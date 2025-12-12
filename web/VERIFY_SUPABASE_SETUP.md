# Verify Supabase Setup - Complete Checklist

## ✅ Step 1: Check Vercel Environment Variables

1. Go to **Vercel Dashboard** → Your Project (`movescrow`)
2. Go to **Settings** → **Environment Variables**
3. Verify these are set (case-sensitive):

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important Checks:**
- ✅ `SUPABASE_URL` should start with `https://` and end with `.supabase.co`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` should be a very long string (starts with `eyJ...`)
- ✅ Make sure you're using **Service Role Key** (NOT anon key!)
- ✅ Apply to: Production, Preview, Development (all environments)

**How to get the correct keys:**
1. Go to your Supabase Dashboard
2. Go to **Settings** → **API**
3. Copy:
   - **Project URL** → This is your `SUPABASE_URL`
   - **service_role** key (under "Project API keys") → This is your `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ **DO NOT** use the `anon` key - it doesn't have write permissions!

---

## ✅ Step 2: Verify Supabase Tables Exist

1. Go to your **Supabase Dashboard**
2. Go to **Table Editor**
3. You should see these tables:
   - ✅ `restaurant_auth`
   - ✅ `restaurants`
   - ✅ `restaurant_sessions`
   - ✅ `orders`
   - ✅ `chat_messages`

**If tables are missing:**
1. Go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste this SQL (from `web/SUPABASE_TERMII_SETUP.md`):

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
  sender_type TEXT NOT NULL,
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
5. You should see: "Success. No rows returned"

---

## ✅ Step 3: Test Supabase Connection

### Option A: Test via Supabase Dashboard

1. Go to **SQL Editor** in Supabase
2. Run this test query:

```sql
-- First, check if updated_at column exists, if not add it
ALTER TABLE restaurant_auth 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Test insert into restaurant_auth
INSERT INTO restaurant_auth (phone, otp_code, otp_expires_at)
VALUES ('+2348060800971', '123456', NOW() + INTERVAL '10 minutes')
ON CONFLICT (phone) 
DO UPDATE SET 
  otp_code = EXCLUDED.otp_code,
  otp_expires_at = EXCLUDED.otp_expires_at,
  updated_at = NOW();

-- Check if it worked
SELECT * FROM restaurant_auth WHERE phone = '+2348060800971';
```

3. You should see the row inserted/updated
4. If you get an error, the table structure is wrong

### Option B: Test via PowerShell Script

Create a test script to verify your setup:

```powershell
# Test Supabase Connection
$supabaseUrl = "YOUR_SUPABASE_URL_HERE"  # e.g., https://xxxxx.supabase.co
$supabaseKey = "YOUR_SERVICE_ROLE_KEY_HERE"  # The long service_role key

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
}

# Test query
$body = @{
    phone = "+2348060800971"
    otp_code = "123456"
    otp_expires_at = (Get-Date).AddMinutes(10).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
} | ConvertTo-Json

try {
    # Try to upsert
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/restaurant_auth" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -ContentType "application/json" `
        -Prefer "return=representation"
    
    Write-Host "✅ Success! Supabase connection works!"
    Write-Host "Response: $($response | ConvertTo-Json)"
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response)"
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}
```

---

## ✅ Step 4: Check Vercel Function Logs

After redeploying with environment variables:

1. Go to **Vercel Dashboard** → Your Project
2. Go to **Deployments** → Click latest deployment
3. Click **"View Function Logs"** (or go to **Functions** tab)
4. Try sending an OTP from the restaurant dashboard
5. Look for these log messages:

**Good signs:**
- ✅ `Supabase client initialized in send-otp.js`
- ✅ `OTP saved to Supabase successfully:`
- ✅ `Attempting to save OTP to Supabase...`

**Bad signs:**
- ❌ `Supabase not configured - using test mode`
- ❌ `Error saving OTP to Supabase:`
- ❌ `relation "restaurant_auth" does not exist` → Table missing
- ❌ `permission denied for table restaurant_auth` → Wrong API key
- ❌ `JWT expired` or `Invalid API key` → Wrong or expired key

---

## ✅ Step 5: Verify Environment Variables Are Loaded

### Check via Vercel Dashboard

1. Go to **Settings** → **Environment Variables**
2. Make sure variables show as:
   - ✅ **Name**: `SUPABASE_URL`
   - ✅ **Value**: `https://xxxxx.supabase.co` (visible or hidden)
   - ✅ **Environments**: Production, Preview, Development (checked)

3. **Redeploy** after adding/updating variables:
   - Go to **Deployments**
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**

### Check via API Response

After redeploy, test sending OTP. The response includes debug info:

```json
{
  "debug": {
    "hasSupabase": true/false,
    "supabaseUrl": "Set" or "Not set",
    "supabaseKey": "Set (XXX chars)" or "Not set"
  }
}
```

- If `hasSupabase: false` → Environment variables not set or not loaded
- If `supabaseUrl: "Not set"` → `SUPABASE_URL` missing
- If `supabaseKey: "Not set"` → `SUPABASE_SERVICE_ROLE_KEY` missing

---

## ✅ Step 6: Common Issues & Fixes

### Issue 1: "relation 'restaurant_auth' does not exist"

**Fix:** Table doesn't exist. Run the SQL from Step 2.

---

### Issue 2: "permission denied for table restaurant_auth"

**Fix:** You're using the wrong API key.
- ✅ Use **service_role** key (has full access)
- ❌ Don't use **anon** key (read-only)

---

### Issue 3: "JWT expired" or "Invalid API key"

**Fix:** API key is wrong or expired.
1. Go to Supabase Dashboard → Settings → API
2. Copy the **service_role** key again
3. Update in Vercel environment variables
4. Redeploy

---

### Issue 4: Environment variables not loading

**Fix:**
1. Check variable names are exact (case-sensitive): `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
2. Make sure they're applied to the correct environment (Production/Preview/Development)
3. **Redeploy** after adding variables (Vercel doesn't auto-load new env vars)

---

### Issue 5: "Supabase not configured" in logs

**Fix:** Variables are missing or empty.
1. Check Vercel environment variables exist
2. Make sure they're not empty strings
3. Redeploy after adding

---

## ✅ Step 7: Quick Verification Test

1. **Check environment variables in Vercel** ✅
2. **Check tables exist in Supabase** ✅
3. **Redeploy Vercel** ✅
4. **Send OTP from restaurant dashboard** ✅
5. **Check Vercel function logs** ✅
6. **Check `restaurant_auth` table in Supabase** - Should see new row ✅

---

## 🔍 Debugging Commands

### Check if OTP was saved

Go to Supabase Dashboard → Table Editor → `restaurant_auth`

You should see rows with:
- `phone`: The phone number you tested
- `otp_code`: The OTP that was generated
- `otp_expires_at`: When it expires
- `updated_at`: When it was created/updated

---

## 📞 Still Having Issues?

1. **Check Vercel Logs** - Most detailed error info
2. **Check Supabase Logs** - Go to Supabase Dashboard → Logs
3. **Verify API key permissions** - Make sure it's service_role key
4. **Test with PowerShell script** - Direct API test (Option B above)

---

## ✅ Success Criteria

You know Supabase is working when:

- ✅ Environment variables are set in Vercel
- ✅ Tables exist in Supabase
- ✅ Vercel logs show "OTP saved to Supabase successfully"
- ✅ You can see rows in `restaurant_auth` table after sending OTP
- ✅ `debug.hasSupabase: true` in API response
- ✅ OTP verification works (OTP found in database)

---

**Next Step:** Once Supabase is verified, test the complete OTP flow:
1. Send OTP → Should save to `restaurant_auth` table
2. Verify OTP → Should find OTP in database and create restaurant + session

