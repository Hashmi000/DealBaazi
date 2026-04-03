/* ===================================================
   DealBaazi — tracked.js
   =================================================== */

const API = '/api';
let _allTracked = [];
let _sortMode   = 'recent';

document.addEventListener('DOMContentLoaded', async () => {
  loadUserNav();
  await loadTrackedItems();
});

/* ── Load Tracked Items ─────────────────────────── */
async function loadTrackedItems() {
  const token = localStorage.getItem('db_token');
  if (!token) { window.location.href = '../index.html'; return; }

  document.getElementById('tracked-skeleton').style.display = 'grid';
  document.getElementById('tracked-grid').innerHTML = '';

  try {
    const res = await fetch(`${API}/user/tracked`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error();
    _allTracked = await res.json();

    updateTrackedSummary();
    renderTracked(_allTracked);

  } catch {
    document.getElementById('tracked-grid').innerHTML =
      '<p style="color:var(--text-3);padding:20px;grid-column:1/-1">Failed to load. Please refresh.</p>';
  } finally {
    document.getElementById('tracked-skeleton').style.display = 'none';
  }
}

/* ── Summary Strip ──────────────────────────────── */
function updateTrackedSummary() {
  document.getElementById('tracked-total').textContent = _allTracked.length;

  const dropsToday = _allTracked.filter(t => {
    if (!t.priceHistory || t.priceHistory.length < 2) return false;
    const last = t.priceHistory[t.priceHistory.length - 1];
    const prev = t.priceHistory[t.priceHistory.length - 2];
    return last.price < prev.price;
  }).length;
  document.getElementById('tracked-drops').textContent = dropsToday;

  const avgDrop = _allTracked.reduce((sum, t) => {
    if (!t.priceHistory || t.priceHistory.length < 2) return sum;
    const first = t.priceHistory[0].price;
    const last  = t.priceHistory[t.priceHistory.length - 1].price;
    return sum + Math.max(0, first - last);
  }, 0) / Math.max(_allTracked.length, 1);

  document.getElementById('tracked-avg-drop').textContent =
    avgDrop > 0 ? `₹${Math.round(avgDrop).toLocaleString('en-IN')}` : '₹0';
}

/* ── Render Tracked Cards ───────────────────────── */
function renderTracked(items) {
  const grid  = document.getElementById('tracked-grid');
  const empty = document.getElementById('tracked-empty');

  if (!items.length) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  const sorted = sortItems([...items], _sortMode);
  grid.innerHTML = sorted.map((item, i) => trackedCardHTML(item, i)).join('');

  // Draw mini charts after render
  sorted.forEach((item, i) => {
    if (item.priceHistory && item.priceHistory.length > 1) {
      drawMiniChart(`chart-${i}`, item.priceHistory);
    }
  });
}

/* ── Card HTML ──────────────────────────────────── */
function trackedCardHTML(item, idx) {
  const delay   = Math.min(idx * 0.05, 0.5);
  const history = item.priceHistory || [];
  const current = item.currentPrice || item.bestPrice || 0;
  const first   = history.length ? history[0].price : current;
  const prev    = history.length > 1 ? history[history.length - 2].price : current;
  const drop    = first - current;
  const dayDrop = prev - current;

  let changeHTML = '';
  if (dayDrop > 0)        changeHTML = `<span class="price-drop">↓ ₹${formatPrice(dayDrop)} today</span>`;
  else if (dayDrop < 0)   changeHTML = `<span class="price-rise">↑ ₹${formatPrice(Math.abs(dayDrop))} today</span>`;
  else                    changeHTML = `<span class="price-stable">— No change</span>`;

  return `
  <div class="tracked-card" style="animation-delay:${delay}s">
    ${drop > 0 ? `<div class="tracked-badge-drop">↓ ₹${formatPrice(drop)} drop</div>` : ''}
    <img class="tracked-card-img"
         src="${item.image || 'https://via.placeholder.com/200x160?text=Product'}"
         alt="${escapeHTML(item.name)}"
         onerror="this.src='https://via.placeholder.com/200x160?text=Product'" />
    <div class="tracked-card-body">
      <div class="tracked-store">${escapeHTML(item.bestStore || 'Marketplace')}</div>
      <div class="tracked-name">${escapeHTML(item.name)}</div>
      <div class="tracked-price-section">
        <div class="tracked-current-label">Current Best Price</div>
        <div style="display:flex;align-items:baseline;gap:8px">
          <div class="tracked-current-price">₹${formatPrice(current)}</div>
          ${first > current ? `<span class="tracked-was">₹${formatPrice(first)}</span>` : ''}
        </div>
        <div class="price-change-row">${changeHTML}</div>
        ${history.length > 1
          ? `<canvas id="chart-${idx}" class="tracked-mini-chart" width="220" height="36"></canvas>`
          : ''}
      </div>
      <div class="tracked-actions">
        <button class="tracked-action-btn" onclick="viewHistory('${item._id || item.id}', event)">📈 History</button>
        <button class="tracked-action-btn" onclick="goToProduct('${item._id || item.id}', event)">🔍 Prices</button>
        <button class="tracked-action-btn danger" onclick="untrack('${item._id || item.id}', this, event)">✕</button>
      </div>
    </div>
  </div>`;
}

/* ── Mini Sparkline Chart (pure canvas) ─────────── */
function drawMiniChart(canvasId, history) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  const prices = history.map(h => h.price).filter(Boolean);
  if (prices.length < 2) return;

  const W   = canvas.offsetWidth || 220;
  const H   = canvas.offsetHeight || 36;
  canvas.width  = W;
  canvas.height = H;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const pts = prices.map((p, i) => ({
    x: (i / (prices.length - 1)) * W,
    y: H - ((p - min) / range) * (H - 6) - 3
  }));

  // Gradient fill
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  const isDown = prices[prices.length - 1] < prices[0];
  grad.addColorStop(0, isDown ? 'rgba(46,212,122,0.3)' : 'rgba(255,77,77,0.3)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');

  // Fill under line
  ctx.beginPath();
  ctx.moveTo(pts[0].x, H);
  pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[pts.length - 1].x, H);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = isDown ? '#2ed47a' : '#ff4d4d';
  ctx.lineWidth   = 1.8;
  ctx.lineJoin    = 'round';
  ctx.stroke();

  // End dot
  const last = pts[pts.length - 1];
  ctx.beginPath();
  ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
  ctx.fillStyle = isDown ? '#2ed47a' : '#ff4d4d';
  ctx.fill();
}

/* ── Sort ───────────────────────────────────────── */
function sortTracked(mode) {
  _sortMode = mode;
  renderTracked(_allTracked);
}

function sortItems(items, mode) {
  switch (mode) {
    case 'price-low':
      return items.sort((a, b) => (a.currentPrice||0) - (b.currentPrice||0));
    case 'price-high':
      return items.sort((a, b) => (b.currentPrice||0) - (a.currentPrice||0));
    case 'biggest-drop': {
      return items.sort((a, b) => {
        const dropA = a.priceHistory?.length ? a.priceHistory[0].price - (a.currentPrice||0) : 0;
        const dropB = b.priceHistory?.length ? b.priceHistory[0].price - (b.currentPrice||0) : 0;
        return dropB - dropA;
      });
    }
    default:
      return items; // recent = original order from API
  }
}

/* ── View Price History Modal ───────────────────── */
async function viewHistory(productId, e) {
  if (e) e.stopPropagation();
  const modal   = document.getElementById('history-modal');
  const content = document.getElementById('history-modal-content');
  modal.classList.add('open');
  content.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-3)">Loading history...</div>`;

  // Find from local data first
  const item = _allTracked.find(t => (t._id || t.id) === productId);

  try {
    const token = localStorage.getItem('db_token');
    const res   = await fetch(`${API}/product/${productId}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    const data  = res.ok ? await res.json() : null;
    const history = data?.priceHistory || item?.priceHistory || [];
    const name    = data?.name || item?.name || 'Product';

    content.innerHTML = renderHistoryModal(name, history, data);

    // Draw full chart
    if (history.length > 1) {
      setTimeout(() => drawFullChart('full-history-chart', history), 50);
    }

  } catch {
    content.innerHTML = `<p style="color:var(--red);padding:20px">⚠️ Failed to load history.</p>`;
  }
}

function renderHistoryModal(name, history, product) {
  const tableRows = [...history].reverse().slice(0, 10).map(h => `
    <tr>
      <td>${formatDate(h.date)}</td>
      <td>${escapeHTML(h.store || 'Various')}</td>
      <td style="text-align:right;font-family:var(--font-display);font-weight:700;color:var(--text)">₹${formatPrice(h.price)}</td>
    </tr>`).join('');

  return `
  <h3>${escapeHTML(name)}</h3>
  <p style="color:var(--text-2);font-size:.85rem;margin-bottom:16px">
    Price tracked across all marketplaces
    ${product?.lowestEver ? `· <span style="color:var(--green)">Lowest ever: ₹${formatPrice(product.lowestEver)}</span>` : ''}
  </p>
  ${history.length > 1
    ? `<div class="history-chart-wrap">
         <canvas id="full-history-chart" style="width:100%;height:100%"></canvas>
       </div>`
    : `<div class="history-chart-wrap">
         <span style="color:var(--text-3);font-size:.85rem">Not enough data yet — check back tomorrow.</span>
       </div>`
  }
  <table class="history-table">
    <thead><tr><th>Date</th><th>Store</th><th style="text-align:right">Price</th></tr></thead>
    <tbody>${tableRows || '<tr><td colspan="3" style="color:var(--text-3)">No history recorded yet.</td></tr>'}</tbody>
  </table>`;
}

function drawFullChart(canvasId, history) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  const prices = history.map(h => h.price).filter(Boolean);
  if (prices.length < 2) return;

  const W   = canvas.parentElement.offsetWidth - 40;
  const H   = canvas.parentElement.offsetHeight - 40;
  canvas.width  = W;
  canvas.height = H;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const pad   = { top: 10, bottom: 24, left: 8, right: 8 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const pts = prices.map((p, i) => ({
    x: pad.left + (i / (prices.length - 1)) * chartW,
    y: pad.top + (1 - (p - min) / range) * chartH
  }));

  const isDown = prices[prices.length-1] <= prices[0];
  const lineColor = isDown ? '#2ed47a' : '#ff4d4d';

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  [0.25, 0.5, 0.75].forEach(t => {
    const y = pad.top + t * chartH;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + chartW, y); ctx.stroke();
  });

  // Gradient fill
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
  grad.addColorStop(0, isDown ? 'rgba(46,212,122,0.2)' : 'rgba(255,77,77,0.2)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pad.top + chartH);
  pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[pts.length-1].x, pad.top + chartH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = lineColor;
  ctx.lineWidth   = 2;
  ctx.lineJoin    = 'round';
  ctx.stroke();

  // Dots at each point
  pts.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.fill();
  });

  // Price labels (min, max, current)
  ctx.fillStyle = 'rgba(155,155,176,0.8)';
  ctx.font      = '10px DM Sans, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`₹${formatPrice(max)}`, pad.left, pad.top + 10);
  ctx.fillText(`₹${formatPrice(min)}`, pad.left, pad.top + chartH - 2);
}

function closeHistoryModal(e) {
  if (!e || e.target.id === 'history-modal') {
    document.getElementById('history-modal').classList.remove('open');
  }
}

/* ── Go To Product ──────────────────────────────── */
function goToProduct(productId, e) {
  if (e) e.stopPropagation();
  window.location.href = `dashboard.html?product=${productId}`;
}

/* ── Untrack ────────────────────────────────────── */
async function untrack(productId, btn, e) {
  if (e) e.stopPropagation();
  const token = localStorage.getItem('db_token');
  btn.textContent = '...';
  btn.disabled = true;

  try {
    const res = await fetch(`${API}/user/tracked/${productId}`, {
      method:'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error();

    _allTracked = _allTracked.filter(t => (t._id||t.id) !== productId);
    updateTrackedSummary();
    renderTracked(_allTracked);
    showToast('Removed from tracked items.', 'info');

  } catch {
    btn.textContent = '✕';
    btn.disabled = false;
    showToast('Failed to remove. Please try again.', 'error');
  }
}

/* ── Helpers ────────────────────────────────────── */
function formatPrice(n) { return n ? Number(n).toLocaleString('en-IN') : '—'; }
function formatDate(d)   { return d ? new Date(d).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'}) : '—'; }
function escapeHTML(str) { const d=document.createElement('div');d.textContent=str||'';return d.innerHTML; }
