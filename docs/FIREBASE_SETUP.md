# Firebase Configuration Setup Guide

## ✅ Current Configuration

Your app is using the following Firebase project:
- **Project ID**: kiddotubes
- **Auth Domain**: kiddotubes-85ae3.firebaseapp.com
- **API Key**: AIzaSyDsX8GuCj3v1MDIUH3OoaDYoNy7BqEPR7o

## 🔧 Required Firebase Console Setup

To make Google Authentication work, you MUST configure these in Firebase Console:

### 1. **Add Authorized Domains**
Go to: Firebase Console → Authentication → Settings → Authorized domains

Add:
- `localhost:8005`
- `127.0.0.1:8005`
- `192.168.1.10:8005`
- Your production domain (when deployed)

### 2. **Enable Google Sign-In**
Go to: Firebase Console → Authentication → Sign-in method

✅ Enable:
- Email/Password
- Google
- Phone Number (optional)

### 3. **Configure OAuth Consent Screen**
Go to: Google Cloud Console → OAuth consent screen

- User Type: **External**
- Add test users (your email)
- Scopes needed:
  - `email`
  - `profile`
  - `openid`

### 4. **Create OAuth 2.0 Credentials**
Go to: Google Cloud Console → Credentials

- Application type: **Web application**
- Authorized redirect URIs:
  - `https://kiddotubes-85ae3.firebaseapp.com/__/auth/handler`
  - `http://localhost:8005`
  - `http://127.0.0.1:8005`

### 5. **Enable APIs**
Go to: Google Cloud Console → APIs & Services → Library

Enable:
- ✅ Google Identity Services API
- ✅ Identity Toolkit API
- ✅ YouTube Data API v3

## 🧪 Testing Google Sign-In

1. Open: `http://127.0.0.1:8005`
2. Click **Profile Button** (👤)
3. Click **Google Login** button
4. Select your Google account
5. Allow permissions when prompted

## ✅ What's Fixed in the Code

1. **Consistent Firebase Config**: Now using the new config in both auth.js and index.html
2. **Better Google Sign-In**: Enhanced error handling and user feedback
3. **Auto Modal Management**: Profile modal opens/closes automatically
4. **Improved Logging**: Better console messages for debugging

## 🐛 If Still Not Working

**Check Browser Console (F12)**:
- Look for any red errors
- Check if popups are blocked
- Verify Firebase initialized successfully

**Common Issues**:
- ❌ "auth/operation-not-allowed" → Enable Google in Firebase Console
- ❌ "auth/popup-blocked" → Allow popups for localhost
- ❌ "Cross-Origin Request Blocked" → Domain not authorized in Firebase

## 📝 Contact Info
If issues persist, add your domain to Firebase Authorized Domains and refresh the browser.
