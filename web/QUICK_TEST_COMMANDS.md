# Quick Test Commands - Copy & Paste

## 🚀 One-Line Commands (Easiest)

### Test Send Order Notification

**PowerShell (Single Line):**
```powershell
$body = @{ restaurantId = "c18cc33b-cd8c-4049-8a28-9412b29c851c"; orderId = "03772f87-7318-4358-9af1-9935f221dfe8" } | ConvertTo-Json; Invoke-RestMethod -Uri "https://movescrow.vercel.app/api/notifications/send-order" -Method POST -Body $body -ContentType "application/json"
```

**Copy this entire line and paste into PowerShell!**

---

## 📝 Multi-Line (Easier to Read)

### Option 1: Use Test Script

1. Navigate to web folder:
   ```powershell
   cd C:\MOVESCROW\web
   ```

2. Run the test script:
   ```powershell
   .\test-notification.ps1
   ```

---

### Option 2: Manual Multi-Line

```powershell
$restaurantId = "c18cc33b-cd8c-4049-8a28-9412b29c851c"
$orderId = "03772f87-7318-4358-9af1-9935f221dfe8"
$body = @{ restaurantId = $restaurantId; orderId = $orderId } | ConvertTo-Json
Invoke-RestMethod -Uri "https://movescrow.vercel.app/api/notifications/send-order" -Method POST -Body $body -ContentType "application/json"
```

**Copy each line one by one and paste into PowerShell.**

---

## ✅ Expected Success Response

```json
{
  "success": true,
  "message": "Notification sent",
  "magicLink": "https://movescrow.com/restaurant/auth?token=xxx&order=yyy",
  "method": "whatsapp"
}
```

---

## ❌ Error Response (with details)

If you see an error, it will now show:
- What failed (SMS/WhatsApp)
- Configuration status (which services are set up)
- Restaurant phone number status
- Detailed error messages

---

## 🔧 Update Restaurant Phone Number

If you need to update the restaurant phone number:

```sql
-- Run in Supabase SQL Editor
UPDATE restaurants 
SET phone = '+2348060800971',
    whatsapp_phone = '+2348060800971',
    notification_preference = 'whatsapp'
WHERE id = 'c18cc33b-cd8c-4049-8a28-9412b29c851c';
```

---

## 📋 Test Checklist

Before testing:
- [ ] Restaurant exists in Supabase
- [ ] Order exists in Supabase
- [ ] Restaurant has phone/whatsapp_phone set
- [ ] WhatsApp phone number added to Meta's allowed list (if using WhatsApp)
- [ ] Environment variables set in Vercel (TERMII_API_KEY or WhatsApp tokens)

---

**Quickest Test:** Just run `.\test-notification.ps1` in the `web` folder!

