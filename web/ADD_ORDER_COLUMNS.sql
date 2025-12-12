-- Add missing columns to orders table for WhatsApp WebView functionality
-- Run this in Supabase SQL Editor

ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS items JSONB,
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS delivery_address TEXT,
  ADD COLUMN IF NOT EXISTS special_instructions TEXT,
  ADD COLUMN IF NOT EXISTS ready_time_minutes INT;

-- Add comment for documentation
COMMENT ON COLUMN orders.items IS 'JSON array of order items: [{"name": "Jollof Rice", "quantity": 2}]';
COMMENT ON COLUMN orders.customer_name IS 'Customer display name';
COMMENT ON COLUMN orders.delivery_address IS 'Full delivery address';
COMMENT ON COLUMN orders.special_instructions IS 'Special customer instructions';
COMMENT ON COLUMN orders.ready_time_minutes IS 'Minutes until order is ready (set by restaurant)';

