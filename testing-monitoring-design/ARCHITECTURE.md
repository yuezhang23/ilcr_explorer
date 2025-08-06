# ICLR Rating Application - Deployment Architecture

## Overview

This document outlines the recommended deployment architecture for the ICLR Rating Application, optimized for handling 20,000+ papers with EMR integration and cost-effective data management.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AWS Cloud                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │   Frontend      │    │   Load Balancer │    │   CloudWatch    │        │
│  │   (React SPA)   │◄──►│   (ALB/NLB)     │◄──►│   Monitoring    │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│           │                       │                       │                │
│           ▼                       ▼                       ▼                │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                           VPC (10.0.0.0/16)                            │ │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │ │
│  │  │   Backend       │    │   MongoDB       │    │   Redis Cache   │    │ │
│  │  │   (EC2)         │◄──►│   (Atlas/EC2)   │◄──►│   (ElastiCache) │    │ │
│  │  │   Node.js App   │    │   Primary DB    │    │   Session Store │    │ │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘    │ │
│  │           │                       │                       │            │ │
│  │           ▼                       ▼                       ▼            │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                    EMR Cluster (Data Processing)                   │ │ │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │ │ │
│  │  │  │   Master    │  │   Core      │  │   Task      │                │ │ │
│  │  │  │   Node      │  │   Nodes     │  │   Nodes     │                │ │ │
│  │  │  │   (Spark)   │  │   (Spark)   │  │   (Spark)   │                │ │ │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘                │ │ │
│  │  └─────────────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│           │                       │                       │                │
│           ▼                       ▼                       ▼                │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │   S3 Bucket     │    │   CloudWatch    │    │   SNS Topics    │        │
│  │   (Data Lake)   │    │   Logs          │    │   (Alerts)      │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend (React SPA)
- **Deployment**: S3 + CloudFront (Static hosting)
- **Benefits**: Global CDN, cost-effective, scalable
- **Configuration**: 
  ```bash
  # Build and deploy
  npm run build
  aws s3 sync build/ s3://your-frontend-bucket
  aws cloudfront create-invalidation --distribution-id <id> --paths "/*"
  ```

### 2. Load Balancer (ALB/NLB)
- **Type**: Application Load Balancer
- **Purpose**: Traffic distribution, SSL termination, health checks
- **Configuration**:
  ```yaml
  # ALB Configuration
  Target Group: EC2 instances (port 4000)
  Health Check: /health endpoint
  SSL Certificate: ACM managed
  ```

### 3. Backend (EC2)
- **Instance Type**: t3.large (2 vCPU, 8GB RAM) for development
- **Auto Scaling**: t3.xlarge (4 vCPU, 16GB RAM) for production
- **Benefits**: 
  - Direct EMR integration
  - Cost-effective for consistent workloads
  - Full control over environment

#### EC2 Setup Script:
```bash
#!/bin/bash
# EC2 User Data Script

# Update system
yum update -y

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install MongoDB (if self-hosted)
# wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
# echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
# apt-get update
# apt-get install -y mongodb-org

# Clone application
git clone https://github.com/your-repo/iclr-rating-dev.git
cd iclr-rating-dev/iclr-node-server-app

# Install dependencies
npm install

# Configure environment
cat > .env << EOF
DB_CONNECTION_STRING=mongodb://your-mongo-host:27017/iclr_2024
PORT=4000
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
EOF

# Start application with PM2
pm2 start App.js --name "iclr-backend"
pm2 startup
pm2 save
```

### 4. MongoDB (Primary Database)
- **Option A**: MongoDB Atlas (Recommended)
  - Managed service, automatic backups
  - Global distribution, built-in monitoring
  - Cost: ~$0.25/hour for M10 cluster

- **Option B**: Self-hosted on EC2
  - More control, potentially lower cost
  - Requires manual management
  - Cost: ~$0.10/hour for t3.medium

#### MongoDB Atlas Setup:
```javascript
// Connection string
mongodb+srv://username:password@cluster.mongodb.net/iclr_2024?retryWrites=true&w=majority

// Indexes for performance
db.papers.createIndex({ "title": "text", "abstract": "text" });
db.papers.createIndex({ "year": 1, "decision": 1 });
db.papers.createIndex({ "authors": 1 });
db.papers.createIndex({ "createdAt": -1 });
```

### 5. S3 (Data Lake)
- **Purpose**: EMR data source, backups, analytics
- **Cost**: $0.023/GB/month
- **Structure**:
  ```
  s3://your-iclr-bucket/
  ├── iclr-data/
  │   ├── papers/                    # Exported papers (JSON)
  │   │   ├── papers_chunk_0.json
  │   │   ├── papers_chunk_1.json
  │   │   └── ...
  │   ├── backups/                   # MongoDB backups
  │   │   ├── daily/
  │   │   └── weekly/
  │   └── analytics/                 # Processed data
  │       ├── validation-reports/
  │       ├── performance-metrics/
  │       └── user-analytics/
  ├── emr-logs/                      # EMR job logs
  ├── application-logs/              # App logs
  └── static-assets/                 # Images, documents
  ```

### 6. EMR Cluster (Data Processing)
- **Purpose**: Data validation, analytics, batch processing
- **Configuration**: Spot instances for cost optimization
- **Schedule**: Daily validation jobs

#### EMR Cost Optimization:
```json
{
  "InstanceGroups": [
    {
      "Name": "Master node",
      "Market": "ON_DEMAND",  // Always available
      "InstanceType": "m5.xlarge"
    },
    {
      "Name": "Core nodes", 
      "Market": "SPOT",       // 60-90% cost savings
      "InstanceType": "m5.2xlarge"
    }
  ]
}
```

## Data Flow Patterns

### 1. Real-time Operations (MongoDB)
```javascript
// User interactions - always use MongoDB
app.get('/api/iclr', async (req, res) => {
  const papers = await Paper.find()
    .limit(limit)
    .skip(offset)
    .lean();
  res.json(papers);
});

app.post('/api/public/comments/comment', async (req, res) => {
  const comment = new Comment(req.body);
  await comment.save();
  res.status(201).json(comment);
});
```

### 2. Batch Processing (S3 + EMR)
```python
# Daily data export to S3
def export_papers_to_s3():
    papers = list(collection.find({}))
    # Split into chunks and upload to S3
    for chunk in chunks(papers, 1000):
        upload_to_s3(chunk)

# EMR processes S3 data
def validate_papers():
    papers_df = spark.read.json("s3://bucket/iclr-data/papers/*.json")
    # Perform validation
    validation_results = validate_schema(papers_df)
    # Save results back to S3
    validation_results.write.json("s3://bucket/analytics/validation-reports/")
```

### 3. Analytics Queries (S3 + EMR)
```python
# Complex analytics on S3 data
def generate_analytics():
    papers_df = spark.read.json("s3://bucket/iclr-data/papers/*.json")
    
    # Year distribution
    year_dist = papers_df.groupBy("year").count()
    
    # Decision analysis
    decision_dist = papers_df.groupBy("decision").count()
    
    # Author analysis
    author_stats = papers_df.select(explode("authors")).groupBy("col").count()
    
    # Save to S3 for dashboard consumption
    year_dist.write.json("s3://bucket/analytics/year-distribution/")
```

## Cost Analysis

### Monthly Costs (Estimated)

| Component | Cost/Month | Notes |
|-----------|------------|-------|
| **EC2 (t3.large)** | $30 | 24/7 running |
| **MongoDB Atlas (M10)** | $180 | Managed service |
| **S3 Storage (100GB)** | $2.30 | Data lake + backups |
| **EMR (Spot instances)** | $50 | Daily jobs, 2 hours/day |
| **Load Balancer** | $20 | ALB + data transfer |
| **CloudWatch** | $10 | Monitoring + logs |
| **CloudFront** | $5 | CDN for frontend |
| **Total** | **~$297** | Production-ready setup |

### Cost Optimization Strategies

1. **Use Spot Instances for EMR**
   - 60-90% cost savings
   - Suitable for batch processing

2. **MongoDB Atlas vs Self-hosted**
   - Atlas: $180/month (managed)
   - Self-hosted: $70/month (t3.medium)
   - Trade-off: Management vs cost

3. **S3 Lifecycle Policies**
   ```bash
   # Move old data to cheaper storage
   aws s3api put-bucket-lifecycle-configuration \
     --bucket your-iclr-bucket \
     --lifecycle-configuration file://lifecycle-policy.json
   ```

4. **Auto Scaling**
   ```bash
   # Scale EC2 based on CPU usage
   aws autoscaling create-auto-scaling-group \
     --auto-scaling-group-name iclr-backend-asg \
     --min-size 1 --max-size 5 \
     --target-tracking-configuration TargetValue=70.0
   ```

## Security Configuration

### VPC Setup
```bash
# Create VPC with private subnets
aws ec2 create-vpc --cidr-block 10.0.0.0/16
aws ec2 create-subnet --vpc-id vpc-123 --cidr-block 10.0.1.0/24
aws ec2 create-subnet --vpc-id vpc-123 --cidr-block 10.0.2.0/24
```

### Security Groups
```bash
# Backend security group
aws ec2 create-security-group \
  --group-name iclr-backend-sg \
  --description "ICLR Backend Security Group"

# Allow HTTP/HTTPS from ALB
aws ec2 authorize-security-group-ingress \
  --group-id sg-123 \
  --protocol tcp --port 4000 \
  --source-group sg-alb
```

### IAM Roles
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-iclr-bucket",
        "arn:aws:s3:::your-iclr-bucket/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "elasticmapreduce:*"
      ],
      "Resource": "*"
    }
  ]
}
```

## Deployment Commands

### 1. Create Infrastructure
```bash
# Using AWS CLI
aws ec2 run-instances \
  --image-id ami-123 \
  --instance-type t3.large \
  --key-name your-key \
  --security-group-ids sg-123 \
  --subnet-id subnet-123 \
  --user-data file://user-data.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=iclr-backend}]'
```

### 2. Deploy Application
```bash
# Using AWS Systems Manager
aws ssm send-command \
  --instance-ids i-123 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["cd /opt/iclr && git pull && npm install && pm2 restart all"]'
```

### 3. Monitor Deployment
```bash
# Check application status
aws ssm describe-instance-information --filters "Key=InstanceIds,Values=i-123"

# View logs
aws logs describe-log-groups --log-group-name-prefix "/aws/ec2/iclr"
```

## Conclusion

**Recommended Setup:**
- ✅ **EC2** for backend (cost-effective, EMR integration)
- ✅ **MongoDB Atlas** for primary database (managed, reliable)
- ✅ **S3** for data lake and backups (cost-effective, scalable)
- ✅ **EMR** for batch processing (spot instances for cost optimization)

This architecture provides the best balance of performance, cost, and manageability for handling 20,000+ papers while maintaining high availability and data integrity. 