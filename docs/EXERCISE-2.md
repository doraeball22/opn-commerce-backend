# 📋 Exercise 2: Database Design & System Architecture

This document outlines the comprehensive database design and system architecture for the OPN Commerce Backend, demonstrating scalable e-commerce data modeling and enterprise-grade architectural patterns.

## 🎯 Overview

The system implements a complete e-commerce backend with user management, multi-address support, geolocation services, and product catalog capabilities. The architecture follows Domain-Driven Design (DDD) principles with clear separation of concerns.

## 📊 Database Schema Design

### Entity Relationship Diagram

```mermaid
erDiagram
    User {
        uuid id PK
        varchar email UK "Unique email address"
        varchar password_hash "Bcrypt hashed password"
        varchar name "Full name"
        date date_of_birth "Date of birth"
        enum gender "MALE|FEMALE|OTHER"
        boolean subscribed_to_newsletter "Newsletter subscription"
        timestamp created_at "Creation timestamp"
        timestamp updated_at "Last update timestamp"
        timestamp deleted_at "Soft deletion timestamp"
    }

    UserAddress {
        uuid id PK
        uuid user_id FK "References User.id"
        varchar street "Street address"
        varchar city "City name"
        varchar state "State/Province"
        varchar postal_code "Postal/ZIP code"
        varchar country "Country name"
        enum type "HOME|WORK|BILLING|SHIPPING|OTHER"
        varchar label "User-defined label"
        boolean is_default "Default address flag"
        decimal latitude "GPS latitude (-90 to 90)"
        decimal longitude "GPS longitude (-180 to 180)"
        text delivery_instructions "Optional delivery notes"
        timestamp created_at "Creation timestamp"
        timestamp updated_at "Last update timestamp"
        timestamp deleted_at "Soft deletion timestamp"
    }

    Category {
        uuid id PK
        varchar name "Category name"
        varchar slug "URL-friendly identifier"
        text description "Category description"
        uuid parent_id FK "Self-reference for hierarchy"
        varchar image_url "Category image"
        boolean is_active "Active status"
        integer sort_order "Display order"
        timestamp created_at "Creation timestamp"
        timestamp updated_at "Last update timestamp"
    }

    Product {
        uuid id PK
        varchar name "Product name"
        varchar slug "URL-friendly identifier"
        text description "Product description"
        text short_description "Brief product summary"
        varchar sku "Stock Keeping Unit"
        decimal price "Base price"
        decimal sale_price "Discounted price"
        integer stock_quantity "Available inventory"
        boolean manage_stock "Track inventory"
        boolean in_stock "Stock status"
        enum status "DRAFT|ACTIVE|INACTIVE|ARCHIVED"
        decimal weight "Product weight"
        varchar dimensions "Length x Width x Height"
        json attributes "Product attributes (color, size, etc)"
        varchar featured_image "Main product image"
        json images "Product image gallery"
        decimal average_rating "Average customer rating"
        integer review_count "Number of reviews"
        timestamp created_at "Creation timestamp"
        timestamp updated_at "Last update timestamp"
        timestamp deleted_at "Soft deletion timestamp"
    }

    ProductCategory {
        uuid product_id FK "References Product.id"
        uuid category_id FK "References Category.id"
        boolean is_primary "Primary category flag"
        timestamp created_at "Creation timestamp"
    }

    Cart {
        uuid id PK
        uuid user_id FK "References User.id"
        enum status "ACTIVE|ABANDONED|CONVERTED"
        timestamp expires_at "Cart expiration time"
        timestamp created_at "Creation timestamp"
        timestamp updated_at "Last update timestamp"
    }

    CartItem {
        uuid id PK
        uuid cart_id FK "References Cart.id"
        uuid product_id FK "References Product.id"
        integer quantity "Item quantity"
        decimal price "Price at time of adding"
        json product_options "Selected options (size, color, etc)"
        timestamp created_at "Creation timestamp"
        timestamp updated_at "Last update timestamp"
    }

    Order {
        uuid id PK
        varchar order_number "Human-readable order ID"
        uuid user_id FK "References User.id"
        enum status "PENDING|CONFIRMED|PROCESSING|SHIPPED|DELIVERED|CANCELLED|REFUNDED"
        decimal subtotal "Items total"
        decimal tax_amount "Tax amount"
        decimal shipping_amount "Shipping cost"
        decimal discount_amount "Discount applied"
        decimal total_amount "Final total"
        varchar currency "Currency code (THB, USD, etc)"
        json billing_address "Billing address snapshot"
        json shipping_address "Shipping address snapshot"
        varchar payment_method "Payment method used"
        enum payment_status "PENDING|PAID|FAILED|REFUNDED"
        varchar tracking_number "Shipping tracking number"
        text notes "Order notes"
        timestamp confirmed_at "Order confirmation time"
        timestamp shipped_at "Shipping time"
        timestamp delivered_at "Delivery time"
        timestamp created_at "Creation timestamp"
        timestamp updated_at "Last update timestamp"
    }

    OrderItem {
        uuid id PK
        uuid order_id FK "References Order.id"
        uuid product_id FK "References Product.id"
        varchar product_name "Product name at time of order"
        varchar product_sku "Product SKU at time of order"
        integer quantity "Ordered quantity"
        decimal price "Price at time of order"
        json product_options "Selected options"
        timestamp created_at "Creation timestamp"
    }

    Review {
        uuid id PK
        uuid user_id FK "References User.id"
        uuid product_id FK "References Product.id"
        uuid order_id FK "References Order.id"
        integer rating "Rating (1-5 stars)"
        varchar title "Review title"
        text content "Review content"
        boolean is_verified "Verified purchase"
        boolean is_featured "Featured review"
        enum status "PENDING|APPROVED|REJECTED"
        timestamp created_at "Creation timestamp"
        timestamp updated_at "Last update timestamp"
    }

    Wishlist {
        uuid id PK
        uuid user_id FK "References User.id"
        varchar name "Wishlist name"
        boolean is_default "Default wishlist flag"
        enum privacy "PRIVATE|PUBLIC|SHARED"
        timestamp created_at "Creation timestamp"
        timestamp updated_at "Last update timestamp"
    }

    WishlistItem {
        uuid id PK
        uuid wishlist_id FK "References Wishlist.id"
        uuid product_id FK "References Product.id"
        text notes "Item notes"
        timestamp created_at "Creation timestamp"
    }

    %% Relationships
    User ||--o{ UserAddress : "has multiple addresses"
    User ||--o{ Cart : "has carts"
    User ||--o{ Order : "places orders"
    User ||--o{ Review : "writes reviews"
    User ||--o{ Wishlist : "creates wishlists"

    Category ||--o{ Category : "parent-child hierarchy"
    Category ||--o{ ProductCategory : "categorizes products"
    
    Product ||--o{ ProductCategory : "belongs to categories"
    Product ||--o{ CartItem : "added to carts"
    Product ||--o{ OrderItem : "ordered items"
    Product ||--o{ Review : "receives reviews"
    Product ||--o{ WishlistItem : "saved to wishlists"

    Cart ||--o{ CartItem : "contains items"
    Order ||--o{ OrderItem : "contains items"
    Wishlist ||--o{ WishlistItem : "contains items"

    ProductCategory }|--|| Product : ""
    ProductCategory }|--|| Category : ""
```

## 🏗️ System Architecture

### High-Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Frontend]
        MOBILE[Mobile App]
        API_DOCS[API Documentation]
    end

    subgraph "Load Balancer"
        ALB[Application Load Balancer]
    end

    subgraph "Application Layer"
        subgraph "API Gateway"
            GATEWAY[NestJS API Gateway]
            AUTH[Authentication Service]
            RATE[Rate Limiting]
        end
        
        subgraph "Microservices"
            USER_SVC[User Service]
            PRODUCT_SVC[Product Service]
            ORDER_SVC[Order Service]
            CART_SVC[Cart Service]
            PAYMENT_SVC[Payment Service]
            NOTIFICATION_SVC[Notification Service]
        end
    end

    subgraph "Data Layer"
        subgraph "Primary Database"
            POSTGRES[(PostgreSQL<br/>Primary)]
            READ_REPLICA[(PostgreSQL<br/>Read Replica)]
        end
        
        subgraph "Caching Layer"
            REDIS[(Redis<br/>Cache & Sessions)]
            MEMCACHED[(Memcached<br/>Query Cache)]
        end
        
        subgraph "Search & Analytics"
            ELASTICSEARCH[(Elasticsearch<br/>Product Search)]
            ANALYTICS[(Analytics DB<br/>ClickHouse)]
        end
    end

    subgraph "External Services"
        PAYMENT_GATEWAY[Payment Gateway<br/>Stripe, PayPal]
        SHIPPING[Shipping APIs<br/>DHL, FedEx]
        EMAIL[Email Service<br/>SendGrid]
        SMS[SMS Service<br/>Twilio]
        GEOCODING[Geocoding API<br/>Google Maps]
    end

    subgraph "Infrastructure"
        subgraph "Monitoring"
            METRICS[Prometheus]
            LOGGING[ELK Stack]
            TRACING[Jaeger]
        end
        
        subgraph "Message Queue"
            RABBITMQ[RabbitMQ]
            SQS[AWS SQS]
        end
        
        subgraph "File Storage"
            S3[AWS S3<br/>Images & Files]
            CDN[CloudFront CDN]
        end
    end

    %% Client connections
    WEB --> ALB
    MOBILE --> ALB
    API_DOCS --> ALB

    %% Load balancer to API Gateway
    ALB --> GATEWAY

    %% API Gateway to services
    GATEWAY --> AUTH
    GATEWAY --> RATE
    GATEWAY --> USER_SVC
    GATEWAY --> PRODUCT_SVC
    GATEWAY --> ORDER_SVC
    GATEWAY --> CART_SVC

    %% Service dependencies
    USER_SVC --> POSTGRES
    USER_SVC --> REDIS
    PRODUCT_SVC --> POSTGRES
    PRODUCT_SVC --> ELASTICSEARCH
    ORDER_SVC --> POSTGRES
    ORDER_SVC --> PAYMENT_SVC
    CART_SVC --> REDIS
    
    %% Payment and notifications
    PAYMENT_SVC --> PAYMENT_GATEWAY
    NOTIFICATION_SVC --> EMAIL
    NOTIFICATION_SVC --> SMS
    
    %% External integrations
    USER_SVC --> GEOCODING
    ORDER_SVC --> SHIPPING
    
    %% Data replication
    POSTGRES --> READ_REPLICA
    
    %% Message queues
    ORDER_SVC --> RABBITMQ
    NOTIFICATION_SVC --> RABBITMQ
    
    %% File storage
    PRODUCT_SVC --> S3
    S3 --> CDN
    
    %% Monitoring
    USER_SVC --> METRICS
    PRODUCT_SVC --> METRICS
    ORDER_SVC --> LOGGING

    %% Styling
    classDef clientClass fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef appClass fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef dataClass fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef externalClass fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef infraClass fill:#fce4ec,stroke:#880e4f,stroke-width:2px

    class WEB,MOBILE,API_DOCS clientClass
    class GATEWAY,AUTH,RATE,USER_SVC,PRODUCT_SVC,ORDER_SVC,CART_SVC,PAYMENT_SVC,NOTIFICATION_SVC appClass
    class POSTGRES,READ_REPLICA,REDIS,MEMCACHED,ELASTICSEARCH,ANALYTICS dataClass
    class PAYMENT_GATEWAY,SHIPPING,EMAIL,SMS,GEOCODING externalClass
    class METRICS,LOGGING,TRACING,RABBITMQ,SQS,S3,CDN infraClass
```

## 🔄 Data Flow Architecture

### User Registration & Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API_Gateway
    participant Auth_Service
    participant User_Service
    participant Database
    participant Cache

    Client->>API_Gateway: POST /v1/users/register
    API_Gateway->>User_Service: Validate & Create User
    User_Service->>Database: Check email uniqueness
    Database-->>User_Service: Email available
    User_Service->>User_Service: Hash password
    User_Service->>Database: Save user
    Database-->>User_Service: User created
    User_Service-->>API_Gateway: Success response
    API_Gateway-->>Client: 201 Created

    Note over Client,Cache: Login Flow
    Client->>API_Gateway: POST /v1/users/login
    API_Gateway->>Auth_Service: Authenticate user
    Auth_Service->>Database: Get user by email
    Database-->>Auth_Service: User data
    Auth_Service->>Auth_Service: Verify password
    Auth_Service->>Auth_Service: Generate JWT token
    Auth_Service->>Cache: Store session
    Auth_Service-->>API_Gateway: JWT token
    API_Gateway-->>Client: Login success + token
```

### Order Processing Flow

```mermaid
sequenceDiagram
    participant Client
    participant Order_Service
    participant Cart_Service
    participant Product_Service
    participant Payment_Service
    participant Notification_Service
    participant Database
    participant Queue

    Client->>Order_Service: POST /v1/orders (create from cart)
    Order_Service->>Cart_Service: Get cart items
    Cart_Service-->>Order_Service: Cart data
    Order_Service->>Product_Service: Validate products & stock
    Product_Service-->>Order_Service: Products available
    Order_Service->>Database: Create order (PENDING)
    Database-->>Order_Service: Order created
    
    Order_Service->>Payment_Service: Process payment
    Payment_Service->>Payment_Service: Call payment gateway
    Payment_Service-->>Order_Service: Payment successful
    
    Order_Service->>Database: Update order (CONFIRMED)
    Order_Service->>Product_Service: Update stock quantities
    Order_Service->>Cart_Service: Clear cart
    
    Order_Service->>Queue: Publish order_confirmed event
    Queue->>Notification_Service: Send confirmation email
    Queue->>Notification_Service: Send SMS notification
    
    Order_Service-->>Client: Order confirmation
```

## 📈 Scalability Patterns

### Database Scaling Strategy

Our system leverages **CQRS (Command Query Responsibility Segregation)** pattern, allowing us to use a simpler and more maintainable scaling approach without the complexity of sharding.

```mermaid
graph TB
    subgraph "Application Layer (CQRS)"
        subgraph "Write Operations"
            CMD1[Command Service 1]
            CMD2[Command Service 2]
        end
        
        subgraph "Read Operations"
            QUERY1[Query Service 1]
            QUERY2[Query Service 2]
            QUERY3[Query Service 3]
        end
    end

    subgraph "Database Layer"
        subgraph "Write Database"
            WRITE_DB[(PostgreSQL Primary<br/>Optimized for Writes)]
        end
        
        subgraph "Read Databases"
            READ_DB1[(Read Replica 1<br/>Load Balanced)]
            READ_DB2[(Read Replica 2<br/>Load Balanced)]
            READ_DB3[(Read Replica 3<br/>Geographic)]
        end
    end

    subgraph "Caching Layer (AWS)"
        subgraph "ElastiCache"
            REDIS_CLUSTER[Redis Cluster<br/>Session & Hot Data]
            MEMCACHED[Memcached<br/>Query Results]
        end
        
        subgraph "Application Cache"
            L1_CACHE[In-Memory Cache<br/>Frequently Used Data]
        end
        
        subgraph "CDN"
            CLOUDFRONT[CloudFront<br/>Static Assets]
        end
    end

    %% Write flow
    CMD1 --> WRITE_DB
    CMD2 --> WRITE_DB
    
    %% Read flow with caching
    QUERY1 --> L1_CACHE
    QUERY2 --> L1_CACHE
    QUERY3 --> L1_CACHE
    
    L1_CACHE --> REDIS_CLUSTER
    L1_CACHE --> MEMCACHED
    
    REDIS_CLUSTER --> READ_DB1
    REDIS_CLUSTER --> READ_DB2
    MEMCACHED --> READ_DB1
    MEMCACHED --> READ_DB2
    
    %% Replication
    WRITE_DB -.->|Async Replication| READ_DB1
    WRITE_DB -.->|Async Replication| READ_DB2
    WRITE_DB -.->|Async Replication| READ_DB3
    
    %% Cache invalidation
    WRITE_DB -.->|Invalidate| REDIS_CLUSTER
    WRITE_DB -.->|Invalidate| MEMCACHED

    classDef writeClass fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef readClass fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef cacheClass fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px

    class CMD1,CMD2,WRITE_DB writeClass
    class QUERY1,QUERY2,QUERY3,READ_DB1,READ_DB2,READ_DB3 readClass
    class REDIS_CLUSTER,MEMCACHED,L1_CACHE,CLOUDFRONT cacheClass
```

#### Key Benefits of CQRS-based Scaling:

1. **Simplified Architecture**: No complex sharding logic or data distribution
2. **Independent Scaling**: Scale reads and writes independently based on actual load
3. **Optimized Performance**: 
   - Write database optimized for transactional consistency
   - Read replicas optimized for complex queries and reporting
4. **Cache Strategy**:
   - **L1 Cache**: In-memory application cache for immediate response
   - **AWS ElastiCache Redis**: Distributed cache for session data and frequently accessed objects
   - **AWS ElastiCache Memcached**: Query result caching with automatic expiration
   - **CloudFront CDN**: Static asset and API response caching at edge locations

#### AWS ElastiCache Configuration:

```yaml
# Redis Cluster for Session & Object Cache
Redis:
  Engine: redis
  CacheNodeType: cache.r6g.xlarge
  NumCacheNodes: 3
  AutomaticFailoverEnabled: true
  MultiAZEnabled: true
  Features:
    - Session storage
    - Shopping cart data
    - User preferences
    - Hot product data
    - Real-time inventory

# Memcached for Query Results
Memcached:
  Engine: memcached
  CacheNodeType: cache.m6g.large
  NumCacheNodes: 4
  Features:
    - Product search results
    - Category listings
    - Computed aggregations
    - API response caching
```

## 🔒 Security Architecture

### Authentication & Authorization Flow

```mermaid
graph TD
    subgraph "Client Layer"
        CLIENT[Client Application]
    end

    subgraph "Security Layer"
        subgraph "Edge Security"
            WAF[Web Application Firewall]
            DDOS[DDoS Protection]
            SSL[SSL Termination]
        end
        
        subgraph "API Security"
            RATE_LIMIT[Rate Limiting]
            JWT_GUARD[JWT Authentication]
            RBAC[Role-Based Access Control]
            API_KEY[API Key Validation]
        end
    end

    subgraph "Application Layer"
        API_GATEWAY[API Gateway]
        AUTH_SERVICE[Authentication Service]
        USER_SERVICE[User Service]
    end

    subgraph "Data Security"
        ENCRYPTION[Data Encryption at Rest]
        AUDIT[Audit Logging]
        BACKUP[Encrypted Backups]
    end

    CLIENT --> WAF
    WAF --> DDOS
    DDOS --> SSL
    SSL --> RATE_LIMIT
    RATE_LIMIT --> JWT_GUARD
    JWT_GUARD --> RBAC
    RBAC --> API_KEY
    API_KEY --> API_GATEWAY
    
    API_GATEWAY --> AUTH_SERVICE
    API_GATEWAY --> USER_SERVICE
    
    AUTH_SERVICE --> ENCRYPTION
    USER_SERVICE --> AUDIT
    AUDIT --> BACKUP

    classDef securityClass fill:#ffebee,stroke:#c62828,stroke-width:2px
    class WAF,DDOS,SSL,RATE_LIMIT,JWT_GUARD,RBAC,API_KEY,ENCRYPTION,AUDIT,BACKUP securityClass
```

## 🚀 Deployment Architecture

### Simple Docker Compose Deployment

```mermaid
graph TB
    subgraph "GitHub Repository"
        CODE[Source Code]
        DOCKERFILE[Dockerfile]
        COMPOSE_FILES[docker-compose.yml<br/>docker-compose.prod.yml]
        ENV_EXAMPLE[.env.example]
    end

    subgraph "GitHub Actions CI/CD"
        TRIGGER[Push to main]
        BUILD[Build Docker Images]
        TEST[Run Tests]
        DEPLOY[Deploy via SSH]
    end

    subgraph "Production Server (EC2)"
        subgraph "Docker Compose Stack"
            NGINX[NGINX Container<br/>Reverse Proxy & SSL]
            API1[API Container 1]
            API2[API Container 2]
            API3[API Container 3]
            WORKER[Worker Container]
        end
        
        ENV_PROD[.env.production]
        VOLUMES[Docker Volumes]
    end

    subgraph "AWS Managed Services"
        RDS[AWS RDS<br/>PostgreSQL]
        ELASTICACHE[AWS ElastiCache<br/>Redis]
        S3[AWS S3<br/>File Storage]
    end

    %% CI/CD Flow
    CODE --> TRIGGER
    TRIGGER --> BUILD
    BUILD --> TEST
    TEST --> DEPLOY
    DEPLOY --> Production Server

    %% Docker Compose
    COMPOSE_FILES --> Docker Compose Stack
    ENV_PROD --> Docker Compose Stack

    %% Service connections
    NGINX --> API1
    NGINX --> API2
    NGINX --> API3
    
    API1 --> RDS
    API2 --> RDS
    API3 --> RDS
    API1 --> ELASTICACHE
    API2 --> ELASTICACHE
    API3 --> ELASTICACHE
    WORKER --> RDS
    WORKER --> ELASTICACHE
    
    API1 --> S3
    API2 --> S3
    API3 --> S3

    classDef gitClass fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef dockerClass fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef awsClass fill:#fff3e0,stroke:#f57c00,stroke-width:2px

    class CODE,DOCKERFILE,COMPOSE_FILES,ENV_EXAMPLE,TRIGGER,BUILD,TEST,DEPLOY gitClass
    class NGINX,API1,API2,API3,WORKER,ENV_PROD,VOLUMES dockerClass
    class RDS,ELASTICACHE,S3 awsClass
```

#### Production Docker Compose (docker-compose.prod.yml):

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    container_name: opn-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: always

  api:
    build:
      context: .
      dockerfile: Dockerfile
    image: opn-commerce-api:latest
    environment:
      - NODE_ENV=production
      - PORT=8091
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - S3_BUCKET=${S3_BUCKET}
    deploy:
      replicas: 3
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8091/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  worker:
    build:
      context: .
      dockerfile: Dockerfile.worker
    image: opn-commerce-worker:latest
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    restart: always
    depends_on:
      - api

networks:
  default:
    driver: bridge

volumes:
  nginx_ssl:
  upload_data:
```

#### GitHub Actions Deployment (.github/workflows/deploy.yml):

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/opn-commerce
            git pull origin main
            docker-compose -f docker-compose.prod.yml down
            docker-compose -f docker-compose.prod.yml build
            docker-compose -f docker-compose.prod.yml up -d
            docker system prune -f
```

#### Key Benefits:

1. **Ultra Simple**: Just Docker Compose, no orchestration complexity
2. **One Command Deploy**: `docker-compose up -d` handles everything
3. **GitHub Actions**: Automated deployment on push to main
4. **Cost Effective**: Single EC2 instance can handle moderate traffic
5. **Easy Maintenance**: Standard Docker commands for troubleshooting
