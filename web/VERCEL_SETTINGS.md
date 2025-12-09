# Vercel Deployment Settings Guide

## Recommended Project Settings

For your static HTML website, use these settings in Vercel:

### Framework Preset
- **Setting:** `Other`
- Vercel will auto-detect this is a static site

### Build Command
- **Setting:** Leave **EMPTY** (no build needed for static HTML)
- Or set to: `echo "No build required for static site"`

### Output Directory
- **Setting:** `.` (current directory/root)
- This tells Vercel the files are in the root of the `web/` folder

### Install Command
- **Setting:** Leave **EMPTY** (no dependencies to install)

### Root Directory
- **Setting:** `web`
- This is the most important setting - tells Vercel where your website files are located

### Node.js Version
- **Setting:** `24.x` (or latest LTS)
- Not critical for static sites, but good to have a recent version

## Current Configuration

Your `vercel.json` already contains:
- ✅ Security headers (HSTS, X-Frame-Options, etc.)
- ✅ Content-Type headers for sitemap.xml and robots.txt
- ✅ Redirect from `movescrow.com` to `www.movescrow.com`
- ✅ Caching headers for static assets

## Setting Up in Vercel Dashboard

1. Go to your project: https://vercel.com/dashboard
2. Click **Settings** → **General**
3. Scroll to **Build and Development Settings**
4. Configure:

```
Framework Preset: Other
Root Directory: web
Build Command: (leave empty)
Output Directory: .
Install Command: (leave empty)
Node.js Version: 24.x
```

5. Click **Save**

## Resolving Production Overrides Conflict

If you see "Configuration Settings in the current Production deployment differ from your current Project Settings":

1. **Option A: Update Project Settings** (Recommended)
   - Update Project Settings to match what's shown above
   - This will apply to all future deployments

2. **Option B: Keep Production Overrides**
   - If your production deployment is working, you can keep the overrides
   - But Project Settings are better for consistency

3. **Option C: Clear Overrides**
   - Go to the Production deployment
   - Clear any overrides to use Project Settings

## Verification

After updating settings:

1. Make a small change to `web/index.html` (add a comment)
2. Commit and push to GitHub
3. Vercel should auto-deploy
4. Check the deployment logs to ensure:
   - Root directory is correctly detected as `web/`
   - No build errors
   - All files are deployed correctly

## Troubleshooting

### "Build Failed" Errors
- Check that Root Directory is set to `web`
- Ensure `index.html` exists in the `web/` folder
- Check deployment logs for specific errors

### Files Not Deploying
- Verify Root Directory is `web`
- Check that files exist in the `web/` folder
- Ensure `.gitignore` isn't excluding necessary files

### Redirect Not Working
- Check `vercel.json` redirect rules
- Verify domain configuration in Vercel
- DNS settings must point to Vercel

## Static Site Benefits

Since this is a static site:
- ✅ No build time needed
- ✅ Instant deployments
- ✅ Edge CDN caching
- ✅ No serverless function costs
- ✅ Very fast page loads

Your `vercel.json` handles all the necessary configurations automatically!

