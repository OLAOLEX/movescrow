# Next Steps After Webhook Connection ✅

## 🎉 Congratulations!

Your WhatsApp webhook is now:
- ✅ Connected to Meta
- ✅ Subscribed to `messages` field
- ✅ Verified and working

---

## 📋 Next Steps Checklist

### Step 1: Set Up Supabase Database ⚠️ **CRITICAL**

You need to create the database tables before messages can be saved.

#### 1.1 Create Supabase Project

1. Go to https://supabase.com
2. Click **"New Project"**
3. Fill in:
   - **Name**: `movescrow-restaurant`
   - **Database Password**: (create a strong password, **SAVE IT!**)
   - **Region**: Choose closest to Nigeria (e.g., Europe West)
   - **Pricing Plan**: Free
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup

#### 1.2 Create Database Tables

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste the **entire SQL schema** from `web/SETUP_GUIDE.md` (Step 1.2)
4. Click **"Run"**
5. Verify tables are created:
   - `restaurants`
   - `orders`
   - `chat_messages`
   - `restaurant_auth`
   - `restaurant_sessions`

#### 1.3 Enable Realtime (Optional - Dashboard works without it)

**Note:** Realtime enables instant updates in the dashboard. If not available, the dashboard will use polling (checking for updates every few seconds).

**Option A: Via SQL (Recommended)**

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **"New query"**
3. Run this SQL:

```sql
-- Enable realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Enable realtime for chat_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
```

4. Verify by running:
```sql
-- Check if tables are in realtime publication
SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

You should see `orders` and `chat_messages` in the results.

**Option B: Via Database → Replication (if available)**

Some Supabase projects have this UI:
1. Go to **Database** → **Replication**
2. Enable replication for:
   - ✅ `orders`
   - ✅ `chat_messages`

**Option C: Skip Realtime (Dashboard will use polling)**

- Realtime is **optional** - your dashboard will still work
- Without realtime, the dashboard polls for updates every 3-5 seconds
- You can enable realtime later if needed
- **For now, you can skip this step** if the SQL method doesn't work

#### 1.4 Get API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://jgtvavugofqxlovakswb.supabase.co` → This is your `SUPABASE_URL`
   - **service_role key**: `eyJhbGc...` → This is your `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

**Important:** 
- The **anon/public key** is for client-side (frontend)
- The **service_role key** is for server-side (API routes) - **KEEP THIS SECRET!**
- Use the **service_role key** in your Vercel environment variables

---

### Step 2: Configure Vercel Environment Variables ⚠️ **REQUIRED**

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select project: **movescrow**
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

#### Required Variables:

```env
# Supabase (REQUIRED)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (your service_role key)

# WhatsApp (REQUIRED)
WHATSAPP_ACCESS_TOKEN=EAAxxxxx...
WHATSAPP_PHONE_NUMBER_ID=1234567890
WHATSAPP_VERIFY_TOKEN=movescrow00secret
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789

# SMS Provider (Choose one)
TERMII_API_KEY=xxx (if using Termii)
# OR
TWILIO_ACCOUNT_SID=xxx (if using Twilio)
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1234567890

# App URL (Optional)
APP_URL=https://movescrow.vercel.app
```

5. For each variable:
   - Select environments: **Production**, **Preview**, **Development**
   - Click **Save**

6. **Redeploy** project (or trigger new deployment)

---

### Step 3: Test the Integration 🧪

#### 3.1 Test Webhook Verification

```bash
curl "https://movescrow.vercel.app/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=movescrow00secret&hub.challenge=test123"
```

**Expected:** Returns `test123`

#### 3.2 Send Test Message

1. Send a WhatsApp message to your WhatsApp Business number
2. Check Vercel Function Logs:
   - Vercel Dashboard → Project → Functions → `/api/whatsapp/webhook` → Logs
   - Should see: "Received message from +234..."
3. Check Supabase:
   - Go to Supabase Dashboard → Table Editor → `chat_messages`
   - Should see the message saved

#### 3.3 Test Order Flow

1. **First, create a test restaurant** (if you don't have one):
   ```sql
   INSERT INTO restaurants (name, phone, whatsapp_phone, status)
   VALUES ('Test Restaurant', '+2348000000000', '+2348000000000', 'active')
   RETURNING id;
   ```
   Copy the `id` (UUID) that's returned.

2. **Create a test order** in Supabase:
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
     'PASTE_RESTAURANT_UUID_HERE',
     gen_random_uuid(),
     '#12345',
     '+2348000000000',
     '{"item": "Jollof Rice"}'::jsonb,
     3000.00,
     'pending'
   )
   RETURNING id;
   ```
   
   **Important:**
   - Replace `PASTE_RESTAURANT_UUID_HERE` with the restaurant UUID from step 1
   - Replace `+2348000000000` with a WhatsApp number you can test with
   - Copy the `id` (order UUID) that's returned

3. **Test notification**:
   Use the UUIDs you just created:
   ```bash
   curl -X POST https://movescrow.vercel.app/api/notifications/send-order \
     -H "Content-Type: application/json" \
     -d '{
       "restaurantId": "c18cc33b-cd8c-4049-8a28-9412b29c851c",
       "orderId": "03772f87-7318-4358-9af1-9935f221dfe8"
     }'
   ```

2. Send notification:
   ```bash
   curl -X POST https://movescrow.vercel.app/api/notifications/send-order \
     -H "Content-Type: application/json" \
     -d '{
       "restaurantId": "restaurant-uuid",
       "orderId": "order-uuid"
     }'
   ```

**Important:** Replace `restaurant-uuid` and `order-uuid` with actual UUIDs from your database!

---

### Step 4: Test Restaurant Dashboard 🎨

1. Visit: `https://movescrow.vercel.app/restaurant/index.html`
2. Try login flow (OTP or magic link)
3. Test order viewing
4. Test chat interface

---

## 🔍 Verification Checklist

After completing all steps, verify:

- [ ] Supabase project created
- [ ] Database tables created
- [ ] Realtime enabled for `orders` and `chat_messages`
- [ ] Supabase API keys copied
- [ ] All environment variables set in Vercel
- [ ] Project redeployed after setting env vars
- [ ] Webhook verification test passes
- [ ] Test message received and saved to database
- [ ] Function logs show successful message processing
- [ ] Restaurant dashboard accessible

---

## 📊 Monitor Webhook Activity

### View Incoming Messages

1. **Vercel Logs**: Dashboard → Functions → `/api/whatsapp/webhook` → Logs
2. **Supabase Database**: Table Editor → `chat_messages` table
3. **Meta Developer Console**: WhatsApp → Configuration → Webhook → View webhook logs

### Check for Errors

- ✅ Green checkmarks in Meta webhook logs
- ✅ No errors in Vercel function logs
- ✅ Messages appearing in Supabase database

---

## 🐛 Troubleshooting

### Messages Not Appearing in Database

**Check:**
1. Supabase environment variables set correctly?
2. Database tables created?
3. Function logs show any errors?
4. Message phone number matches order's `customer_whatsapp`?

### "Supabase client not available" in Logs

**Fix:** Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel.

### Messages Received But Not Linked to Orders

**Check:**
- Phone number format matches (should include country code, e.g., `+2348000000000`)
- Order exists with matching `customer_whatsapp`
- Order status is active (`pending`, `paid`, `preparing`)

---

## 🚀 You're Ready!

Once all environment variables are set and Supabase is configured:

1. ✅ Messages will be automatically saved to database
2. ✅ Orders will be linked to messages
3. ✅ Restaurant dashboard will show real-time updates
4. ✅ Full chat functionality will work

---

**Current Status:**
- ✅ Webhook connected to Meta
- ⏳ Next: Set up Supabase database
- ⏳ Next: Configure environment variables
- ⏳ Next: Test full integration

---

**Need Help?** Check:
- `web/SETUP_GUIDE.md` - Complete setup instructions
- `web/VERCEL_ENV_VARS_SETUP.md` - Environment variables guide
- `web/WHATSAPP_WEBHOOK_SETUP.md` - Webhook troubleshooting

