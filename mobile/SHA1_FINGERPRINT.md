# Movescrow Android SHA-1 Fingerprint

## 📱 Package Name
```
com.movescrow.app
```

## 🔐 SHA-1 Fingerprint (Debug)
```
BF:E5:19:63:C6:92:97:06:DB:26:81:C2:79:A3:4E:8E:5A:F7:3C:B2
```

**Format:** `BF:E5:19:63:C6:92:97:06:DB:26:81:C2:79:A3:4E:8E:5A:F7:3C:B2`

---

## 📋 How to Use

### For Google Maps API Key Restrictions:

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your API key
3. Under **Application restrictions**, select **Android apps**
4. Click **Add an item**
5. Enter:
   - **Package name:** `com.movescrow.app`
   - **SHA-1 certificate fingerprint:** `BF:E5:19:63:C6:92:97:06:DB:26:81:C2:79:A3:4E:8E:5A:F7:3C:B2`
6. Click **Save**

---

## ⚠️ Important Notes

- **Debug fingerprint:** This is for development/testing builds
- **Release fingerprint:** You'll need a separate SHA-1 when you create a release keystore for production
- **Multiple fingerprints:** You can add multiple SHA-1 fingerprints for the same package name

---

## 🔄 Getting SHA-1 Again

If you need to get it again:

**PowerShell:**
```powershell
cd $env:USERPROFILE\.android
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Look for the line: `SHA1: BF:E5:19:63:C6:92:97:06:DB:26:81:C2:79:A3:4E:8E:5A:F7:3C:B2`

---

## 📝 Release Build

When ready for production, you'll need to:
1. Create a release keystore
2. Get its SHA-1 fingerprint
3. Add it to Google Cloud Console alongside the debug one

---

**Last Updated:** $(Get-Date -Format "yyyy-MM-dd")

