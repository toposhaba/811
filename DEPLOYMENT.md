# 811 Integration API - Deployment Guide

This guide provides comprehensive instructions for deploying the 811 Integration API to AWS using various methods.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Deployment Methods](#deployment-methods)
4. [Infrastructure Components](#infrastructure-components)
5. [Configuration](#configuration)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools
- **AWS CLI** (v2.0+) - [Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- **Node.js** (v16+) - [Download](https://nodejs.org/)
- **Docker** (v20.0+) - [Installation Guide](https://docs.docker.com/get-docker/)
- **Git** - [Download](https://git-scm.com/)

### AWS Account Setup
1. Create an AWS account if you don't have one
2. Create an IAM user with appropriate permissions
3. Configure AWS CLI:
   ```bash
   aws configure
   ```
4. Ensure your IAM user has the following permissions:
   - IAM (create roles and policies)
   - DynamoDB (create and manage tables)
   - S3 (create and manage buckets)
   - SQS (create and manage queues)
   - SNS (create and manage topics)
   - Lambda (create and manage functions)
   - API Gateway (create and manage APIs)
   - ECS (create and manage clusters/services)
   - CloudWatch (create and manage logs/alarms)
   - EC2 (create VPC, subnets, security groups)

## Quick Start

### Option 1: Automated Deployment Script
```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment
./deploy.sh
```

### Option 2: CloudFormation Stack
```bash
# Deploy the CloudFormation stack
aws cloudformation create-stack \
  --stack-name 811-integration-api-stack \
  --template-body file://cloudformation-template.yaml \
  --parameters ParameterKey=ProjectName,ParameterValue=811-integration-api \
  --capabilities CAPABILITY_NAMED_IAM
```

### Option 3: Docker Compose (Local Development)
```bash
# Start all services locally
docker-compose up -d

# View logs
docker-compose logs -f api
```

## Deployment Methods

### 1. Automated Script Deployment (`deploy.sh`)

The automated script provides a comprehensive deployment solution that:

- **Checks prerequisites** (AWS CLI, Node.js, npm)
- **Creates IAM roles and policies** with least privilege access
- **Sets up DynamoDB tables** with proper indexing
- **Creates S3 bucket** with encryption and lifecycle policies
- **Configures SQS queue** with dead letter queue
- **Sets up SNS topic** for notifications
- **Creates API Gateway** with Lambda integration
- **Deploys Lambda function** with proper environment variables
- **Sets up ECS cluster** for containerized deployment
- **Creates Application Load Balancer** for high availability
- **Configures CloudWatch alarms** for monitoring

**Usage:**
```bash
# Basic deployment
./deploy.sh

# With custom parameters
PROJECT_NAME="my-811-api" REGION="us-west-2" ./deploy.sh
```

### 2. CloudFormation Deployment

The CloudFormation template provides infrastructure as code with:

- **Complete infrastructure definition** in YAML
- **Version control** for infrastructure changes
- **Rollback capabilities** on deployment failures
- **Resource dependencies** managed automatically
- **Output values** for integration with other systems

**Usage:**
```bash
# Create stack
aws cloudformation create-stack \
  --stack-name 811-integration-api \
  --template-body file://cloudformation-template.yaml \
  --parameters \
    ParameterKey=ProjectName,ParameterValue=811-integration-api \
    ParameterKey=Environment,ParameterValue=production \
    ParameterKey=Region,ParameterValue=us-east-1 \
  --capabilities CAPABILITY_NAMED_IAM

# Update stack
aws cloudformation update-stack \
  --stack-name 811-integration-api \
  --template-body file://cloudformation-template.yaml \
  --parameters \
    ParameterKey=ProjectName,ParameterValue=811-integration-api \
    ParameterKey=Environment,ParameterValue=production \
  --capabilities CAPABILITY_NAMED_IAM

# Delete stack
aws cloudformation delete-stack --stack-name 811-integration-api
```

### 3. Docker Deployment

For containerized deployment:

```bash
# Build Docker image
docker build -t 811-integration-api .

# Run locally
docker run -p 3000:3000 --env-file .env 811-integration-api

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker tag 811-integration-api:latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/811-integration-api:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/811-integration-api:latest
```

## Infrastructure Components

### Database Layer
- **DynamoDB Tables:**
  - `requests` - Stores 811 request data
  - `districts` - Stores district information and configurations
  - `status` - Stores request status updates

### Storage Layer
- **S3 Bucket:** `811-integration-api-storage`
  - Encrypted at rest
  - Versioning enabled
  - Lifecycle policies for cost optimization

### Messaging Layer
- **SQS Queue:** `811-integration-api-queue`
  - Dead letter queue for failed messages
  - Long polling for efficiency
  - Visibility timeout for processing

- **SNS Topic:** `811-integration-api-notifications`
  - For status updates and alerts
  - Supports multiple subscription types

### Compute Layer
- **Lambda Function:** Serverless execution
  - 300-second timeout
  - 512MB memory allocation
  - Environment variables for configuration

- **ECS Cluster:** Container orchestration
  - Fargate for serverless containers
  - Auto-scaling capabilities
  - Load balancer integration

### API Layer
- **API Gateway:** RESTful API endpoints
  - Regional endpoint for low latency
  - Lambda integration
  - Request/response transformation

### Monitoring Layer
- **CloudWatch Logs:** Centralized logging
- **CloudWatch Alarms:** Automated alerting
- **X-Ray:** Distributed tracing

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Application Configuration
NODE_ENV=production
API_PORT=3000
LOG_LEVEL=info

# Database Configuration
DYNAMODB_TABLE_REQUESTS=811-integration-api-requests
DYNAMODB_TABLE_DISTRICTS=811-integration-api-districts
DYNAMODB_TABLE_STATUS=811-integration-api-status

# S3 Configuration
S3_BUCKET_NAME=811-integration-api-storage
S3_BUCKET_REGION=us-east-1

# SQS Configuration
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/your-account-id/811-integration-api-queue

# SNS Configuration
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:your-account-id:811-integration-api-notifications

# External API Keys
OPENAI_API_KEY=your_openai_api_key_here
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

# Email Configuration
EMAIL_HOST=your_email_host_here
EMAIL_PORT=587
EMAIL_USER=your_email_user_here
EMAIL_PASS=your_email_password_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# Salesforce Configuration
SALESFORCE_CLIENT_ID=your_salesforce_client_id_here
SALESFORCE_CLIENT_SECRET=your_salesforce_client_secret_here
SALESFORCE_LOGIN_URL=https://login.salesforce.com

# Monitoring
CLOUDWATCH_LOG_GROUP=/aws/lambda/811-integration-api
XRAY_ENABLED=true
```

### Security Configuration

1. **IAM Roles and Policies:**
   - Least privilege access
   - Resource-specific permissions
   - Regular access reviews

2. **Encryption:**
   - S3 bucket encryption
   - DynamoDB encryption at rest
   - TLS for data in transit

3. **Network Security:**
   - VPC with private subnets
   - Security groups with minimal access
   - WAF for API protection

## Monitoring and Maintenance

### CloudWatch Monitoring

Set up the following CloudWatch alarms:

```bash
# API Gateway 5XX errors
aws cloudwatch put-metric-alarm \
  --alarm-name "811-api-5xx-errors" \
  --alarm-description "API Gateway 5XX errors" \
  --metric-name 5XXError \
  --namespace AWS/ApiGateway \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2

# Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name "811-lambda-errors" \
  --alarm-description "Lambda function errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

### Log Analysis

```bash
# View Lambda logs
aws logs tail /aws/lambda/811-integration-api --follow

# View API Gateway logs
aws logs tail /aws/apigateway/811-integration-api --follow

# View ECS logs
aws logs tail /ecs/811-integration-api --follow
```

### Performance Monitoring

1. **API Gateway Metrics:**
   - Request count
   - Latency
   - Error rates

2. **Lambda Metrics:**
   - Invocation count
   - Duration
   - Error count

3. **DynamoDB Metrics:**
   - Read/write capacity
   - Throttled requests
   - Consumed capacity

### Backup and Recovery

1. **DynamoDB Backups:**
   ```bash
   # Enable point-in-time recovery
   aws dynamodb update-continuous-backups \
     --table-name 811-integration-api-requests \
     --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
   ```

2. **S3 Versioning:**
   - Already enabled in CloudFormation template
   - Lifecycle policies for cost optimization

3. **Cross-Region Replication:**
   ```bash
   # Set up S3 cross-region replication
   aws s3api put-bucket-replication \
     --bucket 811-integration-api-storage \
     --replication-configuration file://replication-config.json
   ```

## Troubleshooting

### Common Issues

1. **IAM Permission Errors:**
   ```bash
   # Check IAM role permissions
   aws iam get-role --role-name 811-integration-api-role
   aws iam list-attached-role-policies --role-name 811-integration-api-role
   ```

2. **Lambda Function Errors:**
   ```bash
   # Check Lambda logs
   aws logs describe-log-streams \
     --log-group-name /aws/lambda/811-integration-api \
     --order-by LastEventTime \
     --descending
   ```

3. **API Gateway Issues:**
   ```bash
   # Test API endpoint
   curl -X GET https://your-api-id.execute-api.us-east-1.amazonaws.com/production/health
   ```

4. **DynamoDB Connection Issues:**
   ```bash
   # Test DynamoDB connectivity
   aws dynamodb describe-table --table-name 811-integration-api-requests
   ```

### Debugging Commands

```bash
# Check AWS CLI configuration
aws sts get-caller-identity

# List all resources
aws resourcegroupstaggingapi get-resources

# Check CloudFormation stack status
aws cloudformation describe-stacks --stack-name 811-integration-api-stack

# Monitor deployment progress
aws cloudformation describe-stack-events --stack-name 811-integration-api-stack
```

### Performance Optimization

1. **Lambda Optimization:**
   - Increase memory allocation for better CPU
   - Use connection pooling for databases
   - Implement caching strategies

2. **DynamoDB Optimization:**
   - Use appropriate partition keys
   - Implement efficient queries
   - Monitor consumed capacity

3. **API Gateway Optimization:**
   - Enable caching
   - Use compression
   - Implement rate limiting

## Cost Optimization

### AWS Cost Management

1. **DynamoDB:**
   - Use on-demand billing for unpredictable workloads
   - Implement TTL for automatic data cleanup
   - Monitor consumed capacity

2. **Lambda:**
   - Optimize function duration
   - Use appropriate memory allocation
   - Implement efficient cold start strategies

3. **S3:**
   - Use lifecycle policies
   - Implement intelligent tiering
   - Monitor storage usage

### Cost Monitoring

```bash
# Set up cost alerts
aws ce create-anomaly-monitor \
  --monitor-type DIMENSIONAL \
  --dimensional-value-count 1

# Get cost and usage reports
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

## Security Best Practices

1. **Secrets Management:**
   - Use AWS Secrets Manager for sensitive data
   - Rotate credentials regularly
   - Implement least privilege access

2. **Network Security:**
   - Use VPC for private resources
   - Implement security groups
   - Enable VPC Flow Logs

3. **Compliance:**
   - Enable CloudTrail for audit logs
   - Implement data encryption
   - Regular security assessments

## Support and Resources

- **AWS Documentation:** [https://docs.aws.amazon.com/](https://docs.aws.amazon.com/)
- **CloudFormation User Guide:** [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/)
- **AWS CLI Reference:** [https://docs.aws.amazon.com/cli/latest/reference/](https://docs.aws.amazon.com/cli/latest/reference/)
- **Docker Documentation:** [https://docs.docker.com/](https://docs.docker.com/)

For additional support, please refer to the main README.md file or contact the development team.