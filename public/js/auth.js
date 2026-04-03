/* ============================================================
   DealBaazi v2 — auth.js  (full OTP registration flow)
   ============================================================ */

const API_BASE = '/api';
let _signupData = null, _otpTimer = null, _resendTimer = null;

/* ── Tab Switch ─────────────────────────────────── */
function switchTab(tab) {
  ['login','signup'].forEach(t => {
    document.getElementById(`form-${t}`)?.classList.remove('active');
    document.getElementById(`tab-${t}`)?.classList.remove('active');
  });
  document.getElementById('form-otp')?.classList.remove('active');
  document.getElementById(`form-${tab}`)?.classList.add('active');
  document.getElementById(`tab-${tab}`)?.classList.add('active');
}

/* ── Login ──────────────────────────────────────── */
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const pwd   = document.getElementById('login-password').value;
  const msg   = document.getElementById('login-msg');
  const btn   = document.getElementById('login-btn');
  if (!email||!pwd) { showMsg(msg,'Please fill in all fields.','error'); return; }
  setBtn(btn, true);
  try {
    const res  = await fetch(`${API_BASE}/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({email,password:pwd})});
    const data = await res.json();
    if (!res.ok) { showMsg(msg, data.message||'Login failed.','error'); return; }
    localStorage.setItem('db_token', data.token);
    localStorage.setItem('db_user',  JSON.stringify(data.user));
    showMsg(msg,'Signed in! Redirecting…','success');
    setTimeout(()=>{ window.location.href='pages/dashboard.html'; }, 700);
  } catch { showMsg(msg,'Network error. Try again.','error'); }
  finally   { setBtn(btn, false, 'Sign In <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>'); }
}

/* ── Signup Step 1 ──────────────────────────────── */
async function handleSignupStep1(e) {
  e.preventDefault();
  const fname = document.getElementById('signup-fname').value.trim();
  const lname = document.getElementById('signup-lname').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const pwd   = document.getElementById('signup-password').value;
  const conf  = document.getElementById('signup-confirm').value;
  const msg   = document.getElementById('signup-msg');
  const btn   = document.getElementById('signup-btn');
  if (!fname||!email||!pwd) { showMsg(msg,'Please fill in all required fields.','error'); return; }
  if (pwd.length<8)         { showMsg(msg,'Password must be at least 8 characters.','error'); return; }
  if (pwd!==conf)           { showMsg(msg,'Passwords do not match.','error'); return; }
  setBtn(btn, true);
  try {
    const res = await fetch(`${API_BASE}/auth/send-otp`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});
    const data= await res.json();
    if (!res.ok) { showMsg(msg, data.message||'Could not send OTP.','error'); return; }
    _signupData = { firstName:fname, lastName:lname, email, password:pwd };
    showOtpScreen(email);
  } catch { showMsg(msg,'Network error. Try again.','error'); }
  finally { setBtn(btn, false, '<span id="signup-btn-text">Send Verification Code</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>'); }
}

/* ── OTP Screen ─────────────────────────────────── */
function showOtpScreen(email) {
  document.getElementById('form-signup').classList.remove('active');
  const otp = document.getElementById('form-otp');
  otp.classList.add('active');
  const sub = document.getElementById('otp-sub-text');
  if (sub) sub.innerHTML = `We sent a 6-digit code to <strong style="color:var(--em)">${email}</strong>`;
  document.querySelectorAll('.otp-box').forEach(b=>{ b.value=''; b.classList.remove('filled','shake'); });
  document.querySelector('.otp-box')?.focus();
  startOtpCountdown(600);
  startResendCD(60);
  const m = document.getElementById('otp-msg');
  if(m){ m.className='form-msg'; m.textContent=''; }
}

function backToSignup() {
  document.getElementById('form-otp').classList.remove('active');
  document.getElementById('form-signup').classList.add('active');
  clearInterval(_otpTimer); clearInterval(_resendTimer);
}

/* ── OTP Input ──────────────────────────────────── */
function otpInput(box) {
  box.value = box.value.replace(/\D/g,'');
  box.classList.toggle('filled', !!box.value);
  if (box.value) {
    const next = document.querySelector(`.otp-box[data-idx="${+box.dataset.idx+1}"]`);
    next?.focus();
  }
  if ([...document.querySelectorAll('.otp-box')].every(b=>b.value)) verifyOtp();
}

function otpKey(e, box) {
  if (e.key==='Backspace' && !box.value && box.dataset.idx>0) {
    const prev = document.querySelector(`.otp-box[data-idx="${+box.dataset.idx-1}"]`);
    if (prev) { prev.value=''; prev.classList.remove('filled'); prev.focus(); }
  }
}

document.addEventListener('paste', e => {
  if (!document.getElementById('form-otp')?.classList.contains('active')) return;
  const text = (e.clipboardData||window.clipboardData).getData('text').replace(/\D/g,'').slice(0,6);
  if (text.length<4) return;
  e.preventDefault();
  const boxes = document.querySelectorAll('.otp-box');
  [...text].forEach((c,i)=>{ if(boxes[i]){ boxes[i].value=c; boxes[i].classList.add('filled'); } });
  boxes[Math.min(text.length,5)]?.focus();
  if(text.length===6) setTimeout(verifyOtp,80);
});

/* ── Verify OTP ─────────────────────────────────── */
async function verifyOtp() {
  const otp = [...document.querySelectorAll('.otp-box')].map(b=>b.value).join('');
  const msg = document.getElementById('otp-msg');
  const btn = document.getElementById('otp-verify-btn');
  if (otp.length<6) { showMsg(msg,'Enter all 6 digits.','error'); return; }
  if (!_signupData) { showMsg(msg,'Session expired. Go back and try again.','error'); return; }
  setBtn(btn, true);
  try {
    const res = await fetch(`${API_BASE}/auth/register`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({..._signupData,otp})});
    const data= await res.json();
    if (!res.ok) {
      if (data.code==='INVALID_OTP'||data.code==='OTP_EXPIRED') shakeBoxes();
      showMsg(msg, data.message||'Invalid code.','error'); return;
    }
    clearInterval(_otpTimer); clearInterval(_resendTimer); _signupData=null;
    localStorage.setItem('db_token', data.token);
    localStorage.setItem('db_user',  JSON.stringify(data.user));
    showMsg(msg,'🎉 Welcome to DealBaazi! Redirecting…','success');
    setTimeout(()=>{ window.location.href='pages/dashboard.html'; },900);
  } catch { showMsg(msg,'Network error.','error'); }
  finally { setBtn(btn,false,'<span id="otp-btn-text">Verify &amp; Create Account</span>'); }
}

function shakeBoxes() {
  document.querySelectorAll('.otp-box').forEach(b=>{ b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); setTimeout(()=>b.classList.remove('shake'),450); });
}

/* ── Resend ─────────────────────────────────────── */
async function resendOtp() {
  if (!_signupData) return;
  try {
    const res = await fetch(`${API_BASE}/auth/send-otp`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:_signupData.email})});
    if (res.ok) { showMsg(document.getElementById('otp-msg'),'New code sent!','success'); startOtpCountdown(600); startResendCD(60); }
    else showMsg(document.getElementById('otp-msg'),'Failed to resend.','error');
  } catch {}
}

/* ── Timers ─────────────────────────────────────── */
function startOtpCountdown(secs) {
  clearInterval(_otpTimer);
  let s=secs;
  const el=document.getElementById('otp-timer');
  const tick=()=>{ if(el) el.textContent=`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; if(s<=0){clearInterval(_otpTimer);if(el)el.textContent='Expired';} s--; };
  tick(); _otpTimer=setInterval(tick,1000);
}
function startResendCD(secs) {
  clearInterval(_resendTimer);
  let s=secs;
  const btn=document.getElementById('otp-resend'), cd=document.getElementById('otp-resend-cd');
  if(btn) btn.disabled=true;
  const tick=()=>{ if(cd) cd.textContent=s; if(s<=0){clearInterval(_resendTimer);if(btn){btn.disabled=false;btn.innerHTML='Resend code';}} s--; };
  tick(); _resendTimer=setInterval(tick,1000);
}

/* ── Social ─────────────────────────────────────── */
function socialLogin(p) { window.location.href=`${API_BASE}/auth/${p}`; }

/* ── Logout ─────────────────────────────────────── */
function logout() { localStorage.removeItem('db_token'); localStorage.removeItem('db_user'); window.location.href='../index.html'; }

/* ── Nav user ───────────────────────────────────── */
function loadUserNav() {
  const user=JSON.parse(localStorage.getItem('db_user')||'{}');
  const el=document.getElementById('nav-avatar')||document.getElementById('user-initial');
  if(el&&user.firstName) el.textContent=user.firstName[0].toUpperCase();
}

/* ── Helpers ────────────────────────────────────── */
function showMsg(el,text,type) { if(!el)return; el.textContent=text; el.className=`form-msg ${type}`; }
function setBtn(btn,loading,label='') {
  if(!btn)return;
  btn.disabled=loading;
  if(loading) btn.innerHTML='<span class="spinner"></span>';
  else if(label) btn.innerHTML=label;
}
function showToast(message,type='info') {
  const c=document.getElementById('toast-container'); if(!c)return;
  const t=document.createElement('div'); t.className=`toast ${type}`; t.textContent=message;
  c.appendChild(t); setTimeout(()=>t.remove(),3500);
}
function requireAuth() {
  const tok=localStorage.getItem('db_token'); if(!tok){window.location.href='../index.html';return null;}
  return JSON.parse(localStorage.getItem('db_user')||'{}');
}

if(document.getElementById('nav-avatar')) loadUserNav();
