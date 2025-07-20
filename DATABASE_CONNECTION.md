# Database Connection Configuration

This document outlines how to connect to the Aurora PostgreSQL database from your local development environment.

## 🔐 Aurora PostgreSQL Connection Details

Your Aurora PostgreSQL cluster is now deployed and available:

- **Endpoint**: `aorora_endpoint`
- **Port**: `1111`
- **Database**: `opncommerce`
- **Username**: `postgres`
- **Engine**: PostgreSQL 15.4
- **Region**: ap-southeast-1

## 🚀 Quick Start

### Option 1: Use the Database Switch Script (Recommended)

```bash
# Make script executable
chmod +x scripts/db-switch.sh

# Switch to Aurora PostgreSQL
./scripts/db-switch.sh aurora

# Check status
./scripts/db-switch.sh status

# Test connection
npm run start:dev
```

### Option 2: Manual Configuration

The `.env` file has been automatically configured with Aurora connection details:

```bash
# View current configuration
cat .env | grep -E "^(DATABASE_TYPE|DB_HOST|DB_NAME)"

# Start the application
npm run start:dev
```

## 🔄 Switching Between Databases

### Switch to Aurora (Production Database)
```bash
./scripts/db-switch.sh aurora
```

### Switch to Mock (Development Database)
```bash
./scripts/db-switch.sh mock
```

### Check Current Status
```bash
./scripts/db-switch.sh status
```

## 🏥 Health Monitoring

### Application Health Endpoint
```bash
# Test health endpoint
curl http://localhost:8091/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "database": {
    "type": "postgresql",
    "status": "connected",
    "host": "opncommerceinfrastructuresta...",
    "ssl": "enabled"
  },
  "memory": {
    "used": 25.67,
    "total": 50.12
  }
}
```

## 🛠️ Database Client Tools

### Using psql (Command Line)
```bash
# Install PostgreSQL client (if needed)
brew install postgresql  # macOS
sudo apt-get install postgresql-client  # Ubuntu

# Connect directly
psql -h opncommerceinfrastructuresta-auroracluster23d869c0-l2isiso2tg4d.cluster-cmmhbw1lpj1e.ap-southeast-1.rds.amazonaws.com \
     -p 5432 \
     -U postgres \
     -d opncommerce
```

### Using pgAdmin
1. Download: https://www.pgadmin.org/download/
2. Create new server connection:
   - **Host**: `db_host`
   - **Port**: `5432`
   - **Database**: `opncommerce`
   - **Username**: `postgres`
   - **Password**: `db_password`
   - **SSL Mode**: Require

### Using DBeaver
1. Download: https://dbeaver.io/download/
2. Create PostgreSQL connection with same details above

## 📁 Environment Files

### `.env` (Main configuration - Aurora enabled)
- Contains Aurora PostgreSQL connection details
- Used for development with production database
- **Committed to git** for team development

### `.env.aurora` (Aurora-specific configuration)
- Backup of Aurora configuration
- **Gitignored** for security

### `.env.local.example` (Template)
- Example configuration for new developers
- Copy to `.env.local` for personal settings
- **Gitignored** for security

### `.env.production` (Production deployment)
- Used in ECS containers
- References AWS environment variables
- **Committed to git** (no secrets)

## 🔒 Security Notes

1. **Password Security**: Database password is stored in AWS Secrets Manager
2. **SSL Required**: Aurora enforces SSL connections in production
3. **Network Security**: Database is in private subnets, not publicly accessible
4. **Gitignore**: Sensitive files like `.env.local` and `.env.aurora` are gitignored

## 🐛 Troubleshooting

### Connection Timeouts
```bash
# Check if Aurora cluster is available
aws rds describe-db-clusters --query 'DBClusters[*].[DBClusterIdentifier,Status]'

# Increase timeout values in .env
DB_ACQUIRE_TIMEOUT=60000
DB_IDLE_TIMEOUT=300000
```

### SSL Certificate Issues
```bash
# Verify SSL configuration in .env
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

### Permission Issues
```bash
# Check AWS credentials
aws sts get-caller-identity

# Verify Aurora cluster exists
aws rds describe-db-clusters
```

### Network Connectivity
The Aurora cluster is in private subnets. For direct access, you need:
1. VPN connection to the VPC, or
2. Bastion host in public subnet, or  
3. AWS Session Manager (recommended)

## 🎯 Development Workflow

1. **Start with Mock Database** for quick development:
   ```bash
   ./scripts/db-switch.sh mock
   npm run start:dev
   ```

2. **Switch to Aurora** for integration testing:
   ```bash
   ./scripts/db-switch.sh aurora
   npm run start:dev
   ```

3. **Use Health Endpoint** to verify connections:
   ```bash
   curl http://localhost:8091/health
   ```

4. **Deploy to Production** when ready:
   ```bash
   cd ../opn-commerce-iac
   ./scripts/build-and-push.sh
   ```

## 📚 Additional Resources

- [Aurora PostgreSQL Documentation](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/)
- [NestJS Database Integration](https://docs.nestjs.com/techniques/database)
- [AWS CLI Configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)

---

**✅ Your Aurora PostgreSQL database is ready for development!**