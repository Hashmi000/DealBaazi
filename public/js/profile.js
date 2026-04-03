/* ===================================================
   DealBaazi — profile.js
   =================================================== */

let _editMode = false;

document.addEventListener('DOMContentLoaded', async () => {
  loadUserNav();
  await loadProfileData();
  loadPreferences();
});

/* ── Load Profile Data ──────────────────────────── */
async function loadProfileData() {
  const token = localStorage.getItem('db_token');
  if (!token) { window.location.href = '../index.html'; return; }

  try {
    const [profileRes, alertsRes, trackedRes] = await Promise.all([
      fetch(`${API}/auth/me`,             { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch(`${API}/alerts`,              { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch(`${API}/user/tracked`,        { headers: { 'Authorization': `Bearer ${token}` } })
    ]);

    if (profileRes.ok) {
      const user = await profileRes.json();
      populateProfile(user);
    }
    if (alertsRes.ok) {
      const alerts = await alertsRes.json();
      document.getElementById('stat-alerts').textContent = alerts.length || 0;
    }
    if (trackedRes.ok) {
      const tracked = await trackedRes.json();
      document.getElementById('stat-tracked').textContent = tracked.length || 0;
    }

  } catch (err) {
    console.error('Profile load error:', err);
  }
}

function populateProfile(user) {
  document.getElementById('profile-display-name').textContent = `${user.firstName} ${user.lastName || ''}`.trim();
  document.getElementById('profile-display-email').textContent = user.email;
  document.getElementById('profile-avatar-display').textContent = (user.firstName || 'U')[0].toUpperCase();

  if (user.isVerified) document.getElementById('verified-badge').style.display = 'inline-flex';

  document.getElementById('pf-fname').value  = user.firstName  || '';
  document.getElementById('pf-lname').value  = user.lastName   || '';
  document.getElementById('pf-email').value  = user.email      || '';
  document.getElementById('pf-phone').value  = user.phone      || '';
  document.getElementById('pf-city').value   = user.city       || '';
}

/* ── Toggle Edit Mode ───────────────────────────── */
function toggleEdit() {
  _editMode = !_editMode;
  const inputs = document.querySelectorAll('#profile-form input:not([type="email"])');
  const btn    = document.getElementById('edit-toggle-btn');
  const actions= document.getElementById('form-actions');

  inputs.forEach(inp => inp.disabled = !_editMode);
  btn.textContent     = _editMode ? '✕ Cancel' : '✏️ Edit';
  actions.style.display = _editMode ? 'flex' : 'none';
}

function cancelEdit() {
  _editMode = false;
  document.querySelectorAll('#profile-form input:not([type="email"])').forEach(inp => inp.disabled = true);
  document.getElementById('edit-toggle-btn').textContent = '✏️ Edit';
  document.getElementById('form-actions').style.display = 'none';
  loadProfileData();
}

/* ── Save Profile ───────────────────────────────── */
async function saveProfile(e) {
  e.preventDefault();
  const token = localStorage.getItem('db_token');
  const msg   = document.getElementById('profile-msg');

  const payload = {
    firstName: document.getElementById('pf-fname').value.trim(),
    lastName:  document.getElementById('pf-lname').value.trim(),
    phone:     document.getElementById('pf-phone').value.trim(),
    city:      document.getElementById('pf-city').value.trim()
  };

  try {
    const res = await fetch(`${API}/user/profile`, {
      method: 'PUT',
      headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error();

    // Update localStorage
    const stored = JSON.parse(localStorage.getItem('db_user') || '{}');
    localStorage.setItem('db_user', JSON.stringify({ ...stored, firstName: payload.firstName }));

    showMsg(msg, '✅ Profile updated!', 'success');
    document.getElementById('profile-display-name').textContent = `${payload.firstName} ${payload.lastName}`.trim();
    cancelEdit();

  } catch {
    showMsg(msg, 'Failed to save changes. Please try again.', 'error');
  }
}

/* ── Change Password ────────────────────────────── */
async function changePassword(e) {
  e.preventDefault();
  const token   = localStorage.getItem('db_token');
  const current = document.getElementById('pw-current').value;
  const newPw   = document.getElementById('pw-new').value;
  const confirm = document.getElementById('pw-confirm').value;
  const msg     = document.getElementById('pw-msg');

  if (newPw !== confirm) { showMsg(msg, 'New passwords do not match.','error'); return; }
  if (newPw.length < 8)  { showMsg(msg, 'Password must be at least 8 characters.','error'); return; }

  try {
    const res = await fetch(`${API}/user/change-password`, {
      method: 'PUT',
      headers: { 'Content-Type':'application/json','Authorization': `Bearer ${token}` },
      body: JSON.stringify({ currentPassword: current, newPassword: newPw })
    });
    const data = await res.json();

    if (!res.ok) { showMsg(msg, data.message || 'Incorrect current password.','error'); return; }
    showMsg(msg, '✅ Password changed successfully!','success');
    document.getElementById('pw-form').reset();

  } catch {
    showMsg(msg, 'Network error. Please try again.','error');
  }
}

/* ── Notification Preferences ───────────────────── */
function loadPreferences() {
  const prefs = JSON.parse(localStorage.getItem('db_prefs') || '{}');
  document.getElementById('pref-price').checked  = prefs.price  !== false;
  document.getElementById('pref-weekly').checked = prefs.weekly === true;
  document.getElementById('pref-flash').checked  = prefs.flash  === true;
}

function savePref(key, value) {
  const prefs = JSON.parse(localStorage.getItem('db_prefs') || '{}');
  prefs[key] = value;
  localStorage.setItem('db_prefs', JSON.stringify(prefs));
  showToast(`Preference saved.`, 'success');

  // Optionally sync to backend
  const token = localStorage.getItem('db_token');
  if (token) fetch(`${API}/user/preferences`, {
    method:'PUT',
    headers:{ 'Content-Type':'application/json','Authorization': `Bearer ${token}` },
    body: JSON.stringify({ [key]: value })
  }).catch(() => {});
}

/* ── Avatar Preview ─────────────────────────────── */
function previewAvatar(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const el = document.getElementById('profile-avatar-display');
    el.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />`;
  };
  reader.readAsDataURL(file);
}

/* ── Delete Account ─────────────────────────────── */
function confirmDelete() {
  const confirmed = confirm('Are you absolutely sure? This cannot be undone.\n\nAll your data will be permanently deleted.');
  if (!confirmed) return;

  const token = localStorage.getItem('db_token');
  fetch(`${API}/user/delete`, {
    method:'DELETE',
    headers:{ 'Authorization': `Bearer ${token}` }
  }).then(() => {
    localStorage.clear();
    window.location.href = '../index.html';
  }).catch(() => showToast('Failed to delete account.','error'));
}

/* ── Helper ─────────────────────────────────────── */
function showMsg(el, text, type) {
  el.textContent = text;
  el.className = `form-msg ${type}`;
}
