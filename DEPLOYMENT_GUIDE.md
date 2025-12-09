# Movescrow Website Deployment Guide

## Step 1: Deploy to GitHub

### 1.1 Initialize Git Repository (if not already done)

```bash
cd c:\MOVESCROW\mobile\web
git init
git add .
git commit -m "Add coming soon landing page"
```

### 1.2 Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and create a new repository
2. Name it: `movescrow-website` (or your preferred name)
3. **Don't** initialize with README, .gitignore, or license
4. Copy the repository URL (e.g., `https://github.com/yourusername/movescrow-website.git`)

### 1.3 Push to GitHub

```bash
# Add remote repository
git remote add origin https://github.com/yourusername/movescrow-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### 2.1 Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with your GitHub account
3. Click **"Add New Project"**
4. Import your `movescrow-website` repository
5. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `mobile/web` (or just `web` if deploying from web folder)
   - **Build Command**: Leave empty (static site)
   - **Output Directory**: `.` (current directory)
6. Click **"Deploy"**

### 2.2 Configure Custom Domain

1. In Vercel dashboard, go to your project
2. Click **"Settings"** → **"Domains"**
3. Add your domain (e.g., `movescrow.com` or `www.movescrow.com`)
4. Follow Vercel's DNS configuration instructions:
   - Add a CNAME record pointing to `cname.vercel-dns.com`
   - Or add A records as instructed by Vercel

### 2.3 DNS Configuration (Example)

**For your domain registrar (e.g., Namecheap, GoDaddy):**

```
Type: CNAME
Name: www (or @ for root domain)
Value: cname.vercel-dns.com
TTL: 3600
```

**For root domain (movescrow.com):**
- Vercel will provide specific A records to add
- Or use a CNAME flattening service

---

## Step 3: Connect Waitlist Form to Backend API

### 3.1 Update Backend API Endpoint

Create a waitlist endpoint in your backend (Python/FastAPI example):

```python
# backend/app/api/waitlist.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime

router = APIRouter()

class WaitlistRequest(BaseModel):
    name: str
    email: EmailStr

@router.post("/waitlist")
async def add_to_waitlist(request: WaitlistRequest):
    # Save to database
    # Example: await db.waitlist.insert_one({
    #     "name": request.name,
    #     "email": request.email,
    #     "created_at": datetime.now()
    # })
    
    return {"message": "Successfully added to waitlist", "status": "success"}
```

### 3.2 Update Frontend JavaScript

Update the `handleSubmit` function in `index.html`:

```javascript
async function handleSubmit(event) {
  event.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const submitButton = event.target.querySelector('.btn');
  const successMessage = document.getElementById('successMessage');
  
  // Disable button during submission
  submitButton.disabled = true;
  submitButton.textContent = 'Joining...';
  
  try {
    const response = await fetch('https://api.movescrow.com/api/waitlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email })
    });
    
    if (response.ok) {
      successMessage.classList.add('show');
      document.getElementById('waitlistForm').reset();
      
      setTimeout(() => {
        successMessage.classList.remove('show');
      }, 5000);
    } else {
      throw new Error('Failed to join waitlist');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Something went wrong. Please try again later.');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Join Waitlist';
  }
}
```

---

## Step 4: Update Social Media Links

Update the social media links in `index.html`:

```html
<div class="social-links">
  <a href="https://facebook.com/movescrow" class="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">f</a>
  <a href="https://twitter.com/movescrow" class="social-link" aria-label="Twitter" target="_blank" rel="noopener noreferrer">t</a>
  <a href="https://instagram.com/movescrow" class="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">i</a>
  <a href="https://linkedin.com/company/movescrow" class="social-link" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">in</a>
</div>
```

---

## Step 5: Add Google Analytics

### 5.1 Get Google Analytics ID

1. Go to [Google Analytics](https://analytics.google.com)
2. Create a new property for your website
3. Get your Measurement ID (format: `G-XXXXXXXXXX`)

### 5.2 Add to index.html

Add this code in the `<head>` section of `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## Step 6: Submit Sitemap to Google Search Console

### 6.1 Create Google Search Console Account

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property (domain: `movescrow.com`)
3. Verify ownership (DNS record or HTML file upload)

### 6.2 Submit Sitemap

1. In Search Console, go to **"Sitemaps"** in the left menu
2. Enter: `https://movescrow.com/sitemap.xml`
3. Click **"Submit"**

### 6.3 Request Indexing

1. Go to **"URL Inspection"**
2. Enter your homepage URL: `https://movescrow.com/`
3. Click **"Request Indexing"**

---

## Step 7: Additional SEO Optimizations

### 7.1 Update sitemap.xml with current date

```xml
<lastmod>2024-12-19</lastmod>
```

### 7.2 Add structured data (JSON-LD)

Add this to the `<head>` section of `index.html`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Movescrow",
  "url": "https://movescrow.com",
  "logo": "https://movescrow.com/icons/Icon-512.png",
  "description": "Secure, escrow-protected delivery platform for packages, food, and documents",
  "sameAs": [
    "https://facebook.com/movescrow",
    "https://twitter.com/movescrow",
    "https://instagram.com/movescrow",
    "https://linkedin.com/company/movescrow"
  ]
}
</script>
```

---

## Quick Deployment Checklist

- [ ] Push code to GitHub
- [ ] Connect Vercel to GitHub repository
- [ ] Configure custom domain in Vercel
- [ ] Update DNS records at domain registrar
- [ ] Update waitlist API endpoint in JavaScript
- [ ] Update social media links
- [ ] Add Google Analytics code
- [ ] Submit sitemap to Google Search Console
- [ ] Request indexing in Search Console
- [ ] Test waitlist form submission
- [ ] Test on mobile devices
- [ ] Verify SSL certificate (automatic with Vercel)

---

## Troubleshooting

### Domain not connecting?
- Wait 24-48 hours for DNS propagation
- Check DNS records are correct
- Verify domain in Vercel dashboard

### Form not submitting?
- Check browser console for errors
- Verify API endpoint is correct
- Check CORS settings on backend

### Analytics not working?
- Verify Measurement ID is correct
- Check if ad blockers are interfering
- Use Google Tag Assistant to debug

