#!/bin/bash
# ICLR Rating Application - EC2 Deployment Script
# This script sets up the complete infrastructure for the ICLR application

set -e

# Configuration
APP_NAME="iclr-rating"
REGION="us-east-1"
VPC_CIDR="10.0.0.0/16"
SUBNET_CIDR="10.0.1.0/24"
INSTANCE_TYPE="t3.large"
KEY_NAME="iclr-key"
S3_BUCKET="iclr-data-bucket-$(date +%s)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
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

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed. Please install it first."
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS credentials not configured. Run 'aws configure' first."
    fi
    
    # Check if key pair exists
    if ! aws ec2 describe-key-pairs --key-names "$KEY_NAME" &> /dev/null; then
        warn "Key pair '$KEY_NAME' not found. Creating..."
        aws ec2 create-key-pair --key-name "$KEY_NAME" --query 'KeyMaterial' --output text > "$KEY_NAME.pem"
        chmod 400 "$KEY_NAME.pem"
        log "Key pair created: $KEY_NAME.pem"
    fi
    
    log "Prerequisites check completed."
}

# Create S3 bucket
create_s3_bucket() {
    log "Creating S3 bucket: $S3_BUCKET"
    
    aws s3 mb "s3://$S3_BUCKET" --region "$REGION"
    
    # Enable versioning
    aws s3api put-bucket-versioning \
        --bucket "$S3_BUCKET" \
        --versioning-configuration Status=Enabled
    
    # Configure lifecycle policy
    cat > lifecycle-policy.json << EOF
{
    "Rules": [
        {
            "ID": "MoveToIA",
            "Status": "Enabled",
            "Filter": {
                "Prefix": "backups/"
            },
            "Transitions": [
                {
                    "Days": 30,
                    "StorageClass": "STANDARD_IA"
                }
            ]
        }
    ]
}
EOF
    
    aws s3api put-bucket-lifecycle-configuration \
        --bucket "$S3_BUCKET" \
        --lifecycle-configuration file://lifecycle-policy.json
    
    log "S3 bucket created and configured."
}

# Create VPC and networking
create_networking() {
    log "Creating VPC and networking components..."
    
    # Create VPC
    VPC_ID=$(aws ec2 create-vpc \
        --cidr-block "$VPC_CIDR" \
        --query 'Vpc.VpcId' \
        --output text)
    
    aws ec2 create-tags --resources "$VPC_ID" --tags Key=Name,Value="$APP_NAME-vpc"
    
    # Create Internet Gateway
    IGW_ID=$(aws ec2 create-internet-gateway \
        --query 'InternetGateway.InternetGatewayId' \
        --output text)
    
    aws ec2 attach-internet-gateway --vpc-id "$VPC_ID" --internet-gateway-id "$IGW_ID"
    
    # Create public subnet
    SUBNET_ID=$(aws ec2 create-subnet \
        --vpc-id "$VPC_ID" \
        --cidr-block "$SUBNET_CIDR" \
        --availability-zone "${REGION}a" \
        --query 'Subnet.SubnetId' \
        --output text)
    
    aws ec2 create-tags --resources "$SUBNET_ID" --tags Key=Name,Value="$APP_NAME-subnet"
    
    # Create route table
    ROUTE_TABLE_ID=$(aws ec2 create-route-table \
        --vpc-id "$VPC_ID" \
        --query 'RouteTable.RouteTableId' \
        --output text)
    
    aws ec2 create-route \
        --route-table-id "$ROUTE_TABLE_ID" \
        --destination-cidr-block 0.0.0.0/0 \
        --gateway-id "$IGW_ID"
    
    aws ec2 associate-route-table \
        --subnet-id "$SUBNET_ID" \
        --route-table-id "$ROUTE_TABLE_ID"
    
    # Create security group
    SG_ID=$(aws ec2 create-security-group \
        --group-name "$APP_NAME-sg" \
        --description "Security group for $APP_NAME" \
        --vpc-id "$VPC_ID" \
        --query 'GroupId' \
        --output text)
    
    # Allow SSH
    aws ec2 authorize-security-group-ingress \
        --group-id "$SG_ID" \
        --protocol tcp \
        --port 22 \
        --cidr 0.0.0.0/0
    
    # Allow HTTP
    aws ec2 authorize-security-group-ingress \
        --group-id "$SG_ID" \
        --protocol tcp \
        --port 80 \
        --cidr 0.0.0.0/0
    
    # Allow HTTPS
    aws ec2 authorize-security-group-ingress \
        --group-id "$SG_ID" \
        --protocol tcp \
        --port 443 \
        --cidr 0.0.0.0/0
    
    # Allow application port
    aws ec2 authorize-security-group-ingress \
        --group-id "$SG_ID" \
        --protocol tcp \
        --port 4000 \
        --cidr 0.0.0.0/0
    
    # Allow MongoDB port (if self-hosted)
    aws ec2 authorize-security-group-ingress \
        --group-id "$SG_ID" \
        --protocol tcp \
        --port 27017 \
        --cidr 0.0.0.0/0
    
    log "Networking components created."
    echo "VPC_ID=$VPC_ID" > .env
    echo "SUBNET_ID=$SUBNET_ID" >> .env
    echo "SG_ID=$SG_ID" >> .env
    echo "S3_BUCKET=$S3_BUCKET" >> .env
}

# Create IAM role
create_iam_role() {
    log "Creating IAM role for EC2..."
    
    # Create trust policy
    cat > trust-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "ec2.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
EOF
    
    # Create role
    aws iam create-role \
        --role-name "$APP_NAME-ec2-role" \
        --assume-role-policy-document file://trust-policy.json
    
    # Attach policies
    aws iam attach-role-policy \
        --role-name "$APP_NAME-ec2-role" \
        --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
    
    aws iam attach-role-policy \
        --role-name "$APP_NAME-ec2-role" \
        --policy-arn arn:aws:iam::aws:policy/CloudWatchFullAccess
    
    # Create instance profile
    aws iam create-instance-profile \
        --instance-profile-name "$APP_NAME-instance-profile"
    
    aws iam add-role-to-instance-profile \
        --instance-profile-name "$APP_NAME-instance-profile" \
        --role-name "$APP_NAME-ec2-role"
    
    log "IAM role created."
}

# Create EC2 instance
create_ec2_instance() {
    log "Creating EC2 instance..."
    
    # Get latest Amazon Linux 2 AMI
    AMI_ID=$(aws ssm get-parameters \
        --names /aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2 \
        --region "$REGION" \
        --query 'Parameters[0].Value' \
        --output text)
    
    # Create user data script
    cat > user-data.sh << 'EOF'
#!/bin/bash
yum update -y

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install PM2
npm install -g pm2

# Install MongoDB (if self-hosted)
cat > /etc/yum.repos.d/mongodb-org-6.0.repo << 'MONGOEOF'
[mongodb-org-6.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/6.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-6.0.asc
MONGOEOF

yum install -y mongodb-org
systemctl start mongod
systemctl enable mongod

# Create application directory
mkdir -p /opt/iclr
cd /opt/iclr

# Clone application (replace with your repo)
git clone https://github.com/your-repo/iclr-rating-dev.git .

# Install dependencies
cd iclr-node-server-app
npm install

# Create environment file
cat > .env << 'ENVEOF'
DB_CONNECTION_STRING=mongodb://localhost:27017/iclr_2024
PORT=4000
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
S3_BUCKET=S3_BUCKET_PLACEHOLDER
ENVEOF

# Replace placeholder with actual S3 bucket
sed -i "s/S3_BUCKET_PLACEHOLDER/$S3_BUCKET/g" .env

# Start application
pm2 start App.js --name "iclr-backend"
pm2 startup
pm2 save

# Install monitoring tools
yum install -y htop iotop

# Create health check script
cat > /opt/iclr/health-check.sh << 'HEALTHEOF'
#!/bin/bash
if ! pgrep -f "node.*App.js" > /dev/null; then
    echo "Application not running, restarting..."
    cd /opt/iclr/iclr-node-server-app
    pm2 restart iclr-backend
fi
HEALTHEOF

chmod +x /opt/iclr/health-check.sh

# Add to crontab
echo "*/5 * * * * /opt/iclr/health-check.sh" | crontab -
EOF
    
    # Replace S3 bucket placeholder in user data
    sed -i "s/S3_BUCKET_PLACEHOLDER/$S3_BUCKET/g" user-data.sh
    
    # Launch instance
    INSTANCE_ID=$(aws ec2 run-instances \
        --image-id "$AMI_ID" \
        --instance-type "$INSTANCE_TYPE" \
        --key-name "$KEY_NAME" \
        --security-group-ids "$SG_ID" \
        --subnet-id "$SUBNET_ID" \
        --iam-instance-profile Name="$APP_NAME-instance-profile" \
        --user-data file://user-data.sh \
        --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$APP_NAME-backend}]" \
        --query 'Instances[0].InstanceId' \
        --output text)
    
    log "EC2 instance created: $INSTANCE_ID"
    echo "INSTANCE_ID=$INSTANCE_ID" >> .env
    
    # Wait for instance to be running
    log "Waiting for instance to be running..."
    aws ec2 wait instance-running --instance-ids "$INSTANCE_ID"
    
    # Get public IP
    PUBLIC_IP=$(aws ec2 describe-instances \
        --instance-ids "$INSTANCE_ID" \
        --query 'Reservations[0].Instances[0].PublicIpAddress' \
        --output text)
    
    echo "PUBLIC_IP=$PUBLIC_IP" >> .env
    log "Instance is running at: $PUBLIC_IP"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create CloudWatch log group
    aws logs create-log-group --log-group-name "/aws/ec2/$APP_NAME"
    
    # Create CloudWatch alarm for CPU
    aws cloudwatch put-metric-alarm \
        --alarm-name "$APP_NAME-high-cpu" \
        --alarm-description "High CPU usage for $APP_NAME" \
        --metric-name CPUUtilization \
        --namespace AWS/EC2 \
        --statistic Average \
        --period 300 \
        --threshold 80 \
        --comparison-operator GreaterThanThreshold \
        --evaluation-periods 2 \
        --dimensions Name=InstanceId,Value="$INSTANCE_ID"
    
    # Create CloudWatch alarm for memory (if available)
    aws cloudwatch put-metric-alarm \
        --alarm-name "$APP_NAME-high-memory" \
        --alarm-description "High memory usage for $APP_NAME" \
        --metric-name MemoryUtilization \
        --namespace System/Linux \
        --statistic Average \
        --period 300 \
        --threshold 85 \
        --comparison-operator GreaterThanThreshold \
        --evaluation-periods 2 \
        --dimensions Name=InstanceId,Value="$INSTANCE_ID"
    
    log "Monitoring setup completed."
}

# Setup EMR (optional)
setup_emr() {
    log "Setting up EMR cluster configuration..."
    
    # Create EMR cluster configuration
    cat > emr-cluster-config.json << EOF
{
  "Name": "$APP_NAME-Data-Processing",
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
        "InstanceCount": 1
      },
      {
        "Name": "Core nodes",
        "Market": "SPOT",
        "InstanceRole": "CORE",
        "InstanceType": "m5.2xlarge",
        "InstanceCount": 2
      }
    ],
    "Ec2KeyName": "$KEY_NAME",
    "KeepJobFlowAliveWhenNoSteps": false,
    "TerminationProtected": false,
    "Ec2SubnetId": "$SUBNET_ID"
  },
  "JobFlowRole": "$APP_NAME-ec2-role",
  "ServiceRole": "EMR_DefaultRole",
  "LogUri": "s3://$S3_BUCKET/emr-logs/",
  "Tags": [
    {"Key": "Project", "Value": "$APP_NAME"},
    {"Key": "Environment", "Value": "Production"}
  ]
}
EOF
    
    log "EMR configuration created. You can launch it manually when needed."
}

# Deploy application
deploy_application() {
    log "Deploying application..."
    
    # Wait a bit for instance to fully initialize
    sleep 60
    
    # Test connection
    if ! ssh -i "$KEY_NAME.pem" -o StrictHostKeyChecking=no -o ConnectTimeout=10 ec2-user@"$PUBLIC_IP" "echo 'Connection successful'" 2>/dev/null; then
        warn "SSH connection failed. Instance might still be initializing."
        log "You can manually connect using: ssh -i $KEY_NAME.pem ec2-user@$PUBLIC_IP"
        return
    fi
    
    # Check application status
    ssh -i "$KEY_NAME.pem" ec2-user@"$PUBLIC_IP" << 'EOF'
        cd /opt/iclr/iclr-node-server-app
        pm2 status
        curl -f http://localhost:4000/health || echo "Application not responding"
EOF
    
    log "Application deployment completed."
}

# Display summary
display_summary() {
    log "=== Deployment Summary ==="
    echo
    echo "✅ Infrastructure created successfully!"
    echo
    echo "📋 Resources created:"
    echo "   • VPC: $VPC_ID"
    echo "   • Subnet: $SUBNET_ID"
    echo "   • Security Group: $SG_ID"
    echo "   • EC2 Instance: $INSTANCE_ID"
    echo "   • Public IP: $PUBLIC_IP"
    echo "   • S3 Bucket: $S3_BUCKET"
    echo
    echo "🔗 Access Information:"
    echo "   • SSH: ssh -i $KEY_NAME.pem ec2-user@$PUBLIC_IP"
    echo "   • Application: http://$PUBLIC_IP:4000"
    echo "   • MongoDB: mongodb://$PUBLIC_IP:27017"
    echo
    echo "📁 Configuration files:"
    echo "   • Environment: .env"
    echo "   • Key pair: $KEY_NAME.pem"
    echo "   • EMR config: emr-cluster-config.json"
    echo
    echo "🚀 Next steps:"
    echo "   1. Update your application repository URL in user-data.sh"
    echo "   2. Configure MongoDB Atlas (recommended) or use local MongoDB"
    echo "   3. Set up your domain and SSL certificate"
    echo "   4. Configure monitoring dashboards"
    echo "   5. Test the application thoroughly"
    echo
    echo "⚠️  Security notes:"
    echo "   • Keep your key pair secure: $KEY_NAME.pem"
    echo "   • Update security groups to restrict access"
    echo "   • Enable CloudWatch monitoring"
    echo "   • Set up regular backups"
}

# Main execution
main() {
    log "Starting ICLR Rating Application deployment..."
    
    check_prerequisites
    create_s3_bucket
    create_networking
    create_iam_role
    create_ec2_instance
    setup_monitoring
    setup_emr
    deploy_application
    display_summary
    
    log "Deployment completed successfully!"
}

# Run main function
main "$@" 