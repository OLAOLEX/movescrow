-- ========================================
-- COMPLETE TABLE RECREATION SCRIPT
-- Run this to delete all existing tables and recreate them properly
-- WARNING: This will delete all existing data!
-- ========================================

-- Drop all tables in reverse order of dependencies
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS restaurant_sessions CASCADE;
DROP TABLE IF EXISTS restaurant_auth CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;

-- ========================================
-- Create restaurant_auth table for OTP storage
-- ========================================
CREATE TABLE restaurant_auth (
  phone TEXT PRIMARY KEY,
  otp_code TEXT,
  otp_expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- Create restaurants table
-- ========================================
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  address TEXT,
  description TEXT,
  whatsapp_phone TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- Create restaurant_sessions table
-- ========================================
CREATE TABLE restaurant_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- Create orders table
-- ========================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id),
  order_ref TEXT UNIQUE NOT NULL,
  customer_code TEXT,
  total_amount DECIMAL(10, 2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- Create chat_messages table
-- ========================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL, -- 'restaurant' or 'customer'
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- Create indexes for better performance
-- ========================================
CREATE INDEX idx_restaurant_auth_phone ON restaurant_auth(phone);
CREATE INDEX idx_restaurants_phone ON restaurants(phone);
CREATE INDEX idx_restaurant_sessions_token ON restaurant_sessions(token);
CREATE INDEX idx_restaurant_sessions_restaurant_id ON restaurant_sessions(restaurant_id);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_chat_messages_order_id ON chat_messages(order_id);

-- ========================================
-- Verify tables were created
-- ========================================
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('restaurant_auth', 'restaurants', 'restaurant_sessions', 'orders', 'chat_messages')
ORDER BY table_name, ordinal_position;

