#!/bin/bash

echo "🧪 Testing Cart API Endpoints"
echo "============================="

BASE_URL="http://localhost:8091/v1"

# Test credentials - adjust these based on your test data
TEST_EMAIL="john.doe@example.com"
TEST_PASSWORD="password123"

echo ""
echo "1. Testing API health check..."
HEALTH_RESPONSE=$(curl -s "${BASE_URL}" -w "%{http_code}" || echo "000")
HTTP_CODE="${HEALTH_RESPONSE: -3}"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
    echo "✅ API server is responding"
else
    echo "❌ API server not responding (code: $HTTP_CODE)"
    echo "Make sure the server is running with: npm run start:dev"
    exit 1
fi

echo ""
echo "2. Testing user login to get JWT token..."
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/users/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\"}" \
  -w "%{http_code}")

HTTP_CODE="${LOGIN_RESPONSE: -3}"
BODY="${LOGIN_RESPONSE%???}"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ User login successful"
    # Extract token from response (assuming JSON format: {"token": "..."})
    TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    if [ -n "$TOKEN" ]; then
        echo "✅ JWT token obtained: ${TOKEN:0:20}..."
        AUTH_HEADER="Authorization: Bearer $TOKEN"
    else
        echo "⚠️  Could not extract token from response: $BODY"
        echo "ℹ️  Continuing with public endpoints only"
        TOKEN=""
        AUTH_HEADER=""
    fi
else
    echo "⚠️  User login failed with code: $HTTP_CODE"
    echo "ℹ️  Response: $BODY"
    echo "ℹ️  Continuing with public endpoints only (create test user first if needed)"
    TOKEN=""
    AUTH_HEADER=""
fi

echo ""
echo "3. Testing cart endpoint (GET all carts)..."
RESPONSE=$(curl -s "${BASE_URL}/cart" -w "%{http_code}")
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ GET /cart successful"
    echo "Response: $BODY"
else
    echo "❌ GET /cart failed with code: $HTTP_CODE"
    echo "Response: $BODY"
    exit 1
fi

echo ""
echo "4. Testing create cart (public endpoint)..."
CART_RESPONSE=$(curl -s -X POST "${BASE_URL}/cart" \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-123"}' \
  -w "%{http_code}")

HTTP_CODE="${CART_RESPONSE: -3}"
BODY="${CART_RESPONSE%???}"

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo "✅ POST /cart successful"
    echo "Response: $BODY"
    
    # Extract cart ID for further testing
    CART_ID=$(echo "$BODY" | jq -r '.cartId' 2>/dev/null || echo "")
    
    if [ -n "$CART_ID" ] && [ "$CART_ID" != "null" ]; then
        echo ""
        echo "4. Testing add item to cart..."
        ITEM_RESPONSE=$(curl -s -X POST "${BASE_URL}/cart/${CART_ID}/items" \
          -H "Content-Type: application/json" \
          -d '{"productId": "laptop-1", "quantity": 1}' \
          -w "%{http_code}")
        
        HTTP_CODE="${ITEM_RESPONSE: -3}"
        BODY="${ITEM_RESPONSE%???}"
        
        if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
            echo "✅ POST /cart/${CART_ID}/items successful"
            echo "Response: $BODY"
            
            echo ""
            echo "4.1. Testing add second item to cart..."
            ITEM2_RESPONSE=$(curl -s -X POST "${BASE_URL}/cart/${CART_ID}/items" \
              -H "Content-Type: application/json" \
              -d '{"productId": "mouse-1", "quantity": 2}' \
              -w "%{http_code}")
            
            HTTP_CODE2="${ITEM2_RESPONSE: -3}"
            BODY2="${ITEM2_RESPONSE%???}"
            
            if [ "$HTTP_CODE2" = "200" ] || [ "$HTTP_CODE2" = "201" ]; then
                echo "✅ POST second item successful"
                echo "Response: $BODY2"
            else
                echo "❌ POST second item failed with code: $HTTP_CODE2"
                echo "Response: $BODY2"
            fi
        else
            echo "❌ POST /cart/${CART_ID}/items failed with code: $HTTP_CODE"
            echo "Response: $BODY"
        fi
        
        echo ""
        echo "5. Testing get cart with items..."
        GET_RESPONSE=$(curl -s "${BASE_URL}/cart/${CART_ID}" -w "%{http_code}")
        HTTP_CODE="${GET_RESPONSE: -3}"
        BODY="${GET_RESPONSE%???}"
        
        if [ "$HTTP_CODE" = "200" ]; then
            echo "✅ GET /cart/${CART_ID} successful"
            echo "Response: $BODY"
        else
            echo "❌ GET /cart/${CART_ID} failed with code: $HTTP_CODE"
            echo "Response: $BODY"
        fi
        
        echo ""
        echo "6. Testing apply discount..."
        DISCOUNT_RESPONSE=$(curl -s -X POST "${BASE_URL}/cart/${CART_ID}/discounts/percentage" \
          -H "Content-Type: application/json" \
          -d '{"name": "WELCOME10", "percentage": 10, "maxAmount": 5000}' \
          -w "%{http_code}")
        
        HTTP_CODE="${DISCOUNT_RESPONSE: -3}"
        BODY="${DISCOUNT_RESPONSE%???}"
        
        if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
            echo "✅ POST discount successful"
            echo "Response: $BODY"
        else
            echo "❌ POST discount failed with code: $HTTP_CODE"
            echo "Response: $BODY"
        fi
        
        echo ""
        echo "7. Testing apply freebie rule..."
        FREEBIE_RESPONSE=$(curl -s -X POST "${BASE_URL}/cart/${CART_ID}/freebies" \
          -H "Content-Type: application/json" \
          -d '{"triggerProductId": "laptop-1", "freebieProductId": "mousepad-1", "quantity": 1}' \
          -w "%{http_code}")
        
        HTTP_CODE="${FREEBIE_RESPONSE: -3}"
        BODY="${FREEBIE_RESPONSE%???}"
        
        if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
            echo "✅ POST freebie rule successful"
            echo "Response: $BODY"
        else
            echo "❌ POST freebie rule failed with code: $HTTP_CODE"
            echo "Response: $BODY"
        fi
        
        echo ""
        echo "8. Testing cart utilities..."
        UTILS_RESPONSE=$(curl -s "${BASE_URL}/cart/${CART_ID}/utilities/counts" -w "%{http_code}")
        HTTP_CODE="${UTILS_RESPONSE: -3}"
        BODY="${UTILS_RESPONSE%???}"
        
        if [ "$HTTP_CODE" = "200" ]; then
            echo "✅ GET utilities/counts successful"
            echo "Response: $BODY"
        else
            echo "❌ GET utilities/counts failed with code: $HTTP_CODE"
            echo "Response: $BODY"
        fi
        
        echo ""
        echo "8.1. Testing final cart state..."
        FINAL_RESPONSE=$(curl -s "${BASE_URL}/cart/${CART_ID}" -w "%{http_code}")
        HTTP_CODE="${FINAL_RESPONSE: -3}"
        BODY="${FINAL_RESPONSE%???}"
        
        if [ "$HTTP_CODE" = "200" ]; then
            echo "✅ Final cart state:"
            echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
        else
            echo "❌ GET final cart failed with code: $HTTP_CODE"
            echo "Response: $BODY"
        fi
    else
        echo "❌ Could not extract cart ID from response"
    fi
else
    echo "❌ POST /cart failed with code: $HTTP_CODE"
    echo "Response: $BODY"
fi

echo ""
echo "🏁 Cart API testing completed!"

echo ""
echo "9. Testing user-specific cart functionality..."
echo "9.1. Testing get user's current cart (should create new one)..."
USER_CART_RESPONSE=$(curl -s "${BASE_URL}/cart/user/customer-456/current" -w "%{http_code}")
HTTP_CODE="${USER_CART_RESPONSE: -3}"
BODY="${USER_CART_RESPONSE%???}"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ GET user current cart successful"
    echo "Response: $BODY"
    
    # Extract the new user cart ID
    USER_CART_ID=$(echo "$BODY" | jq -r '.cartId' 2>/dev/null || echo "")
    
    if [ -n "$USER_CART_ID" ] && [ "$USER_CART_ID" != "null" ]; then
        echo ""
        echo "9.2. Testing add item to user's cart..."
        USER_ITEM_RESPONSE=$(curl -s -X POST "${BASE_URL}/cart/${USER_CART_ID}/items" \
          -H "Content-Type: application/json" \
          -d '{"productId": "keyboard-1", "quantity": 1}' \
          -w "%{http_code}")
        
        HTTP_CODE="${USER_ITEM_RESPONSE: -3}"
        BODY="${USER_ITEM_RESPONSE%???}"
        
        if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
            echo "✅ Added item to user cart successful"
            echo "Response: $BODY"
            
            echo ""
            echo "9.3. Testing get user's current cart again (should return existing cart with items)..."
            USER_CART2_RESPONSE=$(curl -s "${BASE_URL}/cart/user/customer-456/current" -w "%{http_code}")
            HTTP_CODE="${USER_CART2_RESPONSE: -3}"
            BODY="${USER_CART2_RESPONSE%???}"
            
            if [ "$HTTP_CODE" = "200" ]; then
                echo "✅ GET user current cart (with items) successful"
                RETURNED_CART_ID=$(echo "$BODY" | jq -r '.cartId' 2>/dev/null || echo "")
                
                if [ "$RETURNED_CART_ID" = "$USER_CART_ID" ]; then
                    echo "✅ Correctly returned the same cart with items"
                    echo "Response: $BODY"
                else
                    echo "❌ Returned different cart ID: $RETURNED_CART_ID vs $USER_CART_ID"
                fi
            else
                echo "❌ GET user current cart failed with code: $HTTP_CODE"
                echo "Response: $BODY"
            fi
        else
            echo "❌ Add item to user cart failed with code: $HTTP_CODE"
            echo "Response: $BODY"
        fi
    fi
else
    echo "❌ GET user current cart failed with code: $HTTP_CODE"
    echo "Response: $BODY"
fi

echo ""
echo "🔐 Testing Authenticated Cart Endpoints (JWT Token Required)"
echo "============================================================="

if [ -n "$TOKEN" ]; then
    echo ""
    echo "10.1. Testing get my cart (authenticated)..."
    MY_CART_RESPONSE=$(curl -s -X GET "${BASE_URL}/cart/my-cart" \
      -H "$AUTH_HEADER" \
      -w "%{http_code}")

    HTTP_CODE="${MY_CART_RESPONSE: -3}"
    BODY="${MY_CART_RESPONSE%???}"

    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ GET /cart/my-cart successful"
        echo "Response: $BODY"
        
        echo ""
        echo "10.2. Testing add item to my cart (authenticated)..."
        ADD_MY_ITEM_RESPONSE=$(curl -s -X POST "${BASE_URL}/cart/my-cart/items" \
          -H "Content-Type: application/json" \
          -H "$AUTH_HEADER" \
          -d '{"productId": "PROD-001", "quantity": 2}' \
          -w "%{http_code}")

        HTTP_CODE="${ADD_MY_ITEM_RESPONSE: -3}"
        BODY="${ADD_MY_ITEM_RESPONSE%???}"

        if [ "$HTTP_CODE" = "201" ]; then
            echo "✅ POST /cart/my-cart/items successful"
            echo "Response: $BODY"
            
            echo ""
            echo "10.3. Testing update item in my cart (authenticated)..."
            UPDATE_MY_ITEM_RESPONSE=$(curl -s -X PUT "${BASE_URL}/cart/my-cart/items/PROD-001" \
              -H "Content-Type: application/json" \
              -H "$AUTH_HEADER" \
              -d '{"quantity": 3}' \
              -w "%{http_code}")

            HTTP_CODE="${UPDATE_MY_ITEM_RESPONSE: -3}"
            BODY="${UPDATE_MY_ITEM_RESPONSE%???}"

            if [ "$HTTP_CODE" = "200" ]; then
                echo "✅ PUT /cart/my-cart/items/{itemId} successful"
                echo "Response: $BODY"
                
                echo ""
                echo "10.4. Testing remove item from my cart (authenticated)..."
                REMOVE_MY_ITEM_RESPONSE=$(curl -s -X DELETE "${BASE_URL}/cart/my-cart/items/PROD-001" \
                  -H "$AUTH_HEADER" \
                  -w "%{http_code}")

                HTTP_CODE="${REMOVE_MY_ITEM_RESPONSE: -3}"
                BODY="${REMOVE_MY_ITEM_RESPONSE%???}"

                if [ "$HTTP_CODE" = "200" ]; then
                    echo "✅ DELETE /cart/my-cart/items/{itemId} successful"
                    echo "Response: $BODY"
                else
                    echo "❌ Remove item from my cart failed with code: $HTTP_CODE"
                    echo "Response: $BODY"
                fi
            else
                echo "❌ Update item in my cart failed with code: $HTTP_CODE"
                echo "Response: $BODY"
            fi
        else
            echo "❌ Add item to my cart failed with code: $HTTP_CODE"
            echo "Response: $BODY"
        fi
        
        echo ""
        echo "10.5. Testing clear my cart (authenticated)..."
        CLEAR_MY_CART_RESPONSE=$(curl -s -X DELETE "${BASE_URL}/cart/my-cart" \
          -H "$AUTH_HEADER" \
          -w "%{http_code}")

        HTTP_CODE="${CLEAR_MY_CART_RESPONSE: -3}"
        BODY="${CLEAR_MY_CART_RESPONSE%???}"

        if [ "$HTTP_CODE" = "200" ]; then
            echo "✅ DELETE /cart/my-cart successful"
            echo "Response: $BODY"
        else
            echo "❌ Clear my cart failed with code: $HTTP_CODE"
            echo "Response: $BODY"
        fi
    else
        echo "❌ GET my cart failed with code: $HTTP_CODE"
        echo "Response: $BODY"
    fi
else
    echo "⚠️  Skipping authenticated tests - no JWT token available"
    echo "ℹ️  To test authenticated endpoints:"
    echo "   1. Make sure user exists: POST /users/register"
    echo "   2. Update TEST_EMAIL and TEST_PASSWORD variables in this script"
    echo "   3. Run this script again"
fi

echo ""
echo "🎯 Cart API Testing Completed!"
