/* ===================================================
   DealBaazi — auth.js  (updated: OTP registration)
   =================================================== */

const API_BASE = '/api';

// Temp storage for signup data between steps
let _signupData = null;
let _otpTimer   = null;
let _resendTimer = null;

/* ════════════════════════════════════════
   TAB SWITCHING
   ════════════════════════════════════════ */
function switchTab(tab) {
  ['login','signup'].forEach(t => {
    document.getElementById(`form-${t}`)?.classList.remove('active');
    document.getElementById(`tab-${t}`)?.classList.remove('active');
  });
  document.getElementById('form-otp')?.classList.remove('active');
  document.getElementById(`form-${tab}`)?.classList.add('active');
  document.getElementById(`tab-${tab}`)?.classList.add('active');
}

/* ════════════════════════════════════════
   LOGIN
   ════════════════════════════════════════ */
async function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const msg      = document.getElementById('login-msg');
  const btn      = document.getElementById('login-btn');

  if (!email || !password) { showMsg(msg,'Please fill in all fields.','error'); return; }

  setLoading(btn, true, 'Signing In...');

  try {
    const res  = await fetch(`${API_BASE}/auth/login`, {
      method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) { showMsg(msg, data.message || 'Login failed. Check credentials.','error'); return; }

    localStorage.setItem('db_token', data.token);
    localStorage.setItem('db_user', JSON.stringify(data.user));
    showMsg(msg,'Signed in! Redirecting...','success');
    setTimeout(() => { window.location.href = 'pages/dashboard.html'; }, 700);

  } catch { showMsg(msg,'Network error. Please try again.','error'); }
  finally  { setLoading(btn, false, 'Sign In <span>→</span>'); }
}

/* ════════════════════════════════════════
   SIGNUP — STEP 1: Collect details & send OTP
   ════════════════════════════════════════ */
async function handleSignupStep1(e) {
  e.preventDefault();
  const fname    = document.getElementById('signup-fname').value.trim();
  const lname    = document.getElementById('signup-lname').value.trim();
  const email    = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm  = document.getElementById('signup-confirm').value;
  const msg      = document.getElementById('signup-msg');
  const btn      = document.getElementById('signup-btn');

  if (!fname || !email || !password) { showMsg(msg,'Please fill in all required fields.','error'); return; }
  if (password.length < 8)           { showMsg(msg,'Password must be at least 8 characters.','error'); return; }
  if (password !== confirm)          { showMsg(msg,'Passwords do not match.','error'); return; }

  setLoading(btn, true, '');

  try {
    const res  = await fetch(`${API_BASE}/auth/send-otp`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email })
    });
    const data = await res.json();

    if (!res.ok) { showMsg(msg, data.message || 'Could not send OTP. Try again.','error'); return; }

    // Save data for step 2
    _signupData = { firstName: fname, lastName: lname, email, password };

    // Show OTP screen
    showOtpScreen(email);

  } catch { showMsg(msg,'Network error. Please try again.','error'); }
  finally  { setLoading(btn, false, 'Send Verification Code →'); }
}

/* ════════════════════════════════════════
   OTP SCREEN — show / hide
   ════════════════════════════════════════ */
function showOtpScreen(email) {
  document.getElementById('form-signup').classList.remove('active');

  const otpForm = document.getElementById('form-otp');
  otpForm.classList.add('active');

  // Show email in message
  const el = document.getElementById('otp-email-display');
  if (el) el.innerHTML = `We sent a 6-digit code to <strong>${email}</strong>`;

  // Clear boxes
  document.querySelectorAll('.otp-box').forEach(b => { b.value=''; b.classList.remove('filled','error-shake'); });
  document.querySelector('.otp-box')?.focus();

  // Start 10-min countdown
  startOtpTimer(10 * 60);

  // Start 60-sec resend lockout
  startResendCountdown(60);

  document.getElementById('otp-msg').className = 'form-msg';
  document.getElementById('otp-msg').textContent = '';
}

function backToSignup() {
  document.getElementById('form-otp').classList.remove('active');
  document.getElementById('form-signup').classList.add('active');
  clearInterval(_otpTimer);
  clearInterval(_resendTimer);
}

/* ════════════════════════════════════════
   OTP INPUT HANDLING
   ════════════════════════════════════════ */
function otpInput(box) {
  // Allow only digits
  box.value = box.value.replace(/\D/g,'');
  box.classList.toggle('filled', box.value !== '');

  // Auto-advance
  if (box.value && box.dataset.index < 5) {
    const next = document.querySelector(`.otp-box[data-index="${parseInt(box.dataset.index)+1}"]`);
    next?.focus();
  }

  // Auto-submit when all 6 filled
  const allFilled = [...document.querySelectorAll('.otp-box')].every(b => b.value);
  if (allFilled) verifyOtp();
}

function otpKeydown(e, box) {
  if (e.key === 'Backspace' && !box.value && box.dataset.index > 0) {
    const prev = document.querySelector(`.otp-box[data-index="${parseInt(box.dataset.index)-1}"]`);
    if (prev) { prev.value=''; prev.classList.remove('filled'); prev.focus(); }
  }
  // Allow paste on first box
  if (e.key === 'v' && (e.ctrlKey || e.metaKey) && box.dataset.index == 0) {
    setTimeout(() => handleOtpPaste(), 50);
  }
}

function handleOtpPaste() {
  const text = document.querySelector('.otp-box').value.replace(/\D/g,'').slice(0,6);
  const boxes = document.querySelectorAll('.otp-box');
  [...text].forEach((ch, i) => { if(boxes[i]){ boxes[i].value=ch; boxes[i].classList.add('filled'); } });
  boxes[Math.min(text.length, 5)]?.focus();
  if (text.length === 6) verifyOtp();
}

/* Paste event on the whole otp-inputs div */
document.addEventListener('paste', (e) => {
  if (!document.getElementById('form-otp')?.classList.contains('active')) return;
  const text = (e.clipboardData||window.clipboardData).getData('text').replace(/\D/g,'').slice(0,6);
  if (text.length < 4) return;
  const boxes = document.querySelectorAll('.otp-box');
  [...text].forEach((ch,i) => { if(boxes[i]){ boxes[i].value=ch; boxes[i].classList.add('filled'); } });
  boxes[Math.min(text.length,5)]?.focus();
  if (text.length===6) setTimeout(verifyOtp,100);
});

/* ════════════════════════════════════════
   SIGNUP — STEP 2: Verify OTP & create account
   ════════════════════════════════════════ */
async function verifyOtp() {
  const otp = [...document.querySelectorAll('.otp-box')].map(b=>b.value).join('');
  const msg = document.getElementById('otp-msg');
  const btn = document.getElementById('otp-verify-btn');

  if (otp.length < 6) { showMsg(msg,'Please enter all 6 digits.','error'); return; }
  if (!_signupData)   { showMsg(msg,'Session expired. Please try again.','error'); backToSignup(); return; }

  setLoading(btn, true, '');

  try {
    const res  = await fetch(`${API_BASE}/auth/register`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ..._signupData, otp })
    });
    const data = await res.json();

    if (!res.ok) {
      if (data.code === 'INVALID_OTP' || data.code === 'OTP_EXPIRED') {
        shakeOtpBoxes();
        showMsg(msg, data.message || 'Invalid or expired code.','error');
      } else {
        showMsg(msg, data.message || 'Registration failed.','error');
      }
      return;
    }

    clearInterval(_otpTimer);
    clearInterval(_resendTimer);
    _signupData = null;

    localStorage.setItem('db_token', data.token);
    localStorage.setItem('db_user', JSON.stringify(data.user));
    showMsg(msg,'🎉 Account created! Redirecting...','success');
    setTimeout(() => { window.location.href = 'pages/dashboard.html'; }, 900);

  } catch { showMsg(msg,'Network error. Please try again.','error'); }
  finally  { setLoading(btn, false, 'Verify & Create Account'); }
}

function shakeOtpBoxes() {
  document.querySelectorAll('.otp-box').forEach(b => {
    b.classList.remove('error-shake');
    void b.offsetWidth; // reflow
    b.classList.add('error-shake');
    setTimeout(() => b.classList.remove('error-shake'), 500);
  });
}

/* ════════════════════════════════════════
   RESEND OTP
   ════════════════════════════════════════ */
async function resendOtp() {
  if (!_signupData) return;
  const msg = document.getElementById('otp-msg');

  try {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email: _signupData.email })
    });
    if (res.ok) {
      showMsg(msg,'New code sent!','success');
      startOtpTimer(10 * 60);
      startResendCountdown(60);
    } else {
      showMsg(msg,'Failed to resend. Try again in a moment.','error');
    }
  } catch { showMsg(msg,'Network error.','error'); }
}

/* ════════════════════════════════════════
   TIMERS
   ════════════════════════════════════════ */
function startOtpTimer(seconds) {
  clearInterval(_otpTimer);
  const display = document.getElementById('otp-timer-display');
  let remaining = seconds;

  function tick() {
    const m = String(Math.floor(remaining/60)).padStart(2,'0');
    const s = String(remaining % 60).padStart(2,'0');
    if (display) display.textContent = `${m}:${s}`;
    if (remaining <= 0) {
      clearInterval(_otpTimer);
      if (display) display.textContent = 'Expired';
    }
    remaining--;
  }
  tick();
  _otpTimer = setInterval(tick, 1000);
}

function startResendCountdown(seconds) {
  clearInterval(_resendTimer);
  const btn = document.getElementById('resend-btn');
  const countEl = document.getElementById('resend-countdown');
  if (btn) btn.disabled = true;
  let remaining = seconds;

  function tick() {
    if (countEl) countEl.textContent = remaining;
    if (remaining <= 0) {
      clearInterval(_resendTimer);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Resend code';
      }
    }
    remaining--;
  }
  tick();
  _resendTimer = setInterval(tick, 1000);
}

/* ════════════════════════════════════════
   PASSWORD STRENGTH METER
   ════════════════════════════════════════ */
const pwInput = document.getElementById('signup-password');
if (pwInput) {
  pwInput.addEventListener('input', () => {
    const val = pwInput.value;
    const bar = document.getElementById('pw-strength');
    if (!bar) return;
    if (val.length < 1) { bar.className='password-strength'; return; }
    const score = (val.length>=8?1:0) + (/[A-Z]/.test(val)?1:0) + (/\d/.test(val)?1:0) + (/[^A-Za-z0-9]/.test(val)?1:0);
    bar.className = 'password-strength ' + (score<=1?'weak':score<=2?'medium':'strong');
  });
}

/* ════════════════════════════════════════
   SOCIAL AUTH
   ════════════════════════════════════════ */
function socialLogin(provider) {
  window.location.href = `${API_BASE}/auth/${provider}`;
}

/* ════════════════════════════════════════
   LOGOUT
   ════════════════════════════════════════ */
function logout() {
  localStorage.removeItem('db_token');
  localStorage.removeItem('db_user');
  window.location.href = '../index.html';
}

/* ════════════════════════════════════════
   NAV USER INIT
   ════════════════════════════════════════ */
function loadUserNav() {
  const user = JSON.parse(localStorage.getItem('db_user') || '{}');
  const el   = document.getElementById('user-initial');
  if (el && user.firstName) el.textContent = user.firstName[0].toUpperCase();
}
function toggleDropdown() {
  document.getElementById('nav-dropdown')?.classList.toggle('open');
}
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-avatar')) document.getElementById('nav-dropdown')?.classList.remove('open');
});

/* ════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════ */
function showMsg(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className   = `form-msg ${type}`;
}

function setLoading(btn, loading, label) {
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';
  } else {
    btn.disabled = false;
    btn.innerHTML = label;
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function requireAuth() {
  const token = localStorage.getItem('db_token');
  if (!token) { window.location.href = '../index.html'; return null; }
  return JSON.parse(localStorage.getItem('db_user') || '{}');
}

if (document.getElementById('user-initial')) loadUserNav();
