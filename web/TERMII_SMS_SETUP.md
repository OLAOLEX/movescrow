# Termii SMS Setup Guide (Nigerian SMS Provider)

## ✅ Quick Answer

**Do you need to buy a phone number?**
- **NO!** Termii uses **Sender IDs** (text names like "Movescrow") instead of phone numbers
- Much simpler setup than Twilio
- Better for Nigerian market

---

## 🚀 Setup Steps (5 Minutes)

### Step 1: Create Termii Account

1. Go to https://termii.com
2. Click **"Sign Up"** or **"Get Started"**
3. Fill in:
   - Email
   - Phone number
   - Company name
   - Password
4. Verify your email
5. Complete profile setup

---

### Step 2: Get API Key

1. Login to Termii Dashboard
2. Go to **Settings** → **API** (or **API Keys**)
3. You'll see your **API Key** (looks like: `TLxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
4. **Copy this key** - you'll need it for Vercel

**Note:** You may need to generate a new API key if you don't see one.

---

### Step 3: Set Up Sender ID (Optional but Recommended)

**What is a Sender ID?**
- The name that appears as the sender of your SMS
- Example: "Movescrow" or "MovescrowApp"
- Must be approved by Termii (usually takes a few hours to 1 day)

**How to Set Up:**

1. Go to **Sender ID** section in Termii Dashboard
2. Click **"Add Sender ID"** or **"Request Sender ID"**
3. Enter: `Movescrow` (or your preferred name, max 11 characters)
4. Submit for approval
5. Wait for approval (usually 24-48 hours)

**Note:** You can still send SMS during approval using default sender ID.

---

### Step 4: Add to Vercel Environment Variables

1. Go to **Vercel Dashboard** → Your project → **Settings** → **Environment Variables**
2. Add this variable:

```env
TERMII_API_KEY=TLxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

3. Make sure to select:
   - ✅ **Production**
   - ✅ **Preview**  
   - ✅ **Development**

4. Click **"Save"**
5. **Redeploy** your project (or wait for auto-deploy)

---

### Step 5: Update Restaurant in Supabase

Make sure your restaurant has the phone number and preference set:

```sql
-- Update restaurant with test phone number
UPDATE restaurants 
SET phone = '+2348060800971',
    notification_preference = 'sms'
WHERE id = 'c18cc33b-cd8c-4049-8a28-9412b29c851c';
```

---

## 🧪 Test SMS Sending

### Test via PowerShell

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

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Notification sent",
  "magicLink": "https://movescrow.com/restaurant/auth?token=xxx&order=yyy",
  "method": "sms"
}
```

**Check:** Restaurant should receive SMS at `+2348060800971`

---

## 💰 Pricing

### Free Tier
- Usually includes some free credits for testing
- Check Termii dashboard for current free tier limits

### Paid (Pay-as-you-go)
- **Nigeria SMS:** ~₦2-₦5 per SMS (very affordable!)
- Much cheaper than Twilio for Nigerian numbers
- No monthly fees (pay only for what you use)

---

## ✅ Termii vs Twilio for Nigeria

| Feature | Termii | Twilio |
|---------|--------|--------|
| Phone Number Required? | ❌ No (uses Sender ID) | ✅ Yes (~$1/month) |
| Setup Complexity | ⭐⭐ Easy | ⭐⭐⭐⭐ Complex |
| Cost per SMS (Nigeria) | ₦2-₦5 | $0.05-0.10 (₦40-₦80) |
| Nigerian Support | ✅ Excellent | ⚠️ Limited |
| Delivery Rate (Nigeria) | ✅ Very High | ⚠️ Varies |
| Sender ID | ✅ Custom name | ⚠️ Phone number |

**Recommendation: Termii for Nigeria** ✅

---

## 🎯 Option 2: Skip SMS for Now (Test with WhatsApp Only)

If you want to test the system quickly without SMS setup:

### Just Use WhatsApp

1. **Add phone number to Meta allowed list** (see `FIX_WHATSAPP_PHONE_NOT_ALLOWED.md`)
2. **Update restaurant to use WhatsApp:**

```sql
UPDATE restaurants 
SET whatsapp_phone = '+2348060800971',
    notification_preference = 'whatsapp'
WHERE id = 'c18cc33b-cd8c-4049-8a28-9412b29c851c';
```

3. **Test notification** - will use WhatsApp instead of SMS
4. **Add SMS later** when you're ready for production

---

## 📋 Quick Setup Checklist (Termii)

- [ ] Create Termii account
- [ ] Get API key from Termii dashboard
- [ ] (Optional) Request Sender ID approval
- [ ] Add `TERMII_API_KEY` to Vercel environment variables
- [ ] Redeploy Vercel project
- [ ] Update restaurant phone in Supabase: `+2348060800971`
- [ ] Set restaurant `notification_preference` to `'sms'`
- [ ] Test sending notification

---

## 🔧 Troubleshooting

### Error: "SMS service not configured"

**Check:**
- `TERMII_API_KEY` is set in Vercel environment variables?
- Project redeployed after adding env var?
- Check function logs in Vercel for specific error

### SMS Not Received

**Check:**
- Restaurant phone number is correct in Supabase?
- Phone number format is correct: `+2348060800971` (with country code)
- Termii dashboard shows SMS was sent?
- Check Termii logs/delivery reports

### Sender ID Not Approved Yet

**Solution:**
- You can still send SMS
- Will use default sender ID or numeric sender
- Once approved, will use your custom sender ID

---

## 🎯 My Recommendation

**For Quick Testing:**
1. Use **WhatsApp only** for now (already configured)
2. Add phone number to Meta's allowed list
3. Test full flow
4. Add Termii SMS later for production

**For Production:**
1. Set up Termii (better for Nigeria)
2. Request Sender ID approval
3. Use both WhatsApp and SMS for redundancy

---

**Test Phone Number:** `+2348060800971`

**Next Step:** Choose either Termii setup OR test with WhatsApp only first!

