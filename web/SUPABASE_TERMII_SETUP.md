# Complete Setup Guide: Supabase + Termii for Restaurant Dashboard

## 🎯 Quick Setup Checklist

- [ ] Create Supabase project
- [ ] Create database tables
- [ ] Get Supabase API keys
- [ ] Set up Termii account
- [ ] Get Termii API key
- [ ] Add all environment variables to Vercel
- [ ] Test OTP flow

---

## 1. 📊 Supabase Setup

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up / Log in
3. Click **"New Project"**
4. Fill in:
   - **Name**: `movescrow-restaurant` (or any name)
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to Nigeria (e.g., `West US` or `Southeast Asia`)
5. Click **"Create new project"**
6. Wait 2-3 minutes for project to initialize

### Step 2: Get Supabase Credentials

1. In your Supabase project dashboard
2. Go to **Settings** → **API**
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Service Role Key** (anon key): `eyJhbGc...` (long string)
   - **Service Role Key** (service_role): `eyJhbGc...` (different long string, keep secret!)

### Step 3: Create Database Tables

1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New query"**
3. Paste this SQL and run it:

```sql
-- Create restaurant_auth table for OTP storage
CREATE TABLE IF NOT EXISTS restaurant_auth (
  phone TEXT PRIMARY KEY,
  otp_code TEXT,
  otp_expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
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

-- Create restaurant_sessions table
CREATE TABLE IF NOT EXISTS restaurant_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id),
  order_ref TEXT UNIQUE NOT NULL,
  customer_code TEXT,
  total_amount DECIMAL(10, 2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL, -- 'restaurant' or 'customer'
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_restaurant_auth_phone ON restaurant_auth(phone);
CREATE INDEX IF NOT EXISTS idx_restaurants_phone ON restaurants(phone);
CREATE INDEX IF NOT EXISTS idx_restaurant_sessions_token ON restaurant_sessions(token);
CREATE INDEX IF NOT EXISTS idx_restaurant_sessions_restaurant_id ON restaurant_sessions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_order_id ON chat_messages(order_id);
```

4. Click **"Run"** (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

### Step 4: Enable Realtime (Optional, for live updates)

1. Go to **Database** → **Replication**
2. Enable replication for:
   - `restaurant_auth`
   - `restaurants`
   - `orders`
   - `chat_messages`

OR run this SQL:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE restaurant_auth;
ALTER PUBLICATION supabase_realtime ADD TABLE restaurants;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
```

---

## 2. 📱 Termii SMS Setup

### Step 1: Create Termii Account

1. Go to https://termii.com
2. Click **"Sign Up"**
3. Fill in your details
4. Verify your email

### Step 2: Get API Key

1. Log in to Termii dashboard
2. Go to **API** section
3. Copy your **API Key** (looks like: `TLxxxxxxxxxxxxxxxxxxxxx`)

### Step 3: Fund Your Account (Already Done ✅)

You mentioned you've already funded Termii, so you're good!

### Step 4: Set Up Sender ID (Optional but Recommended)

1. In Termii dashboard, go to **Sender ID**
2. Request a sender ID: `Movescrow` (or your preferred name)
3. Wait for approval (usually instant or few hours)

**Note**: If sender ID not approved yet, Termii will use a default number.

---

## 3. 🔐 Vercel Environment Variables

### Step 1: Go to Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project: **movescrow**
3. Go to **Settings** → **Environment Variables**

### Step 2: Add All Variables

Add these environment variables:

#### Supabase Variables:
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (the service_role key, NOT anon key)
```

#### Termii Variables:
```
TERMII_API_KEY=TLxxxxxxxxxxxxxxxxxxxxx
```

#### WhatsApp Variables (if you have them):
```
WHATSAPP_ACCESS_TOKEN=your_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=movescrow00secret
```

### Step 3: Apply to All Environments

- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

### Step 4: Redeploy

1. After adding variables, go to **Deployments**
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger redeploy

---

## 4. ✅ Verification Steps

### Test Supabase Connection

1. Go to your Supabase project
2. Go to **Table Editor**
3. You should see:
   - `restaurant_auth`
   - `restaurants`
   - `restaurant_sessions`
   - `orders`
   - `chat_messages`

### Test Termii

You can test Termii API directly:

```powershell
$body = @{
    to = "+2348060800971"
    from = "Movescrow"
    sms = "Test message from Movescrow"
    type = "plain"
    channel = "generic"
    api_key = "YOUR_TERMII_API_KEY"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.ng.termii.com/api/sms/send" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### Test Restaurant Dashboard

1. Go to: `https://www.movescrow.com/restaurant`
2. Enter phone number: `+2348060800971`
3. Click **"Send OTP"**
4. Check your phone for SMS with OTP
5. Enter OTP and verify

---

## 5. 🐛 Troubleshooting

### Issue: "Failed to save OTP"

**Solution**: 
- Check `SUPABASE_URL` is correct
- Check `SUPABASE_SERVICE_ROLE_KEY` is the **service_role** key (not anon key)
- Verify tables exist in Supabase

### Issue: "OTP not found" when verifying

**Solution**:
- Check Supabase tables were created
- Check environment variables are set correctly
- Verify OTP was saved (check `restaurant_auth` table in Supabase)

### Issue: SMS not sending

**Solution**:
- Check `TERMII_API_KEY` is correct
- Verify Termii account is funded
- Check phone number format: `+2348060800971` (with country code)
- Check Termii dashboard for error logs

### Issue: 404 on API routes

**Solution**:
- Verify Root Directory in Vercel is set to `web`
- Check files exist at: `web/api/auth/send-otp.js` and `web/api/auth/verify-otp.js`
- Redeploy after adding environment variables

---

## 6. 📝 Quick Reference

### Supabase Credentials Location:
- Dashboard → Settings → API

### Termii API Key Location:
- Dashboard → API section

### Vercel Environment Variables:
- Project → Settings → Environment Variables

### Test Phone Number Format:
- Use: `+2348060800971` (with + and country code)
- Don't use: `08060800971` or `2348060800971`

---

## 7. 🚀 After Setup

Once everything is configured:

1. **Test OTP Flow**:
   - Send OTP → Should receive SMS
   - Verify OTP → Should log in

2. **Check Supabase**:
   - `restaurant_auth` table should have OTP
   - `restaurants` table should have restaurant after login
   - `restaurant_sessions` should have session token

3. **Monitor**:
   - Check Vercel function logs
   - Check Supabase logs
   - Check Termii dashboard for SMS delivery

---

**Need Help?** Check the logs in:
- Vercel Dashboard → Your Project → Functions → View Logs
- Supabase Dashboard → Logs
- Termii Dashboard → SMS Logs

