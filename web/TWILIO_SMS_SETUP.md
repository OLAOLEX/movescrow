# Twilio SMS Setup Guide for Movescrow

## 🎯 Quick Answer

**Do you need to buy a phone number?** 
- **For Nigeria (+234):** You can use Twilio's trial phone number initially (free)
- **For production:** You may need to buy a Nigerian phone number depending on Twilio's support

---

## 📋 Setup Steps

### Step 1: Create Twilio Account

1. Go to https://www.twilio.com
2. Click **"Sign up"** (free trial available)
3. Fill in your details
4. Verify your email and phone number
5. Complete account setup

**Free Trial Includes:**
- $15.50 free credit
- Trial phone number (may not support all countries)
- Limited to verified phone numbers initially

---

### Step 2: Get Trial Phone Number (Free)

**Option A: Use Trial Number (Easiest)**

1. Go to **Twilio Console** → **Phone Numbers** → **Manage** → **Buy a number**
2. Click **"Get Started"** or **"Buy a number"**
3. **Search for a number:**
   - **Country**: Choose a country Twilio supports well (US, UK, etc.)
   - **Capabilities**: Check **"SMS"**
   - Click **"Search"**
4. Select a number and click **"Buy"**
5. **Note**: Trial numbers may have restrictions

**Note**: Trial numbers might not support Nigeria (+234) directly. You can still send SMS to Nigerian numbers from any Twilio number, but delivery may vary.

---

### Step 3: Verify Test Phone Number

Since you're on trial, you need to verify your test number:

1. Go to **Twilio Console** → **Phone Numbers** → **Verified Caller IDs**
2. Click **"Add a new Caller ID"**
3. Enter your test number: `+2348060800971`
4. Click **"Call me"** or **"Text me"** to verify
5. Enter the verification code

**Important**: You can only send SMS to verified numbers during trial.

---

### Step 4: Get API Credentials

1. Go to **Twilio Console** → **Account** (top right)
2. Find **"Account Info"** section
3. Copy:
   - **Account SID**: `ACxxxxx...` → This is `TWILIO_ACCOUNT_SID`
   - **Auth Token**: Click **"View"** and copy → This is `TWILIO_AUTH_TOKEN`
   - **Phone Number**: From Step 2 → This is `TWILIO_PHONE_NUMBER`

---

### Step 5: Configure in Vercel

1. Go to **Vercel Dashboard** → Your project → **Settings** → **Environment Variables**
2. Add these variables:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**Important:**
- `TWILIO_PHONE_NUMBER` should be the phone number you bought in Step 2 (with country code, e.g., `+1234567890`)
- Make sure to select **Production**, **Preview**, and **Development** environments
3. Click **"Save"**
4. **Redeploy** your project

---

## 🧪 Test SMS Sending

### Test via PowerShell

```powershell
# Test sending SMS to your verified number
$body = @{
    restaurantId = "c18cc33b-cd8c-4049-8a28-9412b29c851c"
    orderId = "03772f87-7318-4358-9af1-9935f221dfe8"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://movescrow.vercel.app/api/notifications/send-order" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Make sure:**
1. Restaurant has phone number set: `+2348060800971`
2. Restaurant's `notification_preference` is `'sms'`
3. Phone number is verified in Twilio (during trial)

---

## 🇳🇬 Nigeria-Specific Considerations

### Can You Buy a Nigerian Phone Number?

**Current Status:**
- Twilio **does support** sending SMS to Nigerian numbers
- **Buying Nigerian phone numbers** may be limited or require special approval
- Check Twilio's **Phone Number Marketplace** for availability

### Alternative: Use International Number

**You can:**
- Buy a US/UK phone number from Twilio
- Send SMS to Nigerian numbers from that number
- Messages will show the international number as sender

**Cost:** ~$1-2/month for the number + SMS charges

---

## 💰 Pricing

### Trial Period (Free)
- $15.50 free credit
- Can send SMS to verified numbers only
- Limited functionality

### After Trial (Pay-as-you-go)

**SMS to Nigeria (+234):**
- ~$0.05 - $0.10 per SMS (varies by carrier)
- Check current rates: https://www.twilio.com/pricing

**Phone Number Cost:**
- US number: ~$1/month
- UK number: ~$1.50/month
- Nigerian number: Check availability

---

## 🔧 Update Restaurant Phone in Supabase

After setting up Twilio, make sure your restaurant has the correct phone:

```sql
-- Update restaurant with test phone number
UPDATE restaurants 
SET phone = '+2348060800971',
    notification_preference = 'sms'
WHERE id = 'c18cc33b-cd8c-4049-8a28-9412b29c851c';
```

---

## ✅ Setup Checklist

- [ ] Create Twilio account
- [ ] Buy/get a Twilio phone number
- [ ] Verify test number: `+2348060800971`
- [ ] Copy Account SID and Auth Token
- [ ] Add environment variables to Vercel
- [ ] Redeploy Vercel project
- [ ] Update restaurant phone in Supabase
- [ ] Test SMS sending

---

## 🆚 Twilio vs Termii (Nigerian SMS Provider)

### Termii (Recommended for Nigeria)

**Advantages:**
- ✅ Nigerian company (better delivery to Nigeria)
- ✅ Lower cost for Nigerian numbers
- ✅ Better support for Nigerian networks
- ✅ Can get Nigerian sender ID

**Setup:**
- Sign up: https://termii.com
- Get API key
- Add `TERMII_API_KEY` to Vercel

### Twilio

**Advantages:**
- ✅ International support
- ✅ More features (voice, video, etc.)
- ✅ Well-documented

**Disadvantages:**
- ⚠️ Higher cost for Nigeria
- ⚠️ May not support Nigerian phone numbers directly

---

## 🎯 Recommendation

**For Nigeria, I recommend Termii:**
1. Better for Nigerian market
2. Lower cost
3. Nigerian sender ID support
4. Better delivery rates

**If you still want Twilio:**
1. Use trial to test
2. Buy international number (US/UK)
3. Can send to Nigeria from international number

---

**Your test number:** `+2348060800971` - make sure to verify this in Twilio!

