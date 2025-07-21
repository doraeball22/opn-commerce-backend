# OPN Commerce Backend

A modern e-commerce backend built with **NestJS**, implementing **Domain-Driven Design (DDD)**, **Onion Architecture**, and **CQRS** patterns.

## 📝 **Challenge Assignments & Solutions**

This repository contains solutions for the OPN.Pro Engineering Challenge. See [**Assignment Details**](docs/ASSIGNMENTS.md) for the complete requirements.

### **Assignment Solutions:**

1. **Exercise 1: RESTful API** ✅ 
   - **Solution**: [User Module Documentation](src/modules/users/README.md)
   - Implemented complete user management system with DDD, CQRS, and JWT authentication

2. **Exercise 2: Database Design** ✅
   - **Solution**: [Database Design Document](docs/EXERCISE-2.md)
   - Designed scalable database schema for e-commerce platform

3. **Exercise 3: OOP - Cart Service** ✅
   - **Solution**: [Cart Module Documentation](src/modules/cart/README.md)
   - Built comprehensive cart system with discounts and freebies using OOP principles

4. **Exercise 4: Solution Architecture** ✅
   - **Solution**: [Architecture Design Document](docs/EXERCISE-4.md)
   - Designed microservices architecture for Instagram-like MVP

## 🏗️ **Architecture Overview**

This project follows enterprise-grade architectural patterns:

- **Domain-Driven Design (DDD)**: Business logic encapsulated in domain entities and value objects
- **Onion Architecture**: Clear separation of concerns with dependency inversion
- **CQRS**: Command Query Responsibility Segregation for scalable read/write operations
- **Repository Pattern**: Abstract data access layer
- **Value Objects**: Immutable objects representing business concepts
- **Shared Authentication**: Global JWT-based auth system for all modules

### **Architecture Layers**

```
┌─────────────────────────────────────────────────┐
│                Presentation                     │ ← Controllers, Guards, Decorators
├─────────────────────────────────────────────────┤
│                Application                      │ ← Use Cases (Commands/Queries), DTOs
├─────────────────────────────────────────────────┤
│                Infrastructure                   │ ← Repositories, External Services
├─────────────────────────────────────────────────┤
│                Domain                           │ ← Entities, Value Objects, Business Logic
└─────────────────────────────────────────────────┘
```

### **Project Structure**

```
src/
├── shared/                            # Shared cross-cutting concerns
│   ├── auth/                          # JWT authentication system
│   ├── database/                      # Database adapters & interfaces
│   ├── exceptions/                    # Global error handling
│   └── types/                         # Shared TypeScript types
├── modules/
│   ├── users/                         # User management & authentication
│   ├── products/                      # Product catalog & inventory
│   └── cart/                          # Shopping cart & discounts
└── main.ts                            # Application bootstrap
```

### **Standard Module Structure**

Each module follows DDD and CQRS patterns with this consistent structure:

```
src/modules/{module-name}/
├── domain/                            # Core business logic (Domain Layer)
│   ├── entities/                      # Domain entities & aggregates
│   │   ├── {entity}.entity.ts        # Aggregate roots
│   │   └── {sub-entity}.entity.ts    # Child entities
│   ├── value-objects/                 # Immutable value objects
│   │   ├── {concept}.vo.ts           # Business concepts
│   │   └── {rule}.vo.ts              # Business rules
│   ├── repositories/                  # Repository interfaces
│   │   └── {entity}.repository.ts    # Abstract data access
│   └── services/                      # Domain services
│       └── {business}.service.ts     # Complex business logic
├── application/                       # Use cases & orchestration (Application Layer)
│   ├── commands/                      # Write operations (CQRS)
│   │   ├── {action}.command.ts       # Command definitions
│   │   └── {action}.handler.ts       # Command handlers
│   ├── queries/                       # Read operations (CQRS)
│   │   ├── {fetch}.query.ts          # Query definitions
│   │   └── {fetch}.handler.ts        # Query handlers
│   ├── use-cases/                     # Business use cases
│   │   └── {feature}.use-case.ts     # Use case orchestration
│   ├── dto/                           # Data transfer objects
│   │   ├── {input}.dto.ts            # Request validation
│   │   └── {output}.dto.ts           # Response formatting
│   └── services/                      # Application services
│       └── {module}.service.ts       # Service facade
├── infrastructure/                    # External dependencies (Infrastructure Layer)
│   ├── persistence/                   # Data persistence
│   │   └── {adapter}.repository.ts   # Repository implementations
│   ├── adapters/                      # External service adapters
│   │   └── {service}.adapter.ts      # Third-party integrations
│   └── mappers/                       # Data mappers
│       └── {entity}.mapper.ts        # Domain-DB mapping
└── presentation/                      # HTTP interface (Presentation Layer)
    ├── controllers/                   # REST controllers
    │   └── {module}.controller.ts     # API endpoints
    ├── guards/                        # Security guards
    │   └── {permission}.guard.ts      # Access control
    └── decorators/                    # Custom decorators
        └── {feature}.decorator.ts     # Request enhancements
```

## 📚 **Module Documentation**

### **Domain Modules**
Each module contains detailed documentation with architecture diagrams, business rules, and implementation details:

- **[User Module](src/modules/users/README.md)** - User management, authentication, multi-address support
- **[Product Module](src/modules/products/README.md)** - Product catalog, inventory, categories
- **[Cart Module](src/modules/cart/README.md)** - Shopping cart, discounts, freebies

### **Shared Modules**
Core functionality shared across all domain modules:

- **Auth Module** - JWT-based authentication system with guards and decorators
- **Database Module** - Adapter pattern for database abstraction (Mock/PostgreSQL)
- **Exception Filters** - Global error handling with consistent error responses
- **Common Types** - Shared TypeScript interfaces and types

## 🚀 **Features**

### **User Management**
- ✅ User registration with comprehensive validation
- ✅ JWT authentication with shared auth system
- ✅ Multi-address support with geolocation
- ✅ Profile management with business rules

### **Product Management**
- ✅ Product catalog with categories and specifications
- ✅ Inventory tracking with stock management
- ✅ Price management with currency support

### **Cart Management**
- ✅ Shopping cart with item management
- ✅ Discount system (fixed & percentage)
- ✅ Freebie rules and promotions
- ✅ OOP-based design patterns

### **API Features**
- ✅ RESTful API with proper HTTP status codes
- ✅ API Versioning (v1) for backward compatibility
- ✅ OpenAPI/Swagger Documentation at `/api`
- ✅ Enhanced validation with custom validators
- ✅ Comprehensive error handling

## 📋 **Quick API Reference**

### **Authentication**
```
POST   /v1/users/register              # Register new user
POST   /v1/users/login                 # Login and get JWT token
```

### **User Management**
```
GET    /v1/users/profile               # Get user profile (requires auth)
PUT    /v1/users/profile               # Update user profile (requires auth)
DELETE /v1/users/profile               # Delete user account (requires auth)
```

### **Address Management**
```
GET    /v1/users/addresses             # Get user addresses (requires auth)
POST   /v1/users/addresses             # Add new address (requires auth)
PUT    /v1/users/addresses/:id         # Update address (requires auth)
DELETE /v1/users/addresses/:id         # Delete address (requires auth)
```

## 🔧 **Getting Started**

### **Prerequisites**
- Node.js 22+ 
- npm 10+

### **Quick Start**

1. **Clone and setup**
   ```bash
   # Copy environment configuration
   cp .env.example .env
   
   # Install dependencies
   npm install
   ```

2. **Start development server**
   ```bash
   npm run start:dev
   ```

3. **Access the application**
   - API Server: http://localhost:8091
   - Swagger Documentation: http://localhost:8091/api
   - **Live Demo**: http://opn-commerce-prod.eba-ezypbcyr.ap-southeast-1.elasticbeanstalk.com/api
   
   > **Note**: The `.env.example` is pre-configured to work immediately with mock data. No additional setup required!

### **Configuration**

The application uses environment variables for configuration. Copy `.env.example` to `.env` and configure:

```bash
# Application
PORT=8091
DATABASE_TYPE=mock        # Use 'postgresql' for production

# Security (change in production)
JWT_SECRET=your-secret-key-change-in-production

# API Documentation
API_DOCS_ENABLED=true
```

### **Testing**

```bash
# Run all tests
npm test

# Run tests in watch mode  
npm run test:watch

# Run test coverage
npm run test:cov
```

## 🔐 **Authentication**

### **Test Users (Development)**
Pre-seeded test users for development:
- Email: `john.doe@example.com`, Password: `password123`
- Email: `jane.smith@example.com`, Password: `password123`
- Email: `bob.wilson@example.com`, Password: `password123`

### **Login Example**
```bash
# Login to get JWT token
curl -X POST http://localhost:8091/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john.doe@example.com", "password": "password123"}'

# Use token in protected endpoints
curl -X GET http://localhost:8091/v1/users/profile \
  -H "Authorization: Bearer <your-jwt-token>"
```

## 📚 **Documentation**

- **Interactive API Documentation**: Available at `/api` when running the server
- **Module-specific Documentation**: See individual module README files for detailed architecture and implementation guides
- **Architecture Patterns**: Domain-Driven Design, CQRS, Onion Architecture

## 🌟 **Technical Highlights**

- **Domain-Driven Design** with rich domain models and business rules
- **CQRS Pattern** with separate command/query handling
- **Database Adapter Pattern** supporting multiple database implementations
- **JWT Authentication** with shared auth system across modules
- **Comprehensive Testing** with unit and integration tests
- **Type Safety** with strict TypeScript implementation

---

## 👥 **Contributing**

### **Development Workflow**

1. **Create feature branch**: `git checkout -b feat/your-feature-name`
2. **Make changes**: Follow coding standards and write tests
3. **Commit changes**: Use conventional commit format
4. **Create Pull Request**: Include description and testing notes

### **Commit Convention**

This project follows [Conventional Commits](https://www.conventionalcommits.org/) format:

```bash
# Examples
feat(users): add multi-address support with geolocation
fix(auth): resolve token validation issue in bearer guard
docs: update API documentation with new endpoints
refactor(cart): extract discount logic into service
```

### **Code Standards**

- **TypeScript**: Strict mode with comprehensive typing
- **ESLint & Prettier**: Enforced code style and formatting
- **Testing**: Maintain test coverage above 80%
- **Documentation**: Update module README files with changes

---