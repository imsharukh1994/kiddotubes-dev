// Simplified auth using Cloudflare Worker + D1 for user persistence
console.log('Auth (D1-backed) loading...');

const DEV_API = 'https://kiddotubes-dev.<subdomain>.workers.dev';
const PROD_API = 'https://kiddotubes.<subdomain>.workers.dev';
const API_BASE = window.API_URL || ((location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? DEV_API : PROD_API);

function setCurrentUser(user) {
  if (user) localStorage.setItem('currentUser', JSON.stringify(user));
  else localStorage.removeItem('currentUser');
  updateAuthUI();
}

async function signUpEmail(email, _password, name) {
  try {
    const res = await fetch(`${API_BASE}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });
    const data = await res.json();
    if (data?.user) {
      setCurrentUser(data.user);
      return data.user;
    }
    throw new Error('Signup failed');
  } catch (err) {
    console.error('Signup error:', err);
    throw err;
  }
}

async function loginEmail(email, _password) {
  try {
    const res = await fetch(`${API_BASE}/api/users?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    if (data?.user) {
      setCurrentUser(data.user);
      return data.user;
    }
    throw new Error('User not found');
  } catch (err) {
    console.error('Login error:', err);
    throw err;
  }
}

async function logoutUser() {
  setCurrentUser(null);
}

function updateAuthUI() {
  const user = localStorage.getItem('currentUser');
  const authContent = document.getElementById('authContent');
  const profileContent = document.getElementById('profileContent');

  if (user) {
    const u = JSON.parse(user);
    if (authContent) authContent.classList.add('hidden');
    if (profileContent) profileContent.classList.remove('hidden');
    document.getElementById('profileName')?.textContent = u.name || u.email;
    document.getElementById('profileEmail')?.textContent = u.email;
  } else {
    if (authContent) authContent.classList.remove('hidden');
    if (profileContent) profileContent.classList.add('hidden');
  }
}

// Hook forms
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm') || document.getElementById('registerForm');

  if (loginForm) loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    try { await loginEmail(email); } catch (err) { alert(err.message); }
  });

  if (signupForm) signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName')?.value;
    const email = document.getElementById('signupEmail')?.value;
    try { await signUpEmail(email, null, name); } catch (err) { alert(err.message); }
  });

  updateAuthUI();
});

window.loginEmail = loginEmail;
window.signUpEmail = signUpEmail;
window.logoutUser = logoutUser;
