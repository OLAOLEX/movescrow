# Movescrow API Design

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints Overview

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

### Users
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update user profile
- `GET /users/{id}` - Get user by ID (public info)

### Orders
- `POST /orders` - Create new order (Sender)
- `GET /orders` - List orders (filtered by user role)
- `GET /orders/{id}` - Get order details
- `PUT /orders/{id}/accept` - Accept order (Mover)
- `PUT /orders/{id}/status` - Update order status
- `PUT /orders/{id}/complete` - Complete delivery

### Payments
- `POST /payments/initialize` - Initialize payment
- `POST /payments/verify` - Verify payment
- `GET /payments/escrow/{order_id}` - Get escrow status
- `POST /payments/release` - Release escrow payment

### Tracking
- `GET /tracking/{order_id}` - Get tracking information
- `POST /tracking/update` - Update location (Mover)
- `WebSocket /ws/tracking/{order_id}` - Real-time tracking

### Restaurants
- `GET /restaurants` - List restaurants
- `GET /restaurants/{id}` - Get restaurant details
- `GET /restaurants/{id}/menu` - Get restaurant menu
- `POST /restaurants` - Create restaurant (Restaurant owner)

### Certifications
- `GET /certifications/food-safe` - List Food-Safe certified movers
- `POST /certifications/verify` - Verify certification

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error


