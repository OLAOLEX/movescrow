# App Icon PNG Setup

## 📱 Why PNG for App Icons?

**`flutter_launcher_icons` does NOT support SVG** - it requires PNG format for generating app icons.

## ✅ Solution: Use Both Formats

- **SVG**: For all in-app displays (onboarding screen, app bar, images)
- **PNG**: For app icon generation only (home screen icon)

## 🎯 What You Need to Do

### Step 1: Convert SVG to PNG

1. **Open your SVG** in Photopea (or any image editor)
2. **Set canvas to square**: `Image → Canvas Size` → **1024x1024 pixels**
3. **Export as PNG**:
   - `File → Export As → PNG`
   - ✅ Check "Transparent" (if you have transparent background)
   - Save as: `movescrow-logo.png`
   - Size: **1024x1024 pixels** (square)

### Step 2: Save PNG to Project

1. **Copy PNG file** to: `C:\MOVESCROW\mobile\assets\images\movescrow-logo.png`
2. **Done!** ✅

## 📁 File Structure

```
mobile/assets/images/
├── movescrow-logo.svg  ← Used for in-app displays (onboarding, app bar)
└── movescrow-logo.png  ← Used for app icon generation only
```

## 🚀 Generate App Icons

After adding the PNG file, run:

```bash
cd mobile
flutter pub run flutter_launcher_icons
```

This will generate all required app icon sizes for iOS and Android.

## ✅ Current Setup

- ✅ **SVG**: Already configured for in-app displays
- ⏳ **PNG**: Need to add for app icons
- ✅ **Code**: Already uses SVG with PNG/JPEG fallback

## 💡 Why Both?

- **SVG**: Scalable, crisp at any size, smaller file size
- **PNG**: Required by `flutter_launcher_icons` for app icon generation
- **Best of both**: SVG for displays, PNG for icons

---

**Once you add the PNG file, app icons will be generated automatically!** 🎨

