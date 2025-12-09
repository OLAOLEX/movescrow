# Movescrow Coming Soon Website

A beautiful, SEO-optimized "Coming Soon" landing page with waitlist functionality.

## Features

- ✅ SEO optimized with meta tags, Open Graph, and structured data
- ✅ Responsive design (mobile-first)
- ✅ Waitlist form with backend API integration
- ✅ Google Analytics ready
- ✅ Social media links
- ✅ Fast loading (no external dependencies)
- ✅ Modern UI with animations

## Quick Start

### Local Development

1. Open `index.html` in a web browser
2. Or use a local server:
   ```bash
   # Python
   python -m http.server 8000
   
   # Node.js
   npx serve
   ```

### Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## Configuration

### Update API Endpoint

Edit the `API_BASE_URL` constant in `index.html`:

```javascript
const API_BASE_URL = 'https://api.movescrow.com'; // Your backend URL
```

### Enable Google Analytics

1. Get your Measurement ID from Google Analytics
2. Uncomment and update the Google Analytics script in `index.html`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

### Update Social Media Links

Edit the social links section in `index.html` with your actual URLs.

## File Structure

```
web/
├── index.html          # Main landing page
├── manifest.json       # PWA manifest
├── robots.txt          # Search engine crawler instructions
├── sitemap.xml         # XML sitemap for SEO
├── vercel.json         # Vercel deployment configuration
├── favicon.png         # Site favicon
├── icons/              # App icons
└── DEPLOYMENT_GUIDE.md # Deployment instructions
```

## SEO Checklist

- [x] Meta tags (title, description, keywords)
- [x] Open Graph tags
- [x] Twitter Card tags
- [x] Structured data (JSON-LD)
- [x] robots.txt
- [x] sitemap.xml
- [x] Mobile responsive
- [x] Fast loading
- [ ] Google Analytics (add your ID)
- [ ] Submit to Google Search Console

## Support

For deployment issues, refer to [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

