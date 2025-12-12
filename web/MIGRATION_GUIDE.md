# API Endpoint Migration Guide

## Changes Made

We've consolidated API endpoints to reduce the number of Vercel serverless functions from 12 to 8 (below the Hobby plan limit).

### Consolidated Endpoints

#### 1. Order Actions → Single Endpoint

**Before:**
- `POST /api/orders/[id]/accept`
- `POST /api/orders/[id]/reject`
- `POST /api/orders/[id]/set-price`

**After:**
- `POST /api/orders/[id]` with `action` parameter

**Usage:**

```javascript
// Accept order
fetch(`/api/orders/${orderId}`, {
  method: 'POST',
  body: JSON.stringify({
    action: 'accept',
    session: 'token'
  })
});

// Reject order
fetch(`/api/orders/${orderId}`, {
  method: 'POST',
  body: JSON.stringify({
    action: 'reject',
    session: 'token',
    reason: 'Item finished'
  })
});

// Set price
fetch(`/api/orders/${orderId}`, {
  method: 'POST',
  body: JSON.stringify({
    action: 'set-price',
    session: 'token',
    price: 4700,
    ready_time: 30
  })
});
```

#### 2. Auth Operations → Single Endpoint

**Before:**
- `GET /api/auth/verify-token?token=xxx`
- `POST /api/auth/magic-link`

**After:**
- `GET /api/auth?token=xxx` (verify token)
- `POST /api/auth` with `type: 'magic-link'` OR use rewrite to `/api/auth/magic-link`

**Usage:**

```javascript
// Verify token (unchanged - Vercel rewrite handles it)
fetch(`/api/auth/verify-token?token=${token}`);

// Generate magic link
fetch('/api/auth/magic-link', {
  method: 'POST',
  body: JSON.stringify({
    restaurantId: 'xxx',
    orderId: 'xxx' // optional
  })
});
```

Note: The Vercel rewrite rules maintain backward compatibility, so old URLs still work.

## Current Function Count: 8

1. `/api/auth/send-otp.js`
2. `/api/auth/verify-otp.js`
3. `/api/auth/index.js` ✅ (consolidated: verify-token + magic-link)
4. `/api/notifications/send-order.js`
5. `/api/whatsapp/webhook.js`
6. `/api/whatsapp/send-message.js`
7. `/api/orders/messages.js`
8. `/api/orders/[id]/index.js` ✅ (consolidated: GET + POST actions)

## Testing

All existing functionality remains the same. The frontend (`order.html`) has been updated to use the new consolidated endpoints.

## Backward Compatibility

Vercel rewrite rules ensure old endpoint URLs still work:
- `/api/auth/verify-token` → `/api/auth?token=xxx`
- `/api/auth/magic-link` → `/api/auth` (POST)

However, it's recommended to update frontend code to use the new endpoints directly.

