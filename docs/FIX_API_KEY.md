# Fix Firebase API Key Error

## ❌ Current Error
```
Error: Firebase: Error (auth/invalid-api-key)
```

This means your API key is either:
1. ❌ Invalid or expired
2. ❌ Restricted to specific services
3. ❌ Not enabled for authentication
4. ❌ Doesn't match your project

## ✅ How to Fix

### Step 1: Get Correct Config from Firebase Console
1. Go to: https://console.firebase.google.com
2. Select project: **"kiddotubes"**
3. Click **⚙️ Settings** (top-right)
4. Go to **Project Settings**
5. Scroll down to **"Your apps"** section
6. Find **Web app** and click it
7. Copy the entire config object (inside the `firebaseConfig = { ... }`)

### Step 2: Update auth.js
Replace lines 9-16 in `auth.js`:

**From:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDsX8GuCj3v1MDIUH3OoaDYoNy7BqEPR7o",
  authDomain: "kiddotubes-85ae3.firebaseapp.com",
  projectId: "kiddotubes",
  storageBucket: "kiddotubes.firebasestorage.app",
  messagingSenderId: "256759094376",
  appId: "1:256759094376:web:9cbff83417d2b3b8ba6fdd",
  measurementId: "G-QV8XEE2NMW"
};
```

**To:** (Replace with your actual config)
```javascript
const firebaseConfig = {
  apiKey: "YOUR_NEW_API_KEY",
  authDomain: "kiddotubes-85ae3.firebaseapp.com",
  projectId: "kiddotubes",
  storageBucket: "kiddotubes.firebasestorage.app",
  messagingSenderId: "256759094376",
  appId: "1:256759094376:web:YOUR_APP_ID",
  measurementId: "G-YOUR_MEASUREMENT_ID"
};
```

### Step 3: Enable APIs in Google Cloud Console
1. Go to: https://console.cloud.google.com
2. Select project: **"kiddotubes"**
3. Go to **APIs & Services** → **Library**
4. Search for and **Enable**:
   - ✅ Identity Toolkit API
   - ✅ Google Identity Services API

### Step 4: Test
1. Refresh browser: `Ctrl+Shift+R` (hard refresh)
2. Open DevTools: `F12`
3. Check console for errors
4. Try phone authentication again

## 🔧 Troubleshooting

### If Still Getting Error:

**Check Firebase Console:**
- Go to **Authentication** → **Settings**
- Verify **Phone number authentication is enabled**
- Check **Authorized domains** (must include `localhost:8005`)

**Check Google Cloud Console:**
- Go to **APIs & Services** → **Credentials**
- Verify your API key is created
- Check **Key restrictions** (should allow all services or at least Auth)

**In Browser Console (F12):**
- Look for detailed error messages
- Copy any red errors and share them

## 📝 Sample Firebase Config
If you need to create a new one, it looks like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "kiddotubes-XXXXX.firebaseapp.com",
  projectId: "kiddotubes",
  storageBucket: "kiddotubes.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:XXXXXXXXXXXXXXXXXX",
  measurementId: "G-XXXXXXXXXX"
};
```

## ✅ Need Help?

1. **Share your Firebase Project ID**: kiddotubes
2. **Check if APIs are enabled** in Google Cloud Console
3. **Verify API key restrictions** don't block authentication

Once you get the correct config, just let me know and I'll update the file!
