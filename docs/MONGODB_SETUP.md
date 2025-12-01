# MongoDB Atlas Setup Guide for KiddoTubes

## Quick Start

### 1. Create MongoDB Atlas Account
- Go to https://www.mongodb.com/cloud/atlas
- Click "Try Free"
- Sign up with email/Google/GitHub
- Verify email and complete onboarding

### 2. Create a Cluster
1. Click "Create" on the Deployments page
2. Select **M0 (Free Tier)** - perfect for development
3. Select **Cloud Provider**: AWS (recommended) or your choice
4. Select **Region**: Choose closest to your users (e.g., us-east-1)
5. Cluster Name: `kiddotubes` (or your preference)
6. Click "Create Deployment"
7. Wait 5-10 minutes for cluster to initialize

### 3. Set Up Database Access
1. Go to **Security → Database Access**
2. Click **Add New Database User**
3. **Username**: `Superadmin`
4. **Password**: `db_password` (or create strong password)
5. **Built-in Role**: Select `Atlas Administrator`
6. Click **Add User**

### 4. Configure Network Access
1. Go to **Security → Network Access**
2. Click **Add IP Address**
3. Select **Allow Access from Anywhere** (development only!)
   - For production: Use specific IP ranges
4. Click **Confirm**

### 5. Get Connection String
1. Go to **Deployments → Clusters**
2. Click **Connect** on your cluster
3. Select **Drivers** (Node.js)
4. Copy the connection string
5. Replace `<username>` with `Superadmin`
6. Replace `<password>` with your password
7. Replace `<dbname>` with `kiddotubes`

**Example:**
```
mongodb+srv://Superadmin:db_password@masterdata.rclrgon.mongodb.net/kiddotubes?retryWrites=true&w=majority
```

### 6. Update .env File
```bash
MONGODB_URI=mongodb+srv://Superadmin:db_password@masterdata.rclrgon.mongodb.net/kiddotubes?retryWrites=true&w=majority
PORT=5000
```

### 7. Install Dependencies
```bash
npm install
```

This installs all required packages including:
- `mongoose` - MongoDB ODM
- `dotenv` - Environment variables
- `express` - Backend server
- `cors` - Cross-origin requests
- `node-fetch` - HTTP requests

### 8. Start Backend Server
```bash
# Development with auto-reload
npm run server:dev

# Production
npm run server
```

Server will run on `http://localhost:5000`

---

## Available API Endpoints

### User Management
- **GET** `/api/user/:uid` - Get user profile
- **POST** `/api/user` - Create/update user profile
  ```json
  {
    "uid": "firebase_user_id",
    "email": "user@example.com",
    "displayName": "John",
    "photoURL": "https://..."
  }
  ```

### Watch History
- **POST** `/api/watch-history` - Add video to watch history
  ```json
  {
    "uid": "user_id",
    "videoId": "youtube_video_id",
    "title": "Video Title",
    "duration": 300
  }
  ```
- **GET** `/api/watch-history/:uid` - Get user's watch history

### Favorites
- **POST** `/api/favorites` - Add video to favorites
  ```json
  {
    "uid": "user_id",
    "videoId": "youtube_video_id",
    "title": "Video Title"
  }
  ```
- **GET** `/api/favorites/:uid` - Get user's favorite videos
- **DELETE** `/api/favorites/:uid/:videoId` - Remove from favorites

### Content Filtering
- **POST** `/api/filter-log` - Log blocked content
  ```json
  {
    "videoId": "video_id",
    "title": "Video Title",
    "channel": "Channel Name",
    "blockedKeywords": ["keyword1", "keyword2"],
    "blockReason": "inappropriate_content"
  }
  ```
- **GET** `/api/filter-stats` - Get filtering statistics

### Other
- **GET** `/api/health` - Check server status
- **PUT** `/api/user/:uid/age-group` - Update user's age group

---

## Database Schemas

### User Collection
```javascript
{
  uid: String (unique),
  email: String (unique),
  displayName: String,
  photoURL: String,
  ageGroup: "2-4" | "5-7" | "8-12",
  safeSearchEnabled: Boolean,
  watchHistory: [
    {
      videoId: String,
      title: String,
      watchedAt: Date,
      duration: Number
    }
  ],
  favorites: [
    {
      videoId: String,
      title: String,
      addedAt: Date
    }
  ],
  parentalControls: {
    enabled: Boolean,
    pin: String,
    restrictedCategories: [String],
    screenTimeLimit: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### FilterLog Collection
```javascript
{
  videoId: String,
  title: String,
  channel: String,
  blockedKeywords: [String],
  blockReason: String,
  timestamp: Date
}
```

### Session Collection
```javascript
{
  userId: String,
  sessionToken: String,
  loginTime: Date,
  lastActive: Date,
  expiresAt: Date,
  ipAddress: String,
  userAgent: String
}
```

---

## Updating Frontend to Use MongoDB

### 1. Update auth.js
Replace localStorage calls with API calls:

```javascript
// OLD: localStorage.setItem('user', JSON.stringify(user));
// NEW:
await fetch('http://localhost:5000/api/user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL
  })
});
```

### 2. Update app-no-firebase.js
Replace watch history storage:

```javascript
// Save to database when video is watched
async function saveWatchHistory(videoId, title, duration) {
  const user = firebase.auth().currentUser;
  if (!user) return;
  
  await fetch('http://localhost:5000/api/watch-history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uid: user.uid,
      videoId,
      title,
      duration
    })
  });
}

// Add to favorites
async function addToFavorites(videoId, title) {
  const user = firebase.auth().currentUser;
  if (!user) return;
  
  await fetch('http://localhost:5000/api/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uid: user.uid,
      videoId,
      title
    })
  });
}
```

### 3. Update profile display
```javascript
// Get user data from database
async function loadUserProfile(uid) {
  const response = await fetch(`http://localhost:5000/api/user/${uid}`);
  const user = await response.json();
  
  document.getElementById('profileName').textContent = user.displayName;
  document.getElementById('profilePhoto').src = user.photoURL;
  // Update other profile fields...
}
```

---

## Testing API Endpoints

### Using cURL (Terminal)
```bash
# Check server health
curl http://localhost:5000/api/health

# Create user
curl -X POST http://localhost:5000/api/user \
  -H "Content-Type: application/json" \
  -d '{
    "uid": "test_user_123",
    "email": "test@example.com",
    "displayName": "Test User",
    "photoURL": "https://example.com/photo.jpg"
  }'

# Get user
curl http://localhost:5000/api/user/test_user_123

# Add to favorites
curl -X POST http://localhost:5000/api/favorites \
  -H "Content-Type: application/json" \
  -d '{
    "uid": "test_user_123",
    "videoId": "dQw4w9WgXcQ",
    "title": "Sample Video"
  }'
```

### Using Postman
1. Download Postman from https://www.postman.com/downloads/
2. Create new request
3. Set method to GET/POST/PUT/DELETE
4. Enter endpoint URL
5. Add JSON body for POST requests
6. Click "Send"

---

## Troubleshooting

### Error: "MongooseError: Cannot connect to MongoDB"
- Check internet connection
- Verify IP address is whitelisted in MongoDB Atlas
- Confirm credentials in .env file
- Make sure cluster is running (not paused)

### Error: "Invalid MongoDB URI"
- Double-check connection string format
- Ensure special characters in password are URL-encoded
- Verify database name is correct

### Error: "Cannot GET /api/user/..."
- Make sure server is running (`npm run server`)
- Check that server port matches frontend requests (5000)
- Verify MongoDB connection is successful

### Slow API Responses
- Check network connection
- MongoDB free tier has performance limits
- Consider upgrading to M5 cluster for better performance

---

## Next Steps

1. ✅ Set up MongoDB Atlas account and cluster
2. ✅ Get connection string
3. ✅ Update .env file
4. ✅ Install dependencies: `npm install`
5. ✅ Start server: `npm run server:dev`
6. ⏳ Update frontend to use API endpoints
7. ⏳ Test all endpoints
8. ⏳ Deploy to production

---

## Production Deployment

### For Cloud Hosting (Heroku, Railway, Render, etc.):
1. Set `MONGODB_URI` in production environment variables
2. Set `NODE_ENV=production`
3. Deploy server code
4. Update frontend to use production server URL instead of localhost

### Security Checklist:
- ✅ Enable IP whitelist in MongoDB Atlas (specific IPs only)
- ✅ Use strong database passwords
- ✅ Add input validation in API routes
- ✅ Implement JWT authentication for APIs
- ✅ Add rate limiting
- ✅ Use HTTPS in production
- ✅ Enable logging and monitoring

---

**Need Help?** Check MongoDB Atlas documentation: https://docs.mongodb.com/atlas/
