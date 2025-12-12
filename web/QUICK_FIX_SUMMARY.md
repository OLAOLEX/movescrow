# Quick Fix Summary - Supabase Tables & Termii SMS

## ✅ Step 1: Recreate All Supabase Tables

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **"New query"**
3. Copy and paste the entire contents of `web/RECREATE_ALL_TABLES.sql`
4. Click **"Run"** (or Ctrl+Enter)
5. You should see: "Success. No rows returned" and a table showing all columns

**This will:**
- ✅ Delete all existing tables (clean slate)
- ✅ Create all tables with correct structure
- ✅ Add all necessary indexes
- ✅ Show verification of created tables

---

## ✅ Step 2: Check Termii SMS Issue

The response shows `smsSent: false` which means SMS isn't being sent. After redeploy, check:

### Check Vercel Logs

1. Go to **Vercel Dashboard** → Your Project
2. Go to **Functions** → **View Function Logs**
3. Send OTP again from restaurant dashboard
4. Look for these logs:

**Good signs:**
- ✅ `SMS sent successfully via Termii`
- ✅ `Termii SMS sent successfully: {...}`

**Bad signs:**
- ❌ `Termii SMS error:`
- ❌ `Termii API error:`
- ❌ Check the `debug.smsError` in the API response

### Common Termii Issues

1. **Invalid API Key**
   - Check `TERMII_API_KEY` in Vercel environment variables
   - Verify key in Termii dashboard

2. **Sender ID Not Approved**
   - "Movescrow" sender ID needs to be approved by Termii
   - Go to Termii Dashboard → Sender ID → Request approval
   - OR use a default sender ID like "Talert" or "SecureOTP" (if approved)

3. **Insufficient Balance**
   - Check Termii account balance
   - Fund account if needed

4. **Wrong Phone Format**
   - Should be: `+2348060800971` (with country code)
   - Not: `08060800971` or `2348060800971`

---

## ✅ Step 3: Verify Setup

After recreating tables:

1. **Test Supabase:**
   - Go to Supabase → Table Editor
   - You should see all 5 tables: `restaurant_auth`, `restaurants`, `restaurant_sessions`, `orders`, `chat_messages`

2. **Test OTP Flow:**
   - Send OTP from restaurant dashboard
   - Check `restaurant_auth` table in Supabase
   - Should see new row with phone number and OTP

3. **Check API Response Debug Info:**
   ```json
   {
     "debug": {
       "otpSaved": true/false,
       "smsSent": true/false,
       "hasSupabase": true/false,
       "hasTermii": true/false,
       "termiiKeyLength": 0 or actual length,
       "smsError": {...}  // If SMS failed
     }
   }
   ```

---

## 🔍 Debugging Termii SMS

### Check the API Response

After sending OTP, check the `debug` object in the response:

- `smsSent: false` → SMS wasn't sent
- `smsError` → Will show the error message if SMS failed
- `termiiKeyLength: 0` → API key not set
- `termiiKeyLength: > 0` → API key is set (check if it's correct)

### Check Vercel Logs for Detailed Errors

Look for:
- `Termii response status: 200` → Good
- `Termii response status: 400/401/403` → API key or request issue
- `Termii API error:` → Will show specific error message

### Test Termii API Directly

You can test Termii API directly using PowerShell:

```powershell
$termiiApiKey = "YOUR_TERMII_API_KEY"

$body = @{
    to = "+2348060800971"
    from = "Movescrow"
    sms = "Test message"
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
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}
```

---

## ✅ Success Checklist

After fixes:

- [ ] All Supabase tables recreated
- [ ] OTP saves to `restaurant_auth` table
- [ ] `debug.otpSaved: true` in API response
- [ ] `debug.smsSent: true` in API response (if Termii working)
- [ ] SMS received on phone (if Termii working)
- [ ] OTP verification works

---

## 📝 Next Steps

1. **Recreate tables** using `web/RECREATE_ALL_TABLES.sql`
2. **Redeploy Vercel** (if needed)
3. **Test OTP flow** - Send OTP
4. **Check Supabase** - Verify OTP saved to `restaurant_auth` table
5. **Check Vercel logs** - See detailed Termii error if SMS fails
6. **Check API response** - Look at `debug.smsError` for SMS issues

The improved error logging will now show exactly why Termii SMS is failing!

