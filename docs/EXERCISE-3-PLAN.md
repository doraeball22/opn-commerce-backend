# Exercise 3: Cart Service Implementation Plan

## Overview
This document outlines the implementation plan for a comprehensive Cart service that manages shopping cart functionality with support for basic operations, utilities, discounts, and freebies.

## Architecture & Design Patterns

### Object-Oriented Design
- **Domain-Driven Design (DDD)** approach with rich domain models
- **Value Objects** for immutable business concepts (Money, Quantity, ProductId)
- **Entities** for cart and cart items with identity and lifecycle
- **Services** for complex business logic (discount calculation, freebie rules)
- **Strategy Pattern** for different discount types
- **Factory Pattern** for creating discount and freebie instances

### File Structure
```
src/modules/cart/
├── domain/
│   ├── entities/
│   │   ├── cart.entity.ts                    # Main Cart aggregate
│   │   ├── cart-item.entity.ts              # Cart item with product & quantity
│   │   └── __tests__/
│   │       ├── cart.entity.spec.ts
│   │       └── cart-item.entity.spec.ts
│   ├── value-objects/
│   │   ├── product-id.vo.ts                 # Product identifier
│   │   ├── quantity.vo.ts                   # Item quantity
│   │   ├── money.vo.ts                      # Reuse from products module
│   │   ├── discount.vo.ts                   # Discount information
│   │   ├── freebie-rule.vo.ts              # Freebie conditions
│   │   └── __tests__/
│   │       ├── product-id.vo.spec.ts
│   │       ├── quantity.vo.spec.ts
│   │       ├── discount.vo.spec.ts
│   │       └── freebie-rule.vo.spec.ts
│   ├── services/
│   │   ├── discount.service.ts              # Discount calculation logic
│   │   ├── freebie.service.ts              # Freebie application logic
│   │   └── __tests__/
│   │       ├── discount.service.spec.ts
│   │       └── freebie.service.spec.ts
│   └── types/
│       ├── discount.types.ts                # Discount enums and interfaces
│       └── freebie.types.ts                # Freebie enums and interfaces
├── application/
│   ├── services/
│   │   ├── cart.service.ts                  # Main cart service (facade)
│   │   └── __tests__/
│   │       └── cart.service.spec.ts
│   ├── dto/
│   │   ├── cart-response.dto.ts            # Cart API response format
│   │   ├── add-item.dto.ts                 # Add item request
│   │   ├── update-item.dto.ts              # Update item request
│   │   ├── apply-discount.dto.ts           # Apply discount request
│   │   └── apply-freebie.dto.ts            # Apply freebie request
│   └── interfaces/
│       ├── cart.service.interface.ts        # Service contract
│       └── product.service.interface.ts     # Product lookup interface
├── infrastructure/
│   ├── services/
│   │   └── mock-product.service.ts         # Mock product data for testing
│   └── __tests__/
│       └── mock-product.service.spec.ts
├── presentation/
│   ├── controllers/
│   │   └── cart.controller.ts              # REST API endpoints
│   └── console/
│       └── cart.console.ts                 # Console demo application
├── cart.module.ts                          # NestJS module configuration
└── README.md                               # Module documentation with examples
```

## Domain Models

### 1. Cart Entity (Aggregate Root)
```typescript
class Cart {
  - id: string
  - items: Map<string, CartItem>
  - discounts: Map<string, Discount>
  - freebies: FreebieRule[]
  - createdAt: Date
  - updatedAt: Date
  
  // Basic Operations
  + addItem(productId: ProductId, quantity: Quantity): void
  + updateItem(productId: ProductId, quantity: Quantity): void
  + removeItem(productId: ProductId): void
  + clear(): void
  
  // Utilities
  + hasProduct(productId: ProductId): boolean
  + isEmpty(): boolean
  + getItems(): CartItem[]
  + getUniqueItemCount(): number
  + getTotalItemCount(): number
  
  // Discount Management
  + applyDiscount(discount: Discount): void
  + removeDiscount(name: string): void
  + getDiscounts(): Discount[]
  
  // Freebie Management
  + applyFreebie(rule: FreebieRule): void
  + removeFreebie(triggerProductId: ProductId): void
  
  // Calculations
  + getSubtotal(): Money
  + getTotalDiscount(): Money
  + getTotal(): Money
  
  // Validation
  + validate(): string[]
}
```

### 2. CartItem Entity
```typescript
class CartItem {
  - productId: ProductId
  - quantity: Quantity
  - unitPrice: Money
  - isFreebie: boolean
  - freebieSource?: ProductId
  
  + getLineTotal(): Money
  + updateQuantity(quantity: Quantity): void
  + markAsFreebie(source: ProductId): void
}
```

### 3. Value Objects

#### ProductId
```typescript
class ProductId {
  - value: string
  + equals(other: ProductId): boolean
  + toString(): string
}
```

#### Quantity
```typescript
class Quantity {
  - value: number
  + add(other: Quantity): Quantity
  + multiply(factor: number): Quantity
  + isPositive(): boolean
}
```

#### Discount
```typescript
class Discount {
  - name: string
  - type: DiscountType (FIXED | PERCENTAGE)
  - amount: number
  - maxAmount?: number
  
  + calculateDiscount(subtotal: Money): Money
  + isValid(): boolean
}
```

#### FreebieRule
```typescript
class FreebieRule {
  - triggerProductId: ProductId
  - freebieProductId: ProductId
  - freebieQuantity: Quantity
  - name: string
  
  + canApply(cart: Cart): boolean
  + apply(cart: Cart): void
}
```

## Services

### 1. Cart Service (Main Application Service)
```typescript
interface ICartService {
  // Basic Operations
  createCart(): Cart
  addItem(cartId: string, productId: string, quantity: number): void
  updateItem(cartId: string, productId: string, quantity: number): void
  removeItem(cartId: string, productId: string): void
  destroyCart(cartId: string): void
  
  // Utilities
  hasProduct(cartId: string, productId: string): boolean
  isEmpty(cartId: string): boolean
  listItems(cartId: string): CartItem[]
  getUniqueItemCount(cartId: string): number
  getTotalItemCount(cartId: string): number
  
  // Discount Operations
  applyFixedDiscount(cartId: string, name: string, amount: number): void
  applyPercentageDiscount(cartId: string, name: string, percentage: number, maxAmount?: number): void
  removeDiscount(cartId: string, name: string): void
  
  // Freebie Operations
  applyFreebie(cartId: string, triggerProductId: string, freebieProductId: string, quantity?: number): void
  removeFreebie(cartId: string, triggerProductId: string): void
  
  // Information
  getCart(cartId: string): Cart
  getCartSummary(cartId: string): CartSummary
}
```

### 2. Discount Service
```typescript
class DiscountService {
  + calculateFixedDiscount(subtotal: Money, amount: number): Money
  + calculatePercentageDiscount(subtotal: Money, percentage: number, maxAmount?: number): Money
  + validateDiscount(discount: Discount): string[]
}
```

### 3. Freebie Service
```typescript
class FreebieService {
  + evaluateFreebieRules(cart: Cart, rules: FreebieRule[]): FreebieRule[]
  + applyFreebie(cart: Cart, rule: FreebieRule): void
  + removeFreebie(cart: Cart, triggerProductId: ProductId): void
}
```

## Implementation Steps

### Phase 1: Core Domain Models (Day 1)
1. **Value Objects Implementation**
   - ProductId with validation and equality
   - Quantity with business rules (positive numbers)
   - Money (reuse from products module)
   - Discount with calculation logic
   - FreebieRule with application conditions

2. **Entity Implementation**
   - CartItem with line total calculation
   - Cart aggregate with basic operations
   - Unit tests for all domain models (aim for 90%+ coverage)

### Phase 2: Business Services (Day 1-2)
1. **Discount Service**
   - Fixed amount discount calculation
   - Percentage discount with maximum cap
   - Discount validation logic
   - Comprehensive unit tests

2. **Freebie Service**
   - Rule evaluation logic
   - Freebie application and removal
   - Conflict resolution (multiple freebies)
   - Unit tests with various scenarios

3. **Cart Service**
   - In-memory cart storage (Map<string, Cart>)
   - All CRUD operations
   - Integration with discount and freebie services
   - Error handling and validation

### Phase 3: Infrastructure & Testing (Day 2)
1. **Mock Product Service**
   - Product lookup for price information
   - Test data seeding
   - Integration with cart operations

2. **Comprehensive Testing**
   - Unit tests for all components
   - Integration tests for complex scenarios
   - Edge cases and error conditions
   - Performance tests for large carts

### Phase 4: Presentation Layer (Day 2-3)
1. **Console Application**
   - Interactive cart management
   - Demonstration of all features
   - Error handling and user feedback

2. **REST API** (Optional Enhancement)
   - Full CRUD endpoints
   - Request/response DTOs
   - OpenAPI documentation
   - Integration with existing product module

### Phase 5: Advanced Features (Day 3)
1. **Enhanced Discount System**
   - Stackable discounts
   - Conditional discounts (minimum purchase)
   - Time-based discounts
   - User-specific discounts

2. **Advanced Freebies**
   - Quantity-based freebies ("Buy 2 get 1 free")
   - Category-based freebies
   - Conditional freebies (minimum quantity)

3. **Cart Persistence** (Optional)
   - Session-based cart storage
   - Cart serialization/deserialization
   - Cart expiration handling

## Testing Strategy

### Unit Tests (Target: 95% Coverage)
- **Domain Models**: All entities and value objects
- **Services**: Business logic with various scenarios
- **Edge Cases**: Negative quantities, invalid products, etc.
- **Error Conditions**: Invalid operations, constraint violations

### Integration Tests
- **End-to-End Scenarios**: Complete shopping cart workflows
- **Service Integration**: Cart service with discount/freebie services
- **Data Integrity**: Cart state consistency after operations

### Performance Tests
- **Large Carts**: 1000+ items performance
- **Complex Discounts**: Multiple discount calculations
- **Memory Usage**: Cart storage efficiency

## Example Usage Scenarios

### Basic Cart Operations
```typescript
// Create cart and add items
const cart = cartService.createCart();
cartService.addItem(cart.id, "product-1", 2);
cartService.addItem(cart.id, "product-2", 1);

// Update item quantity (absolute update)
cartService.updateItem(cart.id, "product-1", 5);

// Check utilities
console.log(cartService.hasProduct(cart.id, "product-1")); // true
console.log(cartService.getUniqueItemCount(cart.id)); // 2
console.log(cartService.getTotalItemCount(cart.id)); // 6
```

### Discount Application
```typescript
// Apply fixed discount
cartService.applyFixedDiscount(cart.id, "SAVE50", 50);

// Apply percentage discount with maximum
cartService.applyPercentageDiscount(cart.id, "10PERCENT", 10, 100);

// Remove discount
cartService.removeDiscount(cart.id, "SAVE50");
```

### Freebie Rules
```typescript
// "Buy product-1 get product-3 for free"
cartService.applyFreebie(cart.id, "product-1", "product-3", 1);

// Automatic application when product-1 is in cart
const summary = cartService.getCartSummary(cart.id);
console.log(summary.freebieItems); // Shows product-3 as freebie
```

## Error Handling & Validation

### Domain Validation
- **Quantity**: Must be positive integers
- **ProductId**: Must be valid format and exist
- **Discounts**: Cannot exceed cart total
- **Freebies**: Cannot create circular dependencies

### Business Rules
- **Cart Items**: No duplicate products (merge quantities)
- **Discounts**: Cannot apply same-named discount twice
- **Freebies**: Automatic removal when trigger product removed
- **Calculations**: Always round to 2 decimal places

### Error Types
```typescript
enum CartErrorType {
  CART_NOT_FOUND = 'CART_NOT_FOUND',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  INVALID_QUANTITY = 'INVALID_QUANTITY',
  DISCOUNT_EXISTS = 'DISCOUNT_EXISTS',
  FREEBIE_CONFLICT = 'FREEBIE_CONFLICT'
}
```

## Console Demo Features

### Interactive Menu
1. **Cart Management**
   - Create new cart
   - List all carts
   - Select active cart
   - Destroy cart

2. **Item Operations**
   - Add item to cart
   - Update item quantity
   - Remove item from cart
   - List all items

3. **Discount Management**
   - Apply fixed discount
   - Apply percentage discount
   - Remove discount
   - List active discounts

4. **Freebie Management**
   - Apply freebie rule
   - Remove freebie rule
   - List active freebies

5. **Cart Information**
   - Show cart summary
   - Calculate totals
   - Display utilities info

### Sample Console Output
```
🛒 Cart Service Demo
===================

Current Cart: cart-123
Items: 3 unique (7 total)
Subtotal: ฿850.00
Discounts: -฿85.00 (10PERCENT)
Freebies: 1 item (product-3)
Total: ฿765.00

Menu:
1. Add item to cart
2. Update item quantity
3. Remove item
4. Apply discount
5. Apply freebie
6. Show cart summary
7. Create new cart
8. Exit

Choose option (1-8):
```

## Success Criteria

### Functional Requirements ✅
- [x] All basic cart operations implemented
- [x] All utility functions working correctly
- [x] Fixed and percentage discounts with maximum cap
- [x] Freebie system with trigger conditions
- [x] Console application demonstrating all features

### Technical Requirements ✅
- [x] Object-Oriented Programming approach
- [x] Comprehensive unit test coverage (90%+)
- [x] Error handling for negative cases
- [x] No external database dependencies
- [x] Clean, maintainable code architecture

### Bonus Features 🎯
- [x] Advanced discount strategies
- [x] Complex freebie rules
- [x] Performance optimization
- [x] REST API integration
- [x] Comprehensive documentation

## Timeline Estimate

- **Day 1**: Domain models, value objects, basic services (6-8 hours)
- **Day 2**: Advanced features, testing, infrastructure (6-8 hours)  
- **Day 3**: Console app, documentation, polish (4-6 hours)

**Total Effort**: 16-22 hours over 3 days

## Next Steps

1. Create the basic file structure and module setup
2. Implement core value objects (ProductId, Quantity, etc.)
3. Build Cart and CartItem entities with basic operations
4. Develop discount and freebie services
5. Create comprehensive unit tests
6. Build console demo application
7. Add REST API endpoints (optional)
8. Write documentation and usage examples

This implementation will demonstrate advanced OOP principles, comprehensive testing, and real-world cart functionality that could be used in a production e-commerce system.