# Fix WhatsApp Access Token Expiration

## 🐛 Problem

WhatsApp access tokens expire after:
- **Short-lived tokens**: 1 hour ❌
- **Long-lived user tokens**: 60 days ⚠️
- **System user tokens**: Long-lived or permanent ✅

---

## ✅ Solution: Get a Long-Lived or System User Token

### Option 1: Get Long-Lived User Token (60 days) - Easier

1. **Go to Meta Developer Console:**
   - https://developers.facebook.com
   - Select your app

2. **Get User Access Token:**
   - Go to **Tools** → **Graph API Explorer**
   - Select your app in the dropdown
   - In **"User or Page"** dropdown, select your Facebook Page (linked to WhatsApp)
   - Under **"Permissions"**, select:
     - `whatsapp_business_messaging`
     - `whatsapp_business_management`
   - Click **"Generate Access Token"**
   - Copy the token (this is a short-lived token)

3. **Exchange for Long-Lived Token:**

   **Using Graph API Explorer:**
   - In Graph API Explorer, make a GET request to:
     ```
     GET /oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={short-lived-token}
     ```
   - Replace:
     - `{app-id}` = Your App ID (from App Settings)
     - `{app-secret}` = Your App Secret (from App Settings → Basic)
     - `{short-lived-token}` = Token from step 2

   **Or use curl:**
   ```bash
   curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=SHORT_LIVED_TOKEN"
   ```

   **Response:**
   ```json
   {
     "access_token": "LONG_LIVED_TOKEN_HERE",
     "token_type": "bearer",
     "expires_in": 5183944
   }
   ```

4. **Update in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Update `WHATSAPP_ACCESS_TOKEN` with the long-lived token
   - Redeploy project

**This token lasts ~60 days.** You'll need to repeat this process every ~2 months.

---

### Option 2: Get System User Token (Recommended - Permanent/Long-Lived)

This requires Business Manager setup but gives you a permanent token.

1. **Set Up Business Manager:**
   - Go to https://business.facebook.com
   - Create a Business Manager (if you don't have one)
   - Add your WhatsApp Business Account to Business Manager

2. **Create System User:**
   - In Business Manager → **Business Settings** → **Users** → **System Users**
   - Click **"Add"** → **"Create New System User"**
   - Name: `WhatsApp API User`
   - Click **"Create System User"**

3. **Assign Assets:**
   - Click on the system user you created
   - Click **"Assign Assets"**
   - Select **"WhatsApp Accounts"**
   - Select your WhatsApp Business Account
   - Assign **"Full Control"**
   - Click **"Assign Assets"**

4. **Generate Token:**
   - Still on System User page
   - Click **"Generate New Token"**
   - Select your app
   - Select permissions:
     - `whatsapp_business_messaging`
     - `whatsapp_business_management`
   - Click **"Generate Token"**
   - **Copy the token immediately** (you can't see it again!)

5. **Update in Vercel:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Update `WHATSAPP_ACCESS_TOKEN` with the system user token
   - Redeploy project

**This token can be permanent or very long-lived!** ✅

---

## 🔄 Quick Token Refresh Script

If you need to refresh tokens frequently, use this PowerShell script:

```powershell
# Refresh WhatsApp Token Script
# Save as refresh-token.ps1

$APP_ID = "YOUR_APP_ID"
$APP_SECRET = "YOUR_APP_SECRET"
$SHORT_LIVED_TOKEN = "YOUR_SHORT_LIVED_TOKEN"

$url = "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=$APP_ID&client_secret=$APP_SECRET&fb_exchange_token=$SHORT_LIVED_TOKEN"

Write-Host "Exchanging token..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $url -Method GET
    Write-Host "✅ Long-lived token obtained!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Token: $($response.access_token)" -ForegroundColor Cyan
    Write-Host "Expires in: $($response.expires_in) seconds (~$([math]::Round($response.expires_in / 86400)) days)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Update this in Vercel environment variables:" -ForegroundColor Yellow
    Write-Host "WHATSAPP_ACCESS_TOKEN=$($response.access_token)" -ForegroundColor White
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}
```

---

## 🔍 Check Token Expiration

### Check Current Token Expiration:

```powershell
$token = "YOUR_ACCESS_TOKEN"

$url = "https://graph.facebook.com/v18.0/debug_token?input_token=$token&access_token=$token"

$response = Invoke-RestMethod -Uri $url -Method GET

Write-Host "Token Info:" -ForegroundColor Cyan
Write-Host "Expires at: $([DateTimeOffset]FromUnixTimeSeconds($response.data.expires_at).LocalDateTime)" -ForegroundColor Yellow
Write-Host "Is Valid: $($response.data.is_valid)" -ForegroundColor $(if ($response.data.is_valid) { "Green" } else { "Red" })
```

---

## 🚨 Detect Expired Token Errors

Add this to detect expired tokens in your API:

When you see these errors, your token is expired:
- `"error_code": 190` - Invalid OAuth 2.0 Access Token
- `"error_subcode": 463` - Token expired
- `"message": "Invalid OAuth access token"`

---

## ✅ Recommended Approach

**For Production:**
1. ✅ Use **System User Token** (Option 2) - Most reliable
2. ✅ Set calendar reminder to refresh before expiration
3. ✅ Monitor API errors for token expiration
4. ✅ Have a process to update Vercel env vars quickly

**For Development:**
- Use long-lived user token (Option 1) - Easier to set up

---

## 📋 Action Items

1. **Immediate:**
   - [ ] Get long-lived or system user token
   - [ ] Update `WHATSAPP_ACCESS_TOKEN` in Vercel
   - [ ] Redeploy project

2. **Long-term:**
   - [ ] Set up System User (Option 2) for permanent token
   - [ ] Set calendar reminder to refresh token (if using long-lived)
   - [ ] Document token refresh process
   - [ ] Consider token refresh automation (advanced)

---

## 🔧 Update Token in Vercel

1. Go to **Vercel Dashboard** → Your Project
2. **Settings** → **Environment Variables**
3. Find `WHATSAPP_ACCESS_TOKEN`
4. Click **"Edit"** or **"Delete and Add New"**
5. Paste new token
6. Select environments: **Production**, **Preview**, **Development**
7. Click **"Save"**
8. **Redeploy** project (or wait for auto-deploy on next push)

---

**Quick Fix:** Use Option 1 to get a long-lived token now, then set up Option 2 (System User) for permanent solution!

