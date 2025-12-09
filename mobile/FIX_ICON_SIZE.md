# Fix App Icon Size & Appearance

## 🔍 Problem
- Icon appears too big
- Icon looks "deepened" or darkened
- Not accurate to original PNG

## ✅ Solution: Create Properly Padded Icon

Android adaptive icons need a **safe zone** (padding). The logo should be **smaller and centered** within the 1024x1024 canvas.

### Step 1: Create Padded Version in Photopea

1. **Open your PNG** in Photopea: `movescrow-logo.png`

2. **Check current size**:
   - If it's already 1024x1024, proceed
   - If not, resize canvas to 1024x1024 (square)

3. **Add padding (safe zone)**:
   - **Safe zone**: Logo should occupy **66% of canvas** (center 66%)
   - **Padding**: 17% on each side
   - This means logo should be **~675x675 pixels** centered in 1024x1024

4. **Resize logo to fit safe zone**:
   - Select logo layer
   - `Edit → Free Transform` (Ctrl+T)
   - Resize to fit within center 66% (about 675x675)
   - Center it perfectly

5. **Export as new file**:
   - `File → Export As → PNG`
   - Save as: `movescrow-logo-icon.png` (with padding)
   - Size: 1024x1024
   - ✅ Check "Transparent" background

### Step 2: Update Configuration

Replace the icon file in `pubspec.yaml`:

```yaml
flutter_launcher_icons:
  android: true
  ios: true
  image_path: "assets/images/movescrow-logo-icon.png"  # Padded version
  adaptive_icon_background: "#1E3A5F"
  adaptive_icon_foreground: "assets/images/movescrow-logo-icon.png"
  remove_alpha_ios: true
```

### Step 3: Regenerate Icons

```bash
cd mobile
flutter pub run flutter_launcher_icons
flutter clean
flutter run
```

## 🎨 Alternative: Use White/Transparent Background

If the "deepened" look is from the blue background, try:

1. **Create icon with white/transparent background** (not blue)
2. **Use white background in config**:

```yaml
adaptive_icon_background: "#FFFFFF"  # White instead of blue
```

Or use transparent and let the system handle it.

## 📐 Quick Reference: Safe Zone Sizes

For 1024x1024 canvas:
- **Safe zone**: 675x675 pixels (center)
- **Padding**: ~175 pixels on each side
- **Logo size**: Should fit within 675x675

## ✅ Expected Result

- Icon appears properly sized (not too big)
- Logo is centered and clear
- No darkening or color issues
- Matches original PNG appearance

---

**Create the padded version and regenerate icons!** 🎨

