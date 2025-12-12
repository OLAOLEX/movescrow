# Vercel Environment Variables Setup

## ⚠️ Required for Webhook to Work

The webhook is now fixed to handle missing environment variables gracefully, but you **must** set these for full functionality:

---

## 🔧 How to Set Environment Variables in Vercel

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your project: **movescrow**
3. Go to **Settings** → **Environment Variables**
4. Add each variable (see list below)
5. Select environment: **Production**, **Preview**, and **Development**
6. Click **Save**
7. **Redeploy** your project (or wait for auto-deploy)

---

## 📋 Required Environment Variables

### 1. Supabase (Required for database operations)

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to get:**
1. Go to https://supabase.com
2. Select your project
3. Settings → API
4. Copy **Project URL** → `SUPABASE_URL`
5. Copy **service_role key** (secret!) → `SUPABASE_SERVICE_ROLE_KEY`

---

### 2. WhatsApp Business API (Required for WhatsApp webhook)

```env
WHATSAPP_ACCESS_TOKEN=EAAxxxxx...
WHATSAPP_PHONE_NUMBER_ID=1234567890
WHATSAPP_VERIFY_TOKEN=movescrow00secret
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789
```

**How to get:**
1. Go to https://developers.facebook.com
2. Select your app
3. WhatsApp → Configuration
4. Copy values from Configuration page

**Note:** `WHATSAPP_VERIFY_TOKEN` is already set to `movescrow00secret` (default), but you should set it explicitly.

---

### 3. SMS Provider (Choose one or both)

#### Option A: Termii (Nigerian SMS)

```env
TERMII_API_KEY=your_termii_api_key
```

#### Option B: Twilio

```env
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

### 4. App Configuration (Optional)

```env
APP_URL=https://movescrow.vercel.app
```

---

## ✅ Testing After Setup

### Test Webhook Verification (GET)

```bash
curl "https://movescrow.vercel.app/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=movescrow00secret&hub.challenge=test123"
```

**Expected Response:** `test123` (200 status)

---

### Test Without Supabase (Should Work)

The webhook now works even without Supabase configured:
- ✅ GET request (verification) - Works
- ⚠️ POST request (messages) - Works but logs warning, doesn't save to DB

**To fully enable message saving, set Supabase variables.**

---

## 🔍 Check Function Logs

1. Go to Vercel Dashboard → Your Project
2. Click **Functions** tab
3. Click on `/api/whatsapp/webhook`
4. View **Logs** tab to see:
   - Webhook verification attempts
   - Incoming messages
   - Any errors

---

## 🐛 Troubleshooting

### Issue: Webhook still returns 500

**Check:**
1. Environment variables are set in Vercel Dashboard
2. Variables are set for **Production** environment
3. Project has been redeployed after adding variables
4. Check function logs for specific error messages

### Issue: "Supabase client not available" in logs

**Solution:** Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables.

### Issue: Messages not being saved

**Solution:** 
1. Ensure Supabase variables are set
2. Ensure Supabase database tables exist (run SQL from `SETUP_GUIDE.md`)
3. Check function logs for database errors

---

## 📝 Quick Setup Checklist

- [ ] Set `SUPABASE_URL` in Vercel
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` in Vercel
- [ ] Set `WHATSAPP_ACCESS_TOKEN` in Vercel
- [ ] Set `WHATSAPP_PHONE_NUMBER_ID` in Vercel
- [ ] Set `WHATSAPP_VERIFY_TOKEN` in Vercel (optional, defaults to `movescrow00secret`)
- [ ] Set SMS provider variables (Termii or Twilio)
- [ ] Redeploy project
- [ ] Test webhook verification
- [ ] Check function logs

---

**Status**: Webhook fixed to handle missing env vars gracefully  
**Next Step**: Set environment variables in Vercel Dashboard!

