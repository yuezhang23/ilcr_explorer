# ICLR Rating Application - Testing & Monitoring Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the comprehensive testing and monitoring strategy for the ICLR Rating Application, designed to handle 20,000+ papers while ensuring data reliability and server uptime.

## Prerequisites

### Required Accounts & Services
- AWS Account with EMR, S3, CloudWatch access
- GitHub repository with Actions enabled
- Postman account (free tier sufficient)
- MongoDB Atlas or self-hosted MongoDB
- Grafana instance (self-hosted or cloud)

### Required Tools
- Node.js 18+
- Python 3.9+
- AWS CLI configured
- Docker (for local testing)
- Git

## Phase 1: Postman Setup (Week 1)

### Step 1: Import Postman Collection

1. **Download the Collection**
   ```bash
   # Clone the repository
   git clone <your-repo-url>
   cd iclr-rating-dev/testing-monitoring-design/postman
   ```

2. **Import to Postman**
   - Open Postman
   - Click "Import" → "File" → Select `ICLR-Rating-Tests.postman_collection.json`
   - Import the environments from `environments/` folder

3. **Configure Environments**
   - Set up Development environment variables:
     - `baseUrl`: `http://localhost:4000`
     - `testUsername`: `testuser`
     - `testPassword`: `TestPass123!`
   
   - Set up Production environment variables:
     - `baseUrl`: `https://your-production-domain.com`
     - Update credentials for production

### Step 2: Test Data Setup

1. **Create Test Users**
   ```bash
   # Start your backend server
   cd iclr-node-server-app
   npm start
   
   # Use Postman to create test users
   # Run the "User Registration" request in the Authentication folder
   ```

2. **Import Sample Papers**
   ```bash
   # Use the existing importData.js script
   cd iclr-node-server-app
   node importData.js
   ```

### Step 3: Run Initial Tests

1. **Test Authentication Flow**
   ```bash
   # Run authentication tests manually in Postman
   # Verify all endpoints return expected responses
   ```

2. **Test Paper Management**
   ```bash
   # Test paper retrieval, search, and pagination
   # Verify performance with large datasets
   ```

## Phase 2: EMR Infrastructure Setup (Week 2)

### Step 1: AWS Configuration

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://your-iclr-bucket
   aws s3 ls s3://your-iclr-bucket
   ```

2. **Upload EMR Scripts**
   ```bash
   # Upload bootstrap script
   aws s3 cp testing-monitoring-design/emr/bootstrap/install-dependencies.sh \
     s3://your-iclr-bucket/bootstrap/
   
   # Upload data processing scripts
   aws s3 cp testing-monitoring-design/emr/scripts/ \
     s3://your-iclr-bucket/scripts/ --recursive
   ```

3. **Configure IAM Roles**
   ```bash
   # Create EMR service role
   aws iam create-role --role-name EMR_DefaultRole \
     --assume-role-policy-document file://emr-trust-policy.json
   
   # Attach necessary policies
   aws iam attach-role-policy --role-name EMR_DefaultRole \
     --policy-arn arn:aws:iam::aws:policy/service-role/AmazonElasticMapReduceRole
   ```

### Step 2: Create EMR Cluster

1. **Update Configuration**
   ```bash
   # Edit emr-cluster-config.json
   # Update S3 bucket names and instance types
   ```

2. **Launch Cluster**
   ```bash
   aws emr create-cluster \
     --config file://testing-monitoring-design/emr/emr-cluster-config.json
   ```

3. **Monitor Cluster Status**
   ```bash
   # Get cluster ID from previous command
   aws emr describe-cluster --cluster-id <cluster-id>
   
   # Check step status
   aws emr describe-step --cluster-id <cluster-id> --step-id <step-id>
   ```

### Step 3: Data Export Setup

1. **Configure MongoDB Export**
   ```bash
   # Set environment variables
   export MONGO_URI="mongodb://your-mongo-host:27017/"
   export DB_NAME="iclr_2024"
   export S3_BUCKET="your-iclr-bucket"
   
   # Run export script
   python3 testing-monitoring-design/emr/scripts/export-data.py
   ```

2. **Verify Data Export**
   ```bash
   aws s3 ls s3://your-iclr-bucket/iclr-data/papers/
   ```

## Phase 3: Monitoring Setup (Week 3)

### Step 1: Prometheus Configuration

1. **Install Prometheus**
   ```bash
   # Download and install Prometheus
   wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
   tar xvf prometheus-*.tar.gz
   cd prometheus-*
   ```

2. **Configure prometheus.yml**
   ```yaml
   global:
     scrape_interval: 15s
   
   scrape_configs:
     - job_name: 'iclr-backend'
       static_configs:
         - targets: ['localhost:4000']
       metrics_path: '/metrics'
   
     - job_name: 'mongodb'
       static_configs:
         - targets: ['localhost:27017']
   ```

3. **Start Prometheus**
   ```bash
   ./prometheus --config.file=prometheus.yml
   ```

### Step 2: Grafana Setup

1. **Install Grafana**
   ```bash
   # For Ubuntu/Debian
   sudo apt-get install -y software-properties-common
   sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
   sudo apt-get update
   sudo apt-get install grafana
   ```

2. **Import Dashboard**
   ```bash
   # Start Grafana
   sudo systemctl start grafana-server
   
   # Access Grafana at http://localhost:3000
   # Default credentials: admin/admin
   
   # Import the dashboard from testing-monitoring-design/monitoring/grafana-dashboard.json
   ```

3. **Configure Data Sources**
   - Add Prometheus as data source
   - Configure MongoDB metrics collection

### Step 3: Application Metrics

1. **Add Metrics to Backend**
   ```javascript
   // Install prometheus client
   npm install prom-client
   
   // Add to your Express app
   const prometheus = require('prom-client');
   
   // Create metrics
   const httpRequestDurationMicroseconds = new prometheus.Histogram({
     name: 'http_request_duration_seconds',
     help: 'Duration of HTTP requests in seconds',
     labelNames: ['method', 'route', 'status_code'],
     buckets: [0.1, 0.5, 1, 2, 5]
   });
   
   // Add middleware
   app.use((req, res, next) => {
     const start = Date.now();
     res.on('finish', () => {
       const duration = Date.now() - start;
       httpRequestDurationMicroseconds
         .labels(req.method, req.route?.path || req.path, res.statusCode)
         .observe(duration / 1000);
     });
     next();
   });
   
   // Expose metrics endpoint
   app.get('/metrics', async (req, res) => {
     res.set('Content-Type', prometheus.register.contentType);
     res.end(await prometheus.register.metrics());
   });
   ```

## Phase 4: CI/CD Integration (Week 4)

### Step 1: GitHub Actions Setup

1. **Configure Secrets**
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `AWS_ACCESS_KEY_ID`
     - `AWS_SECRET_ACCESS_KEY`
     - `EC2_KEY_NAME`
     - `S3_BUCKET`

2. **Create Workflow File**
   ```bash
   # Copy the GitHub Actions workflow
   cp testing-monitoring-design/ci-cd/github-actions.yml .github/workflows/
   ```

3. **Test Workflow**
   ```bash
   # Push to develop branch to trigger staging deployment
   git add .
   git commit -m "Add CI/CD workflow"
   git push origin develop
   ```

### Step 2: Load Testing Setup

1. **Install Artillery**
   ```bash
   npm install -g artillery
   ```

2. **Configure Load Tests**
   ```bash
   # Copy load test configuration
   cp testing-monitoring-design/load-tests/load-test.yml .
   
   # Run load test
   artillery run load-test.yml
   ```

3. **Analyze Results**
   ```bash
   # Generate HTML report
   artillery run --output report.json load-test.yml
   artillery report report.json
   ```

## Phase 5: Production Deployment (Week 5)

### Step 1: Production Environment Setup

1. **Configure Production Database**
   ```bash
   # Set up MongoDB Atlas or production MongoDB instance
   # Update connection strings in environment variables
   ```

2. **Set up Production Server**
   ```bash
   # Deploy to AWS EC2, ECS, or your preferred platform
   # Configure load balancer and auto-scaling
   ```

3. **Configure Monitoring**
   ```bash
   # Set up CloudWatch alarms
   aws cloudwatch put-metric-alarm \
     --alarm-name "ICLR-High-Error-Rate" \
     --alarm-description "High error rate detected" \
     --metric-name "ErrorRate" \
     --namespace "ICLR/Application" \
     --statistic Average \
     --period 300 \
     --threshold 5 \
     --comparison-operator GreaterThanThreshold \
     --evaluation-periods 2
   ```

### Step 2: Data Validation Pipeline

1. **Schedule EMR Jobs**
   ```bash
   # Create CloudWatch Events rule for daily validation
   aws events put-rule \
     --name "ICLR-Daily-Validation" \
     --schedule-expression "cron(0 2 * * ? *)" \
     --description "Daily data validation for ICLR application"
   ```

2. **Set up Notifications**
   ```bash
   # Configure SNS topics for alerts
   aws sns create-topic --name "ICLR-Alerts"
   
   # Subscribe to topic
   aws sns subscribe \
     --topic-arn arn:aws:sns:region:account:ICLR-Alerts \
     --protocol email \
     --notification-endpoint your-email@example.com
   ```

## Phase 6: Optimization & Maintenance (Week 6)

### Step 1: Performance Optimization

1. **Database Optimization**
   ```bash
   # Create indexes for frequently queried fields
   db.papers.createIndex({ "title": "text", "abstract": "text" })
   db.papers.createIndex({ "year": 1, "decision": 1 })
   db.papers.createIndex({ "authors": 1 })
   ```

2. **Application Optimization**
   ```javascript
   // Add caching layer
   const redis = require('redis');
   const client = redis.createClient();
   
   // Cache frequently accessed data
   app.get('/api/iclr', async (req, res) => {
     const cacheKey = `papers:${req.query.page}:${req.query.limit}`;
     const cached = await client.get(cacheKey);
     
     if (cached) {
       return res.json(JSON.parse(cached));
     }
     
     // Fetch from database and cache
     const papers = await Paper.find().limit(limit).skip(offset);
     await client.setex(cacheKey, 300, JSON.stringify(papers));
     res.json(papers);
   });
   ```

### Step 2: Monitoring Optimization

1. **Custom Metrics**
   ```javascript
   // Add business-specific metrics
   const papersProcessed = new prometheus.Counter({
     name: 'iclr_papers_processed_total',
     help: 'Total number of papers processed'
   });
   
   const predictionAccuracy = new prometheus.Gauge({
     name: 'iclr_prediction_accuracy',
     help: 'Current prediction accuracy'
   });
   ```

2. **Alerting Rules**
   ```yaml
   # prometheus-rules.yml
   groups:
   - name: iclr_alerts
     rules:
     - alert: HighErrorRate
       expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
       for: 2m
       labels:
         severity: critical
       annotations:
         summary: "High error rate detected"
   ```

## Testing Checklist

### Daily Tests
- [ ] Run Postman collection against staging
- [ ] Check EMR job status
- [ ] Review monitoring dashboard
- [ ] Verify data integrity

### Weekly Tests
- [ ] Full load test suite
- [ ] Performance regression testing
- [ ] Security vulnerability scan
- [ ] Backup verification

### Monthly Tests
- [ ] Disaster recovery drill
- [ ] Capacity planning review
- [ ] Cost optimization analysis
- [ ] Documentation updates

## Troubleshooting Guide

### Common Issues

1. **Postman Tests Failing**
   ```bash
   # Check server status
   curl http://localhost:4000/health
   
   # Verify database connection
   mongo --eval "db.runCommand('ping')"
   ```

2. **EMR Jobs Failing**
   ```bash
   # Check cluster logs
   aws emr describe-cluster --cluster-id <cluster-id>
   
   # View step logs
   aws emr describe-step --cluster-id <cluster-id> --step-id <step-id>
   ```

3. **High Response Times**
   ```bash
   # Check database performance
   db.papers.explain().find().limit(100)
   
   # Monitor resource usage
   htop
   ```

### Performance Tuning

1. **Database Tuning**
   ```bash
   # Analyze slow queries
   db.setProfilingLevel(2)
   
   # Create compound indexes
   db.papers.createIndex({ "year": 1, "decision": 1, "title": 1 })
   ```

2. **Application Tuning**
   ```javascript
   // Implement connection pooling
   const mongoose = require('mongoose');
   mongoose.connect(uri, {
     maxPoolSize: 10,
     serverSelectionTimeoutMS: 5000,
     socketTimeoutMS: 45000,
   });
   ```

## Success Metrics

### Performance Targets
- [ ] 99.9% uptime
- [ ] <500ms average response time
- [ ] <1% error rate
- [ ] Support for 1000+ concurrent users

### Data Quality Targets
- [ ] 100% data validation
- [ ] <0.1% data corruption rate
- [ ] Real-time data consistency
- [ ] Automated error detection

### Testing Coverage
- [ ] 95% API endpoint coverage
- [ ] 90% business logic coverage
- [ ] Automated regression testing
- [ ] Performance regression detection

## Conclusion

This implementation guide provides a comprehensive approach to ensuring data reliability and server uptime for the ICLR Rating Application. By following these steps, you'll have:

1. **Robust Testing**: Automated API testing with Postman
2. **Data Validation**: EMR-based data processing and validation
3. **Performance Monitoring**: Real-time monitoring with Grafana
4. **CI/CD Pipeline**: Automated testing and deployment
5. **Load Testing**: Performance validation under stress
6. **Alerting**: Proactive issue detection and notification

The system is designed to scale with your application and handle the 20,000+ papers efficiently while maintaining high performance and data integrity standards. 