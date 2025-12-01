// ===== MONGODB API CLIENT =====
// Helper functions to interact with MongoDB backend

const API_URL = 'http://localhost:5000/api';

// ===== USER MANAGEMENT =====

/**
 * Create or update user in MongoDB
 */
async function saveUserToDatabase(uid, email, displayName, photoURL) {
    try {
        const response = await fetch(`${API_URL}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uid,
                email,
                displayName,
                photoURL
            })
        });

        if (!response.ok) throw new Error('Failed to save user');
        return await response.json();
    } catch (error) {
        console.warn('MongoDB offline, using localStorage fallback:', error);
        return null;
    }
}

/**
 * Get user profile from MongoDB
 */
async function getUserFromDatabase(uid) {
    try {
        const response = await fetch(`${API_URL}/user/${uid}`);
        if (!response.ok) throw new Error('User not found');
        return await response.json();
    } catch (error) {
        console.warn('MongoDB offline, using localStorage fallback:', error);
        return null;
    }
}

/**
 * Update user's age group
 */
async function updateAgeGroup(uid, ageGroup) {
    try {
        const response = await fetch(`${API_URL}/user/${uid}/age-group`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ageGroup })
        });

        if (!response.ok) throw new Error('Failed to update age group');
        return await response.json();
    } catch (error) {
        console.warn('MongoDB offline:', error);
        return null;
    }
}

// ===== WATCH HISTORY =====

/**
 * Save video to watch history
 */
async function saveToWatchHistory(uid, videoId, title, duration = 0) {
    try {
        const response = await fetch(`${API_URL}/watch-history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uid,
                videoId,
                title,
                duration
            })
        });

        if (!response.ok) throw new Error('Failed to save watch history');
        return await response.json();
    } catch (error) {
        console.warn('MongoDB offline, using localStorage fallback:', error);
        // Fallback to localStorage
        let history = JSON.parse(localStorage.getItem('watchHistory') || '[]');
        history.unshift({ videoId, title, watchedAt: new Date(), duration });
        if (history.length > 100) history = history.slice(0, 100);
        localStorage.setItem('watchHistory', JSON.stringify(history));
        return null;
    }
}

/**
 * Get watch history from MongoDB
 */
async function getWatchHistory(uid) {
    try {
        const response = await fetch(`${API_URL}/watch-history/${uid}`);
        if (!response.ok) throw new Error('Failed to fetch watch history');
        return await response.json();
    } catch (error) {
        console.warn('MongoDB offline, using localStorage fallback:', error);
        // Fallback to localStorage
        return JSON.parse(localStorage.getItem('watchHistory') || '[]');
    }
}

// ===== FAVORITES =====

/**
 * Add video to favorites
 */
async function addToFavorites(uid, videoId, title) {
    try {
        const response = await fetch(`${API_URL}/favorites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uid,
                videoId,
                title
            })
        });

        if (!response.ok) throw new Error('Failed to add to favorites');
        return await response.json();
    } catch (error) {
        console.warn('MongoDB offline, using localStorage fallback:', error);
        // Fallback to localStorage
        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        if (!favorites.some(f => f.videoId === videoId)) {
            favorites.unshift({ videoId, title, addedAt: new Date() });
            localStorage.setItem('favorites', JSON.stringify(favorites));
        }
        return null;
    }
}

/**
 * Get user's favorite videos
 */
async function getFavorites(uid) {
    try {
        const response = await fetch(`${API_URL}/favorites/${uid}`);
        if (!response.ok) throw new Error('Failed to fetch favorites');
        return await response.json();
    } catch (error) {
        console.warn('MongoDB offline, using localStorage fallback:', error);
        // Fallback to localStorage
        return JSON.parse(localStorage.getItem('favorites') || '[]');
    }
}

/**
 * Remove video from favorites
 */
async function removeFromFavorites(uid, videoId) {
    try {
        const response = await fetch(`${API_URL}/favorites/${uid}/${videoId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('Failed to remove from favorites');
        return await response.json();
    } catch (error) {
        console.warn('MongoDB offline, using localStorage fallback:', error);
        // Fallback to localStorage
        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        favorites = favorites.filter(f => f.videoId !== videoId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        return null;
    }
}

/**
 * Check if video is favorited
 */
async function isFavorited(uid, videoId) {
    try {
        const favorites = await getFavorites(uid);
        return favorites.some(f => f.videoId === videoId);
    } catch (error) {
        console.warn('Check favorite failed:', error);
        return false;
    }
}

// ===== CONTENT FILTERING =====

/**
 * Log blocked content
 */
async function logBlockedContent(videoId, title, channel, blockedKeywords, blockReason) {
    try {
        await fetch(`${API_URL}/filter-log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                videoId,
                title,
                channel,
                blockedKeywords,
                blockReason
            })
        });
    } catch (error) {
        console.warn('Could not log blocked content:', error);
    }
}

/**
 * Get content filtering statistics
 */
async function getFilterStats() {
    try {
        const response = await fetch(`${API_URL}/filter-stats`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        return await response.json();
    } catch (error) {
        console.warn('Failed to get filter stats:', error);
        return null;
    }
}

// ===== SERVER HEALTH CHECK =====

/**
 * Check if MongoDB backend is running
 */
async function checkServerHealth() {
    try {
        const response = await fetch(`${API_URL}/health`, {
            timeout: 5000
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// ===== INITIALIZATION =====

/**
 * Initialize database connection on app load
 */
async function initializeDatabase() {
    console.log('🔄 Checking MongoDB connection...');
    const isHealthy = await checkServerHealth();
    
    if (isHealthy) {
        console.log('✅ MongoDB backend connected');
        document.getElementById('dbStatus')?.classList.add('connected');
    } else {
        console.warn('⚠️ MongoDB backend unavailable - using localStorage fallback');
        document.getElementById('dbStatus')?.classList.add('offline');
    }
}

// Call on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDatabase);
} else {
    initializeDatabase();
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        saveUserToDatabase,
        getUserFromDatabase,
        updateAgeGroup,
        saveToWatchHistory,
        getWatchHistory,
        addToFavorites,
        getFavorites,
        removeFromFavorites,
        isFavorited,
        logBlockedContent,
        getFilterStats,
        checkServerHealth
    };
}
