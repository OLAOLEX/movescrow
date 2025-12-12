# Testing WhatsApp WebView Order Flow

This guide will help you test the complete WhatsApp WebView order flow.

## Prerequisites

1. ✅ WhatsApp Business API configured in Vercel
2. ✅ Supabase configured with required tables
3. ✅ Restaurant phone number added to WhatsApp allowed list
4. ✅ Restaurant record exists in Supabase

## Step 1: Create Test Order in Supabase

Run this SQL in Supabase SQL Editor to create a test order:

```sql
-- First, ensure you have a restaurant
INSERT INTO restaurants (id, phone, name, whatsapp_phone, notification_preference, status)
VALUES (
  gen_random_uuid(),
  '+2348060800971',  -- Replace with your test phone number
  'Test Restaurant',
  '+2348060800971',  -- Replace with your test phone number  
  'whatsapp',
  'active'
)
ON CONFLICT (phone) DO UPDATE SET 
  whatsapp_phone = EXCLUDED.whatsapp_phone,
  notification_preference = EXCLUDED.notification_preference;

-- Get the restaurant ID
SELECT id, phone, name FROM restaurants WHERE phone = '+2348060800971';

-- Create a test order (replace restaurant_id with the ID from above)
INSERT INTO orders (
  id,
  restaurant_id,
  customer_id,
  order_ref,
  total_amount,
  status,
  items,
  delivery_address,
  special_instructions,
  customer_code,
  customer_name
)
VALUES (
  gen_random_uuid(),
  'YOUR_RESTAURANT_ID_HERE',  -- Replace with restaurant ID from above
  'test-customer-123',
  'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || substr(md5(random()::text), 1, 6),
  0,  -- No price yet, restaurant will set it
  'pending',
  '[{"name": "Jollof Rice", "quantity": 2}, {"name": "Fried Chicken", "quantity": 1}]'::jsonb,
  '123 Test Street, Lagos, Nigeria',
  'Extra spicy please',
  'CUST-001',
  'Test Customer'
)
RETURNING id, order_ref;
```

**Save the `id` and `order_ref` from the query result - you'll need them for testing.**

## Step 2: Send Test Notification

Use PowerShell to send a test notification:

```powershell
$body = @{
    restaurantId = "YOUR_RESTAURANT_ID_HERE"  # From Step 1
    orderId = "YOUR_ORDER_ID_HERE"  # From Step 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://www.movescrow.com/api/notifications/send-order" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

## Step 3: Check WhatsApp

You should receive a WhatsApp message with:
- 🍽️ Order details
- 📋 A button that says "📋 View & Respond"
- Button opens the order webview in WhatsApp's in-app browser

## Step 4: Test Order Actions

Once you click the button and the webview opens:

1. **View Order Details** - Should show:
   - Customer name/code
   - Order items
   - Delivery address
   - Special instructions

2. **Accept Order**:
   - Click "✅ Accept Order" button
   - Price form should appear
   - Enter price (e.g., 4700)
   - Enter ready time in minutes (e.g., 30)
   - Click "Confirm Price"
   - Order status updates to "payment_pending"

3. **Reject Order** (test separately):
   - Click "❌ Reject Order" button
   - Enter rejection reason
   - Order status updates to "rejected"
   - Webview closes

## Step 5: Verify in Supabase

Check that the order was updated:

```sql
SELECT 
  id,
  order_ref,
  status,
  total_amount,
  platform_fee,
  delivery_fee,
  ready_time,
  rejection_reason,
  updated_at
FROM orders
WHERE id = 'YOUR_ORDER_ID_HERE';
```

## Troubleshooting

### No WhatsApp message received?

1. Check Vercel function logs for errors
2. Verify WhatsApp phone number is in allowed list
3. Check WhatsApp API token is valid (not expired)
4. Verify restaurant `whatsapp_phone` field is set correctly

### Button doesn't work (falls back to plain text link)?

- This happens if you haven't messaged the WhatsApp Business number first
- Buttons only work within 24-hour customer service window
- Solution: Send a message to your WhatsApp Business number first, then try again

### Webview shows "Order not found"?

1. Check session token is valid (should be in URL)
2. Verify order ID matches
3. Check Supabase logs for query errors
4. Ensure restaurant phone matches session token phone

### 401 Unauthorized errors?

1. Session token might be expired (24 hours)
2. Restaurant phone doesn't match session token
3. Order doesn't belong to the restaurant

## Quick Test Script

Save this as `test-order.ps1`:

```powershell
# Test Order Creation and Notification
$restaurantPhone = "+2348060800971"  # Replace with your phone
$restaurantId = "YOUR_RESTAURANT_ID"  # Replace with restaurant ID
$orderId = "YOUR_ORDER_ID"  # Replace with order ID

Write-Host "Sending test order notification..." -ForegroundColor Yellow

$body = @{
    restaurantId = $restaurantId
    orderId = $orderId
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://www.movescrow.com/api/notifications/send-order" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "✅ Notification sent successfully!" -ForegroundColor Green
    Write-Host "Deep link: $($response.magicLink)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Check your WhatsApp for the message!" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
```

## Expected Flow

```
1. Customer places order → Order created in DB (status: pending)
2. Notification API called → WhatsApp message sent with button
3. Restaurant receives message → Clicks button
4. Webview opens → Shows order details
5. Restaurant accepts → Price form appears
6. Restaurant sets price → Order status: payment_pending
7. Customer notified → Payment link sent (TODO)
```

## Next Steps

After successful testing:
1. Integrate with main app order creation flow
2. Add customer payment notification
3. Add mover assignment workflow
4. Add order status updates (preparing, ready, etc.)

