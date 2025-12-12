# Fix Frontend Supabase Anon Key

## Problem

The frontend JavaScript is using a placeholder `"your-anon-key"` instead of the real Supabase anon key, causing 401 Unauthorized errors.

## Solution

You need to set the Supabase anon key in the frontend. There are two options:

### Option 1: Set via HTML (Quick Fix)

1. Open `web/restaurant/index.html`
2. Find the `<head>` section
3. Add this before the Supabase script loads:

```html
<script>
  // Set Supabase keys from environment or use defaults
  window.SUPABASE_URL = window.SUPABASE_URL || 'https://jgtvavugofqxlovakswb.supabase.co';
  window.SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'YOUR_ACTUAL_ANON_KEY_HERE';
</script>
```

4. Replace `YOUR_ACTUAL_ANON_KEY_HERE` with your real Supabase anon key (get it from Supabase Dashboard → Settings → API → anon public key)

### Option 2: Use Vercel Environment Variables (Recommended)

If you want to keep keys in environment variables:

1. Add to Vercel environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

2. Update `web/restaurant/index.html` to read from environment:
   ```html
   <script>
     window.SUPABASE_ANON_KEY = '<%= process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY %>';
   </script>
   ```

   However, for static HTML, you'll need to use a build step or inject at runtime.

### Option 3: Hardcode for Now (Easiest for Testing)

For quick testing, you can hardcode it directly in `web/restaurant/app.js`:

1. Open `web/restaurant/app.js`
2. Find the Supabase configuration section (around line 30)
3. Replace:
   ```javascript
   const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'your-anon-key';
   ```
   With:
   ```javascript
   const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'YOUR_ACTUAL_ANON_KEY_HERE';
   ```

4. Replace `YOUR_ACTUAL_ANON_KEY_HERE` with your real anon key

---

## How to Get Your Supabase Anon Key

1. Go to **Supabase Dashboard**
2. Go to **Settings** → **API**
3. Find **"Project API keys"**
4. Copy the **`anon` `public`** key (NOT the service_role key!)
5. This key is safe to use in frontend code (it's public and has restricted permissions)

---

## Important Notes

- ✅ Use the **anon** key in the frontend (public, safe to expose)
- ❌ NEVER use the **service_role** key in frontend code (it has full access)
- The anon key has Row Level Security (RLS) restrictions
- For the restaurant dashboard to work, you may need to adjust RLS policies in Supabase

---

## After Fixing

After setting the correct anon key:

1. **Redeploy** to Vercel (if using env vars) or refresh the page (if hardcoded)
2. **Test OTP verification** - should now work
3. **Check browser console** - should no longer see 401 errors
4. **Verify** - Dashboard should load restaurant data

---

## Next: Set Up Row Level Security (RLS)

After fixing the anon key, you may need to set up RLS policies in Supabase to allow restaurants to read their own data. But for now, just getting the key set correctly should allow basic functionality to work.

