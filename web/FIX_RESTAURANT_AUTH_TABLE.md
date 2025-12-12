# Fix restaurant_auth Table - Add Missing Column

## Problem

The `restaurant_auth` table is missing the `updated_at` column.

## Solution

Run this SQL in Supabase SQL Editor:

```sql
-- Add the missing updated_at column
ALTER TABLE restaurant_auth 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
```

## Complete Table Structure (if you need to recreate)

If you want to ensure the table has all the correct columns, run this:

```sql
-- Drop and recreate the table (WARNING: This will delete all existing OTP data)
DROP TABLE IF EXISTS restaurant_auth CASCADE;

-- Create restaurant_auth table with all columns
CREATE TABLE restaurant_auth (
  phone TEXT PRIMARY KEY,
  otp_code TEXT,
  otp_expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_restaurant_auth_phone ON restaurant_auth(phone);
```

**Note:** The first option (adding the column) is safer and won't delete existing data. Use the second option only if you want to start fresh.

