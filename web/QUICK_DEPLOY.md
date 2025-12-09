# Quick Deployment Steps

## 1. GitHub Setup (5 minutes)

```bash
# Navigate to web directory
cd c:\MOVESCROW\mobile\web

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Add Movescrow coming soon landing page"

# Create repository on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/movescrow-website.git
git branch -M main
git push -u origin main
```

## 2. Vercel Deployment (3 minutes)

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `web` (or leave empty if web folder is at root)
   - **Build Command**: (leave empty)
   - **Output Directory**: `.`
5. Click **"Deploy"**

## 3. Custom Domain (5 minutes)

1. In Vercel project → **Settings** → **Domains**
2. Add your domain: `movescrow.com` and `www.movescrow.com`
3. Follow DNS instructions:
   - **For www**: CNAME → `cname.vercel-dns.com`
   - **For root**: Use A records provided by Vercel

## 4. Update Configuration

### Update API URL in index.html:
```javascript
const API_BASE_URL = 'https://api.movescrow.com'; // Your backend URL
```

### Enable Google Analytics:
Uncomment and add your Measurement ID in `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

### Update Social Links:
Edit social media URLs in `index.html` with your actual accounts.

## 5. Google Search Console (5 minutes)

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property: `https://movescrow.com`
3. Verify ownership (DNS or HTML file)
4. Submit sitemap: `https://movescrow.com/sitemap.xml`
5. Request indexing for homepage

## 6. Backend API Setup

The waitlist endpoint is ready at: `/api/waitlist`

Make sure your backend is deployed and CORS is configured to allow your website domain.

---

**Total Time: ~20 minutes**

Your site will be live and indexed by Google! 🚀

