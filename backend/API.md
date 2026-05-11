# ATTYER API Documentation

Base URL: `http://localhost:5000/api`

---

## Auth Routes `/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/logout` | Logout user | No |
| POST | `/auth/refresh` | Refresh access token | No (cookie) |
| POST | `/auth/forgot-password` | Send password reset email | No |
| POST | `/auth/reset-password/:token` | Reset password with token | No |

### POST `/auth/register`
**Request:**
```json
{ "name": "string", "email": "string", "password": "string", "phone": "string" }
```
**Response:**
```json
{ "success": true, "accessToken": "string", "user": { "id": "string", "name": "string", "email": "string", "role": "string" } }
```

### POST `/auth/login`
**Request:**
```json
{ "email": "string", "password": "string" }
```
**Response:**
```json
{ "success": true, "accessToken": "string", "user": { "id": "string", "name": "string", "email": "string", "role": "string" } }
```

### POST `/auth/forgot-password`
**Request:**
```json
{ "email": "string" }
```
**Response:**
```json
{ "success": true, "message": "Password reset email sent" }
```

### POST `/auth/reset-password/:token`
**Request:**
```json
{ "password": "string" }
```
**Response:**
```json
{ "success": true, "message": "Password reset successful" }
```

---

## Product Routes `/products`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/products` | Get all products (with filters) | No |
| GET | `/products/:slug` | Get single product by slug | No |
| POST | `/products` | Create product | Admin |
| PUT | `/products/:id` | Update product | Admin |
| DELETE | `/products/:id` | Soft delete product | Admin |
| POST | `/products/:id/images` | Upload product images | Admin |

### GET `/products` — Query Params
| Param | Type | Example |
|-------|------|---------|
| `gender` | string | `men`, `women`, `unisex` |
| `category` | string | `Kurta`, `Saree` |
| `printType` | string | `sanganeri`, `ajrakh` |
| `minPrice` | number | `500` |
| `maxPrice` | number | `3000` |
| `search` | string | `block print` |
| `page` | number | `1` |
| `limit` | number | `12` |
| `sort` | string | `price_asc`, `price_desc`, `newest`, `rating` |

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [],
    "total": 0,
    "page": 1,
    "pages": 1
  }
}
```

### POST `/products`
**Request:**
```json
{
  "name": "string", "description": "string", "price": 0, "discountedPrice": 0,
  "gstRate": 12, "category": "string", "gender": "men|women|unisex",
  "printType": "string", "fabric": "string",
  "variants": [{ "size": "M", "stock": 10, "sku": "string" }],
  "tags": ["string"]
}
```

---

## Cart Routes `/cart`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/cart` | Get user's cart | Yes |
| POST | `/cart` | Add item to cart | Yes |
| PUT | `/cart/:itemId` | Update item quantity | Yes |
| DELETE | `/cart/:itemId` | Remove item from cart | Yes |
| DELETE | `/cart` | Clear entire cart | Yes |

### POST `/cart`
**Request:**
```json
{ "productId": "string", "size": "string", "quantity": 1 }
```
**Response:**
```json
{ "success": true, "data": { "items": [], "totalPrice": 0 } }
```

### PUT `/cart/:itemId`
**Request:**
```json
{ "quantity": 2 }
```

---

## Order Routes `/orders`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/orders` | Create new order | Yes |
| GET | `/orders/my` | Get logged-in user's orders | Yes |
| GET | `/orders/:id` | Get single order | Yes |
| PUT | `/orders/:id/cancel` | Cancel order | Yes |
| GET | `/orders` | Get all orders | Admin |
| PUT | `/orders/:id/status` | Update order status | Admin |

### POST `/orders`
**Request:**
```json
{
  "orderItems": [{ "product": "string", "size": "string", "quantity": 1, "price": 0 }],
  "shippingAddress": {
    "name": "string", "phone": "string", "street": "string",
    "city": "string", "state": "string", "pincode": "string", "country": "India"
  },
  "couponCode": "string"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "order": {},
    "razorpayOrder": { "id": "string", "amount": 0, "currency": "INR" }
  }
}
```

### PUT `/orders/:id/status` (Admin)
**Request:**
```json
{ "status": "Confirmed|Shipped|Delivered|Cancelled", "trackingNumber": "string" }
```

---

## Payment Routes `/payments`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/payments/verify` | Verify Razorpay payment | Yes |
| POST | `/webhook/razorpay` | Razorpay webhook | No (signature) |

### POST `/payments/verify`
**Request:**
```json
{
  "razorpayOrderId": "string",
  "razorpayPaymentId": "string",
  "razorpaySignature": "string",
  "orderId": "string"
}
```
**Response:**
```json
{ "success": true, "message": "Payment verified successfully" }
```

---

## Coupon Routes `/coupons`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/coupons/validate` | Validate a coupon code | Yes |
| POST | `/coupons` | Create coupon | Admin |
| GET | `/coupons` | List all coupons | Admin |
| PUT | `/coupons/:id/deactivate` | Deactivate coupon | Admin |

### POST `/coupons/validate`
**Request:**
```json
{ "code": "WELCOME10", "orderTotal": 1500 }
```
**Response:**
```json
{ "success": true, "data": { "discount": 150, "finalTotal": 1350, "couponId": "string" } }
```

### POST `/coupons`
**Request:**
```json
{
  "code": "string", "type": "percentage|fixed", "value": 10,
  "minOrderValue": 500, "maxDiscount": 200,
  "maxUses": 100, "expiryDate": "2026-12-31"
}
```

---

## Review Routes `/reviews`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/reviews` | Add a review | Yes |
| GET | `/reviews/:productId` | Get reviews for a product | No |
| DELETE | `/reviews/:id` | Delete own review | Yes |

### POST `/reviews`
**Request:**
```json
{ "product": "string", "rating": 5, "title": "string", "comment": "string" }
```

---

## User Routes `/users`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/me` | Get logged-in user profile | Yes |
| PUT | `/users/me` | Update profile | Yes |
| PUT | `/users/me/password` | Change password | Yes |
| POST | `/users/me/addresses` | Add address | Yes |
| PUT | `/users/me/addresses/:id` | Update address | Yes |
| DELETE | `/users/me/addresses/:id` | Delete address | Yes |

### PUT `/users/me`
**Request:**
```json
{ "name": "string", "phone": "string" }
```

### PUT `/users/me/password`
**Request:**
```json
{ "currentPassword": "string", "newPassword": "string" }
```

---

## Wishlist Routes `/wishlist`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/wishlist` | Get user's wishlist | Yes |
| POST | `/wishlist/:productId` | Add to wishlist | Yes |
| DELETE | `/wishlist/:productId` | Remove from wishlist | Yes |

---

## Admin Routes `/admin`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/dashboard` | Get dashboard stats | Admin |
| GET | `/admin/users` | List all users | Admin |
| PUT | `/admin/users/:id/role` | Update user role | Admin |
| DELETE | `/admin/users/:id` | Delete user | Admin |

### GET `/admin/dashboard` Response:
```json
{
  "success": true,
  "data": {
    "totalOrders": 0, "totalRevenue": 0,
    "totalUsers": 0, "totalProducts": 0,
    "recentOrders": [], "lowStockProducts": []
  }
}
```

---

## Error Response Format

All errors follow this shape:
```json
{ "success": false, "message": "Error description", "stack": "only in development" }
```

## Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Not authenticated |
| 403 | Not authorized |
| 404 | Resource not found |
| 429 | Too many requests |
| 500 | Server error |