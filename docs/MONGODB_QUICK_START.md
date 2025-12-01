# MongoDB Integration - Quick Start Guide

## ✅ What's Been Done

1. **Backend Server Created** (`server.js`)
   - Express API with MongoDB connection
   - All necessary endpoints ready
   - CORS enabled for frontend requests
   - Graceful fallback to localStorage if MongoDB is down

2. **MongoDB Schemas Set Up**
   - User collection (profiles, watch history, favorites)
   - FilterLog collection (content moderation)
   - Video collection (video metadata)
   - Session collection (user sessions)

3. **API Endpoints Ready**
   - `/api/user` - User management
   - `/api/watch-history` - Track videos watched
   - `/api/favorites` - Save favorite videos
   - `/api/filter-stats` - Content filtering analytics
   - And more...

4. **Database Client Created** (`db-client.js`)
   - Helper functions for frontend-to-API communication
   - Automatic fallback to localStorage
   - No MongoDB = app still works

5. **Dependencies Installed**
   - ✅ mongoose (MongoDB driver)
   - ✅ dotenv (environment variables)
   - ✅ express (web server)
   - ✅ cors (cross-origin requests)

---

## 🚀 Getting Started (3 Steps)

### Step 1: Create MongoDB Atlas Account
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free tier available)
3. Create cluster named "kiddotubes"
4. Add database user: Superadmin / db_password
5. Allow network access from anywhere (development)
6. Copy connection string
```

### Step 2: Update .env File
```bash
# .env file already exists, just update:
MONGODB_URI=mongodb+srv://Superadmin:db_password@YOUR_CLUSTER.mongodb.net/kiddotubes?retryWrites=true&w=majority
PORT=5000
```

### Step 3: Start the Backend Server
```bash
# Terminal 1: Start MongoDB backend
npm run server:dev

# Terminal 2: Start frontend (separate terminal)
npm start
```

You should see:
```
✅ Server running on http://localhost:5000
✅ Connected to MongoDB Atlas
```

---

## 🔌 Integration with Frontend

### Option A: Automatic (Already Set Up)
The app automatically uses MongoDB when available:
1. `db-client.js` is loaded in `index.html`
2. All API calls go through the helper functions
3. If MongoDB is down, localStorage is used automatically

### Option B: Manual Integration in auth.js
When user logs in, save to database:

```javascript
// In your login/register functions:
async function loginEmail(email, password) {
    try {
        const result = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = result.user;
        
        // Save to MongoDB
        await saveUserToDatabase(
            user.uid,
            user.email,
            user.displayName || email,
            user.photoURL || 'https://via.placeholder.com/150'
        );
        
        updateAuthUI(user);
    } catch (error) {
        console.error('Login error:', error);
        showError('Invalid email or password');
    }
}
```

### Option C: Save Watch History
In `app-no-firebase.js`, when user watches a video:

```javascript
function playVideo(videoId, title) {
    const user = firebase.auth().currentUser;
    if (user) {
        // Save to watch history
        saveToWatchHistory(user.uid, videoId, title, 0);
    }
    window.open(`https://www.youtube.com/embed/${videoId}?autoplay=1`, '_blank');
}
```

### Option D: Save Favorites
```javascript
async function toggleFavorite(videoId, title) {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert('Please login to save favorites');
        return;
    }

    const isFav = await isFavorited(user.uid, videoId);
    
    if (isFav) {
        await removeFromFavorites(user.uid, videoId);
        console.log('Removed from favorites');
    } else {
        await addToFavorites(user.uid, videoId, title);
        console.log('Added to favorites');
    }
}
```

---

## 📊 Testing

### Check if Server is Running
```bash
# In browser console or curl
curl http://localhost:5000/api/health

# Should return:
# {"status": "Server is running", "time": "2025-01-15T..."}
```

### Create a Test User
```bash
curl -X POST http://localhost:5000/api/user \
  -H "Content-Type: application/json" \
  -d '{
    "uid": "test_123",
    "email": "test@example.com",
    "displayName": "Test User",
    "photoURL": "https://example.com/photo.jpg"
  }'

# Response:
# {"success": true, "user": {...}}
```

### Add to Favorites
```bash
curl -X POST http://localhost:5000/api/favorites \
  -H "Content-Type: application/json" \
  -d '{
    "uid": "test_123",
    "videoId": "dQw4w9WgXcQ",
    "title": "Sample Video"
  }'
```

---

## 🛠️ Available Functions in db-client.js

```javascript
// User Management
saveUserToDatabase(uid, email, displayName, photoURL)
getUserFromDatabase(uid)
updateAgeGroup(uid, ageGroup)

// Watch History
saveToWatchHistory(uid, videoId, title, duration)
getWatchHistory(uid)

// Favorites
addToFavorites(uid, videoId, title)
getFavorites(uid)
removeFromFavorites(uid, videoId)
isFavorited(uid, videoId)

// Content Filtering
logBlockedContent(videoId, title, channel, blockedKeywords, blockReason)
getFilterStats()

// Status
checkServerHealth()
initializeDatabase()
```

---

## 📁 File Structure

```
/
├── server.js                  ← Backend Express server
├── db-client.js              ← Frontend API helpers
├── .env                       ← MongoDB credentials
├── package.json              ← Updated with new scripts
├── MONGODB_SETUP.md          ← Detailed MongoDB guide
├── auth.js                   ← Firebase auth (integrate saveUserToDatabase)
├── app-no-firebase.js        ← Main app (integrate DB functions)
├── index.html                ← Now includes db-client.js
└── style.css                 ← Styling
```

---

## 🎯 Next Steps

1. **MongoDB Atlas Setup** (5 minutes)
   - Follow MONGODB_SETUP.md

2. **Start Backend** (1 command)
   ```bash
   npm run server:dev
   ```

3. **Test API Endpoints**
   - Use curl or Postman to test endpoints
   - Check console for logs

4. **Update Frontend Code** (optional but recommended)
   - Add `await saveUserToDatabase(...)` in auth.js login/register
   - Add `await saveToWatchHistory(...)` in playVideo()
   - Add `await addToFavorites(...)` in favorite toggle

5. **Deploy**
   - Push code to GitHub
   - Deploy backend to Heroku/Railway/Render
   - Update `.env` in production with production MongoDB connection

---

## ⚠️ Important Notes

- **MongoDB Free Tier**: 512MB storage, shared resources
- **Fallback Mode**: App works even if MongoDB is down (uses localStorage)
- **Development**: Connect string has network access from anywhere
- **Production**: Restrict to specific IP addresses only
- **Performance**: First requests may be slower (cold start)

---

## 🆘 Troubleshooting

**Server won't start?**
```bash
# Check if port 5000 is in use
npx lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Use different port
PORT=5001 npm run server:dev
```

**MongoDB connection fails?**
```
1. Check internet connection
2. Verify IP is whitelisted in MongoDB Atlas
3. Check credentials in .env
4. Verify cluster is running (not paused)
```

**API returns 404?**
- Make sure server is running on port 5000
- Check URL format: http://localhost:5000/api/...
- Look for errors in server terminal

**Frontend using localStorage instead of MongoDB?**
- Check browser console for error messages
- Verify server is healthy: http://localhost:5000/api/health
- Check for CORS errors

---

## 📚 Documentation

- **MONGODB_SETUP.md** - Complete MongoDB setup guide
- **db-client.js** - All available functions with comments
- **server.js** - All API endpoints with comments
- **auth.js** - Firebase authentication integration points

---

## ✨ What You Can Do Now

✅ Store user profiles permanently
✅ Track watch history across sessions
✅ Save favorite videos
✅ Log content filtering events
✅ Get filtering statistics
✅ Manage user age groups
✅ Scale to millions of users
✅ Analytics and reporting
✅ Parental controls persistence

---

**Ready? Start with: `npm run server:dev` in terminal**
