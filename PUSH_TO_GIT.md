# Git Commands - Push to Public Repository

## Quick Commands to Run:

```powershell
# Navigate to project
cd c:\MOVESCROW

# Check if git is initialized
git status

# If not initialized, run:
git init

# Add remote repository (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/your-repo-name.git

# Check what files will be committed
git status

# Add all changes
git add .

# Commit with message
git commit -m "Update website to www subdomain and fix SEO - Updated all URLs to www.movescrow.com - Fixed sitemap.xml 404 error - Added proper robots.txt - Configured www redirect in vercel.json - Enhanced SEO meta tags and structured data"

# Push to GitHub (public repo - no authentication needed for read, but push may need token)
git push -u origin main

# If your branch is named 'master' instead:
# git branch -M main
# git push -u origin main
```

## Important: Vercel Configuration

**Configure Vercel to use `web` as the root directory:**

1. Go to https://vercel.com/dashboard
2. Click on your project
3. Go to **Settings** → **General**
4. Find **Root Directory** section
5. Click **Edit**
6. Enter: `web` (or leave empty if web folder is at repository root)
7. Click **Save**
8. Go to **Deployments** tab
9. Click the **3 dots** (⋯) on latest deployment → **Redeploy**

This tells Vercel to treat `web` as the project root, so it will find:
- `index.html`
- `vercel.json`
- `sitemap.xml`
- `robots.txt`
- All other files in `web/`

## After Pushing:

1. Vercel will auto-deploy if connected to GitHub
2. Verify Root Directory is set to `web` (or empty if web is at root)
3. Check deployment logs in Vercel
4. Test: https://www.movescrow.com/sitemap.xml (should work, not 404)

