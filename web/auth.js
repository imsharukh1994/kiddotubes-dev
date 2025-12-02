// ===== FIREBASE AUTH - OPTIMIZED & FAST =====
console.log("🚀 Firebase Auth Loading (Optimized)...");

let auth = null;
let currentUser = null;

// Firebase config - from .env via server or hardcoded as fallback
const firebaseConfig = {
  apiKey: "AIzaSyDsX8GuCj3v1MDIUH3OoaDYoNy7BqEPR7o",
  authDomain: "kiddotubes-85ae3.firebaseapp.com",
  projectId: "kiddotubes",
  storageBucket: "kiddotubes.firebasestorage.app",
  messagingSenderId: "256759094376",
  appId: "1:256759094376:web:9cbff83417d2b3b8ba6fdd",
  measurementId: "G-QV8XEE2NMW"
};

// Initialize Firebase immediately when SDK loads
function initFirebase() {
  if (typeof firebase === 'undefined') {
    setTimeout(initFirebase, 100);
    return;
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    auth = firebase.auth();
    setupListeners();
    checkAuthState();
    console.log("✅ Firebase Ready");
  } catch (error) {
    console.error("❌ Firebase Error:", error.message);
    setTimeout(initFirebase, 2000);
  }
}

// Setup auth listeners
function setupListeners() {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const googleBtn = document.getElementById("googleSignInBtn");
  
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;
      loginEmail(email, password);
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("signupEmail").value;
      const password = document.getElementById("signupPassword").value;
      const name = document.getElementById("signupName").value;
      signUpEmail(email, password, name);
    });
  }

  if (googleBtn) {
    googleBtn.addEventListener("click", googleLogin);
  }
}

// Check auth state
function checkAuthState() {
  if (!auth) {
    setTimeout(checkAuthState, 500);
    return;
  }

  auth.onAuthStateChanged((user) => {
    if (user) {
      currentUser = user;
      localStorage.setItem("currentUser", JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "User",
        photoURL: user.photoURL
      }));
      updateAuthUI();
    } else {
      currentUser = null;
      localStorage.removeItem("currentUser");
      updateAuthUI();
    }
  });
}

// Email login
async function loginEmail(email, password) {
  try {
    if (!auth) {
      alert("Firebase not ready");
      return;
    }
    
    const result = await auth.signInWithEmailAndPassword(email, password);
    console.log("✅ Logged in:", result.user.email);
    
    // Clear form
    const loginForm = document.getElementById("loginForm");
    if (loginForm) loginForm.reset();
    const loginError = document.getElementById("loginError");
    if (loginError) loginError.style.display = "none";
    
    // Update UI
    updateAuthUI();
    
  } catch (error) {
    const errorMsg = document.getElementById("loginError");
    if (errorMsg) {
      errorMsg.textContent = "❌ " + error.message;
      errorMsg.style.display = "block";
    }
    console.error("Login error:", error);
  }
}

// Email signup
async function signUpEmail(email, password, name) {
  try {
    if (!auth) {
      alert("Firebase not ready");
      return;
    }
    
    const result = await auth.createUserWithEmailAndPassword(email, password);
    await result.user.updateProfile({ displayName: name });
    
    console.log("✅ Account created:", result.user.email);
    
    // Clear form
    const signupForm = document.getElementById("signupForm");
    if (signupForm) signupForm.reset();
    const signupError = document.getElementById("signupError");
    if (signupError) signupError.style.display = "none";
    
    // Update UI
    updateAuthUI();
    
  } catch (error) {
    const errorMsg = document.getElementById("signupError");
    if (errorMsg) {
      errorMsg.textContent = "❌ " + error.message;
      errorMsg.style.display = "block";
    }
    console.error("Signup error:", error);
  }
}

// Google login
async function googleLogin() {
  try {
    if (!auth) {
      alert("Firebase not ready");
      return;
    }

    const provider = new firebase.auth.GoogleAuthProvider();
    // Try popup first (works in normal browsers). If popup is blocked or
    // not supported, fallback to redirect flow which is more robust.
    try {
      const result = await auth.signInWithPopup(provider);
      console.log("✅ Google login:", result.user && result.user.email);
      updateAuthUI();
      return;
    } catch (popupErr) {
      console.warn('Google popup failed, falling back to redirect:', popupErr && popupErr.code);
      // Common popup errors: auth/popup-blocked, auth/operation-not-supported-in-this-environment
      try {
        await auth.signInWithRedirect(provider);
        // On redirect, Firebase will handle state and call onAuthStateChanged after redirect completes
        console.log('🔁 Redirecting to Google sign-in...');
        return;
      } catch (redirectErr) {
        console.error('Google redirect failed:', redirectErr && redirectErr.message);
        alert('❌ Google login failed: ' + (redirectErr && redirectErr.message || popupErr && popupErr.message));
        return;
      }
    }
    
  } catch (error) {
    console.error("Google login error:", error.message);
    alert("❌ Google login failed: " + error.message);
  }
}

// Logout
async function logoutUser() {
  try {
    if (auth) {
      await auth.signOut();
      console.log("✅ Logged out");
      closeModal("profileModal");
      updateAuthUI();
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
}

// Update UI based on auth state
function updateAuthUI() {
  const user = localStorage.getItem("currentUser");
  const authContent = document.getElementById("authContent");
  const profileContent = document.getElementById("profileContent");
  
  if (user) {
    const userData = JSON.parse(user);
    
    // Hide auth, show profile
    if (authContent) {
      authContent.classList.add("hidden");
      authContent.style.display = "none";
    }
    if (profileContent) {
      profileContent.classList.remove("hidden");
      profileContent.style.display = "block";
    }
    
    // Update profile info
    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    
    if (profileName) profileName.textContent = userData.displayName || "User";
    if (profileEmail) profileEmail.textContent = userData.email;
    
    console.log("👤 Profile updated:", userData.displayName);
    
  } else {
    // Show auth, hide profile
    if (authContent) {
      authContent.classList.remove("hidden");
      authContent.style.display = "block";
    }
    if (profileContent) {
      profileContent.classList.add("hidden");
      profileContent.style.display = "none";
    }
  }
}

// Modal helpers
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("hidden");
    modal.style.display = "block";
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("hidden");
    modal.style.display = "none";
  }
}

// Initialize on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFirebase);
} else {
  initFirebase();
}

// Fallback initialization
setTimeout(initFirebase, 500);

// Export to global
window.loginEmail = loginEmail;
window.signUpEmail = signUpEmail;
window.googleLogin = googleLogin;
window.logoutUser = logoutUser;
window.checkAuthState = checkAuthState;
window.closeModal = closeModal;
window.showModal = showModal;
