# OTP Troubleshooting Guide

## 🔍 Current Issues

1. **404 error on verify-otp** - Fixed by using `maybeSingle()` instead of `single()`
2. **No SMS received** - Need to check Termii configuration and logs
3. **OTP not saved to Supabase** - Need to verify Supabase setup

---

## ✅ Step 1: Check Vercel Environment Variables

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Verify these are set (case-sensitive):

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (very long string)
TERMII_API_KEY=TLxxxxxxxxxxxxx
```

**Important:**
- `SUPABASE_SERVICE_ROLE_KEY` should be the **service_role** key (not anon key)
- Get it from: Supabase Dashboard → Settings → API → Service Role Key
- Apply to: Production, Preview, Development

After adding/updating variables:
1. Click "Save"
2. Go to Deployments tab
3. Click "..." on latest deployment
4. Click "Redeploy"

---

## ✅ Step 2: Check Supabase Tables

1. Go to your Supabase Dashboard
2. Go to **Table Editor**
3. You should see these tables:
   - `restaurant_auth`
   - `restaurants`
   - `restaurant_sessions`
   - `orders`
   - `chat_messages`

**If tables don't exist:**
1. Go to **SQL Editor**
2. Run the SQL from `web/SUPABASE_TERMII_SETUP.md` (section 1, step 3)

---

## ✅ Step 3: Check Vercel Function Logs

After redeploying, test the OTP flow:

1. Go to: **Vercel Dashboard → Your Project → Functions**
2. Click on the latest deployment
3. Click **"View Function Logs"**
4. Try sending OTP again
5. Look for logs like:
   - `OTP saved to Supabase successfully`
   - `SMS sent successfully via Termii`
   - `Termii response status: 200`
   - `Generated OTP for +234...`

**What to check:**
- If you see `Error saving OTP to Supabase` → Supabase credentials wrong
- If you see `Termii SMS failed` → Termii API key wrong or account issue
- If you see `TERMII_API_KEY not configured` → Environment variable not set

---

## ✅ Step 4: Test Termii API Directly

Use PowerShell to test Termii:

```powershell
$termiiApiKey = "YOUR_TERMII_API_KEY_HERE"

$body = @{
    to = "+2348060800971"
    from = "Movescrow"
    sms = "Test message from Movescrow"
    type = "plain"
    channel = "generic"
    api_key = $termiiApiKey
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.ng.termii.com/api/sms/send" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "Success: $($response | ConvertTo-Json)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response)"
}
```

**Possible errors:**
- `Invalid API Key` → Check your Termii API key
- `Insufficient balance` → Fund your Termii account
- `Sender ID not approved` → Request sender ID in Termii dashboard or use default "Talert"

---

## ✅ Step 5: Check Supabase Connection

Test if Supabase is accessible:

1. Go to Supabase Dashboard → SQL Editor
2. Run this query:

```sql
SELECT * FROM restaurant_auth LIMIT 5;
```

3. If this works, Supabase connection is OK
4. If error, check table exists (see Step 2)

---

## ✅ Step 6: Verify OTP in Database

After sending OTP:

1. Go to Supabase Dashboard → Table Editor
2. Click on `restaurant_auth` table
3. Look for your phone number
4. Check if `otp_code` is saved

**If OTP not in database:**
- Check Vercel logs for Supabase errors
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct (service_role, not anon)
- Verify `SUPABASE_URL` is correct

---

## 🐛 Common Issues & Fixes

### Issue: "OTP not found. Please request a new OTP."

**Cause:** OTP wasn't saved to Supabase or expired

**Fix:**
1. Check if OTP exists in `restaurant_auth` table
2. If not, check Vercel logs for Supabase errors
3. Verify Supabase credentials in Vercel

### Issue: No SMS received

**Cause:** Termii API issue

**Check:**
1. Termii account balance
2. Termii API key in Vercel
3. Sender ID approval status
4. Phone number format (should be `+2348060800971`)

**Fix:**
1. Fund Termii account if needed
2. Verify API key in Termii dashboard
3. Request sender ID approval or use default "Talert"
4. Check DND (Do Not Disturb) status on phone number

### Issue: "Supabase query error: PGRST116"

**Cause:** Using `single()` when 0 rows found

**Status:** ✅ **FIXED** - Now using `maybeSingle()`

---

## 📊 Debug Response Info

The API now returns debug info in the response:

```json
{
  "success": true,
  "message": "...",
  "debug": {
    "otpSaved": true/false,
    "smsSent": true/false,
    "hasSupabase": true/false,
    "hasTermii": true/false
  }
}
```

This helps identify what's working and what's not.

---

## 🚀 Quick Test Checklist

After setup, test this flow:

- [ ] Send OTP → Check Vercel logs → Should see "OTP saved to Supabase"
- [ ] Check Supabase `restaurant_auth` table → Should see OTP entry
- [ ] Check phone → Should receive SMS with OTP
- [ ] Enter OTP → Should log in successfully
- [ ] Check Supabase `restaurants` table → Should see restaurant entry
- [ ] Check Supabase `restaurant_sessions` table → Should see session token

---

## 📞 Need Help?

1. **Vercel Logs:** Check function logs for detailed errors
2. **Supabase Logs:** Check Supabase dashboard → Logs
3. **Termii Dashboard:** Check SMS delivery status
4. **Browser Console:** Check browser console for API errors

---

## 🔄 After Fixes

Once everything works:

1. **Remove debug info** from API responses (security)
2. **Remove console.log OTP** (security)
3. **Set up proper error pages** for users
4. **Monitor Termii costs** and Supabase usage

