# Fix: WhatsApp Phone Number Not in Allowed List

## 🐛 Error

```
WhatsApp API error: Recipient phone number not in allowed list
```

This happens because **Meta WhatsApp Business API** requires you to add phone numbers to an "allowed recipient list" for testing.

---

## ✅ Solution: Add Phone Number to Allowed List

### Step 1: Go to Meta Developer Console

1. Go to https://developers.facebook.com
2. Select your app
3. Go to **WhatsApp** → **API Setup** (or **Getting Started**)

### Step 2: Add Phone Number to Recipient List

**Option A: Via API Setup Page**

1. Scroll to **"To" field** section
2. Find **"Add phone number"** or **"Manage phone number list"**
3. Click **"Add phone number"**
4. Enter the phone number: `+2348000000000` (your restaurant's WhatsApp number)
5. Click **"Add"**
6. Wait a few seconds for it to be verified

**Option B: Via Phone Numbers Page**

1. Go to **WhatsApp** → **Phone Numbers** (left sidebar)
2. Click on your phone number
3. Scroll to **"Recipient phone numbers"** or **"To" numbers**
4. Click **"Add phone number"**
5. Enter: `+2348000000000`
6. Click **"Add"**

**Option C: Via API (if UI not available)**

Use Meta's API to add the number. But the UI method above is easier.

---

## 🔍 How to Find Restaurant's Phone Number

Check in Supabase:

```sql
SELECT id, name, phone, whatsapp_phone 
FROM restaurants 
WHERE id = 'c18cc33b-cd8c-4049-8a28-9412b29c851c';
```

Use the `whatsapp_phone` value (or `phone` if `whatsapp_phone` is null).

---

## ✅ After Adding Phone Number

1. **Wait 1-2 minutes** for Meta to update
2. **Test again** using the PowerShell command:

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

---

## 📋 Complete Fix Checklist

- [ ] Restaurant has `whatsapp_phone` set in Supabase
- [ ] Phone number added to Meta's allowed recipient list
- [ ] Wait 1-2 minutes after adding
- [ ] Test API again
- [ ] Should receive WhatsApp message ✅

---

## 🎯 Alternative: Use SMS Instead

If you don't want to manage WhatsApp recipient lists, you can use SMS:

1. **Set up Termii or Twilio** (see `VERCEL_ENV_VARS_SETUP.md`)
2. **Update restaurant preference** to SMS:
   ```sql
   UPDATE restaurants 
   SET notification_preference = 'sms'
   WHERE id = 'c18cc33b-cd8c-4049-8a28-9412b29c851c';
   ```
3. **Test again** - will use SMS instead of WhatsApp

---

## ⚠️ Important Notes

### WhatsApp Business API Limitations:

- **Test/Debug Mode**: Only allowed phone numbers can receive messages
- **Production Mode**: After Meta business verification, this restriction is removed
- **For now**: You must add each phone number manually to test

### To Remove This Restriction:

1. Complete **Meta Business Verification**
2. Request **production access** for WhatsApp Business API
3. Once approved, any phone number can receive messages

---

**Action Required:** Add the restaurant's phone number to Meta's allowed recipient list!

