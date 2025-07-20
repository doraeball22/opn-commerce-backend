# AWS Secrets Manager - Database Credentials Guide

This guide explains how contributors can securely retrieve database credentials from AWS Secrets Manager using the AWS CLI.

## 🔐 Overview

Database credentials are stored securely in AWS Secrets Manager and can be retrieved programmatically. This approach ensures:
- **Security**: Credentials are encrypted and access-controlled
- **Rotation**: Automatic password rotation capabilities
- **Audit**: All access is logged in CloudTrail
- **Team Access**: Controlled access for team members

## 🛠️ Prerequisites

### 1. AWS CLI Installation
```bash
# macOS
brew install awscli

# Ubuntu/Debian
sudo apt-get install awscli

# Windows
# Download from: https://aws.amazon.com/cli/
```

### 2. AWS CLI Configuration
```bash
# Configure AWS credentials
aws configure

# Required inputs:
# AWS Access Key ID: [Your access key]
# AWS Secret Access Key: [Your secret key]
# Default region name: ap-southeast-1
# Default output format: json
```

### 3. Verify Access
```bash
# Test AWS credentials
aws sts get-caller-identity

# Expected output:
{
    "UserId": "xxx",
    "Account": "yyy",
    "Arn": "arn:aws:iam::xxx:user/your-username"
}
```

## 🔑 Retrieving Database Credentials

### Method 1: Get Complete Secret (JSON)
```bash
# Retrieve the complete database secret
aws secretsmanager get-secret-value \
    --secret-id opn-commerce-aurora-credentials \
    --region ap-southeast-1 \
    --query 'SecretString' \
    --output text
```

**Expected Output:**
```json
{
  "username": "postgres",
  "password": "db_password",
  "engine": "postgres",
  "host": "db_host",
  "port": 1234,
  "dbname": "opncommerce"
}
```

### Method 2: Extract Specific Values
```bash
# Get only the password
aws secretsmanager get-secret-value \
    --secret-id opn-commerce-aurora-credentials \
    --region ap-southeast-1 \
    --query 'SecretString' \
    --output text | jq -r '.password'

# Get only the host
aws secretsmanager get-secret-value \
    --secret-id opn-commerce-aurora-credentials \
    --region ap-southeast-1 \
    --query 'SecretString' \
    --output text | jq -r '.host'

# Get only the username
aws secretsmanager get-secret-value \
    --secret-id opn-commerce-aurora-credentials \
    --region ap-southeast-1 \
    --query 'SecretString' \
    --output text | jq -r '.username'
```

### Method 3: Create Environment Variables
```bash
# Create a script to export environment variables
cat << 'EOF' > scripts/load-db-secrets.sh
#!/bin/bash

# Retrieve Aurora credentials from AWS Secrets Manager
SECRET=$(aws secretsmanager get-secret-value \
    --secret-id opn-commerce-aurora-credentials \
    --region ap-southeast-1 \
    --query 'SecretString' \
    --output text)

# Export as environment variables
export DB_HOST=$(echo $SECRET | jq -r '.host')
export DB_PORT=$(echo $SECRET | jq -r '.port')
export DB_USERNAME=$(echo $SECRET | jq -r '.username')
export DB_PASSWORD=$(echo $SECRET | jq -r '.password')
export DB_NAME=$(echo $SECRET | jq -r '.dbname')

echo "✅ Database credentials loaded from AWS Secrets Manager"
echo "📊 Host: ${DB_HOST:0:20}..."
echo "🔐 Username: $DB_USERNAME"
echo "🗄️ Database: $DB_NAME"
EOF

# Make script executable
chmod +x scripts/load-db-secrets.sh

# Source the script to load variables
source scripts/load-db-secrets.sh
```

## 🔄 Automated .env File Generation

### Create Dynamic .env Generator
```bash
cat << 'EOF' > scripts/generate-env-from-secrets.sh
#!/bin/bash

echo "🔄 Generating .env file from AWS Secrets Manager..."

# Retrieve credentials from AWS Secrets Manager
SECRET=$(aws secretsmanager get-secret-value \
    --secret-id opn-commerce-aurora-credentials \
    --region ap-southeast-1 \
    --query 'SecretString' \
    --output text 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ Failed to retrieve credentials from AWS Secrets Manager"
    echo "📝 Please check:"
    echo "   - AWS CLI is configured (aws configure)"
    echo "   - You have access to ap-southeast-1 region"
    echo "   - You have permissions to access the secret"
    exit 1
fi

# Parse JSON and extract values
DB_HOST=$(echo $SECRET | jq -r '.host')
DB_PORT=$(echo $SECRET | jq -r '.port')
DB_USERNAME=$(echo $SECRET | jq -r '.username')
DB_PASSWORD=$(echo $SECRET | jq -r '.password')
DB_NAME=$(echo $SECRET | jq -r '.dbname')

# Generate .env file
cat > .env << EOL
# Auto-generated from AWS Secrets Manager on $(date)
# To regenerate: ./scripts/generate-env-from-secrets.sh

# Database Configuration
DATABASE_TYPE=postgresql
NODE_ENV=development

# Aurora PostgreSQL Connection (from AWS Secrets Manager)
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
DB_SCHEMA=public

# SSL Configuration for Aurora
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false

# Database Behavior
DB_SYNCHRONIZE=true
DB_LOGGING=true
DB_MIGRATIONS_RUN=false

# Connection Pool Settings (optimized for Aurora)
DB_POOL_MIN=2
DB_POOL_MAX=20
DB_ACQUIRE_TIMEOUT=60000
DB_IDLE_TIMEOUT=300000

# Health Check Settings
DB_HEALTH_TIMEOUT=10000
DB_HEALTH_INTERVAL=30000

# Retry Configuration
DB_RETRY_ATTEMPTS=5
DB_RETRY_DELAY=2000

# Application Settings
PORT=8091

# Mock Database Settings (not used when DATABASE_TYPE=postgresql)
MOCK_DB_VERBOSE=false
MOCK_DB_SIMULATE_LATENCY=false
MOCK_DB_LATENCY_MS=10
MOCK_DB_SEED=false
EOL

echo "✅ .env file generated successfully!"
echo "📊 Database Host: ${DB_HOST:0:30}..."
echo "🔐 Username: $DB_USERNAME"
echo "🗄️ Database: $DB_NAME"
echo ""
echo "🚀 You can now start the application:"
echo "   npm run start:dev"
EOF

# Make script executable
chmod +x scripts/generate-env-from-secrets.sh
```

## 🔒 Security Best Practices

### 1. IAM Permissions
Ensure your AWS user/role has these permissions:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue"
            ],
            "Resource": "arn:aws:secretsmanager:ap-southeast-1:*:secret:opn-commerce-aurora-credentials*"
        }
    ]
}
```

### 2. Regional Access
The secret is stored in `ap-southeast-1` region. Always specify the region:
```bash
--region ap-southeast-1
```

### 3. Credential Storage
- **Never commit credentials** to git
- Use AWS Secrets Manager for production
- Use local `.env.local` for development overrides

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### 1. Permission Denied
```bash
# Error: User is not authorized to perform: secretsmanager:GetSecretValue
# Solution: Contact AWS administrator to grant SecretsManager permissions
aws iam get-user
```

#### 2. Secret Not Found
```bash
# Error: Secrets Manager can't find the specified secret
# Solution: Verify secret name and region
aws secretsmanager list-secrets --region ap-southeast-1
```

#### 3. jq Command Not Found
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# Alternative: Use AWS CLI built-in parsing
aws secretsmanager get-secret-value \
    --secret-id opn-commerce-aurora-credentials \
    --region ap-southeast-1 \
    --query 'SecretString' \
    --output text
```

#### 4. Region Configuration
```bash
# Verify your default region
aws configure get region

# Or explicitly set region for this session
export AWS_DEFAULT_REGION=ap-southeast-1
```

## 📝 Quick Reference Commands

### Essential Commands
```bash
# 1. Get complete secret
aws secretsmanager get-secret-value --secret-id opn-commerce-aurora-credentials --region ap-southeast-1

# 2. Generate .env from secrets
./scripts/generate-env-from-secrets.sh

# 3. Load secrets as environment variables
source scripts/load-db-secrets.sh

# 4. Test database connection
npm run start:dev
curl http://localhost:8091/health
```

### Verification Commands
```bash
# Check AWS identity
aws sts get-caller-identity

# List available secrets
aws secretsmanager list-secrets --region ap-southeast-1

# Verify secret exists
aws secretsmanager describe-secret --secret-id opn-commerce-aurora-credentials --region ap-southeast-1
```

## 🎯 Development Workflow

### For New Contributors
1. **Setup AWS CLI**:
   ```bash
   aws configure
   ```

2. **Generate environment file**:
   ```bash
   ./scripts/generate-env-from-secrets.sh
   ```

3. **Start development**:
   ```bash
   npm install
   npm run start:dev
   ```

4. **Verify connection**:
   ```bash
   curl http://localhost:8091/health
   ```

### For CI/CD Pipeline
```bash
# In your deployment scripts
aws secretsmanager get-secret-value \
    --secret-id opn-commerce-aurora-credentials \
    --region ap-southeast-1 \
    --query 'SecretString' \
    --output text | \
    jq -r 'to_entries[] | "\(.key | ascii_upcase)=\(.value)"' > .env.secrets
```

## 📚 Additional Resources

- [AWS Secrets Manager Documentation](https://docs.aws.amazon.com/secretsmanager/)
- [AWS CLI Secrets Manager Reference](https://docs.aws.amazon.com/cli/latest/reference/secretsmanager/)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [jq Manual](https://stedolan.github.io/jq/manual/)

---

**🔐 Keep your credentials secure and never commit them to version control!**