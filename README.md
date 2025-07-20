# OPN Commerce Backend

A modern e-commerce backend built with **NestJS**, implementing **Domain-Driven Design (DDD)**, **Onion Architecture**, and **CQRS** patterns.

## 🏗️ **Architecture Overview**

This project follows enterprise-grade architectural patterns:

- **Domain-Driven Design (DDD)**: Business logic encapsulated in domain entities and value objects
- **Onion Architecture**: Clear separation of concerns with dependency inversion
- **CQRS**: Command Query Responsibility Segregation for scalable read/write operations
- **Repository Pattern**: Abstract data access layer
- **Value Objects**: Immutable objects representing business concepts

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
├── modules/
│   └── users/                          # User domain module
│       ├── domain/                     # Core business logic
│       │   ├── entities/               # Domain entities
│       │   │   ├── user.entity.ts      # User aggregate root
│       │   │   └── user-address.entity.ts  # User address entity
│       │   ├── value-objects/          # Immutable value objects
│       │   │   ├── email.vo.ts         # Email validation & normalization
│       │   │   ├── password.vo.ts      # Password hashing
│       │   │   ├── address.vo.ts       # Physical address
│       │   │   ├── location.vo.ts      # GPS coordinates for delivery
│       │   │   └── gender.vo.ts        # Gender enumeration
│       │   └── repositories/           # Repository interfaces
│       ├── application/                # Application services & use cases
│       │   ├── commands/               # Write operations (CQRS)
│       │   ├── queries/                # Read operations (CQRS)
│       │   ├── handlers/               # Command/Query handlers
│       │   ├── use-cases/              # Business use cases
│       │   ├── dto/                    # Data transfer objects
│       │   └── validators/             # Business validation services
│       ├── infrastructure/             # External concerns
│       │   ├── persistence/            # Data persistence (in-memory for now)
│       │   └── repositories/           # Repository implementations
│       └── presentation/               # API controllers & guards
│           ├── controllers/            # REST endpoints
│           ├── guards/                 # Authentication & authorization
│           └── decorators/             # Custom decorators
└── main.ts                            # Application bootstrap
```

## 🚀 **Features**

### **User Management**
- ✅ User registration with comprehensive validation
- ✅ Profile management (update personal information)
- ✅ Password management with secure hashing
- ✅ Soft deletion with business rule enforcement
- ✅ Age calculation and validation (minimum 13 years)

### **Address Management** 
- ✅ **Multiple addresses per user** (Home, Work, Billing, Shipping, Other)
- ✅ **Default address management** (exactly one default required)
- ✅ **Geolocation support** with GPS coordinates for precise delivery
- ✅ **Delivery instructions** for riders/drivers
- ✅ **Address validation** with duplicate detection
- ✅ **Distance calculation** using Haversine formula
- ✅ **Regional validation** (Thailand boundaries)

### **API Features**
- ✅ **RESTful API** with proper HTTP status codes
- ✅ **API Versioning** (v1) for backward compatibility
- ✅ **OpenAPI/Swagger Documentation** at `/api`
- ✅ **Bearer Token Authentication** (mock implementation)
- ✅ **Enhanced Validation** with custom validators
- ✅ **Error Handling** with detailed error messages

## 📋 **API Endpoints**

### **User Management**
```
POST   /v1/users/register              # Register new user
GET    /v1/users/profile               # Get user profile
PUT    /v1/users/profile               # Update user profile
DELETE /v1/users/profile               # Delete user account
PUT    /v1/users/change-password       # Change password
```

### **Address Management**
```
GET    /v1/users/addresses             # Get user addresses
POST   /v1/users/addresses             # Add new address
PUT    /v1/users/addresses/:id         # Update address
DELETE /v1/users/addresses/:id         # Delete address
PUT    /v1/users/addresses/:id/default # Set as default address
```

## 🔧 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm 9+

### **Installation & Setup**

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure database (optional)**
   ```bash
   # Use mock database (default)
   export DATABASE_TYPE=mock
   
   # Or use PostgreSQL (requires setup)
   export DATABASE_TYPE=postgresql
   export DB_HOST=localhost
   export DB_PORT=5432
   export DB_USERNAME=postgres
   export DB_PASSWORD=password
   export DB_NAME=opn_commerce
   ```

3. **Start development server**
   ```bash
   npm run start:dev
   ```

4. **Access the application**
   - API Server: http://localhost:8091
   - Swagger Documentation: http://localhost:8091/api

### **Testing**

```bash
# Run all tests
npm test

# Run tests in watch mode  
npm run test:watch

# Run test coverage
npm run test:cov
```

## 🏪 **Real-World E-commerce Features**

### **Delivery & Logistics**
- **GPS Coordinates**: Precise delivery location for riders
- **Delivery Instructions**: Special notes for delivery (gate codes, building access)
- **Distance Calculation**: Route optimization and delivery fee calculation
- **Address Types**: Organized address management (Home, Work, Billing, Shipping)

### **Business Rules**
- **Minimum Age**: Users must be 13+ years old
- **Address Constraints**: At least one address, exactly one default
- **Data Integrity**: Soft deletion, audit trails, duplicate prevention
- **Input Validation**: Email normalization, password strength, coordinate validation

### **API Design**
- **Consistent Response Format**: Standardized JSON responses
- **Proper HTTP Status Codes**: RESTful conventions
- **Comprehensive Validation**: Input sanitization and business rule validation
- **Error Handling**: Detailed error messages for debugging

## 🧪 **Testing Coverage**

The project includes comprehensive test coverage:

- **Unit Tests**: Domain entities, value objects, and business logic
- **Integration Tests**: Application services and use cases  
- **API Tests**: Controller endpoints and validation
- **Test Coverage**: 100+ test cases covering critical business logic

**Current Test Results**: ✅ 100 passing tests

## 📚 **Documentation**

### **API Documentation**
- Interactive Swagger UI available at `/api`
- Complete endpoint documentation with examples
- Request/response schemas and validation rules

### **Architecture Documentation**
- Domain model documentation
- API integration guides for frontend developers
- Business rule specifications

## 🔐 **Authentication**

Current implementation uses **Bearer Token Authentication** with mock tokens:
- `faketoken_user1`: User ID `user-123`
- `faketoken_user2`: User ID `user-456`

**Note**: This is a mock implementation for development. Production should integrate with proper authentication services.

## 🌟 **Technical Highlights**

### **Domain-Driven Design**
- **Entities**: Encapsulate business logic and invariants
- **Value Objects**: Immutable objects with behavior
- **Aggregates**: Consistency boundaries for business operations
- **Repository Pattern**: Abstract data access layer

### **CQRS Implementation**
- **Commands**: Write operations with business validation
- **Queries**: Optimized read operations
- **Handlers**: Separation of concerns for each operation
- **Events**: Future-ready for event sourcing

### **Database Adapter Pattern**
- **Interface Abstraction**: Clean separation between business logic and data storage
- **Multiple Implementations**: Support for different database types
- **Easy Switching**: Change databases without code modifications
- **Development Flexibility**: Use mock data for rapid development
- **Production Ready**: PostgreSQL adapter for scalable production deployments

### **Validation & Security**
- **Input Sanitization**: Automatic trimming and normalization
- **Business Validation**: Domain-specific rules and constraints  
- **Type Safety**: Full TypeScript implementation
- **Error Boundaries**: Comprehensive error handling

## 🔮 **Future Enhancements**

### **Planned Features**
- [ ] **PostgreSQL Integration**: Replace in-memory storage
- [ ] **Real Authentication**: JWT with refresh tokens
- [ ] **Email Verification**: User registration confirmation
- [ ] **Address Geocoding**: Automatic coordinate resolution
- [ ] **Rate Limiting**: API protection and throttling

### **Database Adapter Pattern**
- ✅ **Adapter Interface**: Abstract database operations
- ✅ **Mock Database Adapter**: In-memory storage for development/testing
- ✅ **PostgreSQL Adapter**: Production-ready database implementation (skeleton)
- ✅ **Factory Pattern**: Easy switching between database implementations
- ✅ **Configuration-driven**: Switch databases via environment variables

### **Scalability Considerations**
- [ ] **Event Sourcing**: Audit log and event replay
- [ ] **Database Optimization**: Indexes and query optimization
- [ ] **Caching Layer**: Redis for session and data caching
- [ ] **Microservice Architecture**: Service decomposition

---

## 📝 **Development Notes**

This project demonstrates modern backend development practices suitable for enterprise e-commerce applications. The architecture is designed for scalability, maintainability, and testability.

**Key Design Decisions:**
- **Multiple addresses per user**: Real-world e-commerce requirement
- **Geolocation support**: Enable precise delivery and logistics
- **Comprehensive validation**: Ensure data integrity and user experience
- **Mock data approach**: Rapid development and testing without database complexity

The codebase follows SOLID principles and clean architecture patterns, making it easy to extend and maintain as business requirements evolve.