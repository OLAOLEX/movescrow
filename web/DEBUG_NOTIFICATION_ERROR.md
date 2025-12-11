# Debug "Failed to send notification" Error

## 🐛 Error Analysis

When you see `{"error": "Failed to send notification"}`, it means the API couldn't send via SMS or WhatsApp.

---

## ✅ Checklist: What's Needed

### 1. Restaurant Has Phone Number? ✅

**Check in Supabase:**
```sql
SELECT id, name, phone, whatsapp_phone, notification_preference 
FROM restaurants 
WHERE id = 'c18cc33b-cd8c-4049-8a28-9412b29c851c';
```

**Required:**
- Restaurant must have `phone` OR `whatsapp_phone` set
- If `notification_preference` is 'sms', `phone` must be set
- If `notification_preference` is 'whatsapp', `whatsapp_phone` must be set

---

### 2. SMS Provider Configured? (if using SMS)

**Check Vercel Environment Variables:**
- ✅ `TERMII_API_KEY` set? (for Termii)
- OR
- ✅ `TWILIO_ACCOUNT_SID` set?
- ✅ `TWILIO_AUTH_TOKEN` set?
- ✅ `TWILIO_PHONE_NUMBER` set?

**If missing:** Go to Vercel Dashboard → Settings → Environment Variables → Add missing variables

---

### 3. WhatsApp API Configured? (if using WhatsApp)

**Check Vercel Environment Variables:**
- ✅ `WHATSAPP_ACCESS_TOKEN` set?
- ✅ `WHATSAPP_PHONE_NUMBER_ID` set?

**If missing:** Add these from Meta Developer Console

---

## 🔍 Step-by-Step Debug

### Step 1: Check Restaurant Data

Run in Supabase SQL Editor:
```sql
SELECT 
  id,
  name,
  phone,
  whatsapp_phone,
  notification_preference,
  CASE 
    WHEN phone IS NULL AND whatsapp_phone IS NULL THEN '❌ No phone numbers'
    WHEN notification_preference = 'sms' AND phone IS NULL THEN '❌ SMS preferred but no phone'
    WHEN notification_preference = 'whatsapp' AND whatsapp_phone IS NULL THEN '❌ WhatsApp preferred but no WhatsApp phone'
    ELSE '✅ OK'
  END as status
FROM restaurants 
WHERE id = 'c18cc33b-cd8c-4049-8a28-9412b29c851c';
```

---

### Step 2: Fix Restaurant Phone Number (if missing)

**Option A: Add phone number:**
```sql
UPDATE restaurants 
SET phone = '+2348000000000'
WHERE id = 'c18cc33b-cd8c-4049-8a28-9412b29c851c';
```

**Option B: Add WhatsApp number:**
```sql
UPDATE restaurants 
SET whatsapp_phone = '+2348000000000',
    notification_preference = 'whatsapp'
WHERE id = 'c18cc33b-cd8c-4049-8a28-9412b29c851c';
```

---

### Step 3: Set Notification Preference

```sql
-- Use WhatsApp if you have WhatsApp API configured
UPDATE restaurants 
SET notification_preference = 'whatsapp'
WHERE id = 'c18cc33b-cd8c-4049-8a28-9412b29c851c';

-- OR use SMS if you have Termii/Twilio configured
UPDATE restaurants 
SET notification_preference = 'sms'
WHERE id = 'c18cc33b-cd8c-4049-8a28-9412b29c851c';
```

---

### Step 4: Configure Environment Variables in Vercel

**If using SMS (Termii):**
```env
TERMII_API_KEY=your_termii_api_key
```

**If using SMS (Twilio):**
```env
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

**If using WhatsApp:**
```env
WHATSAPP_ACCESS_TOKEN=EAAxxxxx...
WHATSAPP_PHONE_NUMBER_ID=1234567890
```

**After adding variables:**
1. Save in Vercel Dashboard
2. **Redeploy** project (or wait for auto-deploy)

---

## 🧪 Test Again

After fixing the issues above, test again:

```powershell
$body = @{
    restaurantId = "c18cc33b-cd8c-4049-8a28-9412b29c851c"
    orderId = "03772f87-7318-4358-9af1-9935f221dfe8"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://movescrow.vercel.app/api/notifications/send-order" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Expected success response:**
```json
{
  "success": true,
  "message": "Notification sent",
  "magicLink": "https://movescrow.com/restaurant/auth?token=xxx&order=yyy",
  "method": "sms"
}
```

---

## 🎯 Quick Fix Summary

**Most likely issues:**

1. **Restaurant has no phone number** → Add phone in Supabase
2. **SMS/WhatsApp providers not configured** → Add env vars in Vercel
3. **Notification preference mismatch** → Update restaurant preference in Supabase

**Fastest fix:** Use WhatsApp if you already have it configured:
```sql
UPDATE restaurants 
SET whatsapp_phone = '+2348000000000',
    notification_preference = 'whatsapp'
WHERE id = 'c18cc33b-cd8c-4049-8a28-9412b29c851c';
```

Then test again!

