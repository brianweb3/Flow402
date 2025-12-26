# API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication via JWT token. Include the token in cookies (httpOnly) or as a Bearer token in the Authorization header.

## Endpoints

### Authentication

#### Sign Up

```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com"
    }
  }
}
```

#### Get Current User

```http
GET /api/auth/me
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "CONSUMER"
    }
  }
}
```

### Offers

#### List Offers

```http
GET /api/offers?resourceType=RAM&minPrice=0&maxPrice=100
```

**Query Parameters:**
- `resourceType` - Filter by resource type (RAM, GPU)
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `region` - Filter by region

#### Create Offer

```http
POST /api/offers
Content-Type: application/json

{
  "resourceType": "RAM",
  "amount": 8,
  "region": "us-east-1",
  "pricePerUnitPerTime": 0.1,
  "currency": "USDC",
  "availability": "available"
}
```

### Rentals

#### Create Rental

```http
POST /api/rentals
Content-Type: application/json

{
  "offerId": "offer_id",
  "durationMinutes": 60
}
```

**Response (Payment Required):**
```http
HTTP/1.1 402 Payment Required
Content-Type: application/json

{
  "success": false,
  "error": {
    "message": "Payment required",
    "code": "PAYMENT_REQUIRED"
  },
  "payment": {
    "challenge": {
      "paymentId": "payment_id",
      "amount": "10.50",
      "currency": "USDC",
      "destination": "destination_address",
      "expiresAt": "2024-01-01T00:15:00Z"
    },
    "paymentUrl": "/api/payments/authorize?paymentId=..."
  }
}
```

### Payments

#### Get Payment Quote

```http
POST /api/payments/quote
Content-Type: application/json

{
  "amount": 10.5,
  "currency": "USDC"
}
```

#### Complete Payment

```http
POST /api/payments/complete
Content-Type: application/json

{
  "paymentId": "payment_id",
  "proof": "payment_proof"
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `402` - Payment Required
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

