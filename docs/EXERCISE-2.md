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
        PAYMENT_GATEWAY[Payment Gateway<br/>(Stripe, PayPal)]
        SHIPPING[Shipping APIs<br/>(DHL, FedEx)]
        EMAIL[Email Service<br/>(SendGrid)]
        SMS[SMS Service<br/>(Twilio)]
        GEOCODING[Geocoding API<br/>(Google Maps)]
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

```mermaid
graph LR
    subgraph "Application Tier"
        APP1[App Instance 1]
        APP2[App Instance 2]
        APP3[App Instance 3]
    end

    subgraph "Database Tier"
        subgraph "Primary Cluster"
            MASTER[(Master DB<br/>Write Operations)]
            SLAVE1[(Read Replica 1)]
            SLAVE2[(Read Replica 2)]
        end
        
        subgraph "Sharding Strategy"
            SHARD1[(Shard 1<br/>Users A-H)]
            SHARD2[(Shard 2<br/>Users I-P)]
            SHARD3[(Shard 3<br/>Users Q-Z)]
        end
    end

    subgraph "Caching Strategy"
        L1[L1 Cache<br/>Application]
        L2[L2 Cache<br/>Redis]
        L3[L3 Cache<br/>CDN]
    end

    APP1 --> L1
    APP2 --> L1
    APP3 --> L1
    
    L1 --> L2
    L2 --> MASTER
    L2 --> SLAVE1
    L2 --> SLAVE2
    
    MASTER --> SLAVE1
    MASTER --> SLAVE2
    
    APP1 -.-> SHARD1
    APP2 -.-> SHARD2
    APP3 -.-> SHARD3
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

## 📊 Performance Monitoring

### System Monitoring Dashboard

```mermaid
graph TB
    subgraph "Metrics Collection"
        APP_METRICS[Application Metrics<br/>Response Times, Throughput]
        DB_METRICS[Database Metrics<br/>Query Performance, Connections]
        INFRA_METRICS[Infrastructure Metrics<br/>CPU, Memory, Network]
        BUSINESS_METRICS[Business Metrics<br/>Orders, Revenue, Users]
    end

    subgraph "Monitoring Stack"
        PROMETHEUS[Prometheus<br/>Metrics Storage]
        GRAFANA[Grafana<br/>Visualization]
        ALERTMANAGER[AlertManager<br/>Notifications]
        JAEGER[Jaeger<br/>Distributed Tracing]
    end

    subgraph "Alerting Channels"
        SLACK[Slack Notifications]
        EMAIL_ALERT[Email Alerts]
        PAGERDUTY[PagerDuty]
        SMS_ALERT[SMS Alerts]
    end

    APP_METRICS --> PROMETHEUS
    DB_METRICS --> PROMETHEUS
    INFRA_METRICS --> PROMETHEUS
    BUSINESS_METRICS --> PROMETHEUS

    PROMETHEUS --> GRAFANA
    PROMETHEUS --> ALERTMANAGER
    PROMETHEUS --> JAEGER

    ALERTMANAGER --> SLACK
    ALERTMANAGER --> EMAIL_ALERT
    ALERTMANAGER --> PAGERDUTY
    ALERTMANAGER --> SMS_ALERT

    classDef metricsClass fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef monitoringClass fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef alertClass fill:#fce4ec,stroke:#c2185b,stroke-width:2px

    class APP_METRICS,DB_METRICS,INFRA_METRICS,BUSINESS_METRICS metricsClass
    class PROMETHEUS,GRAFANA,ALERTMANAGER,JAEGER monitoringClass
    class SLACK,EMAIL_ALERT,PAGERDUTY,SMS_ALERT alertClass
```

## 🚀 Deployment Architecture

### Container Orchestration

```mermaid
graph TB
    subgraph "Development"
        DEV_ENV[Development Environment<br/>Docker Compose]
    end

    subgraph "CI/CD Pipeline"
        GIT[Git Repository]
        GITHUB_ACTIONS[GitHub Actions]
        DOCKER_BUILD[Docker Build]
        SECURITY_SCAN[Security Scanning]
        TESTS[Automated Testing]
    end

    subgraph "Container Registry"
        ECR[AWS ECR<br/>Docker Images]
    end

    subgraph "Production - Kubernetes"
        subgraph "Ingress"
            NGINX_INGRESS[NGINX Ingress Controller]
            CERT_MANAGER[Cert Manager<br/>SSL Certificates]
        end
        
        subgraph "Application Pods"
            API_PODS[API Service Pods<br/>3 replicas]
            WORKER_PODS[Background Worker Pods<br/>2 replicas]
        end
        
        subgraph "Data Services"
            POSTGRES_STATEFUL[PostgreSQL StatefulSet]
            REDIS_DEPLOYMENT[Redis Deployment]
        end
        
        subgraph "Monitoring"
            PROMETHEUS_OPERATOR[Prometheus Operator]
            GRAFANA_DEPLOYMENT[Grafana Deployment]
        end
    end

    subgraph "External Services"
        RDS[AWS RDS<br/>Managed PostgreSQL]
        ELASTICACHE[AWS ElastiCache<br/>Managed Redis]
        S3_STORAGE[AWS S3<br/>Object Storage]
    end

    DEV_ENV --> GIT
    GIT --> GITHUB_ACTIONS
    GITHUB_ACTIONS --> DOCKER_BUILD
    DOCKER_BUILD --> SECURITY_SCAN
    SECURITY_SCAN --> TESTS
    TESTS --> ECR

    ECR --> API_PODS
    ECR --> WORKER_PODS

    NGINX_INGRESS --> API_PODS
    CERT_MANAGER --> NGINX_INGRESS

    API_PODS --> POSTGRES_STATEFUL
    API_PODS --> REDIS_DEPLOYMENT
    WORKER_PODS --> POSTGRES_STATEFUL

    POSTGRES_STATEFUL -.-> RDS
    REDIS_DEPLOYMENT -.-> ELASTICACHE
    API_PODS --> S3_STORAGE

    PROMETHEUS_OPERATOR --> API_PODS
    PROMETHEUS_OPERATOR --> WORKER_PODS
    GRAFANA_DEPLOYMENT --> PROMETHEUS_OPERATOR

    classDef devClass fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef cicdClass fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef k8sClass fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef awsClass fill:#fff3e0,stroke:#f57c00,stroke-width:2px

    class DEV_ENV devClass
    class GIT,GITHUB_ACTIONS,DOCKER_BUILD,SECURITY_SCAN,TESTS,ECR cicdClass
    class NGINX_INGRESS,CERT_MANAGER,API_PODS,WORKER_PODS,POSTGRES_STATEFUL,REDIS_DEPLOYMENT,PROMETHEUS_OPERATOR,GRAFANA_DEPLOYMENT k8sClass
    class RDS,ELASTICACHE,S3_STORAGE awsClass
```

## 📋 Implementation Checklist

### Phase 1: Core Foundation ✅
- [x] User management with authentication
- [x] Multi-address support with geolocation
- [x] JWT-based security system
- [x] PostgreSQL database adapter
- [x] Comprehensive API documentation

### Phase 2: E-commerce Core (Planned)
- [ ] Product catalog management
- [ ] Category hierarchy
- [ ] Shopping cart functionality
- [ ] Order processing system
- [ ] Payment integration

### Phase 3: Advanced Features (Future)
- [ ] Search and filtering (Elasticsearch)
- [ ] Review and rating system
- [ ] Wishlist functionality
- [ ] Inventory management
- [ ] Analytics and reporting

### Phase 4: Scalability & Performance (Future)
- [ ] Microservices architecture
- [ ] Event-driven communication
- [ ] Advanced caching strategies
- [ ] Database sharding
- [ ] CDN integration

## 🏆 Technical Highlights

### Current Implementation
- **Domain-Driven Design**: Clear business logic separation
- **CQRS Pattern**: Optimized read/write operations
- **Onion Architecture**: Dependency inversion principles
- **Database Adapter Pattern**: Flexible data persistence
- **JWT Authentication**: Secure, stateless authentication
- **Type Safety**: Full TypeScript implementation

### Future Scalability
- **Horizontal Scaling**: Kubernetes-based orchestration
- **Database Scaling**: Read replicas and sharding strategies
- **Caching Layers**: Multi-level caching architecture
- **Event Sourcing**: Audit trails and event replay capabilities
- **Microservices**: Service decomposition for scalability

---

This architecture supports enterprise-grade e-commerce applications with the flexibility to scale from startup to enterprise levels while maintaining code quality, security, and performance standards.