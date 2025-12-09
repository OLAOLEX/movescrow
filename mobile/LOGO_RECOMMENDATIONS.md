# Movescrow Logo - SVG Recommendations

## ✅ Yes, SVG is Better!

**Why SVG is Better Than JPEG/PNG:**
- ✅ **Scalable** - Looks crisp at any size
- ✅ **Smaller file size** - Usually 10-50KB vs 100-500KB for images
- ✅ **No pixelation** - Perfect at any resolution
- ✅ **Better for app icons** - One file works for all sizes
- ✅ **Easier to customize** - Can change colors programmatically

---

## 📐 Recommended Sizes

### For App Display (Onboarding Screen)
- **Large Logo (Center)**: **200x200 to 300x300 pixels**
  - This is the main logo display
  - Should be bold and clear
  - Current: 150x150 (can increase to 200-250 for more prominence)

### For App Bar (Top Navigation)
- **Small Logo**: **32x32 to 48x48 pixels**
  - Current: 32x32 (good size)
  - Should be recognizable but not overwhelming

### For App Icon (Home Screen)
- **App Icon**: **1024x1024 pixels** (master size)
  - Flutter will generate all required sizes automatically
  - Should be simple and recognizable at small sizes

---

## 🎨 SVG Specifications

### Optimal SVG Settings:
1. **ViewBox**: Should be square (e.g., `viewBox="0 0 512 512"`)
2. **Dimensions**: 512x512 or 1024x1024 (for clarity)
3. **Stroke Width**: 2-4px for boldness
4. **Colors**: Use Movescrow brand colors
   - Primary Blue: `#1E3A5F`
   - Accent Orange: `#FF6B35`
5. **Simplified**: Remove unnecessary paths for better performance

### File Naming:
- `movescrow-logo.svg` (recommended)
- Or keep both: `movescrow-logo.svg` + `movescrow-logo.jpeg` (fallback)

---

## 📱 Implementation

### Current Sizes in App:
- **Onboarding Screen**: 150x150 (can increase to 200-250)
- **App Bar**: 32x32 (good)
- **App Icon**: Auto-generated from source

### Recommended Updates:
- **Onboarding Screen**: Increase to **200-250px** for more prominence
- **App Bar**: Keep at **32-40px** (current is good)
- **App Icon**: Use **1024x1024** SVG as source

---

## 🚀 How to Add SVG Logo

1. **Save your logo as SVG**:
   - File: `assets/images/movescrow-logo.svg`
   - Size: 512x512 or 1024x1024 viewBox

2. **Update pubspec.yaml** (already done):
   ```yaml
   assets:
     - assets/images/
   ```

3. **Code already updated** to use SVG with fallback

4. **Run**:
   ```bash
   flutter pub get
   flutter run
   ```

---

## 💡 Best Practices

### For Boldness & Clarity:
1. **Stroke Width**: 3-4px minimum for visibility
2. **Contrast**: Ensure logo stands out on white background
3. **Simplified Design**: Avoid fine details that disappear at small sizes
4. **Color**: Use solid colors (Movescrow Blue/Orange)

### For Different Sizes:
- **Large (200-300px)**: Can include more details
- **Medium (48-100px)**: Simplify slightly
- **Small (24-32px)**: Use icon version (just "M" or simplified)

---

## 📊 Size Comparison

| Use Case | Current | Recommended | SVG ViewBox |
|----------|---------|-------------|-------------|
| Onboarding Logo | 150x150 | **200-250px** | 512x512 or 1024x1024 |
| App Bar Logo | 32x32 | 32-40px | Same |
| App Icon | Auto | 1024x1024 | 1024x1024 |

---

## ✅ Next Steps

1. **Get SVG version** of your logo
2. **Save to**: `mobile/assets/images/movescrow-logo.svg`
3. **Update code** (already done - will auto-detect SVG)
4. **Increase onboarding logo size** to 200-250px for more prominence
5. **Test** on device to see clarity

---

**SVG is definitely the better choice!** It will look crisp at all sizes and solve the file lock issues too.

