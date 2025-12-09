# Quick SVG Setup - 3 Steps

## 🚀 Fastest Way to Get SVG Logo

### Step 1: Export from Photopea
1. Open logo in Photopea
2. Remove background (if needed): `Magic Wand Tool` → Select background → Delete
3. Resize canvas: `Image → Canvas Size` → Set to **1024x1024** (square)
4. Export: `File → Export As → SVG`
   - ✅ Check "Transparent" (if available)
   - Save as: `movescrow-logo.svg`

**Note**: If Photopea doesn't support SVG export directly, use an online vector converter or export as EPS then convert to SVG.

### Step 2: Save to Project
1. Save SVG as: `C:\MOVESCROW\mobile\assets\images\movescrow-logo.svg`
2. Done! ✅

**The app will automatically use the SVG!**

---

## 📐 Size Recommendations

- **Canvas in Photopea**: **1024x1024 pixels** (square) ✅ **This is the ideal size!**
- **Export SVG**: 1024x1024 pixels, transparent
- **SVG ViewBox**: Should be `0 0 1024 1024`

**Why 1024x1024?**
- Industry standard for app icons
- Best quality for all use cases
- Flutter needs this size for generating app icons
- Scales perfectly to any display size (250px, 36px, etc.)

---

## ✅ That's It!

Once the SVG is in `mobile/assets/images/movescrow-logo.svg`, run:
```bash
cd mobile
flutter run
```

The logo will appear:
- **250x250px** on onboarding screen (bold & clear)
- **36x36px** in app bar (visible)

---

**No need to resize in code - SVG scales automatically!** 🎨

