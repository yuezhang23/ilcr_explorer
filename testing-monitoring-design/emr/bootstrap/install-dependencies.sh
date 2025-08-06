#!/bin/bash
# Bootstrap script for ICLR EMR cluster
# Installs necessary dependencies for data processing

set -e

echo "Starting ICLR EMR bootstrap process..."

# Update system packages
sudo yum update -y

# Install Python dependencies
sudo yum install -y python3-pip python3-devel

# Install additional system packages
sudo yum install -y git wget curl jq

# Upgrade pip
sudo pip3 install --upgrade pip

# Install Python packages for data processing
sudo pip3 install \
    pymongo \
    pandas \
    numpy \
    boto3 \
    requests \
    pyspark \
    pymongo[srv] \
    dnspython

# Install monitoring tools
sudo pip3 install \
    psutil \
    prometheus_client \
    elasticsearch

# Create directories for logs and data
sudo mkdir -p /opt/iclr/logs
sudo mkdir -p /opt/iclr/data
sudo mkdir -p /opt/iclr/scripts

# Set permissions
sudo chown -R hadoop:hadoop /opt/iclr

# Configure Spark settings for better performance
echo "Configuring Spark settings..."

# Create custom Spark configuration
sudo tee /etc/spark/conf/spark-defaults.conf << EOF
spark.driver.memory 4g
spark.executor.memory 8g
spark.executor.cores 4
spark.dynamicAllocation.enabled true
spark.dynamicAllocation.minExecutors 2
spark.dynamicAllocation.maxExecutors 10
spark.sql.adaptive.enabled true
spark.sql.adaptive.coalescePartitions.enabled true
spark.sql.adaptive.skewJoin.enabled true
spark.sql.adaptive.localShuffleReader.enabled true
EOF

# Configure YARN settings
sudo tee /etc/hadoop/conf/yarn-site.xml << EOF
<?xml version="1.0"?>
<configuration>
  <property>
    <name>yarn.nodemanager.resource.memory-mb</name>
    <value>16384</value>
  </property>
  <property>
    <name>yarn.scheduler.maximum-allocation-mb</name>
    <value>8192</value>
  </property>
  <property>
    <name>yarn.scheduler.minimum-allocation-mb</name>
    <value>1024</value>
  </property>
</configuration>
EOF

# Create monitoring script
sudo tee /opt/iclr/scripts/monitor.sh << 'EOF'
#!/bin/bash
# Monitoring script for ICLR EMR cluster

LOG_FILE="/opt/iclr/logs/monitor.log"
METRICS_FILE="/opt/iclr/logs/metrics.json"

# Get system metrics
get_metrics() {
    metrics=$(cat << EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "cpu_usage": $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1),
    "memory_usage": $(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}'),
    "disk_usage": $(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1),
    "load_average": $(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ','),
    "spark_applications": $(yarn application -list 2>/dev/null | grep -c "RUNNING" || echo 0)
}
EOF
)
    echo "$metrics" > "$METRICS_FILE"
}

# Log metrics
log_metrics() {
    echo "$(date): $(cat $METRICS_FILE)" >> "$LOG_FILE"
}

# Check for critical issues
check_critical_issues() {
    cpu_usage=$(cat "$METRICS_FILE" | jq -r '.cpu_usage')
    memory_usage=$(cat "$METRICS_FILE" | jq -r '.memory_usage')
    disk_usage=$(cat "$METRICS_FILE" | jq -r '.disk_usage')
    
    if (( $(echo "$cpu_usage > 90" | bc -l) )); then
        echo "$(date): CRITICAL - High CPU usage: ${cpu_usage}%" >> "$LOG_FILE"
    fi
    
    if (( $(echo "$memory_usage > 90" | bc -l) )); then
        echo "$(date): CRITICAL - High memory usage: ${memory_usage}%" >> "$LOG_FILE"
    fi
    
    if (( $(echo "$disk_usage > 90" | bc -l) )); then
        echo "$(date): CRITICAL - High disk usage: ${disk_usage}%" >> "$LOG_FILE"
    fi
}

# Main monitoring loop
while true; do
    get_metrics
    log_metrics
    check_critical_issues
    sleep 60
done
EOF

# Make monitoring script executable
sudo chmod +x /opt/iclr/scripts/monitor.sh

# Create systemd service for monitoring
sudo tee /etc/systemd/system/iclr-monitor.service << EOF
[Unit]
Description=ICLR EMR Monitoring Service
After=network.target

[Service]
Type=simple
User=hadoop
ExecStart=/opt/iclr/scripts/monitor.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start monitoring service
sudo systemctl enable iclr-monitor.service
sudo systemctl start iclr-monitor.service

# Create data export script
sudo tee /opt/iclr/scripts/export-data.py << 'EOF'
#!/usr/bin/env python3
"""
Data export script for ICLR papers
Exports data from MongoDB to S3 for EMR processing
"""

import os
import json
import boto3
from pymongo import MongoClient
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def export_papers_to_s3():
    """Export papers from MongoDB to S3"""
    
    # MongoDB connection
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
    db_name = os.getenv('DB_NAME', 'iclr_2024')
    collection_name = os.getenv('COLLECTION_NAME', 'papers')
    
    # S3 configuration
    s3_bucket = os.getenv('S3_BUCKET', 'your-bucket')
    s3_prefix = os.getenv('S3_PREFIX', 'iclr-data/papers')
    
    try:
        # Connect to MongoDB
        client = MongoClient(mongo_uri)
        db = client[db_name]
        collection = db[collection_name]
        
        # Get all papers
        papers = list(collection.find({}))
        logger.info(f"Found {len(papers)} papers to export")
        
        # Convert ObjectId to string for JSON serialization
        for paper in papers:
            paper['_id'] = str(paper['_id'])
        
        # Upload to S3
        s3_client = boto3.client('s3')
        
        # Split into chunks for better performance
        chunk_size = 1000
        for i in range(0, len(papers), chunk_size):
            chunk = papers[i:i + chunk_size]
            chunk_filename = f"papers_chunk_{i//chunk_size}.json"
            
            # Save chunk to temporary file
            temp_file = f"/tmp/{chunk_filename}"
            with open(temp_file, 'w') as f:
                json.dump(chunk, f)
            
            # Upload to S3
            s3_key = f"{s3_prefix}/{chunk_filename}"
            s3_client.upload_file(temp_file, s3_bucket, s3_key)
            
            # Clean up
            os.remove(temp_file)
            
            logger.info(f"Uploaded chunk {i//chunk_size + 1} to s3://{s3_bucket}/{s3_key}")
        
        logger.info("Data export completed successfully")
        
    except Exception as e:
        logger.error(f"Data export failed: {e}")
        raise

if __name__ == "__main__":
    export_papers_to_s3()
EOF

# Make export script executable
sudo chmod +x /opt/iclr/scripts/export-data.py

# Create environment file
sudo tee /opt/iclr/.env << EOF
# MongoDB Configuration
MONGO_URI=mongodb://your-mongo-host:27017/
DB_NAME=iclr_2024
COLLECTION_NAME=papers

# S3 Configuration
S3_BUCKET=your-bucket
S3_PREFIX=iclr-data/papers

# EMR Configuration
EMR_CLUSTER_ID=${CLUSTER_ID}
EMR_MASTER_NODE=${MASTER_NODE}
EOF

# Set up log rotation
sudo tee /etc/logrotate.d/iclr << EOF
/opt/iclr/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 hadoop hadoop
}
EOF

# Create health check script
sudo tee /opt/iclr/scripts/health-check.sh << 'EOF'
#!/bin/bash
# Health check script for ICLR EMR cluster

# Check if Spark is running
check_spark() {
    if pgrep -f "spark" > /dev/null; then
        echo "Spark: OK"
        return 0
    else
        echo "Spark: FAILED"
        return 1
    fi
}

# Check if YARN is running
check_yarn() {
    if pgrep -f "yarn" > /dev/null; then
        echo "YARN: OK"
        return 0
    else
        echo "YARN: FAILED"
        return 1
    fi
}

# Check disk space
check_disk() {
    disk_usage=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)
    if [ "$disk_usage" -lt 90 ]; then
        echo "Disk: OK (${disk_usage}% used)"
        return 0
    else
        echo "Disk: WARNING (${disk_usage}% used)"
        return 1
    fi
}

# Check memory usage
check_memory() {
    memory_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    if [ "$memory_usage" -lt 90 ]; then
        echo "Memory: OK (${memory_usage}% used)"
        return 0
    else
        echo "Memory: WARNING (${memory_usage}% used)"
        return 1
    fi
}

# Run all checks
echo "ICLR EMR Health Check - $(date)"
echo "================================"

check_spark
spark_status=$?

check_yarn
yarn_status=$?

check_disk
disk_status=$?

check_memory
memory_status=$?

# Overall status
if [ $spark_status -eq 0 ] && [ $yarn_status -eq 0 ] && [ $disk_status -eq 0 ] && [ $memory_status -eq 0 ]; then
    echo "================================"
    echo "Overall Status: HEALTHY"
    exit 0
else
    echo "================================"
    echo "Overall Status: UNHEALTHY"
    exit 1
fi
EOF

# Make health check script executable
sudo chmod +x /opt/iclr/scripts/health-check.sh

# Set up cron job for health checks
echo "*/5 * * * * /opt/iclr/scripts/health-check.sh >> /opt/iclr/logs/health-check.log 2>&1" | sudo crontab -

echo "ICLR EMR bootstrap completed successfully!"
echo "Monitoring service started"
echo "Health checks scheduled every 5 minutes"
echo "Logs available at /opt/iclr/logs/" 