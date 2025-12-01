// ===== FIREBASE AUTHENTICATION MODULE (FIXED) =====
console.log("🔐 Firebase Auth Module Loading...");

let auth = null;
let firebaseInitialized = false;

// Firebase Configuration (from .env)
const firebaseConfig = {
  apiKey: "AIzaSyDsX8GuCj3v1MDIUH3OoaDYoNy7BqEPR7o",
  authDomain: "kiddotubes-85ae3.firebaseapp.com",
  projectId: "kiddotubes",
  storageBucket: "kiddotubes.firebasestorage.app",
  messagingSenderId: "256759094376",
  appId: "1:256759094376:web:9cbff83417d2b3b8ba6fdd",
  measurementId: "G-QV8XEE2NMW"
};

// ===== FIREBASE INITIALIZATION =====
function initFirebase() {
    if (firebaseInitialized) {
        console.log("✅ Firebase already initialized");
        return Promise.resolve(auth);
    }

    return new Promise((resolve, reject) => {
        // Wait for Firebase SDK to load
        function tryInit() {
            if (typeof firebase === 'undefined') {
                console.log("⏳ Firebase SDK loading...");
                setTimeout(tryInit, 100);
                return;
            }

            try {
                console.log("🔄 Firebase SDK detected, initializing...");

                // Validate config
                if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY') {
                    console.error("❌ Firebase API Key missing or invalid");
                    reject(new Error("Firebase API Key not configured"));
                    return;
                }

                // Initialize Firebase
                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                    console.log("✅ Firebase App initialized");
                    console.log("📊 Project:", firebaseConfig.projectId);
                } else {
                    console.log("✅ Firebase App already initialized");
                }

                // Get Auth instance
                auth = firebase.auth();
                firebaseInitialized = true;
                
                console.log("✅ Firebase Auth ready!");
                
                // Setup UI event listeners
                setupAuthEventListeners();
                
                // Check current auth state
                checkAuthState();
                
                resolve(auth);

            } catch (error) {
                console.error("❌ Firebase init error:", error.message);
                reject(error);
                setTimeout(tryInit, 2000); // Retry after 2 seconds
            }
        }

        tryInit();
    });
}

// ===== AUTH EVENT LISTENERS =====
function setupAuthEventListeners() {
    console.log("🔍 Setting up auth event listeners...");

    // Login Form
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value.trim();
            const password = document.getElementById("loginPassword").value;
            const loginError = document.getElementById("loginError");

            if (!email || !password) {
                showError(loginError, "Email and password required");
                return;
            }

            try {
                console.log("🔐 Email login attempt:", email);
                await loginEmail(email, password);
                closeModal("loginModal");
                showSuccess("✅ Login successful!");
            } catch (error) {
                showError(loginError, error.message);
            }
        });
        console.log("✅ Login form ready");
    }

    // Register Form
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("registerEmail").value.trim();
            const password = document.getElementById("registerPassword").value;
            const confirm = document.getElementById("registerConfirm").value;
            const registerError = document.getElementById("registerError");

            if (password !== confirm) {
                showError(registerError, "Passwords do not match");
                return;
            }

            try {
                console.log("📝 Registration attempt:", email);
                await signUpEmail(email, password);
                closeModal("registerModal");
                showSuccess("✅ Account created!");
            } catch (error) {
                showError(registerError, error.message);
            }
        });
        console.log("✅ Register form ready");
    }

    // Google Login Button
    const googleLoginBtn = document.getElementById("googleLoginBtn");
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener("click", async () => {
            try {
                console.log("🔄 Google login starting...");
                await googleLogin();
            } catch (error) {
                console.error("Google login error:", error);
            }
        });
        console.log("✅ Google login button ready");
    }

    // Google Register Button
    const googleRegisterBtn = document.getElementById("googleRegisterBtn");
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener("click", async () => {
            try {
                console.log("🔄 Google register starting...");
                await googleLogin();
            } catch (error) {
                console.error("Google register error:", error);
            }
        });
        console.log("✅ Google register button ready");
    }

    // Logout Button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                await logoutUser();
                showSuccess("✅ Logged out!");
                closeModal("profileModal");
            } catch (error) {
                console.error("Logout error:", error);
            }
        });
        console.log("✅ Logout button ready");
    }
}

// ===== AUTH FUNCTIONS =====

// Email Sign Up
async function signUpEmail(email, password) {
    if (!auth) throw new Error("Firebase not initialized");

    const userCred = await auth.createUserWithEmailAndPassword(email, password);
    console.log("✅ Account created:", userCred.user.email);

    // Save to localStorage
    saveUserLocally(userCred.user);

    // Save to MongoDB
    if (typeof saveUserToDatabase === 'function') {
        await saveUserToDatabase(
            userCred.user.uid,
            userCred.user.email,
            userCred.user.displayName || "User",
            userCred.user.photoURL || "https://via.placeholder.com/150"
        );
    }

    updateAuthUI();
    return userCred.user;
}

// Email Sign In
async function loginEmail(email, password) {
    if (!auth) throw new Error("Firebase not initialized");

    const userCred = await auth.signInWithEmailAndPassword(email, password);
    console.log("✅ Logged in:", userCred.user.email);

    // Save to localStorage
    saveUserLocally(userCred.user);

    // Save to MongoDB
    if (typeof saveUserToDatabase === 'function') {
        await saveUserToDatabase(
            userCred.user.uid,
            userCred.user.email,
            userCred.user.displayName || "User",
            userCred.user.photoURL || "https://via.placeholder.com/150"
        );
    }

    updateAuthUI();
    return userCred.user;
}

// Google Sign In
async function googleLogin() {
    if (!auth) throw new Error("Firebase not initialized");

    try {
        console.log("📱 Starting Google Sign-In...");

        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');

        // Try popup
        try {
            const result = await auth.signInWithPopup(provider);
            console.log("✅ Google Sign-In successful:", result.user.email);

            // Save to localStorage
            saveUserLocally(result.user);

            // Save to MongoDB
            if (typeof saveUserToDatabase === 'function') {
                await saveUserToDatabase(
                    result.user.uid,
                    result.user.email,
                    result.user.displayName || "User",
                    result.user.photoURL || "https://via.placeholder.com/150"
                );
            }

            updateAuthUI();
            closeModal("loginModal");
            closeModal("registerModal");
            return result.user;

        } catch (popupError) {
            if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user') {
                console.log("📲 Popup blocked, trying redirect...");
                await auth.signInWithRedirect(provider);
            } else {
                throw popupError;
            }
        }

    } catch (error) {
        console.error("❌ Google Sign-In error:", error.code, error.message);
        if (error.code === 'auth/operation-not-allowed') {
            throw new Error("Google Sign-In not enabled in Firebase");
        }
        throw error;
    }
}

// Logout
async function logoutUser() {
    if (!auth) throw new Error("Firebase not initialized");

    await auth.signOut();
    localStorage.removeItem("currentUser");
    window.currentUser = null;
    console.log("✅ User logged out");
    updateAuthUI();
}

// ===== AUTH STATE MANAGEMENT =====

function saveUserLocally(user) {
    const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "User",
        photoURL: user.photoURL,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem("currentUser", JSON.stringify(userData));
    window.currentUser = user.uid;
    console.log("💾 User saved to localStorage");
}

function checkAuthState() {
    if (!auth) {
        setTimeout(checkAuthState, 1000);
        return;
    }

    auth.onAuthStateChanged(function(user) {
        if (user) {
            console.log("👤 User state: Logged in -", user.email);
            saveUserLocally(user);
        } else {
            console.log("👤 User state: Logged out");
            localStorage.removeItem("currentUser");
            window.currentUser = null;
        }
        updateAuthUI();
    });
}

function updateAuthUI() {
    const currentUser = localStorage.getItem("currentUser");
    const profileContent = document.getElementById("profileContent");
    const authContent = document.getElementById("authContent");

    if (currentUser) {
        try {
            const user = JSON.parse(currentUser);

            // Show profile
            if (profileContent) profileContent.classList.remove("hidden");
            if (authContent) authContent.classList.add("hidden");

            // Update profile display
            const profileName = document.getElementById("profileName");
            const profileEmail = document.getElementById("profileEmail");
            if (profileName) profileName.textContent = user.displayName;
            if (profileEmail) profileEmail.textContent = user.email;

            console.log("✅ Auth UI updated - showing profile");
        } catch (e) {
            console.error("Error updating UI:", e);
        }
    } else {
        // Show login
        if (profileContent) profileContent.classList.add("hidden");
        if (authContent) authContent.classList.remove("hidden");
        console.log("✅ Auth UI updated - showing login");
    }
}

// ===== UTILITY FUNCTIONS =====

function showError(element, message) {
    if (element) {
        element.textContent = "❌ " + message;
        element.style.display = "block";
    }
    console.error("⚠️", message);
}

function showSuccess(message) {
    console.log("✅", message);
    alert(message);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("hidden");
    }
}

// ===== EXPORT TO GLOBAL SCOPE =====
window.initFirebase = initFirebase;
window.signUpEmail = signUpEmail;
window.loginEmail = loginEmail;
window.googleLogin = googleLogin;
window.logoutUser = logoutUser;
window.checkAuthState = checkAuthState;
window.updateAuthUI = updateAuthUI;

// ===== AUTO-INITIALIZE =====
console.log("🚀 Auth module ready, waiting for DOM...");

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log("📄 DOM ready, initializing Firebase...");
        initFirebase().catch(err => console.error("Init failed:", err));
    });
} else {
    console.log("📄 DOM already loaded, initializing Firebase...");
    initFirebase().catch(err => console.error("Init failed:", err));
}

// Backup initialization after timeout
setTimeout(() => {
    if (!firebaseInitialized) {
        console.log("🔄 Firebase not initialized yet, retrying...");
        initFirebase().catch(err => console.error("Backup init failed:", err));
    }
}, 2000);

console.log("✅ Auth module loaded!");
