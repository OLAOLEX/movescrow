# Test Order SQL - Copy This Directly

## Quick Test Setup

Copy these SQL commands **one at a time** into Supabase SQL Editor:

### Step 1: Create Test Restaurant

```sql
INSERT INTO restaurants (name, phone, whatsapp_phone, status)
VALUES ('Test Restaurant', '+2348000000000', '+2348000000000', 'active')
RETURNING id;
```

**Copy the UUID** that appears in the results (you'll need it for step 2).

### Step 2: Create Test Order

**Important:** Replace `YOUR_RESTAURANT_UUID_HERE` with the UUID from Step 1.

```sql
INSERT INTO orders (
  order_number,
  order_ref,
  restaurant_id,
  customer_id,
  customer_code,
  customer_whatsapp,
  items,
  total_amount,
  status
) VALUES (
  'ORD-001',
  'ORD-001',
  'YOUR_RESTAURANT_UUID_HERE',
  gen_random_uuid(),
  '#12345',
  '+2348000000000',
  '{"item": "Jollof Rice"}'::jsonb,
  3000.00,
  'pending'
)
RETURNING id;
```

**Copy the UUID** that appears in the results (you'll need it to test the notification API).

### Step 3: Test Notification (via curl or API tool)

```bash
curl -X POST https://movescrow.vercel.app/api/notifications/send-order \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "RESTAURANT_UUID_FROM_STEP_1",
    "orderId": "ORDER_UUID_FROM_STEP_2"
  }'
```

---

## Notes

- Make sure to use actual UUIDs (not the placeholder text)
- Replace `+2348000000000` with a WhatsApp number you can test with
- The restaurant should receive an SMS/WhatsApp notification with a magic link

