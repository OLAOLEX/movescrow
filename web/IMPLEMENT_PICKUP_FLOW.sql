-- Tables needed for pickup flow with OTP verification

-- Pickups table
CREATE TABLE IF NOT EXISTS pickups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  buyer_id UUID REFERENCES users(id),
  mover_id UUID REFERENCES users(id),
  releaser_contact TEXT NOT NULL, -- Phone/email
  releaser_id UUID REFERENCES users(id), -- If registered
  status TEXT DEFAULT 'pending', -- pending, otp_verified, collected, failed
  mover_photo_url TEXT, -- Photo buyer uploaded of mover
  pickup_photo_url TEXT, -- Photo mover captured with releaser
  geo_location JSONB, -- {lat, lng}
  special_instructions TEXT,
  otp_verified_at TIMESTAMPTZ,
  collected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OTP records
CREATE TABLE IF NOT EXISTS pickup_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pickup_id UUID REFERENCES pickups(id) ON DELETE CASCADE,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Releasers (optional registration)
CREATE TABLE IF NOT EXISTS releasers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE,
  email TEXT,
  name TEXT,
  registered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pickups_order_id ON pickups(order_id);
CREATE INDEX IF NOT EXISTS idx_pickups_mover_id ON pickups(mover_id);
CREATE INDEX IF NOT EXISTS idx_pickup_otps_pickup_id ON pickup_otps(pickup_id);
CREATE INDEX IF NOT EXISTS idx_pickup_otps_code ON pickup_otps(otp_code);

