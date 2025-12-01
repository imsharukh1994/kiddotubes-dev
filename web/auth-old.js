// auth.js - Firebase Authentication Module
// Uses firebase.compat (older but more stable)

console.log("🔐 auth.js loading...");

let auth = null;
let firebaseInitialized = false;

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDUqLYNIzg6jW1OUv5ph68QXGZ8YG2eZtU",
  authDomain: "kiddotubes-5d2f0.firebaseapp.com",
  projectId: "kiddotubes-5d2f0",
  storageBucket: "kiddotubes-5d2f0.appspot.com",
  messagingSenderId: "877819620851",
  appId: "1:877819620851:web:6e7f8c5c5d5c5c5c5c5c5c"
};

// Wait for Firebase to load
function initFirebase() {
    if (firebaseInitialized) {
        console.log("✅ Firebase already initialized");
        return;
    }
    
    if (typeof firebase === 'undefined') {
        console.log("⏳ Firebase SDK not loaded yet, retrying in 500ms...");
        setTimeout(initFirebase, 500);
        return;
    }

    try {
        // Validate config
        if (!firebaseConfig.apiKey) {
            console.error("❌ Firebase API Key is missing or invalid");
            console.error("Config:", firebaseConfig);
            alert("❌ Firebase configuration error. Please check the API key in auth.js");
            return;
        }

        // Initialize Firebase with the config
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log("✅ Firebase initialized successfully!");
            console.log("📊 Project:", firebaseConfig.projectId);
            console.log("🔑 Auth Domain:", firebaseConfig.authDomain);
        }
        
        auth = firebase.auth();
        firebaseInitialized = true;
        console.log("✅ Firebase Auth initialized successfully!");
        
        // Setup event listeners
        setupGoogleSignIn();
        setupEmailForms();
        checkAuthState();
        
    } catch (error) {
        console.error("❌ Firebase init error:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        alert("❌ Firebase Error: " + error.message);
        setTimeout(initFirebase, 2000);
    }
}

// Setup Email Forms
function setupEmailForms() {
    console.log("🔍 Setting up Email Forms...");
    
    // Login Form
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
            
            try {
                await loginEmail(email, password);
            } catch (err) {
                if (loginError) {
                    loginError.style.display = "block";
                    loginError.textContent = "❌ " + err.message;
                }
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
            const confirmPassword = document.getElementById("registerConfirm").value;
            const registerError = document.getElementById("registerError");
            
            if (password !== confirmPassword) {
                if (registerError) {
                    registerError.style.display = "block";
                    registerError.textContent = "Passwords do not match";
                }
                return;
            }
            
            try {
                await signUpEmail(email, password);
            } catch (err) {
                if (registerError) {
                    registerError.style.display = "block";
                    registerError.textContent = "❌ " + err.message;
                }
            }
        });
        console.log("✅ Register form ready");
    }
}

// Setup Google Sign-In button
function setupGoogleSignIn() {
    console.log("🔍 Setting up Google Sign-In...");
    
    const googleLoginBtn = document.getElementById("googleLoginBtn");
    const googleRegisterBtn = document.getElementById("googleRegisterBtn");
    
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener("click", googleLogin);
        console.log("✅ Google Login button ready");
    } else {
        console.log("⚠️ Google Login button not found yet");
    }
    
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener("click", googleLogin);
        console.log("✅ Google Register button ready");
    } else {
        console.log("⚠️ Google Register button not found yet");
    }
    
    // Check for redirect results from signInWithRedirect
    checkGoogleRedirectResult();
}

// Check if user was redirected back from Google sign-in
async function checkGoogleRedirectResult() {
    try {
        if (!auth) return;
        
        const result = await auth.getRedirectResult();
        if (result.user) {
            console.log("✅ Google Sign-In successful (redirect):", result.user.email);
            
            localStorage.setItem("currentUser", JSON.stringify({
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName || "User",
                photoURL: result.user.photoURL
            }));
            
            // Save to MongoDB
            if (typeof saveUserToDatabase === 'function') {
                await saveUserToDatabase(
                    result.user.uid,
                    result.user.email,
                    result.user.displayName || "User",
                    result.user.photoURL || "https://via.placeholder.com/150"
                );
                console.log("📊 User saved to MongoDB");
            }
            
            updateAuthUI();
            
            // Close modals
            const loginModal = document.getElementById("loginModal");
            const registerModal = document.getElementById("registerModal");
            if (loginModal) loginModal.classList.add("hidden");
            if (registerModal) registerModal.classList.add("hidden");
            
            // Show profile modal
            const profileModal = document.getElementById("profileModal");
            const profileContent = document.getElementById("profileContent");
            if (profileModal) profileModal.classList.remove("hidden");
            if (profileContent) profileContent.classList.remove("hidden");
        }
    } catch (error) {
        if (error.code !== 'auth/no-redirect-user') {
            console.error("❌ Redirect result error:", error);
        }
    }
}

// Email Sign Up
async function signUpEmail(email, password) {
    try {
        if (!auth) {
            console.error("❌ Firebase Auth not initialized");
            alert("Firebase is not ready. Please refresh the page.");
            return;
        }
        
        const userCred = await auth.createUserWithEmailAndPassword(email, password);
        console.log("✅ Account created:", userCred.user.email);
        
        localStorage.setItem("currentUser", JSON.stringify({
            uid: userCred.user.uid,
            email: userCred.user.email,
            displayName: userCred.user.displayName || "User"
        }));
        
        // Save to MongoDB
        if (typeof saveUserToDatabase === 'function') {
            await saveUserToDatabase(
                userCred.user.uid,
                userCred.user.email,
                userCred.user.displayName || "User",
                userCred.user.photoURL || "https://via.placeholder.com/150"
            );
            console.log("📊 User saved to MongoDB");
        }
        
        updateAuthUI();
        return userCred.user;
    } catch (error) {
        console.error("❌ Signup error:", error.message);
        alert("Signup Error: " + error.message);
    }
}

// Email Login
async function loginEmail(email, password) {
    try {
        if (!auth) {
            console.error("❌ Firebase Auth not initialized");
            alert("Firebase is not ready. Please refresh the page.");
            return;
        }
        
        const userCred = await auth.signInWithEmailAndPassword(email, password);
        console.log("✅ Logged in:", userCred.user.email);
        
        localStorage.setItem("currentUser", JSON.stringify({
            uid: userCred.user.uid,
            email: userCred.user.email,
            displayName: userCred.user.displayName || "User"
        }));
        
        // Save to MongoDB
        if (typeof saveUserToDatabase === 'function') {
            await saveUserToDatabase(
                userCred.user.uid,
                userCred.user.email,
                userCred.user.displayName || "User",
                userCred.user.photoURL || "https://via.placeholder.com/150"
            );
            console.log("📊 User saved to MongoDB");
        }
        
        updateAuthUI();
        return userCred.user;
    } catch (error) {
        console.error("❌ Login error:", error.message);
        alert("Login Error: " + error.message);
    }
}

// Google Login
async function googleLogin() {
    try {
        if (!auth) {
            console.error("❌ Firebase Auth not initialized");
            alert("Firebase is not ready. Please refresh the page.");
            return;
        }

        console.log("🔄 Starting Google Sign-In...");
        
        // Create and configure Google provider
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        // Try popup first (preferred method)
        let result;
        try {
            console.log("📱 Attempting popup sign-in...");
            result = await auth.signInWithPopup(provider);
        } catch (popupError) {
            console.error("❌ Popup error details:", popupError);
            console.error("Error code:", popupError.code);
            console.error("Error message:", popupError.message);
            
            // Check if it's the Identity Toolkit API blocked error
            if (popupError.message && popupError.message.includes("identitytoolkit")) {
                console.log("⚠️ Identity Toolkit API blocked, using fallback email login");
                alert("⚠️ Google Sign-In is temporarily unavailable.\n\nPlease use Email/Password login instead.\n\nClick the 'Login' tab to proceed.");
                return;
            }
            
            // If popup fails, try redirect method
            if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user') {
                console.log("📲 Popup blocked/closed, trying redirect method...");
                await auth.signInWithRedirect(provider);
                return;
            } else {
                throw popupError;
            }
        }
        
        const user = result.user;
        
        console.log("✅ Google Sign-In successful:", user.email);
        
        localStorage.setItem("currentUser", JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || "User",
            photoURL: user.photoURL
        }));
        
        // Save to MongoDB
        if (typeof saveUserToDatabase === 'function') {
            await saveUserToDatabase(
                user.uid,
                user.email,
                user.displayName || "User",
                user.photoURL || "https://via.placeholder.com/150"
            );
            console.log("📊 User saved to MongoDB");
        }
        
        console.log("✅ User saved to localStorage");
        updateAuthUI();
        
        // Close modals
        const loginModal = document.getElementById("loginModal");
        const registerModal = document.getElementById("registerModal");
        if (loginModal) loginModal.classList.add("hidden");
        if (registerModal) registerModal.classList.add("hidden");
        
        // Show profile modal
        const profileModal = document.getElementById("profileModal");
        const profileContent = document.getElementById("profileContent");
        if (profileModal) profileModal.classList.remove("hidden");
        if (profileContent) profileContent.classList.remove("hidden");
        
        console.log("✅ Welcome " + (user.displayName || user.email));
        return user;
        
    } catch (error) {
        console.error("❌ Google Sign-In error:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        
        if (error.code === 'auth/popup-blocked') {
            alert("❌ Popup was blocked.\n\nPlease allow popups for this website and try again.");
        } else if (error.code === 'auth/cancelled-popup-request') {
            console.log("⚠️ User cancelled the sign-in popup");
        } else if (error.code === 'auth/operation-not-allowed') {
            alert("❌ Google Sign-In is not enabled.\n\nPlease contact support.");
        } else if (error.code === 'auth/requests-to-this-api-identitytoolkit-method-google.cloud.identitytoolkit.v1.projectconfigservice.getprojectconfig-are-blocked') {
            alert("❌ Google API is blocked.\n\nPlease check:\n1. Refresh the page (Ctrl+Shift+R)\n2. Check if localhost:8005 is in Firebase Authorized Domains\n3. Check if Identity Toolkit API is enabled");
        } else {
            alert("❌ Sign-In Error: " + error.message);
        }
    }
}

// Logout
async function logoutUser() {
    try {
        if (!auth) {
            console.error("❌ Firebase Auth not initialized");
            return;
        }
        
        await auth.signOut();
        localStorage.removeItem("currentUser");
        console.log("✅ User logged out");
        updateAuthUI();
        
    } catch (error) {
        console.error("❌ Logout error:", error.message);
    }
}

// ===== PHONE AUTHENTICATION =====
let confirmationResult = null;

// Send OTP to phone
async function sendPhoneOTP() {
    try {
        if (!auth) {
            console.error("❌ Firebase Auth not initialized");
            alert("Firebase is not ready. Please refresh the page.");
            return;
        }

        const countryCode = document.getElementById("countryCode").value.trim();
        const phoneNumber = document.getElementById("phoneNumber").value.trim();
        const phoneError = document.getElementById("phoneError");
        
        if (!countryCode || !phoneNumber) {
            if (phoneError) {
                phoneError.style.display = "block";
                phoneError.textContent = "Please enter country code and phone number";
            }
            return;
        }

        // Validate phone format
        if (!/^\d{5,15}$/.test(phoneNumber.replace(/\D/g, ''))) {
            if (phoneError) {
                phoneError.style.display = "block";
                phoneError.textContent = "Please enter a valid phone number (5-15 digits)";
            }
            return;
        }

        const fullPhoneNumber = countryCode + phoneNumber.replace(/\D/g, '');
        
        console.log("📱 Sending OTP to:", fullPhoneNumber);
        
        try {
            // Configure recaptcha verifier
            if (!window.recaptchaVerifier) {
                window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha', {
                    'size': 'normal',
                    'callback': (response) => {
                        console.log("✅ Recaptcha verified");
                    }
                }, auth);
            }

            // Send OTP
            confirmationResult = await auth.signInWithPhoneNumber(fullPhoneNumber, window.recaptchaVerifier);
            console.log("✅ OTP sent successfully!");

            // Show OTP input step
            document.getElementById("phoneInputStep").style.display = "none";
            document.getElementById("otpStep").style.display = "block";
            
            if (phoneError) phoneError.style.display = "none";
        } catch (firebaseError) {
            console.error("❌ Firebase Phone Auth Error:", firebaseError);
            console.error("Error Code:", firebaseError.code);
            
            if (phoneError) {
                phoneError.style.display = "block";
                
                // Provide user-friendly error messages
                if (firebaseError.code === 'auth/invalid-api-key') {
                    phoneError.textContent = "⚠️ Phone authentication is not configured. Please use Email or Google login instead.";
                } else if (firebaseError.code === 'auth/operation-not-allowed') {
                    phoneError.textContent = "⚠️ Phone authentication is currently disabled. Please use Email or Google login instead.";
                } else if (firebaseError.code === 'auth/too-many-requests') {
                    phoneError.textContent = "Too many requests. Please try again later.";
                } else {
                    phoneError.textContent = "⚠️ Phone auth error: " + firebaseError.message;
                }
            }
            return;
        }

    } catch (error) {
        console.error("❌ Phone OTP Error:", error);
        const phoneError = document.getElementById("phoneError");
        if (phoneError) {
            phoneError.style.display = "block";
            phoneError.textContent = "⚠️ Error: " + error.message;
        }
    }
}

// Verify OTP and sign in
async function verifyPhoneOTP() {
    try {
        if (!confirmationResult) {
            alert("Please send OTP first");
            return;
        }

        const otpCode = document.getElementById("otpCode").value.trim();
        const otpError = document.getElementById("otpError");

        if (!otpCode || otpCode.length !== 6) {
            if (otpError) {
                otpError.style.display = "block";
                otpError.textContent = "Please enter a valid 6-digit OTP";
            }
            return;
        }

        console.log("🔐 Verifying OTP...");
        
        const result = await confirmationResult.confirm(otpCode);
        const user = result.user;

        console.log("✅ Phone authentication successful:", user.phoneNumber);

        localStorage.setItem("currentUser", JSON.stringify({
            uid: user.uid,
            email: user.email || user.phoneNumber,
            displayName: user.displayName || "User",
            phoneNumber: user.phoneNumber,
            photoURL: user.photoURL
        }));

        console.log("✅ User saved to localStorage");
        updateAuthUI();

        // Close modals
        const phoneAuthModal = document.getElementById("phoneAuthModal");
        const loginModal = document.getElementById("loginModal");
        const registerModal = document.getElementById("registerModal");
        if (phoneAuthModal) phoneAuthModal.classList.add("hidden");
        if (loginModal) loginModal.classList.add("hidden");
        if (registerModal) registerModal.classList.add("hidden");

        // Show profile modal
        const profileModal = document.getElementById("profileModal");
        const profileContent = document.getElementById("profileContent");
        if (profileModal) profileModal.classList.remove("hidden");
        if (profileContent) profileContent.classList.remove("hidden");

        console.log("✅ Welcome " + (user.displayName || user.phoneNumber));
        resetPhoneAuth();
        return user;

    } catch (error) {
        console.error("❌ OTP Verification Error:", error);
        const otpError = document.getElementById("otpError");
        if (otpError) {
            otpError.style.display = "block";
            otpError.textContent = "Invalid OTP: " + error.message;
        }
    }
}

// Reset phone auth form
function resetPhoneAuth() {
    document.getElementById("phoneForm").reset();
    document.getElementById("otpForm").reset();
    document.getElementById("phoneInputStep").style.display = "block";
    document.getElementById("otpStep").style.display = "none";
    confirmationResult = null;
    
    if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
    }
}

// Check Auth State
function checkAuthState() {
    if (!auth) {
        console.log("⏳ Auth not ready, checking again in 1000ms...");
        setTimeout(checkAuthState, 1000);
        return;
    }
    
    auth.onAuthStateChanged(function(user) {
        if (user) {
            console.log("👤 User logged in:", user.email);
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || "User",
                photoURL: user.photoURL
            };
            localStorage.setItem("currentUser", JSON.stringify(userData));
            
            // Set global currentUser in app
            if (typeof window !== 'undefined') {
                window.currentUser = user.uid;
            }
        } else {
            console.log("👤 No user logged in");
            localStorage.removeItem("currentUser");
            if (typeof window !== 'undefined') {
                window.currentUser = null;
            }
        }
        updateAuthUI();
    });
}

// Update UI based on auth state
function updateAuthUI() {
    const currentUser = localStorage.getItem("currentUser");
    const profileContent = document.getElementById("profileContent");
    const authContent = document.getElementById("authContent");
    
    if (currentUser) {
        const user = JSON.parse(currentUser);
        
        // Show profile, hide auth
        if (profileContent) profileContent.classList.remove("hidden");
        if (authContent) authContent.classList.add("hidden");
        
        // Update profile info
        const profileName = document.getElementById("profileName");
        const profileEmail = document.getElementById("profileEmail");
        if (profileName) profileName.textContent = user.displayName;
        if (profileEmail) profileEmail.textContent = user.email;
        
    } else {
        // Show auth, hide profile
        if (profileContent) profileContent.classList.add("hidden");
        if (authContent) authContent.classList.remove("hidden");
    }
}

// Helper functions
function closeAuthModal() {
    const authModal = document.getElementById("authModal");
    if (authModal) {
        authModal.classList.add("hidden");
    }
}

// Export functions to global scope
window.signUpEmail = signUpEmail;
window.loginEmail = loginEmail;
window.googleLogin = googleLogin;
window.logoutUser = logoutUser;
window.checkAuthState = checkAuthState;
window.sendPhoneOTP = sendPhoneOTP;
window.verifyPhoneOTP = verifyPhoneOTP;
window.resetPhoneAuth = resetPhoneAuth;
window.initFirebase = initFirebase;
window.firebaseInitialized = firebaseInitialized;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("📄 DOM Content Loaded - Initializing Firebase");
        initFirebase();
    });
} else {
    console.log("📄 DOM already loaded - Initializing Firebase immediately");
    initFirebase();
}

// Also try to initialize after a short delay as backup
setTimeout(() => {
    if (!firebaseInitialized) {
        console.log("🔄 Firebase not initialized yet, retrying...");
        initFirebase();
    }
}, 1000);
