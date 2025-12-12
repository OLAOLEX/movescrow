# Fix Orders Table Schema

## Problem
Your `orders` table is missing columns needed for the WhatsApp WebView order management feature.

## Solution

### Step 1: Run This SQL in Supabase SQL Editor

Copy and paste this into your **Supabase SQL Editor** and click **Run**:

```sql
-- Add missing columns to orders table for WhatsApp WebView functionality
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS items JSONB,
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS delivery_address TEXT,
  ADD COLUMN IF NOT EXISTS special_instructions TEXT,
  ADD COLUMN IF NOT EXISTS ready_time_minutes INT;

-- Add comments for documentation
COMMENT ON COLUMN orders.items IS 'JSON array of order items: [{"name": "Jollof Rice", "quantity": 2}]';
COMMENT ON COLUMN orders.customer_name IS 'Customer display name';
COMMENT ON COLUMN orders.delivery_address IS 'Full delivery address';
COMMENT ON COLUMN orders.special_instructions IS 'Special customer instructions';
COMMENT ON COLUMN orders.ready_time_minutes IS 'Minutes until order is ready (set by restaurant)';
```

### Step 2: Verify It Worked

Run this to check the table structure:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
```

You should now see these columns:
- `id` (uuid)
- `restaurant_id` (uuid)
- `order_ref` (text)
- `customer_code` (text)
- `customer_name` (text) ← NEW
- `total_amount` (numeric)
- `status` (text)
- `items` (jsonb) ← NEW
- `delivery_address` (text) ← NEW
- `special_instructions` (text) ← NEW
- `ready_time_minutes` (integer) ← NEW
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)

### Step 3: Create Test Data

Once the columns are added, follow the guide in `TEST_WHATSAPP_WEBVIEW.md` to create a test order.

## What These Columns Do

| Column | Purpose | Example |
|--------|---------|---------|
| `items` | List of ordered items with quantities | `[{"name": "Jollof Rice", "quantity": 2}]` |
| `customer_name` | Display name for customer | `"John Doe"` |
| `delivery_address` | Full delivery address | `"123 Main St, Lagos"` |
| `special_instructions` | Customer notes | `"Extra spicy please"` |
| `ready_time_minutes` | How long until ready (set by restaurant) | `30` |

## Next Steps

After running this migration:
1. ✅ Create test restaurant (see `TEST_WHATSAPP_WEBVIEW.md`)
2. ✅ Create test order with all fields (see `TEST_WHATSAPP_WEBVIEW.md`)
3. ✅ Test WhatsApp notification sending
4. ✅ Test order management WebView

