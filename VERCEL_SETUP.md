# Vercel Deployment Setup for web directory

## Issue: Vercel not deploying from web directory

Since your website files are in `web/` at the root level, you need to configure Vercel to use this as the root directory.

## Solution: Configure Root Directory in Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project (movescrow)
3. Go to **Settings** → **General**
4. Scroll down to **Root Directory**
5. Click **Edit**
6. Set Root Directory to: `web` (or leave empty if web folder is at repository root)
7. Click **Save**
8. Go to **Deployments** tab
9. Click **Redeploy** on the latest deployment

This tells Vercel to treat `web` as the project root, so it will find `index.html`, `vercel.json`, `sitemap.xml`, etc. in that directory.

## Git Commands to Push Changes

```bash
# Navigate to project root
cd c:\MOVESCROW

# Initialize git (if not already done)
git init

# Add remote (replace with your actual GitHub repo URL)
git remote add origin https://github.com/yourusername/your-repo-name.git
# OR if remote already exists:
# git remote set-url origin https://github.com/yourusername/your-repo-name.git

# Check status
git status

# Add all files
git add .

# Commit changes
git commit -m "Update website to www subdomain and fix SEO

- Updated all URLs to www.movescrow.com
- Fixed sitemap.xml 404 error
- Added proper robots.txt
- Enhanced SEO meta tags
- Configured www redirect"

# Push to GitHub (public repo now)
git push -u origin main
# OR if branch is master:
# git push -u origin master
```

## After Pushing to GitHub

1. **Vercel will auto-deploy** if connected to your GitHub repo
2. **Verify Root Directory** is set to `web` (or empty) in Vercel Settings
3. **Check deployment logs** in Vercel dashboard to ensure files are found
4. **Redeploy** if needed after changing root directory setting

## Verify Deployment

After deployment, check:
- ✅ https://www.movescrow.com/ (should work)
- ✅ https://www.movescrow.com/sitemap.xml (should work, not 404)
- ✅ https://www.movescrow.com/robots.txt (should work)
- ✅ https://movescrow.com/ (should redirect to www)

