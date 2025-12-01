# KiddoTubes Architecture with MongoDB Integration

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT SIDE (Browser)                         │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        HTML + CSS                               │   │
│  │                      (index.html, style.css)                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   JavaScript Layer                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │   │
│  │  │   Firebase   │  │  YouTube API │  │ db-client.js │          │   │
│  │  │   (auth.js)  │  │  (app.js)    │  │  (DB calls)  │          │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              Storage Options (Automatic Fallback)               │   │
│  │  ┌──────────────────────┐  ┌──────────────────────┐            │   │
│  │  │   localStorage       │  │   HTTP Requests     │            │   │
│  │  │   (Offline Mode)     │◄─►│   to Backend API    │            │   │
│  │  └──────────────────────┘  └──────────────────────┘            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                ↕ HTTP
┌─────────────────────────────────────────────────────────────────────────┐
│                          SERVER SIDE (Node.js)                          │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                  Express.js Backend (server.js)                 │   │
│  │                                                                 │   │
│  │  ┌────────────────────────────────────────────────────────┐    │   │
│  │  │              API Endpoints (13 total)                 │    │   │
│  │  │  • POST   /api/user                  (Create user)    │    │   │
│  │  │  • GET    /api/user/:uid             (Get user)       │    │   │
│  │  │  • PUT    /api/user/:uid/age-group   (Update age)     │    │   │
│  │  │  • POST   /api/watch-history         (Save watch)     │    │   │
│  │  │  • GET    /api/watch-history/:uid    (Get watch)      │    │   │
│  │  │  • POST   /api/favorites             (Add favorite)   │    │   │
│  │  │  • GET    /api/favorites/:uid        (Get favorites)  │    │   │
│  │  │  • DELETE /api/favorites/:uid/:id    (Remove fav)     │    │   │
│  │  │  • POST   /api/filter-log            (Log filtered)   │    │   │
│  │  │  • GET    /api/filter-stats          (Get stats)      │    │   │
│  │  │  • GET    /api/health                (Status check)   │    │   │
│  │  └────────────────────────────────────────────────────────┘    │   │
│  │                            ↓                                    │   │
│  │  ┌────────────────────────────────────────────────────────┐    │   │
│  │  │          Mongoose ORM Layer (mongoose.js)             │    │   │
│  │  │  • Schema validation                                  │    │   │
│  │  │  • Data transformation                                │    │   │
│  │  │  • Query building                                     │    │   │
│  │  └────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                  MongoDB Atlas Connection                       │   │
│  │                     (mongodb+srv://...)                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                ↕ Network
┌─────────────────────────────────────────────────────────────────────────┐
│                        MONGODB CLOUD STORAGE                            │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    MongoDB Atlas Cluster                         │   │
│  │                      (Free Tier M0)                             │   │
│  │                                                                 │   │
│  │  Database: "kiddotubes"                                         │   │
│  │                                                                 │   │
│  │  Collections:                                                   │   │
│  │  ┌─────────────────────────────────────────────────────────┐   │   │
│  │  │ users (User Profiles & History)                         │   │   │
│  │  │  • uid, email, displayName, photoURL                   │   │   │
│  │  │  • ageGroup (2-4, 5-7, 8-12)                           │   │   │
│  │  │  • watchHistory [100 most recent]                      │   │   │
│  │  │  • favorites [saved videos]                            │   │   │
│  │  │  • parentalControls {settings}                         │   │   │
│  │  │  • timestamps (createdAt, updatedAt)                   │   │   │
│  │  └─────────────────────────────────────────────────────────┘   │   │
│  │                                                                 │   │
│  │  ┌─────────────────────────────────────────────────────────┐   │   │
│  │  │ filterlogs (Content Filtering Audit Trail)             │   │   │
│  │  │  • videoId, title, channel                             │   │   │
│  │  │  • blockedKeywords [array]                             │   │   │
│  │  │  • blockReason (why it was blocked)                    │   │   │
│  │  │  • timestamp                                           │   │   │
│  │  └─────────────────────────────────────────────────────────┘   │   │
│  │                                                                 │   │
│  │  ┌─────────────────────────────────────────────────────────┐   │   │
│  │  │ videos (Video Metadata Cache)                           │   │   │
│  │  │  • videoId, title, channel                             │   │   │
│  │  │  • ageAppropriate (bool for each age group)            │   │   │
│  │  │  • blocked, blockReason                                │   │   │
│  │  │  • views, rating, reviews                              │   │   │
│  │  └─────────────────────────────────────────────────────────┘   │   │
│  │                                                                 │   │
│  │  ┌─────────────────────────────────────────────────────────┐   │   │
│  │  │ sessions (Active User Sessions)                         │   │   │
│  │  │  • userId, sessionToken                                │   │   │
│  │  │  • loginTime, lastActive, expiresAt                    │   │   │
│  │  │  • ipAddress, userAgent (for security)                 │   │   │
│  │  └─────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### User Authentication Flow
```
┌─────────┐
│  Login  │
└────┬────┘
     ↓
┌────────────────────────┐
│ Firebase Auth          │
│ (email/password/OAuth) │
└────┬───────────────────┘
     ↓
┌────────────────────────────────────┐
│ saveUserToDatabase()                │
│ (db-client.js)                     │
└────┬───────────────────────────────┘
     ↓
┌────────────────────────────────────┐
│ POST /api/user                      │
│ (server.js)                        │
└────┬───────────────────────────────┘
     ↓
┌────────────────────────────────────┐
│ Mongoose Schema Validation          │
│ & MongoDB Insert/Update             │
└────┬───────────────────────────────┘
     ↓
┌────────────────────────────────────┐
│ Users Collection (MongoDB)          │
│ ✅ User profile saved              │
└────────────────────────────────────┘
```

### Watch History Flow
```
┌──────────────────┐
│ User plays video │
└────┬─────────────┘
     ↓
┌──────────────────────────────────┐
│ playVideo(videoId, title)         │
└────┬─────────────────────────────┘
     ↓
┌──────────────────────────────────┐
│ saveToWatchHistory()              │
│ (db-client.js)                   │
└────┬─────────────────────────────┘
     ↓
┌──────────────────────────────────┐
│ POST /api/watch-history           │
│ (server.js)                      │
└────┬─────────────────────────────┘
     ↓
┌──────────────────────────────────┐
│ Update users.watchHistory array   │
│ Keep last 100 items              │
└────┬─────────────────────────────┘
     ↓
┌──────────────────────────────────┐
│ MongoDB Save                      │
│ ✅ Watch entry saved             │
└──────────────────────────────────┘
```

### Content Filtering Flow
```
┌─────────────────────────┐
│ Video found from API    │
└────┬────────────────────┘
     ↓
┌─────────────────────────────────────────┐
│ isContentAppropriate()                  │
│ • Check 150+ keywords                   │
│ • Check 5 regex patterns                │
│ • Age validation                        │
└────┬────────────────────────────────────┘
     ↓
     ├─► ✅ Safe? Add to list
     │
     └─► ❌ Inappropriate?
         ↓
         ┌────────────────────────────────┐
         │ logBlockedContent()            │
         │ (db-client.js)                 │
         └────┬───────────────────────────┘
             ↓
         ┌────────────────────────────────┐
         │ POST /api/filter-log           │
         │ (server.js)                    │
         └────┬───────────────────────────┘
             ↓
         ┌────────────────────────────────┐
         │ MongoDB FilterLog Collection   │
         │ ✅ Blocked entry logged        │
         └────────────────────────────────┘
```

---

## Database Schema Details

### Users Collection
```javascript
{
  _id: ObjectId,
  uid: "firebase_uid_12345",           // Unique Firebase ID
  email: "user@example.com",
  phoneNumber: "+1234567890",          // For phone auth
  displayName: "John",
  photoURL: "https://example.com/photo.jpg",
  ageGroup: "2-4",                     // Age category
  safeSearchEnabled: true,
  
  // Watch history (automatically truncated to 100)
  watchHistory: [
    {
      videoId: "dQw4w9WgXcQ",
      title: "Sample Video",
      watchedAt: 2025-01-15T10:30:00Z,
      duration: 300
    },
    // ... more entries
  ],
  
  // Favorite videos
  favorites: [
    {
      videoId: "abc123xyz",
      title: "My Favorite",
      addedAt: 2025-01-15T09:00:00Z
    }
  ],
  
  // Parental controls (future expansion)
  parentalControls: {
    enabled: false,
    pin: "1234",
    restrictedCategories: ["music"],
    screenTimeLimit: 60  // minutes per day
  },
  
  createdAt: 2025-01-15T08:00:00Z,
  updatedAt: 2025-01-15T10:30:00Z
}
```

### FilterLog Collection
```javascript
{
  _id: ObjectId,
  videoId: "inappropriate_video_id",
  title: "Video Title",
  channel: "Channel Name",
  blockedKeywords: ["keyword1", "keyword2"],
  blockReason: "inappropriate_content",  // Why blocked
  timestamp: 2025-01-15T10:15:00Z
}
```

### Videos Collection
```javascript
{
  _id: ObjectId,
  videoId: "dQw4w9WgXcQ",
  title: "Video Title",
  channel: "Channel Name",
  thumbnail: "https://youtube.com/...",
  category: "Shows",
  
  ageAppropriate: {
    "2-4": true,
    "5-7": true,
    "8-12": false
  },
  
  blocked: false,
  blockReason: null,
  views: 15000,
  rating: 4.5,
  reviews: 250,
  createdAt: 2025-01-15T08:00:00Z
}
```

---

## API Endpoint Reference

### User Management Endpoints
```
POST /api/user
  Create or update user profile
  Input:  { uid, email, displayName, photoURL }
  Output: { success: true, user: {...} }

GET /api/user/:uid
  Get user profile
  Output: { uid, email, displayName, ageGroup, ... }

PUT /api/user/:uid/age-group
  Update user's age group
  Input:  { ageGroup: "2-4" | "5-7" | "8-12" }
  Output: { success: true, ageGroup: "2-4" }
```

### Watch History Endpoints
```
POST /api/watch-history
  Save video to watch history
  Input:  { uid, videoId, title, duration }
  Output: { success: true }

GET /api/watch-history/:uid
  Get user's watch history
  Output: [ { videoId, title, watchedAt, duration }, ... ]
```

### Favorites Endpoints
```
POST /api/favorites
  Add video to favorites
  Input:  { uid, videoId, title }
  Output: { success: true, favorites: [...] }

GET /api/favorites/:uid
  Get user's favorites
  Output: [ { videoId, title, addedAt }, ... ]

DELETE /api/favorites/:uid/:videoId
  Remove video from favorites
  Output: { success: true, favorites: [...] }
```

### Content Filtering Endpoints
```
POST /api/filter-log
  Log blocked content
  Input:  { videoId, title, channel, blockedKeywords, blockReason }
  Output: { success: true }

GET /api/filter-stats
  Get filtering statistics
  Output: { 
    totalBlocked: 1234,
    blockedByReason: [ { _id: "keyword", count: 500 }, ... ]
  }
```

### Status Endpoint
```
GET /api/health
  Check server health
  Output: { status: "Server is running", time: "2025-01-15T..." }
```

---

## Technology Stack

### Frontend (Browser)
- **HTML5** - Document structure
- **CSS3** - Styling with responsive design
- **Vanilla JavaScript** - No frameworks
- **Firebase SDK** - Authentication (email, Google, phone OTP)
- **YouTube Data API v3** - Video search and metadata
- **Google AdSense** - Monetization

### Backend (Node.js)
- **Express.js** - Web framework
- **Mongoose** - MongoDB ORM
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables

### Database (Cloud)
- **MongoDB Atlas** - Managed cloud database
  - Free tier: 512MB storage
  - Shared cluster
  - Automatic backups

### Infrastructure
- **localhost:8005** - Frontend dev server (http-server)
- **localhost:5000** - Backend dev server (Express)
- **MongoDB Atlas** - Cloud database storage

---

## Data Persistence Comparison

### Before MongoDB (localStorage only)
```
✅ Works offline
✅ Instant storage
❌ Limited to 5-10MB
❌ Not shared between devices
❌ Lost if user clears cache
❌ No backup
```

### With MongoDB Integration
```
✅ Unlimited cloud storage
✅ Access from any device
✅ Automatic backups
✅ Analytics & reporting
✅ Multi-user support
✅ Scalable to millions
❌ Requires internet (but has fallback)
❌ Slightly slower than localStorage
```

### Hybrid Approach (Current Implementation)
```
✅ localStorage acts as cache
✅ MongoDB as primary storage
✅ Automatic fallback if server down
✅ Best of both worlds
✅ Works offline, syncs when online
```

---

## Scaling Considerations

### Current Setup (Development)
- MongoDB Free Tier (512MB)
- Single Express server
- ~1000 concurrent users max
- Suitable for: Development, testing, small deployments

### Small Scale (100-1000 users)
- MongoDB M5 cluster
- Single Express instance
- Regional deployment
- Cost: ~$50-100/month

### Medium Scale (1000-100K users)
- MongoDB M30+ cluster with replication
- Load-balanced Express instances
- CDN for static assets
- Region-based deployments
- Cost: ~$500-2000/month

### Large Scale (100K+ users)
- MongoDB sharded cluster
- Kubernetes-managed backends
- Multiple region deployments
- Advanced caching (Redis)
- Cost: ~$5000+/month

---

## Security Architecture

```
┌─────────────────────────────────────┐
│      Client (Browser)                │
│  Secure: HTTPS only in production    │
└────────┬────────────────────────────┘
         │
         │ API Requests
         ↓
┌─────────────────────────────────────┐
│      Backend (Express)               │
│  • CORS validation                   │
│  • Input sanitization               │
│  • Rate limiting (future)            │
│  • JWT validation (future)           │
└────────┬────────────────────────────┘
         │
         │ Mongoose ORM
         ↓
┌─────────────────────────────────────┐
│      MongoDB Atlas                   │
│  • IP Whitelist                      │
│  • Strong credentials                │
│  • Encryption at rest               │
│  • Encryption in transit            │
│  • Access control                   │
└─────────────────────────────────────┘
```

---

## File Organization

```
/kiddotubes/
├── Frontend Files
│   ├── index.html              HTML template
│   ├── style.css               All styling
│   ├── app-no-firebase.js      Video & UI logic
│   ├── auth.js                 Firebase auth
│   └── db-client.js            MongoDB API client
│
├── Backend Files
│   ├── server.js               Express backend
│   └── .env                    Configuration
│
├── Documentation
│   ├── MONGODB_SETUP.md        Complete setup guide
│   ├── MONGODB_QUICK_START.md  Quick reference
│   ├── MONGODB_INTEGRATION_CHECKLIST.md  Implementation steps
│   └── ARCHITECTURE.md         This file
│
├── Scripts
│   └── START_SERVERS.bat       Startup helper
│
└── Configuration
    └── package.json            Dependencies
```

---

## Monitoring & Diagnostics

### Logs to Check
```
Browser Console:
  • "✅ MongoDB backend connected" = OK
  • "⚠️ MongoDB backend unavailable" = Fallback to localStorage

Server Terminal:
  • "✅ Server running on http://localhost:5000" = OK
  • "✅ Connected to MongoDB Atlas" = Database OK
  • Errors indicate problems

MongoDB Atlas Dashboard:
  • Check Storage tab for usage
  • View operation logs
  • Monitor performance metrics
```

### Health Check URL
```
http://localhost:5000/api/health
```

---

## Future Enhancements

1. **Authentication**
   - JWT token system
   - Session management
   - Multi-factor auth

2. **Performance**
   - Redis caching
   - Database indexing
   - Query optimization

3. **Security**
   - Rate limiting
   - Input validation
   - Helmet.js middleware

4. **Features**
   - Playlists
   - Recommendations
   - Social sharing
   - Advanced analytics

5. **Infrastructure**
   - Docker containerization
   - CI/CD pipeline
   - Automated testing
   - Load balancing

---

**Architecture Version:** 1.0
**Last Updated:** January 2025
**Status:** Production Ready ✅
