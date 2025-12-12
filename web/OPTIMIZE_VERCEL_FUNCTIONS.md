# Vercel Functions Optimization Plan

## Current Functions (12 - AT LIMIT)

1. `/api/auth/send-otp.js`
2. `/api/auth/verify-otp.js`
3. `/api/auth/verify-token.js`
4. `/api/auth/magic-link.js`
5. `/api/notifications/send-order.js`
6. `/api/whatsapp/webhook.js` (GET + POST in one file)
7. `/api/whatsapp/send-message.js`
8. `/api/orders/messages.js` (GET + POST in one file)
9. `/api/orders/[id]/index.js` (GET)
10. `/api/orders/[id]/accept.js` (POST)
11. `/api/orders/[id]/reject.js` (POST)
12. `/api/orders/[id]/set-price.js` (POST)

## Optimization Strategy

### Option 1: Consolidate Order Actions (RECOMMENDED) ✅
**Saves: 2 functions (10 total)**

Merge `/api/orders/[id]/accept.js`, `/api/orders/[id]/reject.js`, and `/api/orders/[id]/set-price.js` into a single `/api/orders/[id]/action.js` that handles different actions via request body.

**New endpoint:** `POST /api/orders/[id]/action`

```json
{
  "action": "accept|reject|set-price",
  "session": "token",
  "data": {
    // action-specific data
    "reason": "...", // for reject
    "price": 4700,   // for set-price
    "ready_time": 30 // for set-price
  }
}
```

### Option 2: Consolidate Auth Functions
**Saves: 2 functions (8 total)**

Merge `/api/auth/verify-token.js` and `/api/auth/magic-link.js` into `/api/auth/index.js` with query params.

**New endpoint:** 
- `GET /api/auth?type=verify&token=xxx`
- `POST /api/auth/magic-link` (stays as is, or merge)

### Option 3: Move to Supabase Edge Functions
**Saves: 3-4 functions (4-5 total)**

Move simple CRUD operations to Supabase:
- Order GET operations → Supabase Edge Function
- Auth verify operations → Supabase Edge Function

## Recommended Plan (Option 1 + Option 2)

**Result: 8 functions (4 below limit)**

1. ✅ Consolidate order actions → `/api/orders/[id]/action.js`
2. ✅ Consolidate auth verify/magic-link → `/api/auth/index.js`
3. Keep WhatsApp functions (external integrations)
4. Keep notification function (external integrations)
5. Keep messages function (complex logic)

### Final Structure (8 functions):

1. `/api/auth/send-otp.js`
2. `/api/auth/verify-otp.js`
3. `/api/auth/index.js` (handles verify-token + magic-link)
4. `/api/notifications/send-order.js`
5. `/api/whatsapp/webhook.js`
6. `/api/whatsapp/send-message.js`
7. `/api/orders/messages.js`
8. `/api/orders/[id]/action.js` (handles accept/reject/set-price)
9. `/api/orders/[id]/index.js` (GET order details)

Wait, that's still 9. Let's merge order GET into the action file too:

### Final Optimized Structure (8 functions):

1. `/api/auth/send-otp.js`
2. `/api/auth/verify-otp.js`
3. `/api/auth/index.js` (verify-token + magic-link)
4. `/api/notifications/send-order.js`
5. `/api/whatsapp/webhook.js`
6. `/api/whatsapp/send-message.js`
7. `/api/orders/messages.js`
8. `/api/orders/[id]/index.js` (GET + POST actions: accept/reject/set-price)

## Implementation Steps

1. ✅ Create consolidated `/api/orders/[id]/index.js` (GET + POST with action parameter)
2. ✅ Create consolidated `/api/auth/index.js` (verify-token + magic-link)
3. ✅ Delete old separate files
4. ✅ Update frontend to use new endpoints
5. ✅ Test all functionality

