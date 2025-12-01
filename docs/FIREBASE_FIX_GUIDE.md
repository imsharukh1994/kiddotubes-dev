# 🔧 Firebase Google Sign-In Error Fix Guide

## Error: `auth/requests-to-this-api-identitytoolkit-method-google.cloud.identitytoolkit.v1.projectconfigservice.getprojectconfig-are-blocked`

### What This Means
The Google Identity Toolkit API is blocked. This can happen due to:
1. **Identity Toolkit API not enabled** in Firebase project
2. **API restrictions set incorrectly**
3. **Referrer/domain restrictions** blocking localhost:8005
4. **Cache issues** from old configurations

---

## ✅ Step-by-Step Fix

### Step 1: Clear Browser Cache
Press `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac) to do a **hard refresh**. This clears the cached Firebase configuration.

### Step 2: Go to Firebase Console
1. Visit: https://console.firebase.google.com/
2. Select your **kiddotubes-5d2f0** project

### Step 3: Enable Google Sign-In Method
1. Go to **Authentication** (left sidebar)
2. Click **Sign-in method** tab
3. Click on **Google**
4. Toggle **Enable** to ON
5. Select a support email
6. Click **Save**

### Step 4: Check Authorized Domains
1. In **Authentication**, go to **Settings** tab
2. Scroll to **Authorized domains**
3. Make sure **localhost** is in the list (should be added automatically)
4. Add **127.0.0.1** if not present
5. Add your production domain when ready

### Step 5: Enable Identity Toolkit API
1. Go to **Google Cloud Console**: https://console.cloud.google.com/
2. Search for **"Identity Toolkit API"**
3. Click on it and select your project
4. Click **Enable** button
5. Wait 30 seconds for it to activate

### Step 6: Check API Restrictions
1. In Google Cloud Console, go to **APIs & Services** → **Credentials**
2. Find your API key (should show in credentials list)
3. Click on it to edit
4. Under **Application restrictions**, make sure:
   - If it says "HTTP referrers", add `localhost:8005`
   - If it says "None", that's fine (no restrictions)
5. Click **Save**

### Step 7: Restart Server & Test
1. Stop the server (Ctrl+C in terminal)
2. Run: `npm start`
3. Hard refresh browser: `Ctrl + Shift + R`
4. Try clicking the **"Google Sign-In"** button
5. You should now see the Google login popup

---

## 🐛 Troubleshooting

### If it still doesn't work:

**Try these in order:**

1. **Hard refresh again**
   ```
   Ctrl + Shift + R
   ```

2. **Wait 2-3 minutes** (Firebase APIs need time to propagate)

3. **Check console for errors**
   - Press `F12` to open Developer Tools
   - Go to **Console** tab
   - Look for any red error messages
   - Share the exact error text

4. **Try redirect method instead of popup**
   - The code now automatically falls back to redirect if popup fails
   - You'll be redirected to Google, then back to the app

5. **Verify Firebase credentials are correct**
   - In `auth.js`, check that `apiKey` matches Firebase Console
   - Current key: `AIzaSyDUqLYNIzg6jW1OUv5ph68QXGZ8YG2eZtU`

6. **Check if using different project**
   - Go to Firebase Console main page
   - Verify you're looking at **kiddotubes-5d2f0**
   - Not **kiddotubes-85ae3** (old project)

---

## ✅ Expected Behavior After Fix

When you click **"Google Sign-In"**:
1. A popup should appear asking to sign in with Google
2. Select your Google account
3. You'll be asked for permission to share profile info
4. Popup closes automatically
5. You're now logged in
6. Profile modal shows your name and email

---

## 📞 If You Need More Help

Check the browser console (F12 → Console tab) and share:
1. The exact error message
2. The error code
3. Screenshot of the error

This helps diagnose exactly what Firebase setting is wrong.

---

## 🔑 Current Configuration

- **Project ID**: kiddotubes-5d2f0
- **API Key**: AIzaSyDUqLYNIzg6jW1OUv5ph68QXGZ8YG2eZtU
- **Auth Domain**: kiddotubes-5d2f0.firebaseapp.com
- **Server URL**: http://localhost:8005
- **Firebase**: Using compat library (stable)
