# Google Search Console - Domain Preference Setup

## Setting Preferred Domain (www vs non-www)

### Method 1: Property Settings (Modern Interface)

1. **Go to Google Search Console**
   - Visit: https://search.google.com/search-console

2. **Select Your Property**
   - If you have `movescrow.com` and `www.movescrow.com` as separate properties:
     - Select the one you want to be PRIMARY: `https://www.movescrow.com`
   - If you only have one property listed, continue below

3. **Navigate to Settings**
   - Click the gear icon (⚙️) in the bottom left corner, OR
   - Click **Settings** in the left sidebar

4. **Domain Settings / Property Settings**
   - Look for **"Domain preferences"** or **"Preferred domain"**
   - This option may not appear if:
     - You're using a Domain property (covers all subdomains)
     - The interface has changed

### Method 2: Using a Domain Property (Recommended)

Google Search Console now prefers **Domain properties** that cover all subdomains:

1. **Add a Domain Property**
   - Click the property dropdown (top left)
   - Click **Add property**
   - Select **Domain** (not URL prefix)
   - Enter: `movescrow.com` (without http/https)
   - Click **Continue**

2. **Verify Domain Ownership**
   - You'll need to verify via DNS record
   - Add the TXT record to your domain's DNS settings
   - Wait for verification

3. **Domain Property Benefits**
   - Covers `movescrow.com`, `www.movescrow.com`, and all subdomains
   - No need to set preferred domain separately
   - All subdomains are treated as one property

### Method 3: If Using URL Prefix Properties

If you have separate properties for `movescrow.com` and `www.movescrow.com`:

1. **Primary Property**
   - Use `https://www.movescrow.com` as your PRIMARY property
   - Add and verify both properties

2. **Set Canonical URLs**
   - In your website code (already done in `index.html`):
     ```html
     <link rel="canonical" href="https://www.movescrow.com/">
     ```
   - This tells Google which version to prefer

3. **301 Redirects**
   - Your `vercel.json` already has this:
     ```json
     "redirects": [{
       "source": "/:path*",
       "has": [{"type": "host", "value": "movescrow.com"}],
       "destination": "https://www.movescrow.com/:path*",
       "permanent": true
     }]
     ```
   - This redirects all `movescrow.com` traffic to `www.movescrow.com`

## Current Setup Status

✅ **Canonical URL**: Set in `web/index.html` → `https://www.movescrow.com/`
✅ **301 Redirect**: Configured in `web/vercel.json` → redirects `movescrow.com` to `www.movescrow.com`
✅ **Sitemap**: Uses `https://www.movescrow.com` in `web/sitemap.xml`
✅ **robots.txt**: Uses `https://www.movescrow.com` in sitemap URL

## Recommended Approach

**Option 1: Domain Property (Best)**
- Add `movescrow.com` as a Domain property
- Covers all subdomains automatically
- No preferred domain setting needed

**Option 2: URL Prefix Property**
- Add `https://www.movescrow.com` as URL prefix property
- Your redirects and canonical URLs handle the preference
- Google will learn from your redirects

## Verification Steps

1. **Check Current Properties**
   - In Search Console, check what properties you have
   - You might see:
     - `https://movescrow.com`
     - `https://www.movescrow.com`
     - `movescrow.com` (domain property)

2. **Verify Redirects Work**
   - Visit: `https://movescrow.com`
   - Should redirect to: `https://www.movescrow.com`
   - Check browser network tab to confirm 301 redirect

3. **Submit Sitemap**
   - Go to Sitemaps section in Search Console
   - Submit: `https://www.movescrow.com/sitemap.xml`
   - Use the www version

## Notes

- Google Search Console removed the explicit "Preferred Domain" setting in newer versions
- Google now relies on:
  - Canonical URLs in your HTML
  - 301 redirects
  - Sitemap URLs
- As long as you redirect `movescrow.com` → `www.movescrow.com` and use canonical URLs, Google will understand your preference

## Current Implementation

Your website is already configured correctly:
- ✅ Redirects non-www to www
- ✅ Uses www in canonical URLs
- ✅ Uses www in sitemap
- ✅ Uses www in robots.txt

**No additional Search Console setting needed!** Google will automatically prefer `www.movescrow.com` based on your redirects and canonical tags.

## If You Still Want to Be Explicit

If the Domain property option isn't available, you can:
1. Add both properties separately
2. Use `https://www.movescrow.com` as your primary property
3. Submit sitemap to the www property
4. Google will consolidate based on your redirects

The redirects and canonical URLs you already have are the best practice for telling Google your preference!

