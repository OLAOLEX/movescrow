# Movescrow Website Setup Checklist

## Pre-Deployment

- [ ] Update `API_BASE_URL` in `index.html` with your backend URL
- [ ] Get Google Analytics Measurement ID
- [ ] Update social media links in `index.html`
- [ ] Update contact email in structured data (JSON-LD)
- [ ] Test waitlist form locally

## GitHub Setup

- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Verify all files are committed

## Vercel Deployment

- [ ] Sign up/Login to Vercel
- [ ] Connect GitHub repository
- [ ] Configure build settings (Root: `mobile/web`)
- [ ] Deploy to Vercel
- [ ] Verify site is live on Vercel domain

## Domain Configuration

- [ ] Add domain in Vercel dashboard
- [ ] Update DNS records at domain registrar
- [ ] Wait for DNS propagation (24-48 hours)
- [ ] Verify SSL certificate (automatic with Vercel)
- [ ] Test both `movescrow.com` and `www.movescrow.com`

## Backend API

- [ ] Deploy backend API
- [ ] Test waitlist endpoint: `POST /api/waitlist`
- [ ] Configure CORS to allow your website domain
- [ ] Test form submission from website

## SEO & Analytics

- [ ] Add Google Analytics Measurement ID
- [ ] Create Google Search Console account
- [ ] Verify domain ownership
- [ ] Submit sitemap: `https://movescrow.com/sitemap.xml`
- [ ] Request indexing for homepage
- [ ] Test structured data with Google Rich Results Test

## Testing

- [ ] Test on desktop browsers
- [ ] Test on mobile devices
- [ ] Test waitlist form submission
- [ ] Test social media links
- [ ] Verify all images load correctly
- [ ] Check page speed (Google PageSpeed Insights)

## Post-Launch

- [ ] Monitor Google Analytics
- [ ] Check Search Console for indexing status
- [ ] Monitor waitlist signups
- [ ] Set up email notifications for new signups
- [ ] Share on social media

---

## Quick Commands

### Test locally:
```bash
cd mobile/web
python -m http.server 8000
# Visit http://localhost:8000
```

### Deploy to Vercel:
```bash
# After pushing to GitHub, Vercel auto-deploys
# Or use Vercel CLI:
npm i -g vercel
vercel
```

### Update sitemap date:
Edit `sitemap.xml` and update `<lastmod>` to current date.

