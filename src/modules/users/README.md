# Users Module

The Users module handles all user-related functionality including registration, authentication, profile management, and account operations.

## 🎯 Features

- ✅ **User Registration**: Create new user accounts
- ✅ **Profile Management**: View and update user profiles
- ✅ **Password Management**: Secure password changes
- ✅ **Account Deletion**: GDPR-compliant account removal
- ✅ **Authentication**: Bearer token-based authentication
- ✅ **Input Validation**: Comprehensive request validation
- ✅ **Error Handling**: Consistent error responses

## 🏗️ Module Architecture

This module follows DDD and Onion Architecture principles:

```
users/
├── domain/                    # Business logic core
│   ├── entities/
│   │   └── user.entity.ts    # User aggregate root
│   ├── value-objects/
│   │   ├── email.vo.ts       # Email validation & formatting
│   │   ├── password.vo.ts    # Password hashing & validation
│   │   ├── address.vo.ts     # Address value object
│   │   └── gender.vo.ts      # Gender enumeration
│   └── repositories/
│       └── user.repository.ts # Repository interface
├── application/               # Use cases and DTOs
│   ├── commands/             # Write operations
│   ├── queries/              # Read operations
│   └── dto/                  # Request/response objects
├── infrastructure/           # External concerns
│   └── persistence/
│       └── in-memory-user.repository.ts # Mock implementation
├── presentation/             # HTTP interface
│   ├── controllers/
│   │   └── users.controller.ts # REST endpoints
│   ├── guards/
│   │   └── auth.guard.ts     # Authentication guard
│   └── decorators/
│       └── current-user.decorator.ts # User injection
└── users.module.ts          # Module definition
```

## 🔌 API Reference for Frontend Developers

### Base URL
```
http://localhost:8091/v1/users
```

### Authentication

Most endpoints require authentication via Bearer token:

```typescript
// Add to request headers
{
  "Authorization": "Bearer <token>"
}
```

**Available test tokens:**
- `faketoken_user1` → john.doe@example.com
- `faketoken_user2` → jane.smith@example.com

---

## 📋 Endpoints

### 1. Register User
Create a new user account.

```http
POST /v1/users/register
```

**Request Body:**
```typescript
interface RegisterUserRequest {
  email: string;           // Valid email format
  password: string;        // Minimum 8 characters
  name: string;           // Full name
  dateOfBirth: string;    // ISO date format (YYYY-MM-DD)
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  subscribedToNewsletter: boolean;
}
```

**Example Request:**
```bash
curl -X POST http://localhost:8091/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securePassword123",
    "name": "John Doe",
    "dateOfBirth": "1990-01-15",
    "gender": "MALE",
    "address": {
      "street": "123 Main St",
      "city": "Bangkok",
      "state": "Bangkok",
      "postalCode": "10110",
      "country": "Thailand"
    },
    "subscribedToNewsletter": true
  }'
```

**Response:**
```typescript
// Success (201)
{
  "message": "User registered successfully"
}

// Error (400) - Validation failed
{
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/v1/users/register",
  "message": "Validation failed"
}

// Error (409) - Email already exists
{
  "statusCode": 409,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/v1/users/register", 
  "message": "User with this email already exists"
}
```

---

### 2. Get User Profile
Retrieve authenticated user's profile information.

```http
GET /v1/users/profile
```

**Headers:**
```typescript
{
  "Authorization": "Bearer <token>"
}
```

**Example Request:**
```bash
curl -X GET http://localhost:8091/v1/users/profile \
  -H "Authorization: Bearer faketoken_user1"
```

**Response:**
```typescript
// Success (200)
{
  "id": "user1",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "age": 33,                    // Calculated from dateOfBirth
  "gender": "MALE",
  "address": {
    "street": "123 Main St",
    "city": "Bangkok", 
    "state": "Bangkok",
    "postalCode": "10110",
    "country": "Thailand"
  },
  "subscribedToNewsletter": true
}

// Error (401) - Unauthorized
{
  "statusCode": 401,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/v1/users/profile",
  "message": "Invalid token"
}
```

---

### 3. Update User Profile
Update user profile information. Only provided fields will be updated.

```http
PUT /v1/users/profile
```

**Headers:**
```typescript
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```typescript
interface UpdateUserRequest {
  dateOfBirth?: string;    // ISO date format (YYYY-MM-DD)
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: {
    street: string;        // All address fields required if provided
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  subscribedToNewsletter?: boolean;
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:8091/v1/users/profile \
  -H "Authorization: Bearer faketoken_user1" \
  -H "Content-Type: application/json" \
  -d '{
    "subscribedToNewsletter": false,
    "address": {
      "street": "456 New Street",
      "city": "Bangkok",
      "state": "Bangkok", 
      "postalCode": "10110",
      "country": "Thailand"
    }
  }'
```

**Response:**
```typescript
// Success (200)
{
  "message": "Profile updated successfully"
}
```

---

### 4. Change Password
Change user password with current password verification.

```http
PUT /v1/users/password
```

**Headers:**
```typescript
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```typescript
interface ChangePasswordRequest {
  currentPassword: string;     // Current password for verification
  newPassword: string;         // New password (min 8 characters)
  confirmPassword: string;     // Must match newPassword
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:8091/v1/users/password \
  -H "Authorization: Bearer faketoken_user1" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "currentPassword123",
    "newPassword": "newSecurePassword456", 
    "confirmPassword": "newSecurePassword456"
  }'
```

**Response:**
```typescript
// Success (200)
{
  "message": "Password changed successfully"
}

// Error (400) - Passwords don't match
{
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/v1/users/password",
  "message": "New password and confirmation do not match"
}

// Error (401) - Wrong current password
{
  "statusCode": 401,
  "timestamp": "2024-01-01T00:00:00.000Z", 
  "path": "/v1/users/password",
  "message": "Current password is incorrect"
}
```

---

### 5. Delete Account
Permanently delete user account (GDPR compliance).

```http
DELETE /v1/users/profile
```

**Headers:**
```typescript
{
  "Authorization": "Bearer <token>"
}
```

**Example Request:**
```bash
curl -X DELETE http://localhost:8091/v1/users/profile \
  -H "Authorization: Bearer faketoken_user1"
```

**Response:**
```typescript
// Success (204) - No Content
// Empty response body

// Error (401) - Unauthorized
{
  "statusCode": 401,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/v1/users/profile",
  "message": "Invalid token"
}
```

---

## 🚨 Error Handling

### Common Error Responses

All errors follow this consistent format:

```typescript
interface ErrorResponse {
  statusCode: number;
  timestamp: string;       // ISO timestamp
  path: string;           // Request path
  message: string;        // Error description
}
```

### HTTP Status Codes

| Code | Description | When it occurs |
|------|-------------|----------------|
| `200` | OK | Successful GET/PUT operations |
| `201` | Created | Successful POST operations |
| `204` | No Content | Successful DELETE operations |
| `400` | Bad Request | Validation errors, malformed requests |
| `401` | Unauthorized | Missing/invalid token, wrong password |
| `404` | Not Found | User not found |
| `409` | Conflict | Email already exists |
| `500` | Internal Server Error | Unexpected server errors |

### Validation Rules

#### Email
- Must be valid email format
- Case-insensitive (converted to lowercase)
- Required for registration

#### Password
- Minimum 8 characters
- Hashed using bcrypt
- Required for registration and password changes

#### Name
- Required string
- No specific format restrictions

#### Date of Birth
- Must be valid ISO date format (YYYY-MM-DD)
- Used to calculate age in profile response

#### Gender
- Must be one of: `MALE`, `FEMALE`, `OTHER`
- Case-insensitive input, stored as uppercase

#### Address
- All fields required when provided:
  - `street`: Street address
  - `city`: City name
  - `state`: State/province
  - `postalCode`: Postal/ZIP code
  - `country`: Country name

---

## 🛠️ Frontend Integration Examples

### React/TypeScript Example

```typescript
// types/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  subscribedToNewsletter: boolean;
}

// services/userService.ts
class UserService {
  private baseURL = 'http://localhost:8091/v1/users';
  private token = localStorage.getItem('authToken');

  async register(userData: RegisterUserRequest): Promise<{message: string}> {
    const response = await fetch(`${this.baseURL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  }

  async getProfile(): Promise<User> {
    const response = await fetch(`${this.baseURL}/profile`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  }

  async updateProfile(updates: UpdateUserRequest): Promise<{message: string}> {
    const response = await fetch(`${this.baseURL}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  }
}

export const userService = new UserService();
```

### Vue.js Example

```typescript
// composables/useUser.ts
import { ref, Ref } from 'vue'

export const useUser = () => {
  const user: Ref<User | null> = ref(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchProfile = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('http://localhost:8091/v1/users/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message)
      }

      user.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    fetchProfile,
  }
}
```

---

## 🔧 Testing with Frontend

### Using Swagger UI
1. Open http://localhost:8091/api
2. Click "Authorize" button
3. Enter test token: `faketoken_user1`
4. Test endpoints interactively

### Using Postman
1. Create new collection "Users API"
2. Set base URL: `http://localhost:8091/v1/users`
3. Add Bearer token to collection auth
4. Import endpoints and test

### Mock Data Available
- **User 1**: john.doe@example.com (token: `faketoken_user1`)
- **User 2**: jane.smith@example.com (token: `faketoken_user2`)

---

## 📈 Performance Considerations

- **Caching**: Profile data can be cached on frontend with proper invalidation
- **Debouncing**: Implement debouncing for profile updates
- **Error Handling**: Always handle network errors gracefully
- **Loading States**: Show loading indicators during API calls
- **Optimistic Updates**: Consider optimistic updates for better UX

---

## 🔐 Security Notes

- **Never store passwords** in plain text on frontend
- **Validate tokens** before making API calls
- **Handle token expiration** gracefully
- **Use HTTPS** in production
- **Sanitize user inputs** before sending to API

---

## 🧪 Development Testing with cURL

### Prerequisites

1. Start the development server:
```bash
npm run start:dev
```

2. Server will be running on: `http://localhost:8091`
3. Swagger documentation available at: `http://localhost:8091/api`

### Authentication Tokens

For development/testing, use one of these mock tokens:

- `mock-valid-token` - Maps to user1
- `faketoken_user1` - Maps to user1  
- `faketoken_user2` - Maps to user2

### Complete cURL Test Suite

#### 1. Health Check
```bash
# Test root endpoint
curl -X GET http://localhost:8091/v1/ \
  -H "Content-Type: application/json"
```

#### 2. User Registration
```bash
# Register a new user with all required fields
curl -X POST http://localhost:8091/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "dateOfBirth": "1990-01-01",
    "gender": "MALE",
    "subscribedToNewsletter": true,
    "address": {
      "street": "123 Test St",
      "city": "Bangkok",
      "state": "Bangkok",
      "postalCode": "10110",
      "country": "Thailand"
    }
  }'
```

#### 3. User Profile Management
```bash
# Get user profile
curl -X GET http://localhost:8091/v1/users/profile \
  -H "Authorization: Bearer mock-valid-token" \
  -H "Content-Type: application/json"

# Update user profile
curl -X PUT http://localhost:8091/v1/users/profile \
  -H "Authorization: Bearer mock-valid-token" \
  -H "Content-Type: application/json" \
  -d '{
    "dateOfBirth": "1991-01-01",
    "gender": "MALE",
    "subscribedToNewsletter": false
  }'

# Delete user profile
curl -X DELETE http://localhost:8091/v1/users/profile \
  -H "Authorization: Bearer mock-valid-token" \
  -H "Content-Type: application/json"
```

#### 4. Password Management
```bash
# Change password
curl -X PUT http://localhost:8091/v1/users/password \
  -H "Authorization: Bearer mock-valid-token" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword456"
  }'
```

#### 5. Address Management
```bash
# Get all user addresses
curl -X GET http://localhost:8091/v1/users/addresses \
  -H "Authorization: Bearer mock-valid-token" \
  -H "Content-Type: application/json"

# Get addresses by type
curl -X GET "http://localhost:8091/v1/users/addresses?type=HOME" \
  -H "Authorization: Bearer mock-valid-token" \
  -H "Content-Type: application/json"

# Add new address
curl -X POST http://localhost:8091/v1/users/addresses \
  -H "Authorization: Bearer mock-valid-token" \
  -H "Content-Type: application/json" \
  -d '{
    "address": {
      "street": "456 New St",
      "city": "Bangkok",
      "state": "Bangkok",
      "postalCode": "10111",
      "country": "Thailand"
    },
    "type": "HOME",
    "label": "Home Address",
    "isDefault": true
  }'

# Update address (replace ADDRESS_ID with actual ID)
curl -X PUT http://localhost:8091/v1/users/addresses/ADDRESS_ID \
  -H "Authorization: Bearer mock-valid-token" \
  -H "Content-Type: application/json" \
  -d '{
    "address": {
      "street": "456 Updated St",
      "city": "Bangkok",
      "state": "Bangkok",
      "postalCode": "10111",
      "country": "Thailand"
    },
    "type": "HOME",
    "label": "Updated Home"
  }'

# Set address as default
curl -X PUT http://localhost:8091/v1/users/addresses/ADDRESS_ID/default \
  -H "Authorization: Bearer mock-valid-token" \
  -H "Content-Type: application/json"

# Delete address
curl -X DELETE http://localhost:8091/v1/users/addresses/ADDRESS_ID \
  -H "Authorization: Bearer mock-valid-token" \
  -H "Content-Type: application/json"
```

#### 6. Error Testing
```bash
# Test missing authorization
curl -X GET http://localhost:8091/v1/users/profile \
  -H "Content-Type: application/json"

# Test invalid token
curl -X GET http://localhost:8091/v1/users/profile \
  -H "Authorization: Bearer invalid-token" \
  -H "Content-Type: application/json"

# Test validation errors
curl -X POST http://localhost:8091/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "123"
  }'
```

### Expected Response Examples

#### Successful Registration
```json
{
  "message": "User registered successfully"
}
```

#### User Profile Response
```json
{
  "statusCode": 200,
  "message": "User profile retrieved successfully", 
  "data": {
    "id": "user1",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "age": 35,
    "gender": "MALE",
    "subscribedToNewsletter": true
  }
}
```

#### Address List Response
```json
{
  "statusCode": 200,
  "message": "User addresses retrieved successfully",
  "data": [
    {
      "id": "addr-1",
      "address": {
        "street": "123 Main St",
        "city": "Bangkok",
        "state": "Bangkok", 
        "postalCode": "10110",
        "country": "Thailand"
      },
      "type": "HOME",
      "label": "Home Address",
      "isDefault": true,
      "location": {
        "latitude": 13.7563,
        "longitude": 100.5018
      },
      "deliveryInstructions": "Ring doorbell twice",
      "createdAt": "2025-01-20T10:00:00.000Z",
      "updatedAt": "2025-01-20T10:00:00.000Z"
    }
  ]
}
```

#### Error Response
```json
{
  "statusCode": 400,
  "timestamp": "2025-01-20T10:00:00.000Z",
  "path": "/v1/users/register",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "email must be a valid email"
    }
  ]
}
```

### Address Types Available
- `HOME` - Home address
- `WORK` - Work/office address
- `BILLING` - Billing address  
- `SHIPPING` - Shipping address
- `OTHER` - Other address types

### Development Notes
1. **Mock Data**: The current implementation uses a mock database adapter. Some endpoints may return "User not found" until proper mock data seeding is implemented.

2. **Address IDs**: Replace `ADDRESS_ID` in the curl commands with actual address IDs returned from the GET addresses endpoint.

3. **Geolocation**: Location coordinates are validated to be within Thailand boundaries (optional business rule).

4. **Default Address**: Each user must have exactly one default address. Setting a new default automatically unsets the previous one.

5. **Address Limits**: Users can have up to 10 addresses by default (configurable).

6. **Validation**: All endpoints include comprehensive validation for data integrity.

---

For more technical details, see the [main backend README](../../README.md).