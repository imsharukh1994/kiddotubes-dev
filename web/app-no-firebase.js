
// ===== KIDDOTUBES - COMPLETE APP =====
// Single unified JavaScript file (no Firebase for now)

// API Key - should be fetched from backend in production, not hardcoded
let API_KEY = "AIzaSyDJIlSi1W1NwTDXR5buu1-MSwmpd-7a8BI"; // Fallback (will be overridden if backend config available)
let apiKeyReady = false;

// Initialize API key from backend
async function initializeAPIKey() {
    try {
        const response = await fetch('http://localhost:5000/api/config');
        if (response.ok) {
            const config = await response.json();
            if (config.youtubeApiKey) {
                API_KEY = config.youtubeApiKey;
                console.log("✅ API key loaded from backend config");
            }
        }
    } catch (error) {
        console.warn("⚠️ Could not fetch API key from backend, using fallback");
    }
    apiKeyReady = true;
}

// Initialize API key immediately
const apiKeyPromise = initializeAPIKey();

let videoList = null; // Will be set in DOMContentLoaded

// Pagination variables
let allFetchedVideos = [];
let currentCategory = "shows";
let currentPage = 1;
let videosPerPage = 30;
let totalPages = 1;
let nextPageToken = null;
let currentSearchQuery = null;

// Tracking for blocked content statistics
let totalBlockedCount = 0;
let totalAddedCount = 0;

// Age-specific category search queries
const searchQueriesByAge = {
    "2-4": {
        shows: "baby cartoons nursery rhymes toddler songs",
        music: "baby music lullaby kids songs nursery rhymes",
        explore: "baby learning colors shapes numbers",
        cartoons: "baby cartoons cocomelon peppa pig",
        movies: "kids movies animated family films",
        Short: "short videos kids funny cute compilation"
    },
    "5-7": {
        shows: "kids cartoons animated stories adventure",
        music: "kids songs music Disney animated",
        explore: "kids learning alphabet spelling science",
        cartoons: "cartoon shows kids animated adventures",
        movies: "family movies kids animated Disney",
        Short: "short videos funny kids compilation trending"
    },
    "8-12": {
        shows: "kids shows action adventure animated series",
        music: "kids music songs trending popular",
        explore: "kids learning science experiments activities",
        cartoons: "animated series adventure cartoons comedy",
        movies: "kids movies adventure action family films",
        Short: "viral shorts kids funny trending videos"
    }
};
// ===== MOCK VIDEO DATA FOR DEMO/FALLBACK =====
function getMockVideos(query) {
    const mockData = [
        { id: { videoId: "26WnKJi8fgE" }, snippet: { title: "Kids Learning ABC Song", channelTitle: "Kids Channel", thumbnails: { high: { url: "https://i.ytimg.com/vi/26WnKJi8fgE/hqdefault.jpg" } } } },
        { id: { videoId: "fP4J5IjKLxA" }, snippet: { title: "Nursery Rhymes Collection", channelTitle: "Baby Songs", thumbnails: { high: { url: "https://i.ytimg.com/vi/fP4J5IjKLxA/hqdefault.jpg" } } } },
        { id: { videoId: "3NVmkHWYPFQ" }, snippet: { title: "Peppa Pig - Best Episodes", channelTitle: "Peppa Pig Official", thumbnails: { high: { url: "https://i.ytimg.com/vi/3NVmkHWYPFQ/hqdefault.jpg" } } } },
        { id: { videoId: "xT_5oCiGKu8" }, snippet: { title: "Disney Songs for Kids", channelTitle: "Disney Kids", thumbnails: { high: { url: "https://i.ytimg.com/vi/xT_5oCiGKu8/hqdefault.jpg" } } } },
        { id: { videoId: "5OMN8h94G-E" }, snippet: { title: "Amazing Science Experiments", channelTitle: "Science Channel", thumbnails: { high: { url: "https://i.ytimg.com/vi/5OMN8h94G-E/hqdefault.jpg" } } } },
        { id: { videoId: "H-MzMeKBLrE" }, snippet: { title: "Learn Numbers 1-10", channelTitle: "Learning Hub", thumbnails: { high: { url: "https://i.ytimg.com/vi/H-MzMeKBLrE/hqdefault.jpg" } } } },
        { id: { videoId: "pSnzNDVmNGc" }, snippet: { title: "Cocomelon Nursery Rhymes", channelTitle: "Cocomelon", thumbnails: { high: { url: "https://i.ytimg.com/vi/pSnzNDVmNGc/hqdefault.jpg" } } } },
        { id: { videoId: "nJYChKM2DwM" }, snippet: { title: "Adventure Time Episodes", channelTitle: "Cartoon Network", thumbnails: { high: { url: "https://i.ytimg.com/vi/nJYChKM2DwM/hqdefault.jpg" } } } },
        { id: { videoId: "x7YPOB4T5xU" }, snippet: { title: "Tom & Jerry Classics", channelTitle: "Warner Bros", thumbnails: { high: { url: "https://i.ytimg.com/vi/x7YPOB4T5xU/hqdefault.jpg" } } } },
        { id: { videoId: "RSHhK5A-V1c" }, snippet: { title: "Frozen Sing Along", channelTitle: "Disney", thumbnails: { high: { url: "https://i.ytimg.com/vi/RSHhK5A-V1c/hqdefault.jpg" } } } },
        { id: { videoId: "yH-5OMBaJ4k" }, snippet: { title: "The Lion King Songs", channelTitle: "Disney Music", thumbnails: { high: { url: "https://i.ytimg.com/vi/yH-5OMBaJ4k/hqdefault.jpg" } } } },
        { id: { videoId: "e-IWRmpefzE" }, snippet: { title: "Space Exploration for Kids", channelTitle: "Nasa Kids", thumbnails: { high: { url: "https://i.ytimg.com/vi/e-IWRmpefzE/hqdefault.jpg" } } } },
        { id: { videoId: "w_Gw-k0fPBQ" }, snippet: { title: "Animals in the Zoo", channelTitle: "Nature Kids", thumbnails: { high: { url: "https://i.ytimg.com/vi/w_Gw-k0fPBQ/hqdefault.jpg" } } } },
        { id: { videoId: "aTIkOkMm0O0" }, snippet: { title: "How to Draw Animals", channelTitle: "Art Channel", thumbnails: { high: { url: "https://i.ytimg.com/vi/aTIkOkMm0O0/hqdefault.jpg" } } } },
        { id: { videoId: "8Cw3aLIWE8w" }, snippet: { title: "Piano Lessons for Beginners", channelTitle: "Music School", thumbnails: { high: { url: "https://i.ytimg.com/vi/8Cw3aLIWE8w/hqdefault.jpg" } } } },
        { id: { videoId: "MxWJ6Fh-qLo" }, snippet: { title: "Ocean Animals Discovery", channelTitle: "Discovery Kids", thumbnails: { high: { url: "https://i.ytimg.com/vi/MxWJ6Fh-qLo/hqdefault.jpg" } } } },
        { id: { videoId: "h0gu8G7PZaE" }, snippet: { title: "Building with Blocks", channelTitle: "STEM Learning", thumbnails: { high: { url: "https://i.ytimg.com/vi/h0gu8G7PZaE/hqdefault.jpg" } } } },
        { id: { videoId: "YXf6EkH_8n8" }, snippet: { title: "Soccer Training for Kids", channelTitle: "Sports Academy", thumbnails: { high: { url: "https://i.ytimg.com/vi/YXf6EkH_8n8/hqdefault.jpg" } } } },
        { id: { videoId: "iGjdJwZfKOo" }, snippet: { title: "Yoga for Children", channelTitle: "Kids Fitness", thumbnails: { high: { url: "https://i.ytimg.com/vi/iGjdJwZfKOo/hqdefault.jpg" } } } },
        { id: { videoId: "LKRJvJM6MXs" }, snippet: { title: "Cooking Easy Recipes", channelTitle: "Kids Kitchen", thumbnails: { high: { url: "https://i.ytimg.com/vi/LKRJvJM6MXs/hqdefault.jpg" } } } },
        { id: { videoId: "bfDfYd3-1iI" }, snippet: { title: "Weather Patterns Explained", channelTitle: "Science Class", thumbnails: { high: { url: "https://i.ytimg.com/vi/bfDfYd3-1iI/hqdefault.jpg" } } } },
        { id: { videoId: "7iKvSPSG-io" }, snippet: { title: "Dinosaur Documentary", channelTitle: "History Channel", thumbnails: { high: { url: "https://i.ytimg.com/vi/7iKvSPSG-io/hqdefault.jpg" } } } },
        { id: { videoId: "4rFKddzXX_8" }, snippet: { title: "Magic Tricks Tutorial", channelTitle: "Fun Magic", thumbnails: { high: { url: "https://i.ytimg.com/vi/4rFKddzXX_8/hqdefault.jpg" } } } },
        { id: { videoId: "pFvNlu-8B6I" }, snippet: { title: "Superhero Adventure", channelTitle: "Action Kids", thumbnails: { high: { url: "https://i.ytimg.com/vi/pFvNlu-8B6I/hqdefault.jpg" } } } },
        { id: { videoId: "hKlcLLdYbCQ" }, snippet: { title: "Photography for Kids", channelTitle: "Creative Arts", thumbnails: { high: { url: "https://i.ytimg.com/vi/hKlcLLdYbCQ/hqdefault.jpg" } } } },
        { id: { videoId: "V5bJ_sCj6Cs" }, snippet: { title: "Underwater World Tour", channelTitle: "Ocean Discovery", thumbnails: { high: { url: "https://i.ytimg.com/vi/V5bJ_sCj6Cs/hqdefault.jpg" } } } },
        { id: { videoId: "J3QHYYkKhGE" }, snippet: { title: "Time Management Tips", channelTitle: "Kids Academy", thumbnails: { high: { url: "https://i.ytimg.com/vi/J3QHYYkKhGE/hqdefault.jpg" } } } },
        { id: { videoId: "CRf0J_s-D3Y" }, snippet: { title: "Superhero Training", channelTitle: "Action Central", thumbnails: { high: { url: "https://i.ytimg.com/vi/CRf0J_s-D3Y/hqdefault.jpg" } } } },
        { id: { videoId: "vbHpFuMkBZM" }, snippet: { title: "Virtual Museum Tour", channelTitle: "Education Kids", thumbnails: { high: { url: "https://i.ytimg.com/vi/vbHpFuMkBZM/hqdefault.jpg" } } } },
        { id: { videoId: "3t1fXHnWPVM" }, snippet: { title: "Coding for Kids", channelTitle: "Tech Academy", thumbnails: { high: { url: "https://i.ytimg.com/vi/3t1fXHnWPVM/hqdefault.jpg" } } } }
    ];
    
    return mockData;
}

// Get current age group or default
function getCurrentAgeGroup() {
    return localStorage.getItem("kidAgeGroup") || "2-4";
}

// Get search queries for current age
function getSearchQueries() {
    const age = getCurrentAgeGroup();
    return searchQueriesByAge[age] || searchQueriesByAge["2-4"];
}

// ===== CONTENT FILTERING - BLOCKED KEYWORDS =====
const blockedKeywords = [
    "sex", "sexy", "xxx", "porn", "pornography", "adult", "18+", "21+", "nude", "naked",
    "nudity", "boobs", "breast", "ass", "butt", "buttocks", "penis", "dick", "pussy", "vagina",
    "orgasm", "masturbat", "penetrat", "intercourse", "sexual", "erotic", "hot girl",
    "hot women", "girl hot", "beautiful girls", "hot chick", "strip", "striptease",
    "bikini", "swimsuit model", "swimwear", "lingerie", "underwear model",
    "cam", "camgirl", "webcam", "onlyfans", "patreon exclusive", "leaked",
    "bomb", "bombing", "explosive", "bomb threat", "explode", "shooting", "gun violence",
    "massacre", "terrorist", "terrorism", "kill", "murder", "suicide", "hang", "drown",
    "self harm", "self-harm", "cutting", "cut yourself", "torture", "brutal", "gore",
    "graphic violence", "blood bath", "violence", "dead body", "corpse", "execution",
    "cocaine", "heroin", "meth", "methamphetamine", "crystal meth", "drug dealing",
    "drug abuse", "weed", "smoking", "marijuana", "ecstasy", "mdma", "lsd", "acid",
    "psychedelic", "hallucinogen", "crack", "substance abuse", "overdose",
    "fuck", "shit", "bitch", "asshole", "bastard", "crap", "damn", "hell", "piss",
    "nigga", "nigger", "faggot", "fag", "retard", "slut", "whore",
    "racism", "racist", "hate speech", "homophobic", "transphobic", "sexist",
    "child abuse", "child exploitation", "child trafficking", "human trafficking",
    "grooming", "groom", "pedophile", "pedo", "child sexual", "child porn",
    "underage", "minor", "teen sex", "jailbait", "twerk", "twerking", "adult film",
    "stripper", "lap dance", "fetish", "bdsm", "bondage", "kink", "incest", "bestiality",
    "rape", "assault"
];

// ===== ENHANCED CONTENT FILTER FUNCTION =====
function isContentAppropriate(title, channelName) {
    const lowerTitle = title.toLowerCase();
    const lowerChannel = channelName.toLowerCase();
    const combinedText = lowerTitle + " " + lowerChannel;
    
    // Check 1: Block any video with blocked keywords
    for (let keyword of blockedKeywords) {
        if (combinedText.includes(keyword)) {
            console.log(`❌ BLOCKED: "${title}" - Keyword: "${keyword}"`);
            return false;
        }
    }
    
    // Check 2: Regex patterns for common tricks
    const dangerousPatterns = [
        /\b(xxx|porn|adult|18\+|21\+)\b/gi,
        /\b(sex|sexy|sexual|erotic)\b/gi,
        /\b(nude|naked|nudity)\b/gi,
        /\b(bomb|explosive|shooting|kill|murder|suicide)\b/gi,
        /\b(drug|cocaine|heroin|meth|weed|marijuana)\b/gi,
        /\b(fuck|shit|bitch|asshole)\b/gi,
        /girl.*hot|hot.*girl|beautiful.*girl/gi,
        /teen.*18|barely.*18|year.*old.*girl/gi,
        /strip|twerk|bikini|swimsuit.*model/gi
    ];
    
    for (let pattern of dangerousPatterns) {
        if (pattern.test(combinedText)) {
            console.log(`❌ BLOCKED: "${title}" - Pattern match`);
            return false;
        }
    }
    
    // Check 3: Age detection
    const agePattern = /(\d{1,3}.*year.*old|age.*\d{1,3})/gi;
    if (agePattern.test(combinedText)) {
        const ageMatch = combinedText.match(/\d{1,3}/);
        if (ageMatch && parseInt(ageMatch[0]) > 12) {
            console.log(`❌ BLOCKED: "${title}" - Age mention: ${ageMatch[0]}`);
            return false;
        }
    }
    
    // Check 4: Length check - very long titles are spam
    if (title.length > 150) {
        console.log(`❌ BLOCKED: "${title}" - Title too long (spam)`);
        return false;
    }
    
    // Check 5: Excessive caps or punctuation
    const capsCount = (title.match(/[A-Z]/g) || []).length;
    const punctCount = (title.match(/[!?]/g) || []).length;
    
    if (capsCount > title.length * 0.7 && punctCount > 2) {
        console.log(`❌ BLOCKED: "${title}" - Excessive caps/punctuation`);
        return false;
    }
    
    return true;
}

// ===== SIDEBAR MANAGEMENT =====
const menuBtn = document.getElementById("menuBtn");
const closeMenuBtn = document.getElementById("closeMenuBtn");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

if (menuBtn) {
    menuBtn.addEventListener("click", () => {
        sidebar.classList.remove("hidden");
        sidebarOverlay.classList.add("shown");
    });
}

if (closeMenuBtn) {
    closeMenuBtn.addEventListener("click", () => {
        sidebar.classList.add("hidden");
        sidebarOverlay.classList.remove("shown");
    });
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", () => {
        sidebar.classList.add("hidden");
        sidebarOverlay.classList.remove("shown");
    });
}

// ===== CATEGORY BUTTONS (SIDEBAR) =====
document.querySelectorAll(".sidebar-nav .category-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".sidebar-nav .category-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        const category = btn.dataset.cat;
        document.querySelectorAll(".pill-btn").forEach(p => p.classList.remove("active"));
        document.querySelector(`.pill-btn[data-cat="${category}"]`)?.classList.add("active");
        
        currentPage = 1;
        currentSearchQuery = null;
        allFetchedVideos = [];
        nextPageToken = null;
        loadCategory(category);
        
        sidebar.classList.add("hidden");
        sidebarOverlay.classList.remove("shown");
    });
});

// ===== CATEGORY PILLS (TOP) =====
document.querySelectorAll(".pill-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".pill-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        const category = btn.dataset.cat;
        document.querySelectorAll(".sidebar-nav .category-btn").forEach(sb => sb.classList.remove("active"));
        document.querySelector(`.sidebar-nav .category-btn[data-cat="${category}"]`)?.classList.add("active");
        
        currentPage = 1;
        currentSearchQuery = null;
        allFetchedVideos = [];
        nextPageToken = null;
        loadCategory(category);
    });
});

// ===== LOAD VIDEOS FROM YOUTUBE API =====
async function loadCategory(cat, searchQuery = null) {
    try {
        console.log("=== LOADING CATEGORY ===", cat, "Search:", searchQuery);
        
        let query;
        if (searchQuery) {
            query = searchQuery;
            currentSearchQuery = searchQuery;
        } else {
            const queries = getSearchQueries();
            query = queries[cat] || queries.shows;
            currentCategory = cat;
        }
        
        console.log("Age group:", getCurrentAgeGroup());
        console.log("Search query:", query);
        
        const pageTitle = document.getElementById("pageTitle");
        if (pageTitle) {
            pageTitle.innerText = searchQuery ? "Search Results" : cat.charAt(0).toUpperCase() + cat.slice(1);
        }
        
        if (!videoList) {
            console.error("Video list element not found");
            return;
        }
        
        videoList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; font-size: 18px; color: #666;">Loading videos...</div>';

        // Try backend API first, fall back to direct YouTube API if unavailable
        let url, res, data = null;
        
        try {
            // First try: Use backend server to fetch videos (more reliable with rotation/pooling)
            console.log("Attempting backend YouTube search...");
            url = `http://localhost:5000/api/videos?q=${encodeURIComponent(query)}&maxResults=30`;
            res = await fetch(url);
            
            if (!res.ok) {
                throw new Error(`Backend API Error: ${res.status}`);
            }
            
            data = await res.json();
            console.log("✅ Backend API successful");

            // If backend returns the sample fallback because the server YOUTUBE_API_KEY
            // is not configured, prefer trying the direct client-side YouTube API
            // when a client API key is available. Do this before proceeding with
            // backend-provided sample data so we attempt live results whenever possible.
            if (data && data.source === 'sample' && typeof data.message === 'string' && data.message.toLowerCase().includes('youtube api not configured')) {
                if (API_KEY && API_KEY !== 'AIzaSyDJIlSi1W1NwTDXR5buu1-MSwmpd-7a8BI') {
                    console.warn('⚠️ Backend returned sample fallback; attempting direct YouTube Data v3 using client API key');
                    try {
                        url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=30&q=${encodeURIComponent(query)}&key=${API_KEY}&safeSearch=strict&regionCode=US&order=relevance`;
                        console.log("Fetching direct YouTube API as fallback...");
                        const fallbackRes = await fetch(url);

                        if (!fallbackRes.ok) {
                            throw new Error(`YouTube API Error: ${fallbackRes.status} - ${fallbackRes.statusText}`);
                        }

                        const fallbackData = await fallbackRes.json();
                        if (fallbackData.error) {
                            throw new Error(fallbackData.error.message);
                        }

                        data = fallbackData;
                        console.log("✅ Direct YouTube API successful after backend fallback");
                    } catch (fallbackError) {
                        console.error('❌ Direct YouTube fallback failed:', fallbackError);
                        console.warn('⚠️ Falling back to backend sample data');
                    }
                } else {
                    console.warn('⚠️ Backend returned sample fallback and no valid client API key available');
                }
            }
        } catch (backendError) {
            console.warn("⚠️ Backend unavailable, trying direct YouTube API...", backendError.message);
            
            try {
                // Fallback: Direct YouTube API call
                url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=30&q=${encodeURIComponent(query)}&key=${API_KEY}&safeSearch=strict&regionCode=US&order=relevance`;
                console.log("Fetching direct YouTube API...");
                res = await fetch(url);
                
                if (!res.ok) {
                    throw new Error(`YouTube API Error: ${res.status} - ${res.statusText}`);
                }

                data = await res.json();
                
                if (data.error) {
                    throw new Error(data.error.message);
                }
                console.log("✅ Direct YouTube API successful");
            } catch (fetchError) {
                console.error("❌ YouTube API Error:", fetchError);
                
                // Use mock data as final fallback
                console.log("⚠️ Using demo data due to API restrictions...");
                data = { items: getMockVideos(query) };
            }
        }
        
        // Continue processing with either real data or mock data
        // Handle backend response format (has 'videos' instead of 'items')
        if (data && data.videos && !data.items) {
            console.log("📺 Converting backend response format...");
            data.items = data.videos.map(v => ({
                id: { videoId: v.id },
                snippet: {
                    title: v.title,
                    channelTitle: v.channel,
                    thumbnails: { high: { url: v.thumbnail } }
                }
            }));
        }
        
        if (!data || !data.items || data.items.length === 0) {
            console.log("📺 No data loaded, showing demo videos");
            data = { items: getMockVideos(query) };
        }
        
        console.log("✅ API Response received:", data.items?.length || 0, "videos");
        console.log("📺 First video sample:", data.items[0]);

        if (data.items.length === 0) {
            videoList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">No videos found for this category.</div>';
            updatePagination();
            return;
        }

        // Store next page token for lazy loading (may not exist for mock data)
        nextPageToken = data.nextPageToken || null;
        
        // RESET VIDEOS ARRAY FOR NEW CATEGORY
        allFetchedVideos = [];
        currentPage = 1;
        
        // Reset statistics
        totalBlockedCount = 0;
        totalAddedCount = 0;
        
        // Filter videos for appropriate content
        let blockedCount = 0;
        data.items.forEach((item) => {
            const videoId = item.id.videoId;
            const title = item.snippet.title;
            const channel = item.snippet.channelTitle;
            const thumbnail = item.snippet.thumbnails.high.url;

            console.log(`📺 Video found - ID: ${videoId} | Title: ${title}`);

            if (isContentAppropriate(title, channel)) {
                allFetchedVideos.push({
                    id: videoId,
                    title: title,
                    channel: channel,
                    thumbnail: thumbnail
                });
                totalAddedCount++;
                console.log(`✅ Video approved and added`);
            } else {
                blockedCount++;
                totalBlockedCount++;
                console.log(`🚫 Video blocked by content filter`);
            }
        });

        console.log(`✅ Added ${totalAddedCount} videos | ❌ Blocked ${blockedCount} inappropriate videos`);

        // Render current page
        console.log("📺 About to render", allFetchedVideos.length, "videos to page");
        renderVideos();
        updatePagination();
        
        console.log("✅ Videos loaded successfully!");
        
    } catch (error) {
        console.error("❌ Error loading videos:", error);
        if (videoList) {
            videoList.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: red;">⚠️ Error: ${error.message}</div>`;
        }
    }
}

// ===== RENDER VIDEOS FOR CURRENT PAGE =====
function renderVideos() {
    if (!videoList) {
        console.error("❌ videoList element is null!");
        return;
    }
    
    const startIdx = (currentPage - 1) * videosPerPage;
    const endIdx = startIdx + videosPerPage;
    const paginatedVideos = allFetchedVideos.slice(startIdx, endIdx);

    videoList.innerHTML = "";

    if (paginatedVideos.length === 0) {
        videoList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">No videos to display.</div>';
        return;
    }

    paginatedVideos.forEach((videoData) => {
        const videoCard = document.createElement("div");
        videoCard.className = "video-card";
        videoCard.style.cursor = "pointer";
        videoCard.dataset.videoId = videoData.id;
        
        // Check if video is already in favorites
        const currentUser = localStorage.getItem("currentUser");
        let isFavorited = false;
        if (currentUser) {
            const user = JSON.parse(currentUser);
            const favorites = JSON.parse(localStorage.getItem(`favorites_${user.uid}`) || "[]");
            isFavorited = favorites.some(fav => fav.id === videoData.id);
        }
        
        videoCard.innerHTML = `
            <div class="thumbnail" style="position: relative;">
                <img src="${videoData.thumbnail}" alt="${videoData.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">
                <div class="play-overlay">▶</div>
                <button class="favorite-btn" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); border: none; color: ${isFavorited ? '#FF6B35' : 'white'}; font-size: 20px; padding: 8px 12px; border-radius: 50%; cursor: pointer; transition: all 0.3s ease; z-index: 10;" title="Add to Favorites">
                    ${isFavorited ? '❤️' : '🤍'}
                </button>
            </div>
            <div class="video-info">
                <h4>${videoData.title}</h4>
                <p>${videoData.channel}</p>
            </div>
        `;
        
        // Add click event listener to favorite button
        const favoriteBtn = videoCard.querySelector(".favorite-btn");
        favoriteBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent video from playing
            toggleFavorite(videoData, favoriteBtn);
        });
        
        // Add click event listener to play video
        videoCard.addEventListener("click", () => {
            playVideo(videoData.id, videoData.title, videoData.channel);
        });
        
        videoList.appendChild(videoCard);
    });
}

// ===== UPDATE PAGINATION CONTROLS =====
function updatePagination() {
    totalPages = Math.ceil(allFetchedVideos.length / videosPerPage);
    
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const pageNumbers = document.getElementById("pageNumbers");
    
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
    }
    
    if (pageNumbers) {
        pageNumbers.innerHTML = "";
        
        const maxPages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
        let endPage = Math.min(totalPages, startPage + maxPages - 1);
        
        if (endPage - startPage < maxPages - 1) {
            startPage = Math.max(1, endPage - maxPages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement("button");
            pageBtn.textContent = i;
            pageBtn.className = i === currentPage ? "active" : "";
            pageBtn.onclick = () => goToPage(i);
            pageNumbers.appendChild(pageBtn);
        }
    }
}

// ===== PAGINATION FUNCTIONS =====
function goToPage(pageNum) {
    if (pageNum < 1 || pageNum > totalPages) return;
    currentPage = pageNum;
    renderVideos();
    updatePagination();
    window.scrollTo(0, 0);
}

function nextPage() {
    goToPage(currentPage + 1);
}

function prevPage() {
    goToPage(currentPage - 1);
}

// ===== PLAY VIDEO - IFRAME PLAYER WITH LOGO =====
function playVideo(videoId, title, channel) {
    console.log("🎬 Playing video in iframe:", { videoId, title, channel });
    
    const playerModal = document.getElementById("playerModal");
    const playerContainer = document.getElementById("playerContainer");
    const playerTitle = document.getElementById("playerTitle");
    const playerChannel = document.getElementById("playerChannel");
    
    if (!playerModal || !playerContainer) {
        console.error("❌ Player elements not found");
        return;
    }
    
    // Update metadata
    if (playerTitle) playerTitle.innerText = title || "Video";
    if (playerChannel) playerChannel.innerText = `Channel: ${channel || "Unknown"}`;
    
    // Clear container
    playerContainer.innerHTML = "";
    
    // Create wrapper with relative positioning for logo overlay
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
        background: #000;
    `;
    
    // Create iframe
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=0&rel=0&fs=1&playsinline=1&cc_load_policy=1&iv_load_policy=3`;
    iframe.title = title || "Video";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen");
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("sandbox", "allow-same-origin allow-scripts allow-popups allow-presentation");
    
    // Create logo overlay (top-left corner)
    const logoOverlay = document.createElement("div");
    logoOverlay.style.cssText = `
        position: absolute;
        top: 15px;
        left: 15px;
        z-index: 100;
        background: rgba(255, 107, 53, 0.9);
        padding: 8px 12px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    `;
    
    // Logo image
    const logoImg = document.createElement("img");
    logoImg.src = "Assest/ic_logo.png";
    logoImg.style.cssText = `
        width: 30px;
        height: 30px;
        object-fit: contain;
    `;
    
    // Logo text
    const logoText = document.createElement("span");
    logoText.innerText = "KiddoTubes";
    logoText.style.cssText = `
        color: white;
        font-weight: bold;
        font-size: 14px;
        white-space: nowrap;
    `;
    
    logoOverlay.appendChild(logoImg);
    logoOverlay.appendChild(logoText);
    
    wrapper.appendChild(iframe);
    wrapper.appendChild(logoOverlay);
    playerContainer.appendChild(wrapper);
    
    console.log("✅ Video player loaded - iframe with KiddoTubes logo");
    
    // Show modal
    playerModal.classList.remove("hidden");
}

// ===== SEARCH VALIDATION & HANDLING =====
function handleSearch() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;
    
    const query = searchInput.value.trim().toLowerCase();
    
    if (!query) {
        alert("Please enter a search query");
        return;
    }
    
    // Check if search contains blocked keywords
    const containsBlockedKeyword = blockedKeywords.some(keyword => {
        return query.includes(keyword.toLowerCase());
    });
    
    if (containsBlockedKeyword) {
        showErrorPopup("⚠️ Content Not Allowed", "This search contains inappropriate content. Please search for child-friendly videos only.");
        searchInput.value = "";
        return;
    }
    
    // Valid search - load results
    console.log("🔍 Searching for:", query);
    loadCategory("shows", query);
    searchInput.value = "";
}

// Show error popup for blocked content
function showErrorPopup(title, message) {
    let errorModal = document.getElementById("errorModal");
    
    // Create error modal if it doesn't exist
    if (!errorModal) {
        errorModal = document.createElement("div");
        errorModal.id = "errorModal";
        errorModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 5000;
        `;
        
        const popup = document.createElement("div");
        popup.style.cssText = `
            background: white;
            border-radius: 16px;
            padding: 30px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease;
        `;
        
        const titleEl = document.createElement("h2");
        titleEl.style.cssText = `
            color: #FF6B35;
            margin: 0 0 15px 0;
            font-size: 24px;
        `;
        titleEl.textContent = title;
        
        const messageEl = document.createElement("p");
        messageEl.style.cssText = `
            color: #666;
            margin: 0 0 20px 0;
            font-size: 16px;
            line-height: 1.5;
        `;
        messageEl.textContent = message;
        
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "OK, Got It!";
        closeBtn.style.cssText = `
            background: #FF6B35;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
        `;
        closeBtn.addEventListener("mouseover", () => {
            closeBtn.style.background = "#E85A24";
            closeBtn.style.transform = "scale(1.05)";
        });
        closeBtn.addEventListener("mouseout", () => {
            closeBtn.style.background = "#FF6B35";
            closeBtn.style.transform = "scale(1)";
        });
        closeBtn.addEventListener("click", () => {
            errorModal.style.display = "none";
        });
        
        popup.appendChild(titleEl);
        popup.appendChild(messageEl);
        popup.appendChild(closeBtn);
        errorModal.appendChild(popup);
        document.body.appendChild(errorModal);
    }
    
    // Show the modal
    errorModal.style.display = "flex";
    
    // Auto-close after 4 seconds
    setTimeout(() => {
        if (errorModal) {
            errorModal.style.display = "none";
        }
    }, 4000);
}

// Helper function to show thumbnail player fallback
function showThumbnailPlayer(container, videoId, youtubeUrl, title) {
    container.innerHTML = "";
    container.style.cssText = `
        width: 100%;
        height: 100%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        cursor: pointer;
        background: #000;
    `;
    
    // Thumbnail
    const thumbnail = document.createElement("img");
    thumbnail.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    thumbnail.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        position: absolute;
        top: 0;
        left: 0;
    `;
    
    thumbnail.onerror = () => {
        thumbnail.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    };
    
    // Overlay
    const overlay = document.createElement("div");
    overlay.style.cssText = `
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.3s;
    `;
    
    // Play button
    const playBtn = document.createElement("div");
    playBtn.style.cssText = `
        width: 80px;
        height: 80px;
        background: rgba(255, 0, 0, 0.85);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 40px;
        color: white;
        transition: all 0.3s;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
    `;
    playBtn.innerHTML = "▶";
    
    overlay.appendChild(playBtn);
    container.appendChild(thumbnail);
    container.appendChild(overlay);
    
    // Hover effects
    container.addEventListener("mouseover", () => {
        overlay.style.background = "rgba(0, 0, 0, 0.4)";
        playBtn.style.background = "rgba(255, 0, 0, 1)";
        playBtn.style.transform = "scale(1.15)";
    });
    
    container.addEventListener("mouseout", () => {
        overlay.style.background = "rgba(0, 0, 0, 0.2)";
        playBtn.style.background = "rgba(255, 0, 0, 0.85)";
        playBtn.style.transform = "scale(1)";
    });
    
    // Click to open YouTube
    container.addEventListener("click", () => {
        window.open(youtubeUrl, "_blank");
    });
}

// ===== PAGE INITIALIZATION =====
document.addEventListener("DOMContentLoaded", async () => {
    console.log("🎬 DOM Content Loaded - KiddoTubes Starting");
    await apiKeyPromise;
    
    // Initialize videoList now that DOM is ready
    videoList = document.getElementById("videoList");
    console.log("✅ Video list element initialized:", !!videoList);
    
    // Set default age if none exists
    if (!localStorage.getItem("kidAgeGroup")) {
        localStorage.setItem("kidAgeGroup", "2-4");
    }
    
    console.log("✅ Current age group:", localStorage.getItem("kidAgeGroup"));
    
    // ===== PAGINATION EVENT LISTENERS =====
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    
    if (prevBtn) {
        prevBtn.addEventListener("click", prevPage);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener("click", nextPage);
    }
    
    // ===== PLAYER MODAL CLOSE BUTTON =====
    const playerModal = document.getElementById("playerModal");
    const closePlayerBtn = document.getElementById("closePlayer");
    
    if (closePlayerBtn && playerModal) {
        closePlayerBtn.addEventListener("click", () => {
            playerModal.classList.add("hidden");
            document.getElementById("playerContainer").innerHTML = "";
        });
    }
    
    if (playerModal) {
        playerModal.addEventListener("click", (e) => {
            if (e.target === playerModal) {
                playerModal.classList.add("hidden");
                document.getElementById("playerContainer").innerHTML = "";
            }
        });
    }
    
    // ===== PROFILE MODAL =====
    const profileBtn = document.getElementById("profileBtn");
    const profileModal = document.getElementById("profileModal");
    const profileContent = document.getElementById("profileContent");
    const closeProfileModal = document.getElementById("closeProfileModal");
    const loginModal = document.getElementById("loginModal");
    
    console.log("🔍 Profile elements check - Btn:", !!profileBtn, "Modal:", !!profileModal, "Close:", !!closeProfileModal);
    
    if (profileBtn && profileModal) {
        profileBtn.addEventListener("click", () => {
            console.log("✅ Profile button clicked");
            
            // Check if user is logged in
            const currentUser = localStorage.getItem("currentUser");
            
            if (currentUser) {
                // User is logged in - show profile modal
                profileModal.classList.remove("hidden");
                if (profileContent) {
                    profileContent.classList.remove("hidden");
                }
            } else {
                // User is NOT logged in - show login modal
                if (loginModal) {
                    loginModal.classList.remove("hidden");
                    console.log("📝 Opening login modal");
                }
            }
        });
    } else {
        console.warn("⚠️ Profile button or modal not found");
    }
    
    if (closeProfileModal && profileModal) {
        closeProfileModal.addEventListener("click", () => {
            profileModal.classList.add("hidden");
            if (profileContent) {
                profileContent.classList.add("hidden");
            }
        });
    }
    
    if (profileModal) {
        profileModal.addEventListener("click", (e) => {
            if (e.target === profileModal) {
                profileModal.classList.add("hidden");
                if (profileContent) {
                    profileContent.classList.add("hidden");
                }
            }
        });
    }

    // ===== LOGIN FORM SUBMISSION =====
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const email = document.getElementById("loginEmail").value.trim();
            const password = document.getElementById("loginPassword").value;
            const loginError = document.getElementById("loginError");
            
            if (!email || !password) {
                if (loginError) {
                    loginError.style.display = "block";
                    loginError.textContent = "Please enter email and password";
                }
                return;
            }
            
            console.log("🔐 Attempting login with:", email);
            
            // Call Firebase login function
            await loginEmail(email, password);
            
            // If login successful, close modal
            const currentUser = localStorage.getItem("currentUser");
            if (currentUser) {
                console.log("✅ Login successful!");
                if (loginModal) {
                    loginModal.classList.add("hidden");
                }
                if (profileModal) {
                    profileModal.classList.remove("hidden");
                    if (profileContent) {
                        profileContent.classList.remove("hidden");
                    }
                }
                // Clear form
                document.getElementById("loginEmail").value = "";
                document.getElementById("loginPassword").value = "";
                if (loginError) {
                    loginError.style.display = "none";
                }
            } else {
                // Show error
                if (loginError) {
                    loginError.style.display = "block";
                    loginError.textContent = "Login failed. Please check your email and password.";
                }
            }
        });
    }

    // ===== REGISTER FORM SUBMISSION =====
    const registerForm = document.getElementById("registerForm");
    const registerModal = document.getElementById("registerModal");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const name = document.getElementById("registerName").value.trim();
            const email = document.getElementById("registerEmail").value.trim();
            const password = document.getElementById("registerPassword").value;
            const confirm = document.getElementById("registerConfirm").value;
            const agree = document.getElementById("agreeTerms").checked;
            const registerError = document.getElementById("registerError");
            
            // Validation
            if (!name || !email || !password || !confirm) {
                if (registerError) {
                    registerError.style.display = "block";
                    registerError.textContent = "Please fill all fields";
                }
                return;
            }
            
            if (password !== confirm) {
                if (registerError) {
                    registerError.style.display = "block";
                    registerError.textContent = "Passwords don't match";
                }
                return;
            }
            
            if (password.length < 6) {
                if (registerError) {
                    registerError.style.display = "block";
                    registerError.textContent = "Password must be at least 6 characters";
                }
                return;
            }
            
            if (!agree) {
                if (registerError) {
                    registerError.style.display = "block";
                    registerError.textContent = "Please agree to terms and conditions";
                }
                return;
            }
            
            console.log("📝 Attempting registration with:", email);
            
            // Call Firebase signup function
            await signUpEmail(email, password);
            
            // If signup successful
            const currentUser = localStorage.getItem("currentUser");
            if (currentUser) {
                console.log("✅ Registration successful!");
                if (registerModal) {
                    registerModal.classList.add("hidden");
                }
                if (profileModal) {
                    profileModal.classList.remove("hidden");
                    if (profileContent) {
                        profileContent.classList.remove("hidden");
                    }
                }
                // Clear form
                registerForm.reset();
                if (registerError) {
                    registerError.style.display = "none";
                }
            } else {
                // Show error
                if (registerError) {
                    registerError.style.display = "block";
                    registerError.textContent = "Registration failed. Please try again.";
                }
            }
        });
    }

    // ===== GOOGLE LOGIN BUTTONS =====
    const googleLoginBtn = document.getElementById("googleLoginBtn");
    const googleRegisterBtn = document.getElementById("googleRegisterBtn");
    
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            console.log("🔵 Google Login clicked");
            await googleLogin();
            
            // Check if login successful
            const currentUser = localStorage.getItem("currentUser");
            if (currentUser) {
                if (loginModal) loginModal.classList.add("hidden");
                if (profileModal) {
                    profileModal.classList.remove("hidden");
                    if (profileContent) profileContent.classList.remove("hidden");
                }
            }
        });
    }
    
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            console.log("🔵 Google Register clicked");
            await googleLogin();
            
            // Check if signup successful
            const currentUser = localStorage.getItem("currentUser");
            if (currentUser) {
                if (registerModal) registerModal.classList.add("hidden");
                if (profileModal) {
                    profileModal.classList.remove("hidden");
                    if (profileContent) profileContent.classList.remove("hidden");
                }
            }
        });
    }

    // ===== PHONE LOGIN/REGISTER BUTTONS =====
    const phoneLoginBtn = document.getElementById("phoneLoginBtn");
    const phoneRegisterBtn = document.getElementById("phoneRegisterBtn");
    const phoneAuthModal = document.getElementById("phoneAuthModal");

    if (phoneLoginBtn) {
        phoneLoginBtn.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("📱 Phone Login clicked");
            if (loginModal) loginModal.classList.add("hidden");
            if (phoneAuthModal) phoneAuthModal.classList.remove("hidden");
            resetPhoneAuth();
        });
    }

    if (phoneRegisterBtn) {
        phoneRegisterBtn.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("📱 Phone Register clicked");
            if (registerModal) registerModal.classList.add("hidden");
            if (phoneAuthModal) phoneAuthModal.classList.remove("hidden");
            resetPhoneAuth();
        });
    }

    // ===== PHONE OTP FORM SUBMISSION =====
    const phoneForm = document.getElementById("phoneForm");
    if (phoneForm) {
        phoneForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log("📱 Sending OTP...");
            await sendPhoneOTP();
        });
    }

    // ===== PHONE OTP VERIFICATION =====
    const otpForm = document.getElementById("otpForm");
    if (otpForm) {
        otpForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log("🔐 Verifying OTP...");
            await verifyPhoneOTP();
        });
    }

    // ===== MODAL SWITCH FUNCTIONS =====
    window.switchToRegister = function(e) {
        e.preventDefault();
        if (loginModal) loginModal.classList.add("hidden");
        if (registerModal) registerModal.classList.remove("hidden");
    };
    
    window.switchToLogin = function(e) {
        e.preventDefault();
        if (registerModal) registerModal.classList.add("hidden");
        if (loginModal) loginModal.classList.remove("hidden");
    };
    
    // ===== PARENT MODAL =====
    const parentBtn = document.getElementById("parentBtn");
    const parentModal = document.getElementById("parentModal");
    const closeParentModal = document.getElementById("closeParentModal");
    
    if (parentBtn && parentModal) {
        parentBtn.addEventListener("click", () => {
            parentModal.classList.remove("hidden");
        });
    }
    
    if (closeParentModal && parentModal) {
        closeParentModal.addEventListener("click", () => {
            parentModal.classList.add("hidden");
        });
    }
    
    if (parentModal) {
        parentModal.addEventListener("click", (e) => {
            if (e.target === parentModal) {
                parentModal.classList.add("hidden");
            }
        });
    }
    
    // ===== SEARCH FUNCTIONALITY =====
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener("click", () => {
            handleSearch();
        });
        
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                handleSearch();
            }
        });
    }
    
    // ===== PROFILE SETTINGS SAVE =====
    const saveProfileSettingsBtn = document.getElementById("saveProfileSettingsBtn");
    if (saveProfileSettingsBtn) {
        saveProfileSettingsBtn.addEventListener("click", () => {
            const age = document.getElementById("profileAgeSelect")?.value || "2-4";
            const safeSearch = document.getElementById("safeSearchToggle")?.checked !== false;
            
            localStorage.setItem("kidAgeGroup", age);
            localStorage.setItem("safeSearchEnabled", safeSearch);
            
            console.log("✅ Settings saved - Age:", age, "SafeSearch:", safeSearch);
            
            const saveMsg = document.getElementById("profileSaveMsg");
            if (saveMsg) {
                saveMsg.style.display = "block";
                setTimeout(() => {
                    saveMsg.style.display = "none";
                }, 2000);
            }
            
            loadCategory("shows");
        });
    }

    // ===== LOGOUT BUTTON =====
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            console.log("🚪 Logout clicked");
            logoutUser();
            
            // Close profile modal
            const profileModal = document.getElementById("profileModal");
            if (profileModal) {
                profileModal.classList.add("hidden");
            }
            
            // Clear localStorage
            localStorage.removeItem("currentUser");
            
            // Redirect to age selection
            const agePopup = document.getElementById("agePopup");
            if (agePopup) {
                agePopup.classList.remove("hidden");
            }
            
            console.log("✅ Logged out successfully!");
        });
    }
    
    // ===== AGE POPUP LOGIC =====
    const agePopup = document.getElementById("agePopup");
    const savedAge = localStorage.getItem("kidAgeGroup");

    console.log("📱 Saved age from localStorage:", savedAge);

    if (!savedAge && agePopup) {
        console.log("🎯 No saved age, showing age popup");
        agePopup.classList.remove("hidden");
    } else {
        console.log("🎯 Age found or no popup, loading videos");
        loadCategory("shows");
    }

    // Handle age button clicks
    document.querySelectorAll(".ageBtn").forEach(btn => {
        btn.addEventListener("click", () => {
            const age = btn.dataset.age;
            localStorage.setItem("kidAgeGroup", age);
            if (agePopup) {
                agePopup.classList.add("hidden");
            }
            loadCategory("shows");
            
            document.querySelector(".sidebar-nav .category-btn")?.classList.add("active");
            document.querySelector(".pill-btn")?.classList.add("active");
        });
    });
    
    // ===== AUTH TAB SWITCHING =====
    document.querySelectorAll(".auth-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const tabName = btn.dataset.tab;
            
            document.querySelectorAll(".auth-tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".auth-tab-content").forEach(c => c.classList.remove("active"));
            
            btn.classList.add("active");
            document.getElementById(`${tabName}-tab`)?.classList.add("active");
        });
    });
    
    // ===== PARENT TAB SWITCHING =====
    document.querySelectorAll(".parent-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const tabName = btn.dataset.tab;
            
            document.querySelectorAll(".parent-tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".parent-tab-content").forEach(c => c.classList.remove("active"));
            
            btn.classList.add("active");
            document.getElementById(`${tabName}-tab`)?.classList.add("active");
        });
    });
    
    console.log("✅ App fully initialized!");
});

// ===== AUTHENTICATION FUNCTIONS (STUB IMPLEMENTATIONS) =====

// Login with email and password
async function loginEmail(email, password) {
    try {
        console.log("🔐 Login attempt with:", email);
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            console.error("Login failed:", response.statusText);
            return false;
        }
        
        const data = await response.json();
        if (data.user) {
            localStorage.setItem("currentUser", JSON.stringify(data.user));
            console.log("✅ Login successful!");
            return true;
        }
    } catch (err) {
        console.error("Login error:", err);
        alert("⚠️ Login not yet configured. Please use Google or Phone login.");
    }
    return false;
}

// Sign up with email and password
async function signUpEmail(email, password) {
    try {
        console.log("📝 Signup attempt with:", email);
        const response = await fetch(`${API_BASE}/api/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            console.error("Signup failed:", response.statusText);
            return false;
        }
        
        const data = await response.json();
        if (data.user) {
            localStorage.setItem("currentUser", JSON.stringify(data.user));
            console.log("✅ Signup successful!");
            return true;
        }
    } catch (err) {
        console.error("Signup error:", err);
        alert("⚠️ Signup not yet configured. Please use Google or Phone login.");
    }
    return false;
}

// Google login
async function googleLogin() {
    try {
        console.log("🔵 Google login initiated");
        alert("ℹ️ Google login coming soon!");
        // TODO: Implement Google Firebase authentication
        return false;
    } catch (err) {
        console.error("Google login error:", err);
    }
    return false;
}

// Logout user
function logoutUser() {
    try {
        console.log("🚪 Logging out...");
        localStorage.removeItem("currentUser");
        console.log("✅ Logged out!");
        return true;
    } catch (err) {
        console.error("Logout error:", err);
    }
    return false;
}

// Send OTP to phone
async function sendPhoneOTP() {
    try {
        const phoneInput = document.getElementById("phoneInput");
        if (!phoneInput || !phoneInput.value) {
            alert("Please enter a phone number");
            return false;
        }
        
        console.log("📱 Sending OTP to:", phoneInput.value);
        alert("ℹ️ Phone OTP coming soon!");
        // TODO: Implement phone authentication
        return false;
    } catch (err) {
        console.error("Send OTP error:", err);
    }
    return false;
}

// Verify OTP
async function verifyPhoneOTP() {
    try {
        const otpInput = document.getElementById("otpInput");
        if (!otpInput || !otpInput.value) {
            alert("Please enter OTP");
            return false;
        }
        
        console.log("🔐 Verifying OTP:", otpInput.value);
        alert("ℹ️ Phone OTP verification coming soon!");
        // TODO: Implement phone authentication
        return false;
    } catch (err) {
        console.error("Verify OTP error:", err);
    }
    return false;
}

// Reset phone auth form
function resetPhoneAuth() {
    try {
        const phoneInput = document.getElementById("phoneInput");
        const otpInput = document.getElementById("otpInput");
        const otpSection = document.getElementById("otpSection");
        
        if (phoneInput) phoneInput.value = "";
        if (otpInput) otpInput.value = "";
        if (otpSection) otpSection.style.display = "none";
        
        console.log("✅ Phone auth form reset");
    } catch (err) {
        console.error("Reset phone auth error:", err);
    }
}

// ===== NEW FEATURE 1: WATCH HISTORY =====
const API_BASE = "http://localhost:5000";

// Get current user from Firebase or localStorage
function getCurrentUser() {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
        return JSON.parse(stored).uid;
    }
    return null;
}

// Avoid redeclaring globals if `auth.js` already declared them
if (typeof currentUser === 'undefined') {
    currentUser = null;
}
if (typeof currentProfile === 'undefined') {
    currentProfile = null;
}

// Update currentUser when it changes
setInterval(() => {
    const newUser = getCurrentUser();
    if (newUser !== currentUser) {
        currentUser = newUser;
        console.log("📱 Current user updated:", currentUser);
    }
}, 500);

// Track video watch
function trackVideoWatch(videoId, title, duration = 0) {
    if (!currentUser) return;
    
    fetch(`${API_BASE}/api/watch-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            uid: currentUser,
            videoId,
            title,
            duration
        })
    }).catch(err => console.error("Error tracking watch:", err));
}

// ===== NEW FEATURE 2: FAVORITES =====
function toggleFavorite(videoData, btn) {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
        alert("Please login to add favorites");
        return;
    }
    
    const user = JSON.parse(currentUser);
    const favorites = JSON.parse(localStorage.getItem(`favorites_${user.uid}`) || "[]");
    const videoIndex = favorites.findIndex(fav => fav.id === videoData.id);
    
    if (videoIndex > -1) {
        // Remove from favorites
        favorites.splice(videoIndex, 1);
        btn.innerHTML = "🤍";
        btn.style.color = "white";
    } else {
        // Add to favorites
        favorites.push({
            id: videoData.id,
            title: videoData.title,
            thumbnail: videoData.thumbnail,
            channel: videoData.channel
        });
        btn.innerHTML = "❤️";
        btn.style.color = "#FF6B35";
    }
    
    localStorage.setItem(`favorites_${user.uid}`, JSON.stringify(favorites));
    console.log("Favorite toggled:", videoData.title);
}

// Load watch history
function loadWatchHistory() {
    if (!currentUser) {
        alert("Please login to view history");
        return;
    }
    
    fetch(`${API_BASE}/api/watch-history/${currentUser}`)
        .then(r => r.json())
        .then(history => {
            const historyList = document.getElementById("historyList");
            const continueSection = document.getElementById("continueWatchingSection");
            
            if (!history.length) {
                historyList.innerHTML = "<p style='text-align:center; color:#999;'>No watch history</p>";
                continueSection.style.display = "none";
                return;
            }
            
            // Show continue watching (last 3)
            const recentVideos = history.slice(0, 3);
            const continueGrid = document.getElementById("continueWatchingGrid");
            continueGrid.innerHTML = recentVideos.map(v => `
                <div class="video-card">
                    <img src="https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg" alt="${v.title}" class="video-thumbnail">
                    <div class="video-info">
                        <h3>${v.title.substring(0, 30)}</h3>
                        <div class="continue-badge">Continue ▶️</div>
                    </div>
                </div>
            `).join("");
            continueSection.style.display = "block";
            
            // Show all history
            historyList.innerHTML = history.map(v => `
                <div class="history-item" onclick="playVideo('${v.videoId}', '${v.title}')">
                    <img src="https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg" class="thumbnail">
                    <div class="details">
                        <div class="title">${v.title}</div>
                        <div class="time">${new Date(v.watchedAt).toLocaleDateString()}</div>
                    </div>
                </div>
            `).join("");
        });
    
    document.getElementById("historyModal").classList.remove("hidden");
}

document.getElementById("historyBtn")?.addEventListener("click", loadWatchHistory);

function loadFavorites() {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
        alert("Please login to view favorites");
        return;
    }
    
    const user = JSON.parse(currentUser);
    const favorites = JSON.parse(localStorage.getItem(`favorites_${user.uid}`) || "[]");
    const favoritesList = document.getElementById("favoritesList");
    const noMsg = document.getElementById("noFavoritesMsg");
    
    if (!favorites.length) {
        favoritesList.innerHTML = "";
        noMsg.style.display = "block";
        return;
    }
    
    noMsg.style.display = "none";
    favoritesList.innerHTML = favorites.map(v => `
        <div class="video-card" data-video-id="${v.id}" style="position: relative;">
            <div class="thumbnail" style="position: relative; cursor: pointer;">
                <img src="${v.thumbnail}" alt="${v.title}" class="video-thumbnail" style="width: 100%; height: 200px; object-fit: cover;">
                <div class="play-overlay">▶</div>
                <button class="favorite-btn" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); border: none; color: #FF6B35; font-size: 20px; padding: 8px 12px; border-radius: 50%; cursor: pointer;">❤️</button>
            </div>
            <div class="video-info">
                <h4>${v.title}</h4>
                <p>${v.channel}</p>
            </div>
        </div>
    `).join("");
    
    // Add click listeners
    document.querySelectorAll("#favoritesList .video-card").forEach((card, idx) => {
        const video = favorites[idx];
        
        // Heart button listener
        card.querySelector(".favorite-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            toggleFavorite(video, card.querySelector(".favorite-btn"));
            loadFavorites(); // Refresh favorites list
        });
        
        // Play video listener
        card.querySelector(".thumbnail").addEventListener("click", () => {
            playVideo(video.id, video.title, video.channel);
        });
    });
    
    document.getElementById("favoritesModal").classList.remove("hidden");
}

document.getElementById("favoritesBtn")?.addEventListener("click", loadFavorites);

// Add favorites button to video cards
function addFavoritesButtonToCards() {
    document.querySelectorAll(".video-card").forEach(card => {
        if (!card.querySelector(".favorites-btn")) {
            const videoId = card.getAttribute("data-video-id");
            const title = card.querySelector("h4")?.textContent || card.querySelector("h3")?.textContent || "Video";
            const channel = card.querySelector("p")?.textContent || "Unknown";
            const thumbnail = card.querySelector("img")?.src || "";
            
            const btn = document.createElement("button");
            btn.className = "favorites-btn";
            btn.innerHTML = "🤍";
            btn.onclick = (e) => {
                e.stopPropagation();
                // Call toggleFavorite with proper videoData object and button
                toggleFavorite({ id: videoId, title, channel, thumbnail }, btn);
            };
            card.style.position = "relative";
            card.appendChild(btn);
        }
    });
}

// Call this after loading videos
setInterval(addFavoritesButtonToCards, 1000);

// ===== NEW FEATURE 3: PARENTAL CONTROLS =====
function saveParentalControls() {
    if (!currentUser) {
        alert("Please login first");
        return;
    }
    
    const pin = document.getElementById("pinInput").value;
    const restricted = Array.from(document.querySelectorAll(".category-restriction:checked"))
        .map(cb => cb.value);
    const screenTimeLimit = parseInt(document.getElementById("screenTimeLimitInput").value) || 0;
    
    if (pin && pin.length !== 4) {
        alert("PIN must be 4 digits");
        return;
    }
    
    fetch(`${API_BASE}/api/parental-controls/${currentUser}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            pin,
            restrictedCategories: restricted,
            screenTimeLimit
        })
    })
    .then(r => r.json())
    .then(() => {
        alert("✅ Parental controls saved!");
        closeModal("parentalModal");
    })
    .catch(err => alert("❌ Error saving controls: " + err.message));
}

document.getElementById("saveParentalBtn")?.addEventListener("click", saveParentalControls);
document.getElementById("parentBtn")?.addEventListener("click", () => {
    document.getElementById("parentalModal").classList.remove("hidden");
});

// ===== NEW FEATURE 4: MULTI-PROFILE SUPPORT =====
function loadProfiles() {
    if (!currentUser) {
        alert("Please login first");
        return;
    }
    
    fetch(`${API_BASE}/api/profiles/${currentUser}`)
        .then(r => r.json())
        .then(profiles => {
            const list = document.getElementById("profilesList");
            
            if (!profiles.length) {
                list.innerHTML = "<p style='grid-column:1/-1; text-align:center;'>No profiles yet. Create one!</p>";
                return;
            }
            
            list.innerHTML = profiles.map(p => `
                <div class="profile-card" onclick="switchProfile('${p._id}', '${p.profileName}')">
                    <div class="avatar">${p.avatar}</div>
                    <div class="name">${p.profileName}</div>
                    <div class="age">${p.ageGroup}</div>
                </div>
            `).join("");
        });
    
    document.getElementById("profileModal").classList.remove("hidden");
}

function switchProfile(profileId, profileName) {
    currentProfile = profileId;
    alert(`✅ Switched to ${profileName}'s profile`);
    closeModal("profileModal");
    loadRecommendations();
}

function createNewProfile() {
    const name = prompt("Enter profile name:");
    if (!name) return;
    
    const ageGroup = prompt("Age group (2-4, 5-7, or 8-12):", "2-4");
    if (!["2-4", "5-7", "8-12"].includes(ageGroup)) {
        alert("Invalid age group");
        return;
    }
    
    const avatars = ["👦", "👧", "👨‍🦱", "👩"];
    const avatar = avatars[Math.floor(Math.random() * avatars.length)];
    
    fetch(`${API_BASE}/api/profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentUid: currentUser, profileName: name, avatar, ageGroup })
    })
    .then(r => r.json())
    .then(res => {
        alert("✅ Profile created!");
        loadProfiles();
    })
    .catch(err => alert("❌ Error: " + err.message));
}

document.getElementById("addProfileBtn")?.addEventListener("click", createNewProfile);
document.getElementById("profileBtn")?.addEventListener("click", loadProfiles);

// ===== NEW FEATURE 5: RECOMMENDATIONS =====
function loadRecommendations() {
    if (!currentProfile) {
        console.log("No profile selected yet");
        return;
    }
    
    fetch(`${API_BASE}/api/recommendations/${currentProfile}`)
        .then(r => r.json())
        .then(data => {
            if (!data.recommendations || !data.recommendations.length) {
                document.getElementById("recommendationsSection").style.display = "none";
                return;
            }
            
            const grid = document.getElementById("recommendationsGrid");
            grid.innerHTML = data.recommendations.map(v => `
                <div class="video-card" data-video-id="${v.id}">
                    <img src="${v.thumbnail}" alt="${v.title}" class="video-thumbnail">
                    <button class="favorites-btn" onclick="toggleFavorite('${v.id}', '${v.title}')">🤍</button>
                    <div class="video-info">
                        <h3>${v.title.substring(0, 40)}</h3>
                        <p>${v.reason}</p>
                    </div>
                </div>
            `).join("");
            
            document.getElementById("recommendationsSection").style.display = "block";
        })
        .catch(err => console.error("Error loading recommendations:", err));
}

// ===== HELPER FUNCTION =====
function closeModal(modalId) {
    document.getElementById(modalId)?.classList.add("hidden");
}

// Load recommendations periodically
setInterval(loadRecommendations, 30000);

// Track when user watches a video
window.addEventListener("click", (e) => {
    if (e.target.closest(".video-card")) {
        const videoId = e.target.closest(".video-card")?.getAttribute("data-video-id");
        const title = e.target.closest(".video-card")?.querySelector("h3")?.textContent;
        if (videoId && title) {
            trackVideoWatch(videoId, title);
        }
    }
});

console.log("✅ App.js loaded successfully!");
