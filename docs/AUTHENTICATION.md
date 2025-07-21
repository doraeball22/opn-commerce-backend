# 🔐 Authentication System Guide

This guide explains how to implement JWT-based authentication in your feature modules for the OPN Commerce Backend.

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Protecting Routes](#protecting-routes)
- [Getting User Information](#getting-user-information)
- [Example Implementations](#example-implementations)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The application uses a **shared JWT authentication system** that can be used across all feature modules. The system provides:

- **Global availability**: No need to import auth in every module
- **Consistent user interface**: Same user object structure everywhere
- **Easy route protection**: Simple decorator-based authentication
- **Type safety**: Full TypeScript support for user data

### Architecture

```
┌─────────────────────────────────────────────────┐
│                App Module                       │
│  ┌─────────────────────────────────────────┐   │
│  │           AuthModule (@Global)          │   │
│  │  ├── JwtAuthService                     │   │
│  │  ├── JwtAuthGuard                       │   │
│  │  └── CurrentUser decorator              │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │ UsersModule │  │ CartModule  │  │OrdersModule│ │
│  │ (existing)  │  │ (future)    │  │ (future) │ │
│  └─────────────┘  └─────────────┘  └──────────┘ │
└─────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### 1. Import Required Components

```typescript
import { 
  JwtAuthGuard, 
  CurrentUser, 
  ICurrentUser 
} from '../../../../shared/auth';
```

### 2. Protect Your Controller

```typescript
@Controller('your-feature')
@UseGuards(JwtAuthGuard)  // Protect entire controller
@ApiBearerAuth('JWT-auth') // Swagger documentation
export class YourFeatureController {
  // All routes in this controller require authentication
}
```

### 3. Access Current User

```typescript
@Get('my-items')
async getMyItems(@CurrentUser() user: ICurrentUser) {
  // user.id, user.email, user.name are available
  return this.service.findByUserId(user.id);
}
```

## 🛡️ Protecting Routes

### Controller-Level Protection

Protect all routes in a controller:

```typescript
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OrdersController {
  // All methods require authentication
  
  @Get()
  async getAllOrders(@CurrentUser() user: ICurrentUser) {
    return this.ordersService.findByUserId(user.id);
  }
  
  @Post()
  async createOrder(@CurrentUser() user: ICurrentUser, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.id, dto);
  }
}
```

### Route-Level Protection

Protect specific routes only:

```typescript
@Controller('products')
export class ProductsController {
  @Get()
  async getPublicProducts() {
    // Public endpoint - no authentication required
    return this.productsService.findAll();
  }
  
  @Get('favorites')
  @UseGuards(JwtAuthGuard) // Only this route requires auth
  @ApiBearerAuth('JWT-auth')
  async getFavorites(@CurrentUser() user: ICurrentUser) {
    return this.favoritesService.findByUserId(user.id);
  }
}
```

## 👤 Getting User Information

### Full User Object

```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
async getProfile(@CurrentUser() user: ICurrentUser) {
  // user = { id: string, email: string, name?: string }
  return {
    userId: user.id,
    email: user.email,
    displayName: user.name,
  };
}
```

### Specific User Property

```typescript
@Get('my-orders')
@UseGuards(JwtAuthGuard)
async getMyOrders(@CurrentUser('id') userId: string) {
  // Extract just the user ID
  return this.ordersService.findByUserId(userId);
}
```

### User Information Available

```typescript
interface ICurrentUser {
  id: string;      // Unique user identifier
  email: string;   // User's email address
  name?: string;   // User's display name (optional)
}
```

## 📚 Example Implementations

### 1. Cart Module Example

```typescript
// cart.module.ts
@Module({
  imports: [CqrsModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}

// cart.controller.ts
import { JwtAuthGuard, CurrentUser, ICurrentUser } from '../../../shared/auth';

@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('Shopping Cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get user cart items' })
  async getCartItems(@CurrentUser() user: ICurrentUser) {
    return this.cartService.findByUserId(user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  async addItem(
    @CurrentUser() user: ICurrentUser,
    @Body() dto: AddToCartDto
  ) {
    return this.cartService.addItem(user.id, dto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeItem(
    @CurrentUser() user: ICurrentUser,
    @Param('itemId') itemId: string
  ) {
    return this.cartService.removeItem(user.id, itemId);
  }
}
```

### 2. Orders Module Example

```typescript
// orders.controller.ts
import { JwtAuthGuard, CurrentUser, ICurrentUser } from '../../../shared/auth';

@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('Orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get user orders' })
  async getOrders(@CurrentUser() user: ICurrentUser) {
    return this.ordersService.findByUserId(user.id);
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Get specific order' })
  async getOrder(
    @CurrentUser() user: ICurrentUser,
    @Param('orderId') orderId: string
  ) {
    // Ensure user can only access their own orders
    return this.ordersService.findByIdAndUserId(orderId, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new order' })
  async createOrder(
    @CurrentUser() user: ICurrentUser,
    @Body() dto: CreateOrderDto
  ) {
    return this.ordersService.create(user.id, dto);
  }
}
```

### 3. Mixed Public/Private Routes

```typescript
@Controller('products')
@ApiTags('Products')
export class ProductsController {
  // Public endpoint
  @Get()
  @ApiOperation({ summary: 'Get all products (public)' })
  async getProducts() {
    return this.productsService.findAll();
  }

  // Public endpoint
  @Get(':id')
  @ApiOperation({ summary: 'Get product details (public)' })
  async getProduct(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  // Protected endpoint
  @Get(':id/reviews/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my reviews for product' })
  async getMyReviews(
    @CurrentUser() user: ICurrentUser,
    @Param('id') productId: string
  ) {
    return this.reviewsService.findByProductAndUser(productId, user.id);
  }

  // Protected endpoint
  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add product review' })
  async addReview(
    @CurrentUser() user: ICurrentUser,
    @Param('id') productId: string,
    @Body() dto: CreateReviewDto
  ) {
    return this.reviewsService.create(user.id, productId, dto);
  }
}
```

## ✅ Best Practices

### 1. **Always Validate Ownership**

When accessing user-specific resources, always validate that the resource belongs to the authenticated user:

```typescript
@Get('orders/:orderId')
async getOrder(
  @CurrentUser() user: ICurrentUser,
  @Param('orderId') orderId: string
) {
  const order = await this.ordersService.findById(orderId);
  
  // ✅ Good: Validate ownership
  if (order.userId !== user.id) {
    throw new ForbiddenException('Access denied');
  }
  
  return order;
}
```

### 2. **Use Type-Safe User Interface**

Always use the `ICurrentUser` interface for consistent typing:

```typescript
// ✅ Good: Type-safe
async createOrder(@CurrentUser() user: ICurrentUser) {
  // TypeScript knows user.id, user.email, user.name
}

// ❌ Bad: No type safety
async createOrder(@CurrentUser() user: any) {
  // No IntelliSense or type checking
}
```

### 3. **Consistent Error Handling**

Use standard HTTP status codes for authentication errors:

```typescript
// ✅ Good: Standard error responses
if (!user) {
  throw new UnauthorizedException('Authentication required');
}

if (resource.userId !== user.id) {
  throw new ForbiddenException('Access denied');
}

if (!resource) {
  throw new NotFoundException('Resource not found');
}
```

### 4. **Document Protected Routes**

Always add Swagger documentation for protected routes:

```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')  // ✅ Shows lock icon in Swagger
@ApiOperation({ summary: 'Get user profile' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
async getProfile(@CurrentUser() user: ICurrentUser) {
  // ...
}
```

### 5. **Scope Data to User**

Always scope database queries to the authenticated user:

```typescript
// ✅ Good: User-scoped query
async getOrders(@CurrentUser() user: ICurrentUser) {
  return this.ordersService.findWhere({ userId: user.id });
}

// ❌ Bad: Returns all orders (security risk)
async getOrders(@CurrentUser() user: ICurrentUser) {
  return this.ordersService.findAll();
}
```

## 🔧 Advanced Usage

### Custom Guards

You can extend the base authentication for role-based access:

```typescript
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Already authenticated by JwtAuthGuard
    
    const fullUser = await this.userService.findById(user.sub);
    return fullUser.role === 'ADMIN';
  }
}

// Usage
@UseGuards(JwtAuthGuard, AdminGuard)
@Get('admin/users')
async getAllUsers() {
  return this.userService.findAll();
}
```

### Service-Level Authentication

Use the JWT service directly in services if needed:

```typescript
@Injectable()
export class NotificationService {
  constructor(private readonly jwtAuthService: JwtAuthService) {}

  async sendNotificationWithToken(token: string, message: string) {
    try {
      const payload = await this.jwtAuthService.verifyToken(token);
      // Send notification to user
      await this.sendToUser(payload.sub, message);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **"Cannot read property 'id' of undefined"**
   ```typescript
   // ❌ Problem: User is null
   @Get()
   async getData(@CurrentUser() user: ICurrentUser) {
     return this.service.findByUserId(user.id); // Error here
   }

   // ✅ Solution: Check if guard is applied
   @Get()
   @UseGuards(JwtAuthGuard) // Make sure this is added
   async getData(@CurrentUser() user: ICurrentUser) {
     return this.service.findByUserId(user.id);
   }
   ```

2. **"Invalid or expired token"**
   - Check if the token was generated by the same JWT_SECRET
   - Verify token hasn't expired (default: 24 hours)
   - Ensure Bearer token format: `Authorization: Bearer <token>`

3. **"Property 'user' does not exist on type 'Request'"**
   ```typescript
   // ✅ Solution: Use the AuthenticatedRequest interface
   import { AuthenticatedRequest } from '../../../shared/auth/guards/jwt-auth.guard';
   ```

### Environment Variables

Make sure these are set in your `.env` file:

```bash
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=24h
```

### Testing Authentication

Use these test credentials in development:

```bash
# Login to get token
curl -X POST http://localhost:8091/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john.doe@example.com", "password": "password123"}'

# Use token in protected endpoints
curl -X GET http://localhost:8091/v1/your-endpoint \
  -H "Authorization: Bearer <token-from-login>"
```

## 📖 Reference

### Available Imports

```typescript
import { 
  // Guards
  JwtAuthGuard,
  
  // Decorators  
  CurrentUser,
  
  // Interfaces
  ICurrentUser,
  JwtPayload,
  
  // Services (if needed)
  JwtAuthService
} from '../../../shared/auth';
```

### Token Structure

JWT tokens contain this payload:

```typescript
interface JwtPayload {
  sub: string;    // User ID
  email: string;  // User email
  name: string;   // User name
  iat: number;    // Issued at
  exp: number;    // Expires at
}
```

---

## 🎉 You're Ready!

You now have everything you need to implement secure, user-scoped authentication in your feature modules. The shared auth system ensures consistency across your entire e-commerce application.

Need help? Check the existing `UsersModule` and `UserAddressesController` for working examples!