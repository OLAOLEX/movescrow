# Vercel Root Directory Configuration

## ⚠️ Important: Set Root Directory to `web`

Your Vercel deployment needs to use `web/` as the root directory to properly deploy:
- Static files (`index.html`, `restaurant/`, etc.)
- API routes (`api/**/*.js`)
- Configuration files (`vercel.json`, `package.json`)

---

## 🔧 How to Fix

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your project: **movescrow**
3. Go to **Settings** → **General**
4. Scroll to **Root Directory**
5. Click **Edit**
6. Enter: `web`
7. Click **Save**
8. **Redeploy** the project

---

### Option 2: Via Vercel CLI

If you have the project linked locally:

```bash
cd web
vercel link
# Select your project
# When asked about root directory, specify: web
vercel --prod
```

---

## ✅ Verification

After setting the root directory, your build should show:

```
Root Directory: web
```

And the build should find:
- ✅ `web/index.html`
- ✅ `web/restaurant/index.html`
- ✅ `web/api/**/*.js`
- ✅ `web/vercel.json`
- ✅ `web/package.json`

---

## 📝 Current Configuration

**Expected Structure:**
```
movescrow/
├── .vercelignore (at root - ignores mobile/, backend/, etc.)
├── web/
│   ├── vercel.json ✅
│   ├── package.json ✅
│   ├── index.html ✅
│   ├── restaurant/
│   │   ├── index.html ✅
│   │   ├── app.js ✅
│   │   └── styles.css ✅
│   └── api/
│       ├── auth/
│       ├── notifications/
│       ├── whatsapp/
│       └── orders/
```

**Vercel Settings:**
- **Root Directory**: `web`
- **Build Command**: (none needed - static site)
- **Output Directory**: (none - root is already `web`)
- **Install Command**: `npm install` (if package.json exists)

---

## 🚀 After Setting Root Directory

1. **Redeploy**: Trigger a new deployment
2. **Check Build Logs**: Should show files from `web/` directory
3. **Verify API Routes**: 
   - Test: `https://movescrow.vercel.app/api/whatsapp/webhook`
   - Should return 405 or proper response (not 404)

---

## 🐛 Troubleshooting

### Issue: API routes return 404

**Solution**: Make sure Root Directory is set to `web` and `web/vercel.json` has the functions configuration.

### Issue: Static files not found

**Solution**: Root Directory must be `web` so Vercel serves files from `web/` as root.

### Issue: Build fails to find package.json

**Solution**: Root Directory should be `web` where `package.json` is located.

---

**Action Required**: Set Root Directory to `web` in Vercel Dashboard!

