# Fix Current Notification Error

## 🔍 Error Analysis

From your error response:

### ✅ What's Working:
- ✅ Restaurant has phone number set
- ✅ Restaurant has WhatsApp phone set
- ✅ Termii API key is configured (`hasTermii: true`)
- ✅ WhatsApp API is configured (`hasWhatsApp: true`)

### ❌ What's Failing:

1. **SMS Failed**: "SMS service not configured"
   - Even though Termii API key exists, SMS sending failed
   - Could be: Invalid API key, wrong phone format, or Termii API issue

2. **WhatsApp Failed**: "Recipient phone number not in allowed list"
   - Need to add phone number to Meta's allowed recipient list

---

## 🚀 Quick Fix: Use WhatsApp (Easiest)

Since WhatsApp is already configured, just add the phone number to allowed list:

### Step 1: Add Phone to Meta Allowed List

1. Go to https://developers.facebook.com
2. Select your app → **WhatsApp** → **API Setup** (or **Getting Started**)
3. Find **"To" field** or **"Manage phone number list"** or **"Recipient phone numbers"**
4. Add: `+2348060800971`
5. Wait 1-2 minutes

### Step 2: Update Restaurant Preference to WhatsApp

Run in Supabase SQL Editor:

```sql
UPDATE restaurants 
SET notification_preference = 'whatsapp'
WHERE id = 'c18cc33b-cd8c-4049-8a28-9412b29c851c';
```

### Step 3: Test Again

```powershell
$restaurantId = "c18cc33b-cd8c-4049-8a28-9412b29c851c"
$orderId = "03772f87-7318-4358-9af1-9935f221dfe8"
$body = @{ restaurantId = $restaurantId; orderId = $orderId } | ConvertTo-Json
Invoke-RestMethod -Uri "https://movescrow.vercel.app/api/notifications/send-order" -Method POST -Body $body -ContentType "application/json"
```

**Should work!** ✅

---

## 🔧 Alternative: Fix Termii SMS

If you want to use SMS instead:

### Step 1: Verify Termii API Key

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Check `TERMII_API_KEY` is set correctly
3. Verify in Termii Dashboard that the API key is active

### Step 2: Check Phone Number Format

Make sure restaurant phone is in correct format:
- ✅ Correct: `+2348060800971`
- ❌ Wrong: `2348060800971` (missing +)
- ❌ Wrong: `08060800971` (missing country code)
- ❌ Wrong: `+234 806 080 0971` (spaces)

Run in Supabase to check:

```sql
SELECT id, phone, whatsapp_phone 
FROM restaurants 
WHERE id = 'c18cc33b-cd8c-4049-8a28-9412b29c851c';
```

### Step 3: Test Termii API Directly

Check if Termii API key works:

```powershell
$termiiApiKey = "YOUR_TERMII_API_KEY"  # Get from Vercel env vars
$testBody = @{
    to = "+2348060800971"
    from = "Movescrow"
    sms = "Test message from Movescrow"
    type = "plain"
    channel = "generic"
    api_key = $termiiApiKey
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.ng.termii.com/api/sms/send" -Method POST -Body $testBody -ContentType "application/json"
```

If this fails, your Termii API key might be invalid or expired.

---

## 🎯 Recommended Solution

**Use WhatsApp for now** (fastest):
1. Add `+2348060800971` to Meta allowed list (5 minutes)
2. Change restaurant preference to `'whatsapp'`
3. Test - should work immediately

**Then fix SMS later** for production:
- Verify Termii API key
- Test SMS sending directly
- Add SMS as backup method

---

## 📋 Action Checklist

**For WhatsApp (Recommended):**
- [ ] Add `+2348060800971` to Meta's allowed recipient list
- [ ] Update restaurant: `UPDATE restaurants SET notification_preference = 'whatsapp' WHERE id = 'c18cc33b-cd8c-4049-8a28-9412b29c851c';`
- [ ] Test notification API again
- [ ] Should receive WhatsApp message ✅

**For SMS (Alternative):**
- [ ] Verify Termii API key in Vercel matches Termii dashboard
- [ ] Check restaurant phone format: `+2348060800971` (with + and country code)
- [ ] Test Termii API directly
- [ ] Check Termii dashboard for delivery reports/errors
- [ ] Fix any API key or phone format issues
- [ ] Test notification API again

---

**Next Step:** Add `+2348060800971` to Meta's allowed list and change preference to WhatsApp - should work in 5 minutes! 🚀

