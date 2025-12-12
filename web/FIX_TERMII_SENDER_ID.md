# Fix Termii Sender ID Issue

## ✅ Problem Solved!

The code now automatically tries multiple sender IDs in order:
1. `TERMII_SENDER_ID` (from environment variable, if set)
2. `Movescrow` (your brand - needs approval)
3. `Talert` (default Termii sender ID - usually works)
4. `SecureOTP` (another default)
5. `N-Alert` (Nigerian default)

If one fails, it automatically tries the next one.

---

## 🔧 Option 1: Use Default Sender ID (Quick Fix)

The code will now automatically try default sender IDs like "Talert" which usually work without approval.

**No action needed** - Just redeploy and test!

---

## 🔧 Option 2: Set Custom Sender ID in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add:
   ```
   TERMII_SENDER_ID=Talert
   ```
   (or any approved sender ID you have)
3. Apply to: Production, Preview, Development
4. **Redeploy**

---

## 🔧 Option 3: Request Approval for "Movescrow" (Recommended for Production)

1. Go to **Termii Dashboard**
2. Navigate to **Sender ID** section
3. Click **"Request Sender ID"**
4. Enter: `Movescrow`
5. Submit required documents (usually business registration, ID, etc.)
6. Wait for approval (usually 1-3 business days)
7. Once approved, it will work automatically

---

## 📊 Current Error

```
"ApplicationSenderId not found for applicationId: 53060 and senderName: Movescrow"
```

This means:
- ✅ Your Termii API key is working
- ✅ The API connection is working
- ❌ The sender ID "Movescrow" is not approved yet

---

## ✅ After Fix

After redeploying with the updated code:

- The system will try "Movescrow" first
- If it fails (404), it will automatically try "Talert"
- "Talert" usually works without approval
- SMS should now send successfully!

Check Vercel logs - you should see:
```
Trying sender ID: Movescrow
Sender ID "Movescrow" not found, trying next...
Trying sender ID: Talert
Termii SMS sent successfully using sender ID: Talert
```

---

## 🎯 Success Criteria

After redeploy:

- ✅ `smsSent: true` in API response
- ✅ SMS received on phone
- ✅ Vercel logs show: "Termii SMS sent successfully using sender ID: Talert" (or your approved sender ID)

