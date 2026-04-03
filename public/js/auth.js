/* ===================================================
   DEALBAAZI — auth.js
   Handles login, signup, session, social auth
   =================================================== */

const API_BASE = '/api'; // Your backend URL

/* ── Tab Switch ────────────────────────────────── */
function switchTab(tab) {
  document.getElementById('form-login').classList.remove('active');
  document.getElementById('form-signup').classList.remove('active');
  document.getElementById('tab-login').classList.remove('active');
  document.getElementById('tab-signup').classList.remove('active');

  document.getElementById(`form-${tab}`).classList.add('active');
  document.getElementById(`tab-${tab}`).classList.add('active');
}

/* ── Handle Login ──────────────────────────────── */
async function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const msg      = document.getElementById('login-msg');

  if (!email || !password) {
    showMsg(msg, 'Please fill in all fields.', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      showMsg(msg, data.message || 'Login failed. Check credentials.', 'error');
      return;
    }

    // Store token & user info
    localStorage.setItem('ph_token', data.token);
    localStorage.setItem('ph_user', JSON.stringify(data.user));

    showMsg(msg, 'Signed in! Redirecting...', 'success');
    setTimeout(() => { window.location.href = 'pages/dashboard.html'; }, 800);

  } catch (err) {
    showMsg(msg, 'Network error. Please try again.', 'error');
  }
}

/* ── Handle Signup ─────────────────────────────── */
async function handleSignup(e) {
  e.preventDefault();
  const fname    = document.getElementById('signup-fname').value.trim();
  const lname    = document.getElementById('signup-lname').value.trim();
  const email    = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm  = document.getElementById('signup-confirm').value;
  const msg      = document.getElementById('signup-msg');

  if (!fname || !email || !password) {
    showMsg(msg, 'Please fill in all required fields.', 'error'); return;
  }
  if (password !== confirm) {
    showMsg(msg, 'Passwords do not match.', 'error'); return;
  }
  if (password.length < 8) {
    showMsg(msg, 'Password must be at least 8 characters.', 'error'); return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: fname, lastName: lname, email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      showMsg(msg, data.message || 'Registration failed.', 'error'); return;
    }

    localStorage.setItem('ph_token', data.token);
    localStorage.setItem('ph_user', JSON.stringify(data.user));
    showMsg(msg, 'Account created! Redirecting...', 'success');
    setTimeout(() => { window.location.href = 'pages/dashboard.html'; }, 800);

  } catch (err) {
    showMsg(msg, 'Network error. Please try again.', 'error');
  }
}

/* ── Social Login ──────────────────────────────── */
function socialLogin(provider) {
  // Redirect to backend OAuth route
  window.location.href = `${API_BASE}/auth/${provider}`;
}

/* ── Logout ────────────────────────────────────── */
function logout() {
  localStorage.removeItem('ph_token');
  localStorage.removeItem('ph_user');
  window.location.href = '../index.html';
}

/* ── Auth Guard ────────────────────────────────── */
function requireAuth() {
  const token = localStorage.getItem('ph_token');
  if (!token) {
    window.location.href = '../index.html';
    return null;
  }
  return JSON.parse(localStorage.getItem('ph_user') || '{}');
}

/* ── Load User Info into Nav ───────────────────── */
function loadUserNav() {
  const user = JSON.parse(localStorage.getItem('ph_user') || '{}');
  const el = document.getElementById('user-initial');
  if (el && user.firstName) {
    el.textContent = user.firstName[0].toUpperCase();
  }
}

/* ── Nav Dropdown Toggle ───────────────────────── */
function toggleDropdown() {
  const dd = document.getElementById('nav-dropdown');
  if (dd) dd.classList.toggle('open');
}
document.addEventListener('click', (e) => {
  const dd = document.getElementById('nav-dropdown');
  if (dd && !e.target.closest('.nav-avatar')) dd.classList.remove('open');
});

/* ── Helper: show form message ─────────────────── */
function showMsg(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = `form-msg ${type}`;
}

/* ── Toast Helper (global) ─────────────────────── */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// Init nav if on dashboard
if (document.getElementById('user-initial')) {
  loadUserNav();
}
