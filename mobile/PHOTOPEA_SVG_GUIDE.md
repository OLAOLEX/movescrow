# Creating SVG Logo from Photopea - Step by Step Guide

## 🎨 Step-by-Step Process

### Step 1: Prepare Your Logo in Photopea

1. **Open your logo** in Photopea
2. **Check canvas size**:
   - Recommended: **1024x1024 pixels** (square)
   - Or: **512x512 pixels** (minimum for clarity)
   - Go to: `Image → Canvas Size` to adjust if needed

### Step 2: Remove Background (If Needed)

**Option A: If logo has transparent background already:**
- ✅ Skip this step - you're good!

**Option B: If logo has solid background:**
1. **Select background**:
   - Use `Magic Wand Tool` (W) - click on background
   - Or use `Quick Selection Tool` (W) - drag over background
   - Hold `Shift` to add more areas

2. **Delete background**:
   - Press `Delete` key
   - Or: `Edit → Clear`

3. **Refine edges** (if needed):
   - `Select → Modify → Feather` (1-2px)
   - `Select → Modify → Smooth` (1px)

### Step 3: Export as SVG

**Photopea may not export SVG directly**, so you have these options:

#### Option A: Export as SVG (If Available)

1. **Export as SVG**:
   - `File → Export As → SVG`
   - ✅ Check "Transparent" (if you removed background)
   - Save as: `movescrow-logo.svg`
   - Size: **1024x1024** or **512x512**

#### Option B: Use Vector Tools in Photopea (Better Quality)

1. **Convert to Vector** (if possible):
   - If your logo is simple shapes, use `Pen Tool` (P) to trace
   - Or use `Shape Tools` to recreate as vectors

2. **Export**:
   - `File → Export As → SVG` (if available)
   - Or export as `EPS` then convert to SVG online (https://convertio.co/eps-svg/)

### Step 4: Optimize SVG (Important!)

After getting SVG, optimize it:

1. **Open SVG in text editor** (VS Code, Notepad++)
2. **Check viewBox** - should be square:
   ```xml
   viewBox="0 0 512 512"
   ```
   or
   ```xml
   viewBox="0 0 1024 1024"
   ```

3. **Remove unnecessary code**:
   - Remove comments
   - Remove empty groups
   - Simplify paths if possible

4. **Ensure colors are correct**:
   - Movescrow Blue: `#1E3A5F`
   - Movescrow Orange: `#FF6B35`

### Step 5: Save to Project

1. **Save SVG file**:
   - Location: `C:\MOVESCROW\mobile\assets\images\movescrow-logo.svg`
   - Name: `movescrow-logo.svg`

2. **Verify file**:
   - Open in browser to check it displays correctly
   - Should show your logo clearly

---

## 📐 Recommended Settings

### Canvas Size in Photopea:
- **1024x1024 pixels** (best for app icon)
- **512x512 pixels** (good for display)
- **Square format** (1:1 ratio)

### Export Settings:
- **Format**: SVG (preferred) or EPS (then convert to SVG)
- **Transparency**: ✅ Enabled
- **Quality**: 100% (maximum)
- **Color Mode**: RGB

### SVG Specifications:
- **ViewBox**: `0 0 1024 1024` or `0 0 512 512`
- **Width/Height**: Match viewBox
- **Colors**: Use hex codes (#1E3A5F, #FF6B35)
- **File Size**: Should be < 100KB (optimized)

---

## 🎯 Quick Workflow

### Fastest Method:
1. **Photopea**: Open logo → Remove background → Export as SVG (1024x1024, transparent)
2. **If SVG not available**: Export as EPS, then convert to SVG online (https://convertio.co/eps-svg/)
3. **Save**: Put SVG in `mobile/assets/images/movescrow-logo.svg`
4. **Done!** App will use it automatically

### Best Quality Method:
1. **Photopea**: Recreate logo as vector shapes (Pen Tool)
2. **Export**: As SVG or EPS
3. **Optimize**: Clean up SVG code
4. **Save**: In assets folder

---

## ✅ Checklist

Before saving SVG, verify:
- [ ] Logo is square (1:1 ratio)
- [ ] Background is transparent (or white if needed)
- [ ] Size is 512x512 or 1024x1024 viewBox
- [ ] Colors match Movescrow brand (Blue #1E3A5F, Orange #FF6B35)
- [ ] File size is reasonable (< 100KB)
- [ ] Logo displays correctly when opened in browser

---

## 🚀 After Saving SVG

1. **File location**: `mobile/assets/images/movescrow-logo.svg`
2. **Run app**: 
   ```bash
   cd mobile
   flutter run
   ```
3. **Logo will appear**:
   - Onboarding screen: 250x250px (large, bold)
   - App bar: 36x36px (clear, visible)

---

## 💡 Tips

### For Boldness:
- **Stroke width**: 3-4px minimum for visibility
- **Contrast**: Ensure logo stands out on white background
- **Simplified**: Avoid fine details that disappear at small sizes

### For Clarity:
- **High resolution**: Start with 1024x1024
- **Clean paths**: Simplify complex shapes
- **Solid colors**: Use brand colors, avoid gradients if possible

### For Performance:
- **Optimize SVG**: Remove unnecessary code
- **Minimize paths**: Combine similar shapes
- **File size**: Keep under 100KB

---

**Once you save the SVG to `mobile/assets/images/movescrow-logo.svg`, the app will automatically use it!** 🎉

