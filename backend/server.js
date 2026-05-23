// ===== KIDDOTUBES BACKEND SERVER =====
// Express server with MongoDB Atlas integration

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const fetch = global.fetch || require("node-fetch");

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
// MOVED: Static file serving moved to AFTER API routes (see bottom of file)

// ===== MONGODB CONNECTION =====
const mongoURI = process.env.MONGODB_URI;

if (mongoURI) {
    mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas');
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        // Continue running even if MongoDB fails
    });
} else {
    console.warn('⚠️ MongoDB URI not configured. MongoDB-dependent routes will be unavailable.');
}


// ===== DATABASE SCHEMAS =====

// User Schema
const userSchema = new mongoose.Schema({
    uid: { type: String, unique: true, required: true },
    email: { type: String, unique: true, sparse: true },
    phoneNumber: { type: String, unique: true, sparse: true },
    displayName: { type: String, default: 'User' },
    photoURL: { type: String },
    ageGroup: { type: String, enum: ['2-4', '5-7', '8-12'], default: '2-4' },
    safeSearchEnabled: { type: Boolean, default: true },
    watchHistory: [
        {
            videoId: String,
            title: String,
            watchedAt: { type: Date, default: Date.now },
            duration: Number
        }
    ],
    favorites: [
        {
            videoId: String,
            title: String,
            addedAt: { type: Date, default: Date.now }
        }
    ],
    parentalControls: {
        enabled: Boolean,
        pin: String,
        restrictedCategories: [String],
        screenTimeLimit: Number
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Video Schema
const videoSchema = new mongoose.Schema({
    videoId: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    channel: { type: String },
    thumbnail: String,
    category: String,
    ageAppropriate: {
        '2-4': Boolean,
        '5-7': Boolean,
        '8-12': Boolean
    },
    blocked: { type: Boolean, default: false },
    blockReason: String,
    views: { type: Number, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviews: Number,
    createdAt: { type: Date, default: Date.now }
});

// Content Filter Log Schema
const filterLogSchema = new mongoose.Schema({
    videoId: String,
    title: String,
    channel: String,
    blockedKeywords: [String],
    blockReason: String,
    timestamp: { type: Date, default: Date.now }
});

// Session Schema
const sessionSchema = new mongoose.Schema({
    userId: String,
    sessionToken: String,
    loginTime: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now },
    expiresAt: Date,
    ipAddress: String,
    userAgent: String
});

// Profile Schema (for multi-profile support)
const profileSchema = new mongoose.Schema({
    parentUid: { type: String, required: true },
    profileName: { type: String, required: true },
    avatar: { type: String, default: '👦' },
    ageGroup: { type: String, enum: ['2-4', '5-7', '8-12'], default: '2-4' },
    watchHistory: [{
        videoId: String,
        title: String,
        watchedAt: { type: Date, default: Date.now },
        duration: Number
    }],
    favorites: [{
        videoId: String,
        title: String,
        addedAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Create Models
const User = mongoose.model('User', userSchema);
const Video = mongoose.model('Video', videoSchema);
const FilterLog = mongoose.model('FilterLog', filterLogSchema);
const Session = mongoose.model('Session', sessionSchema);
const Profile = mongoose.model('Profile', profileSchema);

// ===== LEGACY PROXY ROUTE =====
app.get("/proxy", async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({ error: "Missing video URL" });
    }

    try {
        const response = await fetch(videoUrl);
        const buffer = await response.arrayBuffer();

        res.setHeader("Content-Type", response.headers.get("content-type"));
        res.send(Buffer.from(buffer));

    } catch (err) {
        res.status(500).json({ error: "Proxy error", details: err.message });
    }
});

// ===== MONGODB API ROUTES =====

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', time: new Date() });
});

// Get Config (API Keys and settings for frontend)
app.get('/api/config', (req, res) => {
    res.json({
        youtubeApiKey: process.env.YOUTUBE_API_KEY,
        environment: process.env.NODE_ENV || 'development'
    });
});

// Get User Data
app.get('/api/user/:uid', async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.uid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create/Update User
app.post('/api/user', async (req, res) => {
    try {
        const { uid, email, displayName, photoURL } = req.body;
        
        let user = await User.findOne({ uid });
        
        if (user) {
            // Update existing user
            user.email = email || user.email;
            user.displayName = displayName || user.displayName;
            user.photoURL = photoURL || user.photoURL;
            user.updatedAt = new Date();
        } else {
            // Create new user
            user = new User({
                uid,
                email,
                displayName,
                photoURL,
                ageGroup: '2-4',
                safeSearchEnabled: true
            });
        }
        
        await user.save();
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Save Watch History
app.post('/api/watch-history', async (req, res) => {
    try {
        const { uid, videoId, title, duration } = req.body;
        
        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Add to watch history
        user.watchHistory.unshift({
            videoId,
            title,
            duration,
            watchedAt: new Date()
        });
        
        // Keep only last 100 items
        if (user.watchHistory.length > 100) {
            user.watchHistory = user.watchHistory.slice(0, 100);
        }
        
        await user.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Watch History
app.get('/api/watch-history/:uid', async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.uid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user.watchHistory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add to Favorites
app.post('/api/favorites', async (req, res) => {
    try {
        const { uid, videoId, title } = req.body;
        
        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Check if already favorited
        const exists = user.favorites.some(fav => fav.videoId === videoId);
        if (exists) {
            return res.status(400).json({ error: 'Already in favorites' });
        }
        
        user.favorites.push({
            videoId,
            title,
            addedAt: new Date()
        });
        
        await user.save();
        res.json({ success: true, favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Favorites
app.get('/api/favorites/:uid', async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.uid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user.favorites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove from Favorites
app.delete('/api/favorites/:uid/:videoId', async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.uid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        user.favorites = user.favorites.filter(fav => fav.videoId !== req.params.videoId);
        await user.save();
        
        res.json({ success: true, favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Log Filtered Content
app.post('/api/filter-log', async (req, res) => {
    try {
        const { videoId, title, channel, blockedKeywords, blockReason } = req.body;
        
        const log = new FilterLog({
            videoId,
            title,
            channel,
            blockedKeywords,
            blockReason,
            timestamp: new Date()
        });
        
        await log.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Filter Statistics
app.get('/api/filter-stats', async (req, res) => {
    try {
        const totalBlocked = await FilterLog.countDocuments();
        const blockedByReason = await FilterLog.aggregate([
            { $group: { _id: '$blockReason', count: { $sum: 1 } } }
        ]);
        
        res.json({
            totalBlocked,
            blockedByReason
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update User Age Group
app.put('/api/user/:uid/age-group', async (req, res) => {
    try {
        const { ageGroup } = req.body;
        
        const user = await User.findOne({ uid: req.params.uid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        user.ageGroup = ageGroup;
        user.updatedAt = new Date();
        await user.save();
        
        res.json({ success: true, ageGroup: user.ageGroup });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== PARENTAL CONTROLS =====
// Set Parental Controls
app.post('/api/parental-controls/:uid', async (req, res) => {
    try {
        const { pin, restrictedCategories, screenTimeLimit } = req.body;
        
        const user = await User.findOne({ uid: req.params.uid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        user.parentalControls = {
            enabled: true,
            pin: pin || user.parentalControls.pin,
            restrictedCategories: restrictedCategories || [],
            screenTimeLimit: screenTimeLimit || 0
        };
        
        await user.save();
        res.json({ success: true, parentalControls: user.parentalControls });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Parental Controls
app.get('/api/parental-controls/:uid', async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.uid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user.parentalControls || { enabled: false });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== MULTI-PROFILE SUPPORT =====
// Create Child Profile
app.post('/api/profiles', async (req, res) => {
    try {
        const { parentUid, profileName, avatar, ageGroup } = req.body;
        
        const profile = new Profile({
            parentUid,
            profileName,
            avatar: avatar || '👦',
            ageGroup: ageGroup || '2-4'
        });
        
        await profile.save();
        res.json({ success: true, profile });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Profiles for Parent
app.get('/api/profiles/:parentUid', async (req, res) => {
    try {
        const profiles = await Profile.find({ parentUid: req.params.parentUid });
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Profile
app.put('/api/profiles/:profileId', async (req, res) => {
    try {
        const { profileName, avatar, ageGroup } = req.body;
        
        const profile = await Profile.findByIdAndUpdate(
            req.params.profileId,
            { profileName, avatar, ageGroup, updatedAt: new Date() },
            { new: true }
        );
        
        res.json({ success: true, profile });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Profile
app.delete('/api/profiles/:profileId', async (req, res) => {
    try {
        await Profile.findByIdAndDelete(req.params.profileId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== RECOMMENDATIONS =====
// Get Recommended Videos (based on watch history)
app.get('/api/recommendations/:profileId', async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.profileId);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        
        // Get categories from watch history
        const categories = {};
        profile.watchHistory.forEach(item => {
            categories[item.category] = (categories[item.category] || 0) + 1;
        });
        
        // Get most watched category
        const topCategory = Object.keys(categories).reduce((a, b) => 
            categories[a] > categories[b] ? a : b
        ) || 'educational';
        
        // Search for similar videos
        const youtubeApiKey = process.env.YOUTUBE_API_KEY;
        if (youtubeApiKey && youtubeApiKey !== 'your_youtube_api_key') {
            const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(topCategory + ' kids')}&maxResults=10&type=video&key=${youtubeApiKey}&safeSearch=strict`;
            const response = await fetch(youtubeUrl);
            const data = await response.json();
            
            if (response.ok && data.items) {
                const videos = data.items.map(item => ({
                    id: item.id.videoId,
                    title: item.snippet.title,
                    channel: item.snippet.channelTitle,
                    thumbnail: item.snippet.thumbnails.medium.url,
                    reason: `More ${topCategory} videos`
                }));
                
                return res.json({ success: true, recommendations: videos, topCategory });
            }
        }
        
        res.json({ success: true, recommendations: [], topCategory });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== ROOT ROUTE =====
app.get('/', (req, res) => {
    res.json({
        name: 'KiddoTubes API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/api/health',
            videos_search: '/api/videos/search?q=query',
            user_profile: '/api/user/:uid',
            watch_history: '/api/watch-history',
            user_settings: '/api/user/:uid/age-group'
        },
        backend: 'http://localhost:5000',
        frontend: 'http://localhost:8005'
    });
});

// ===== YOUTUBE API INTEGRATION =====
app.get('/api/videos/search', async (req, res) => {
    try {
        const query = req.query.q || 'kids videos';
        const maxResults = req.query.maxResults || 20;
        const youtubeApiKey = process.env.YOUTUBE_API_KEY;

        if (!youtubeApiKey || youtubeApiKey === 'your_youtube_api_key') {
            return res.status(400).json({
                error: 'YouTube API key not configured',
                message: 'Please set YOUTUBE_API_KEY in .env file',
                instruction: 'Get your key from: https://console.cloud.google.com'
            });
        }

        const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&type=video&key=${youtubeApiKey}&safeSearch=strict`;

        const response = await fetch(youtubeUrl);
        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: 'YouTube API Error',
                message: data.error?.message || 'Failed to fetch videos',
                details: data.error
            });
        }

        // Transform YouTube data
        const videos = data.items?.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            channel: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.medium.url,
            publishedAt: item.snippet.publishedAt
        })) || [];

        res.json({
            success: true,
            query,
            count: videos.length,
            videos
        });

    } catch (error) {
        console.error('YouTube API Error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// ===== SEARCH ALL VIDEOS =====
app.get('/api/videos', async (req, res) => {
    try {
        const query = req.query.q || 'kids';
        const page = req.query.page || 1;
        const pageSize = req.query.pageSize || 20;

        // First try YouTube API
        const youtubeApiKey = process.env.YOUTUBE_API_KEY;
        if (youtubeApiKey && youtubeApiKey !== 'your_youtube_api_key') {
            const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${pageSize}&type=video&key=${youtubeApiKey}&safeSearch=strict`;
            const response = await fetch(youtubeUrl);
            const data = await response.json();

            if (response.ok && data.items) {
                const videos = data.items.map(item => ({
                    id: item.id.videoId,
                    title: item.snippet.title,
                    channel: item.snippet.channelTitle,
                    thumbnail: item.snippet.thumbnails.medium.url,
                    publishedAt: item.snippet.publishedAt,
                    source: 'youtube'
                }));

                return res.json({
                    success: true,
                    source: 'youtube',
                    query,
                    page,
                    videos
                });
            }
        }

        // Fallback: return sample data
        res.json({
            success: true,
            source: 'sample',
            query,
            message: 'YouTube API not configured. Showing sample videos.',
            videos: [
                {
                    id: 'sample-1',
                    title: 'Fun Kids Learning - ABC',
                    channel: 'Kids Learning Channel',
                    thumbnail: 'https://via.placeholder.com/320x180?text=Kids+ABC',
                    source: 'sample'
                },
                {
                    id: 'sample-2',
                    title: 'Numbers 1-10 for Kids',
                    channel: 'Kids Education',
                    thumbnail: 'https://via.placeholder.com/320x180?text=Numbers',
                    source: 'sample'
                },
                {
                    id: 'sample-3',
                    title: 'Nursery Rhymes Compilation',
                    channel: 'Baby Songs',
                    thumbnail: 'https://via.placeholder.com/320x180?text=Nursery+Rhymes',
                    source: 'sample'
                }
            ]
        });

    } catch (error) {
        console.error('Video search error:', error);
        res.status(500).json({
            error: 'Error fetching videos',
            message: error.message
        });
    }
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

// ===== STATIC FILE SERVING (AFTER API ROUTES) =====
// Only serve web folder, not entire root (prevents conflicts with API routes)
app.use(express.static('./web'));
app.use(express.static('./policy'));
app.use(express.static('./Assest'));

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    if (mongoURI) {
        console.log(`📊 MongoDB Atlas configured`);
    }
});
