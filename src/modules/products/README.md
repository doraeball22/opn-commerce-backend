# Products Module

This module implements a comprehensive e-commerce product catalog system using Domain-Driven Design (DDD), CQRS patterns, and clean architecture principles.

## 🏗️ Architecture Overview

```
products/
├── domain/                           # Core Business Logic
│   ├── entities/                     # Rich domain entities
│   │   ├── product.entity.ts         # Product aggregate root
│   │   └── category.entity.ts        # Category entity with hierarchy
│   ├── value-objects/               # Encapsulated business rules
│   │   ├── money.vo.ts              # Currency & amount handling
│   │   ├── product-sku.vo.ts        # SKU validation & generation
│   │   ├── product-status.vo.ts     # Product lifecycle states
│   │   ├── product-weight.vo.ts     # Weight with unit conversions
│   │   └── product-dimensions.vo.ts # Dimensions with conversions
│   └── repositories/                # Repository interfaces
│       ├── product.repository.ts    # Product data access contract
│       └── category.repository.ts   # Category data access contract
├── application/                     # Use Cases & Business Flow
│   ├── commands/                    # Write operations (CQRS)
│   ├── queries/                     # Read operations (CQRS)
│   ├── handlers/                    # Command/Query handlers
│   └── dto/                         # Data transfer objects
├── infrastructure/                  # External Dependencies
│   ├── repositories/               # Repository implementations
│   └── adapters/                   # Database adapters
└── presentation/                   # HTTP Interface
    └── controllers/                # REST API endpoints
```

## 🚀 Features

### Product Management
- ✅ Complete CRUD operations
- ✅ SKU generation and validation
- ✅ Price management with sale prices
- ✅ Stock quantity tracking
- ✅ Product status lifecycle (draft, active, archived)
- ✅ Weight and dimensions with unit conversions
- ✅ Product attributes and metadata
- ✅ Image management
- ✅ Rating and review aggregation

### Category Management
- ✅ Hierarchical category structure
- ✅ Parent-child relationships
- ✅ Category tree navigation
- ✅ Product-category associations
- ✅ Breadcrumb generation
- ✅ Category sorting and ordering

### Search & Filtering
- ✅ Full-text search across products
- ✅ Category-based filtering
- ✅ Price range filtering
- ✅ Status-based filtering
- ✅ Featured products
- ✅ Products on sale
- ✅ Stock availability filtering

### Business Logic
- ✅ Currency support (THB, USD, EUR, GBP, JPY, SGD)
- ✅ Weight units (g, kg, lb, oz) with conversions
- ✅ Dimension units (mm, cm, m, in, ft) with conversions
- ✅ Automatic effective price calculation
- ✅ Stock management and validation
- ✅ Category hierarchy validation

## 📊 Database Schema

The module follows the database design from `EXERCISE-2.md`:

### Products Table
```sql
products (
  id, name, slug, description, short_description,
  sku, price, sale_price, stock_quantity, manage_stock,
  status, weight, dimensions, attributes, images,
  average_rating, review_count, featured_image,
  created_at, updated_at, deleted_at
)
```

### Categories Table
```sql
categories (
  id, name, slug, description, parent_id,
  image_url, is_active, sort_order,
  created_at, updated_at, deleted_at
)
```

### Product-Category Relationships
```sql
product_categories (
  product_id, category_id
)
```

## 🔧 Setup & Testing

### Start the Application
```bash
npm run start:dev
```
Server runs on: `http://localhost:8091`

### API Documentation
- **Swagger UI**: `http://localhost:8091/api`
- **API Base URL**: `http://localhost:8091/v1`

### Authentication
Some endpoints require JWT authentication:
```bash
# Get JWT token
TOKEN=$(curl -s -X POST "http://localhost:8091/v1/users/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "john.doe@example.com", "password": "password123"}' | \
  jq -r '.accessToken')
```

## 📝 API Endpoints

### Products API

#### 1. List Products
```bash
# Get all products
curl -s "http://localhost:8091/v1/products" | jq '.'

# Search products
curl -s "http://localhost:8091/v1/products?search=macbook" | jq '.'

# Filter by category
curl -s "http://localhost:8091/v1/products?categoryId=CATEGORY_ID" | jq '.'

# Filter by price range
curl -s "http://localhost:8091/v1/products?minPrice=1000&maxPrice=50000" | jq '.'

# Sort products
curl -s "http://localhost:8091/v1/products?sortBy=price&sortOrder=ASC" | jq '.'

# Pagination
curl -s "http://localhost:8091/v1/products?page=1&limit=10" | jq '.'

# Filter in-stock products
curl -s "http://localhost:8091/v1/products?inStock=true" | jq '.'

# Filter active products
curl -s "http://localhost:8091/v1/products?isActive=true" | jq '.'
```

#### 2. Get Product by ID
```bash
# Get specific product
PRODUCT_ID=$(curl -s "http://localhost:8091/v1/products" | jq -r '.data.products[0].id')
curl -s "http://localhost:8091/v1/products/$PRODUCT_ID" | jq '.'
```

#### 3. Get Product by Slug
```bash
# Get product by slug
curl -s "http://localhost:8091/v1/products/slug/macbook-pro-16" | jq '.'
curl -s "http://localhost:8091/v1/products/slug/iphone-15-pro" | jq '.'
curl -s "http://localhost:8091/v1/products/slug/cotton-t-shirt" | jq '.'

# Test non-existent slug (should return 404)
curl -s "http://localhost:8091/v1/products/slug/non-existent" | jq '.'
```

#### 4. Create Product (Requires Authentication)
```bash
# Get authentication token first
TOKEN=$(curl -s -X POST "http://localhost:8091/v1/users/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "john.doe@example.com", "password": "password123"}' | \
  jq -r '.accessToken')

# Create new product
curl -s -X POST "http://localhost:8091/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Premium Headphones",
    "slug": "premium-headphones",
    "description": "High-quality wireless headphones with noise cancellation",
    "shortDescription": "Premium wireless headphones",
    "sku": "HEAD-PREM-001",
    "price": 5990,
    "stockQuantity": 25,
    "categoryIds": []
  }' | jq '.'
```

#### 5. Update Product (Requires Authentication)
```bash
# Update existing product
curl -s -X PUT "http://localhost:8091/v1/products/$PRODUCT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "MacBook Pro 16\" (Updated)",
    "price": 95900,
    "salePrice": 89900
  }' | jq '.'
```

#### 6. Delete Product (Requires Authentication)
```bash
# Soft delete product
curl -s -X DELETE "http://localhost:8091/v1/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

#### 7. Featured Products
```bash
# Get featured products
curl -s "http://localhost:8091/v1/products/featured" | jq '.'

# With pagination
curl -s "http://localhost:8091/v1/products/featured?limit=5" | jq '.'
```

#### 8. Products on Sale
```bash
# Get products on sale
curl -s "http://localhost:8091/v1/products/on-sale" | jq '.'

# With sorting and pagination
curl -s "http://localhost:8091/v1/products/on-sale?sortBy=price&sortOrder=ASC&limit=10" | jq '.'
```

### Categories API

#### 1. List Categories
```bash
# Get all categories
curl -s "http://localhost:8091/v1/categories" | jq '.'

# Filter by parent ID (root categories)
curl -s "http://localhost:8091/v1/categories?parentId=null" | jq '.'

# Get child categories
PARENT_ID=$(curl -s "http://localhost:8091/v1/categories" | jq -r '.data[0].id')
curl -s "http://localhost:8091/v1/categories?parentId=$PARENT_ID" | jq '.'

# Search categories
curl -s "http://localhost:8091/v1/categories?search=electronics" | jq '.'

# Filter active categories
curl -s "http://localhost:8091/v1/categories?isActive=true" | jq '.'

# Sort categories
curl -s "http://localhost:8091/v1/categories?sortBy=name&sortOrder=ASC" | jq '.'
```

#### 2. Category Tree
```bash
# Get complete category tree
curl -s "http://localhost:8091/v1/categories/tree" | jq '.'

# Get tree with product counts
curl -s "http://localhost:8091/v1/categories/tree?includeProductCount=true" | jq '.'
```

#### 3. Get Category by ID
```bash
# Get specific category
CATEGORY_ID=$(curl -s "http://localhost:8091/v1/categories" | jq -r '.data[0].id')
curl -s "http://localhost:8091/v1/categories/$CATEGORY_ID" | jq '.'
```

#### 4. Get Category by Slug
```bash
# Get category by slug
curl -s "http://localhost:8091/v1/categories/slug/electronics" | jq '.'
curl -s "http://localhost:8091/v1/categories/slug/computers" | jq '.'
curl -s "http://localhost:8091/v1/categories/slug/clothing" | jq '.'

# Test non-existent slug (should return 404)
curl -s "http://localhost:8091/v1/categories/slug/non-existent" | jq '.'
```

#### 5. Create Category (Requires Authentication)
```bash
# Create root category
curl -s -X POST "http://localhost:8091/v1/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Books",
    "slug": "books",
    "description": "Books and literature",
    "parentId": null,
    "isActive": true,
    "sortOrder": 10
  }' | jq '.'

# Create child category
curl -s -X POST "http://localhost:8091/v1/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Fiction",
    "slug": "fiction",
    "description": "Fiction books",
    "parentId": "'$CATEGORY_ID'",
    "isActive": true,
    "sortOrder": 1
  }' | jq '.'
```

#### 6. Update Category (Requires Authentication)
```bash
# Update category
curl -s -X PUT "http://localhost:8091/v1/categories/$CATEGORY_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Electronics & Gadgets",
    "description": "Electronic devices, gadgets and accessories"
  }' | jq '.'
```

#### 7. Delete Category (Requires Authentication)
```bash
# Soft delete category
curl -s -X DELETE "http://localhost:8091/v1/categories/$CATEGORY_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

#### 8. Category Products
```bash
# Get products in a category
curl -s "http://localhost:8091/v1/categories/$CATEGORY_ID/products" | jq '.'

# With pagination and sorting
curl -s "http://localhost:8091/v1/categories/$CATEGORY_ID/products?sortBy=name&sortOrder=ASC&page=1&limit=5" | jq '.'

# Include products from child categories
curl -s "http://localhost:8091/v1/categories/$CATEGORY_ID/products?includeDescendants=true" | jq '.'
```

## 🧪 Test Data

The module includes seeded test data:

### Categories (6 total)
1. **Electronics** (root)
   - Computers (child)
   - Smartphones (child)
2. **Clothing** (root)
   - Men's Clothing (child)
   - Women's Clothing (child)

### Products (5 total)
1. **MacBook Pro 16"** - ฿89,900 (Electronics > Computers)
2. **iPhone 15 Pro** - ฿39,900 → ฿35,900 (on sale) (Electronics > Smartphones)
3. **Cotton T-Shirt** - ฿590 (Clothing > Men's)
4. **Summer Dress** - ฿1,290 (Clothing > Women's)
5. **Gaming Mouse Pro** - ฿2,490 (Electronics > Computers)

## 🏃‍♂️ Quick Test Commands

### Verify All Products
```bash
echo "=== ALL PRODUCTS ==="
curl -s "http://localhost:8091/v1/products" | jq '.data.products[] | {name, price: .price.formatted, sku}'
```

### Verify All Categories
```bash
echo "=== ALL CATEGORIES ==="
curl -s "http://localhost:8091/v1/categories" | jq '.data[] | {name, slug, parentId}'
```

### Verify Search
```bash
echo "=== SEARCH TEST ==="
curl -s "http://localhost:8091/v1/products?search=pro" | jq '.data.products[] | .name'
```

### Verify Sale Products
```bash
echo "=== PRODUCTS ON SALE ==="
curl -s "http://localhost:8091/v1/products/on-sale" | jq '.data.products[] | {name, originalPrice: .price.formatted, salePrice: .salePrice.formatted}'
```

### Verify Category Tree
```bash
echo "=== CATEGORY TREE ==="
curl -s "http://localhost:8091/v1/categories/tree" | jq '.data[] | {name: .category.name, children: [.children[].category.name]}'
```

## 🔍 Validation Examples

### Valid Product Creation
```bash
curl -s -X POST "http://localhost:8091/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Product",
    "slug": "test-product",
    "description": "A test product",
    "shortDescription": "Test",
    "sku": "TEST-001",
    "price": 1000,
    "stockQuantity": 10
  }' | jq '.message'
```

### Invalid Product Creation (Validation Errors)
```bash
curl -s -X POST "http://localhost:8091/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "",
    "price": -100
  }' | jq '.errors'
```

## 📋 Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "statusCode": 200,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/v1/products",
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name is required",
      "value": ""
    }
  ]
}
```

## 🏗️ Architecture Patterns

- **Domain-Driven Design (DDD)**: Rich domain models with business logic
- **CQRS**: Separate read and write operations
- **Repository Pattern**: Abstracted data access
- **Value Objects**: Encapsulated business rules
- **Dependency Inversion**: Domain defines interfaces
- **Clean Architecture**: Separation of concerns across layers

## 🔄 Future Enhancements

- [ ] Real database integration (PostgreSQL/MongoDB)
- [ ] Elasticsearch integration for advanced search
- [ ] Product variants and options
- [ ] Inventory tracking and alerts
- [ ] Product reviews and ratings
- [ ] Image upload and management
- [ ] Bulk operations
- [ ] Product import/export
- [ ] Advanced analytics and reporting
- [ ] Caching layer (Redis)