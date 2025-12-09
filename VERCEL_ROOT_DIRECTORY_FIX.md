# ⚠️ CRITICAL: Vercel Root Directory Must Be Set

## The Problem

Vercel is currently processing the entire repository instead of just the `web/` folder. This is why you see Android files in the build logs.

## The Solution

**You MUST set the Root Directory in Vercel Dashboard:**

### Step-by-Step Instructions:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: **movescrow**

2. **Navigate to Settings**
   - Click on **Settings** tab
   - Click **General** in the left sidebar

3. **Find Root Directory**
   - Scroll down to **"Build and Development Settings"** section
   - Find **"Root Directory"** field

4. **Set Root Directory**
   - Click **Edit** next to Root Directory
   - Type exactly: `web`
   - **NOT** `./web` or `/web` or `web/` - just `web`
   - Click **Save**

5. **Verify Other Settings**
   While you're there, ensure:
   - Framework Preset: `Other`
   - Build Command: **(Leave EMPTY)**
   - Output Directory: `.` or **(Leave EMPTY)**
   - Install Command: **(Leave EMPTY)**
   - Node.js Version: `24.x` or latest

6. **Redeploy**
   - Go to **Deployments** tab
   - Find the latest deployment
   - Click the three dots (**...**)
   - Click **Redeploy**
   - Or push a new commit to trigger auto-deploy

## What This Does

When Root Directory is set to `web`:
- ✅ Vercel will ONLY look at files in the `web/` folder
- ✅ It will use `web/vercel.json` for configuration
- ✅ It will serve `web/index.html` as the homepage
- ✅ Android/mobile files will be completely ignored
- ✅ Build will be faster and cleaner

## Verification

After setting Root Directory and redeploying, the build logs should show:
- ✅ No mention of Android files
- ✅ Files from `web/` folder only
- ✅ Successful deployment
- ✅ Website loads at https://www.movescrow.com/

## Current Status

- ❌ Root Directory: **NOT SET** (or set incorrectly)
- ✅ `web/vercel.json`: Exists and configured
- ✅ `web/index.html`: Exists
- ✅ `.vercelignore`: Updated to ignore mobile files

## Why This Matters

Without Root Directory set to `web`:
- Vercel processes the entire repository
- It tries to find `index.html` in the root (doesn't exist there)
- It sees Android files (which it ignores, but still processes)
- Build takes longer
- Deployment may fail or show 404

With Root Directory set to `web`:
- Vercel ONLY processes the `web/` folder
- Clean, fast builds
- Proper deployment
- Website works correctly

## Troubleshooting

### "Root Directory field doesn't exist"
- You might be on the wrong project
- Make sure you're in **Settings → General**
- Scroll down to find it

### "Build still shows Android files"
- Clear browser cache
- Wait for deployment to fully complete
- Check that Root Directory shows exactly `web` (no quotes, no slashes)

### "Still getting 404"
- After setting Root Directory, **must redeploy**
- Check that `web/index.html` exists
- Verify deployment logs show files from `web/` folder

---

**⚠️ IMPORTANT: This setting MUST be changed in the Vercel Dashboard. It cannot be fixed via code/configuration files alone.**

