#!/bin/bash
# Complete Workflow: Export 20,000 Papers from MongoDB and Process with EMR
# This script orchestrates the entire data pipeline

set -e

# Configuration
MONGO_URI="mongodb://localhost:27017/"
DB_NAME="iclr_2024"
COLLECTION_NAME="papers"
S3_BUCKET="your-iclr-bucket"
S3_PREFIX="iclr-data"
EMR_CLUSTER_NAME="ICLR-Paper-Processing-$(date +%Y%m%d-%H%M%S)"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Step 1: Export papers from MongoDB to S3
export_papers_to_s3() {
    log "Step 1: Exporting 20,000 papers from MongoDB to S3..."
    
    # Set environment variables
    export MONGO_URI="$MONGO_URI"
    export DB_NAME="$DB_NAME"
    export COLLECTION_NAME="$COLLECTION_NAME"
    export S3_BUCKET="$S3_BUCKET"
    export S3_PREFIX="$S3_PREFIX"
    
    # Run export script
    python3 testing-monitoring-design/scripts/export-20000-papers.py
    
    if [ $? -eq 0 ]; then
        log "✅ Export completed successfully!"
        return 0
    else
        error "Export failed!"
    fi
}

# Step 2: Create EMR cluster
create_emr_cluster() {
    log "Step 2: Creating EMR cluster for processing..."
    
    # Create EMR cluster configuration
    cat > emr-cluster-config.json << EOF
{
  "Name": "$EMR_CLUSTER_NAME",
  "ReleaseLabel": "emr-6.15.0",
  "Applications": [
    {"Name": "Spark"},
    {"Name": "Hadoop"}
  ],
  "Instances": {
    "InstanceGroups": [
      {
        "Name": "Master node",
        "Market": "ON_DEMAND",
        "InstanceRole": "MASTER",
        "InstanceType": "m5.xlarge",
        "InstanceCount": 1,
        "EbsConfiguration": {
          "EbsBlockDeviceConfigs": [
            {
              "VolumeSpecification": {
                "VolumeType": "gp3",
                "SizeInGB": 100
              },
              "VolumesPerInstance": 1
            }
          ]
        }
      },
      {
        "Name": "Core nodes",
        "Market": "SPOT",
        "InstanceRole": "CORE",
        "InstanceType": "m5.2xlarge",
        "InstanceCount": 2,
        "EbsConfiguration": {
          "EbsBlockDeviceConfigs": [
            {
              "VolumeSpecification": {
                "VolumeType": "gp3",
                "SizeInGB": 200
              },
              "VolumesPerInstance": 1
            }
          ]
        }
      }
    ],
    "KeepJobFlowAliveWhenNoSteps": false,
    "TerminationProtected": false,
    "Ec2SubnetId": "subnet-xxxxxxxxx"
  },
  "BootstrapActions": [
    {
      "Name": "Install Python Dependencies",
      "ScriptBootstrapAction": {
        "Path": "s3://$S3_BUCKET/bootstrap/install-dependencies.sh"
      }
    }
  ],
  "Steps": [
    {
      "Name": "Process 20,000 Papers",
      "ActionOnFailure": "CONTINUE",
      "HadoopJarStep": {
        "Jar": "command-runner.jar",
        "Args": [
          "spark-submit",
          "--deploy-mode", "cluster",
          "--master", "yarn",
          "--conf", "spark.driver.memory=4g",
          "--conf", "spark.executor.memory=8g",
          "--conf", "spark.executor.cores=4",
          "--conf", "spark.sql.adaptive.enabled=true",
          "--conf", "spark.sql.adaptive.coalescePartitions.enabled=true",
          "s3://$S3_BUCKET/scripts/emr-process-20000-papers.py"
        ]
      }
    }
  ],
  "JobFlowRole": "EMR_EC2_DefaultRole",
  "ServiceRole": "EMR_DefaultRole",
  "LogUri": "s3://$S3_BUCKET/emr-logs/",
  "Tags": [
    {"Key": "Project", "Value": "ICLR-Paper-Processing"},
    {"Key": "Environment", "Value": "Production"}
  ]
}
EOF
    
    # Create EMR cluster
    CLUSTER_ID=$(aws emr create-cluster \
        --config file://emr-cluster-config.json \
        --query 'ClusterId' \
        --output text)
    
    log "EMR cluster created: $CLUSTER_ID"
    echo "CLUSTER_ID=$CLUSTER_ID" > .env
    
    return $CLUSTER_ID
}

# Step 3: Monitor EMR job
monitor_emr_job() {
    log "Step 3: Monitoring EMR job..."
    
    CLUSTER_ID=$(cat .env | grep CLUSTER_ID | cut -d'=' -f2)
    
    if [ -z "$CLUSTER_ID" ]; then
        error "No cluster ID found!"
    fi
    
    # Wait for cluster to start
    log "Waiting for cluster to start..."
    aws emr wait cluster-running --cluster-id "$CLUSTER_ID"
    
    # Monitor job progress
    while true; do
        CLUSTER_STATUS=$(aws emr describe-cluster \
            --cluster-id "$CLUSTER_ID" \
            --query 'Cluster.Status.State' \
            --output text)
        
        log "Cluster status: $CLUSTER_STATUS"
        
        case $CLUSTER_STATUS in
            "RUNNING")
                log "Cluster is running, processing papers..."
                sleep 60
                ;;
            "TERMINATED")
                log "Cluster terminated, checking for errors..."
                
                # Check if terminated with errors
                TERMINATION_REASON=$(aws emr describe-cluster \
                    --cluster-id "$CLUSTER_ID" \
                    --query 'Cluster.Status.StateChangeReason.Message' \
                    --output text)
                
                if [ "$TERMINATION_REASON" != "Steps completed" ]; then
                    error "Cluster terminated with errors: $TERMINATION_REASON"
                else
                    log "✅ EMR job completed successfully!"
                    break
                fi
                ;;
            "TERMINATED_WITH_ERRORS")
                error "Cluster terminated with errors!"
                ;;
            *)
                log "Unknown status: $CLUSTER_STATUS"
                sleep 30
                ;;
        esac
    done
}

# Step 4: Download and display results
download_results() {
    log "Step 4: Downloading processing results..."
    
    # Create results directory
    mkdir -p results
    
    # Download analytics results
    aws s3 sync "s3://$S3_BUCKET/$S3_PREFIX/analytics/" results/analytics/
    
    # Download summary
    aws s3 cp "s3://$S3_BUCKET/$S3_PREFIX/analytics/summary_*/part-00000" results/summary.json
    
    log "Results downloaded to results/ directory"
}

# Step 5: Display summary
display_summary() {
    log "Step 5: Processing Summary"
    
    echo
    echo "📊 ICLR Paper Processing Summary"
    echo "================================"
    echo
    
    # Display summary if available
    if [ -f "results/summary.json" ]; then
        echo "Processing Results:"
        cat results/summary.json | python3 -m json.tool
        echo
    fi
    
    # Display analytics files
    if [ -d "results/analytics" ]; then
        echo "Analytics Files Generated:"
        find results/analytics -name "*.json" | head -10
        echo
    fi
    
    echo "🔗 S3 Locations:"
    echo "   • Raw papers: s3://$S3_BUCKET/$S3_PREFIX/papers/"
    echo "   • Analytics: s3://$S3_BUCKET/$S3_PREFIX/analytics/"
    echo "   • EMR logs: s3://$S3_BUCKET/emr-logs/"
    echo
    
    echo "📁 Local Results:"
    echo "   • Analytics: results/analytics/"
    echo "   • Summary: results/summary.json"
    echo
}

# Main workflow
main() {
    log "Starting complete workflow for 20,000 papers processing..."
    
    # Check prerequisites
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed"
    fi
    
    if ! command -v python3 &> /dev/null; then
        error "Python 3 is not installed"
    fi
    
    # Check if required packages are installed
    python3 -c "import pymongo, boto3" 2>/dev/null || {
        error "Required Python packages not installed. Run: pip install pymongo boto3"
    }
    
    # Run workflow steps
    export_papers_to_s3
    CLUSTER_ID=$(create_emr_cluster)
    monitor_emr_job
    download_results
    display_summary
    
    log "🎉 Complete workflow finished successfully!"
    
    # Cleanup
    rm -f emr-cluster-config.json
}

# Run main function
main "$@" 