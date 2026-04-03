/* ===================================================
   DealBaazi — alerts.js
   =================================================== */

let _allAlerts = [];
let _currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  loadUserNav();
  await loadAlerts();
});

/* ── Load Alerts ────────────────────────────────── */
async function loadAlerts() {
  const token = localStorage.getItem('db_token');
  if (!token) { window.location.href = '../index.html'; return; }

  document.getElementById('alerts-skeleton').style.display = 'flex';
  document.getElementById('alerts-list').innerHTML = '';

  try {
    const res = await fetch(`${API}/alerts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error();
    _allAlerts = await res.json();

    updateSummary();
    renderAlerts(_allAlerts);

  } catch (err) {
    document.getElementById('alerts-list').innerHTML =
      '<p style="color:var(--text-3);padding:20px">Failed to load alerts. Please refresh.</p>';
  } finally {
    document.getElementById('alerts-skeleton').style.display = 'none';
  }
}

/* ── Update Summary Numbers ─────────────────────── */
function updateSummary() {
  const triggered = _allAlerts.filter(a => a.isTriggered);
  document.getElementById('alert-total-count').textContent     = _allAlerts.filter(a=>a.isActive).length;
  document.getElementById('alert-triggered-count').textContent = triggered.length;

  const totalSavings = triggered.reduce((sum, a) => {
    const diff = (a.currentPrice || 0) - (a.targetPrice || 0);
    return sum + (diff > 0 ? diff : 0);
  }, 0);
  document.getElementById('alert-savings').textContent = `₹${totalSavings.toLocaleString('en-IN')}`;
}

/* ── Render Alert Cards ─────────────────────────── */
function renderAlerts(alerts) {
  const list  = document.getElementById('alerts-list');
  const empty = document.getElementById('alerts-empty');

  const filtered = alerts.filter(a => {
    if (_currentFilter === 'active')    return a.isActive && !a.isTriggered;
    if (_currentFilter === 'triggered') return a.isTriggered;
    return true;
  });

  if (!filtered.length) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  list.innerHTML = filtered.map((a, i) => alertCardHTML(a, i)).join('');
}

function alertCardHTML(a, idx) {
  const delay = Math.min(idx * 0.04, 0.4);
  const isTriggered = a.isTriggered;
  const drop = a.currentPrice && a.targetPrice && a.currentPrice < a.targetPrice
    ? a.targetPrice - a.currentPrice : 0;

  return `
  <div class="alert-card ${isTriggered ? 'triggered' : ''}" style="animation-delay:${delay}s">
    <div class="alert-img-placeholder">🔔</div>
    <div class="alert-info">
      <div class="alert-product-name">${escapeHTML(a.productName || 'Product')}</div>
      <div class="alert-price-row">
        <span class="alert-current-price">Current: <strong>₹${formatPrice(a.currentPrice)}</strong></span>
        <span class="alert-target">
          Target: <span class="target-val">₹${formatPrice(a.targetPrice)}</span>
        </span>
        ${isTriggered ? '<span class="alert-triggered-badge">✅ Triggered!</span>' : ''}
        ${drop > 0 ? `<span style="color:var(--green);font-size:.75rem;font-weight:600">↓ ₹${formatPrice(drop)} below target</span>` : ''}
      </div>
      <div class="alert-date">Set on ${formatDate(a.createdAt)}</div>
    </div>
    <div class="alert-actions">
      ${isTriggered
        ? `<a href="dashboard.html?q=${encodeURIComponent(a.productName||'')}" class="btn-primary-sm" style="font-size:.75rem;padding:7px 12px">View Deals</a>`
        : `<span style="font-size:.75rem;color:var(--text-3)">Watching...</span>`
      }
      <button class="alert-delete-btn" onclick="deleteAlert('${a._id}', this)">Remove</button>
    </div>
  </div>`;
}

/* ── Filter Tabs ────────────────────────────────── */
function filterAlerts(filter, btn) {
  _currentFilter = filter;
  document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAlerts(_allAlerts);
}

/* ── Delete Alert ───────────────────────────────── */
async function deleteAlert(id, btn) {
  const token = localStorage.getItem('db_token');
  btn.textContent = '...';
  btn.disabled = true;

  try {
    const res = await fetch(`${API}/alerts/${id}`, {
      method:'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error();

    _allAlerts = _allAlerts.filter(a => a._id !== id);
    updateSummary();
    renderAlerts(_allAlerts);
    showToast('Alert removed.', 'info');

  } catch {
    btn.textContent = 'Remove';
    btn.disabled = false;
    showToast('Failed to remove alert.', 'error');
  }
}

/* ── Add Alert Modal ────────────────────────────── */
function openAddAlertModal() {
  document.getElementById('add-alert-modal').classList.add('open');
  document.getElementById('alert-product-input')?.focus();
}
function closeAddAlertModal(e) {
  if (!e || e.target.id === 'add-alert-modal') {
    document.getElementById('add-alert-modal').classList.remove('open');
    document.getElementById('add-alert-msg').className = 'form-msg';
  }
}

async function createManualAlert() {
  const product = document.getElementById('alert-product-input').value.trim();
  const price   = document.getElementById('alert-target-price').value;
  const msg     = document.getElementById('add-alert-msg');
  const token   = localStorage.getItem('db_token');

  if (!product || !price) { showMsgEl(msg,'Please fill in both fields.','error'); return; }

  try {
    const res = await fetch(`${API}/alerts`, {
      method:'POST',
      headers: { 'Content-Type':'application/json','Authorization': `Bearer ${token}` },
      body: JSON.stringify({ productName: product, targetPrice: Number(price) })
    });
    if (!res.ok) throw new Error();

    showMsgEl(msg,'✅ Alert set! We\'ll email you when the price drops.','success');
    setTimeout(() => {
      closeAddAlertModal();
      loadAlerts();
    }, 1200);

  } catch {
    showMsgEl(msg,'Failed to create alert. Please try again.','error');
  }
}

/* ── Helpers ────────────────────────────────────── */
function formatDate(d)   { return d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric',month:'short',year:'numeric' }) : ''; }
function showMsgEl(el, text, type) { el.textContent=text; el.className=`form-msg ${type}`; }
