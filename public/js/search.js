/* ===================================================
   DEALBAAZI — search.js
   Product search, result rendering, modal detail
   =================================================== */

let currentResults = [];
let currentPage = 1;
let currentQuery = '';

/* ── Trigger Search ────────────────────────────── */
function triggerSearch() {
  const heroInput = document.getElementById('hero-search-input');
  const navInput  = document.getElementById('nav-search-input');
  const heroVisible = document.getElementById('hero-section')?.style.display !== 'none';

  // If hero is visible, prioritize it. If hidden (already searched), prioritize navbar.
  let query = '';
  if (heroVisible) {
    query = (heroInput?.value || navInput?.value || '').trim();
  } else {
    query = (navInput?.value || heroInput?.value || '').trim();
  }

  if (!query) return;

  // Sync both inputs to the selected query for consistency
  if (heroInput) heroInput.value = query;
  if (navInput)  navInput.value  = query;

  currentQuery = query;
  currentPage  = 1;
  currentResults = [];

  // Hide hero, show results
  const hero = document.getElementById('hero-section');
  const results = document.getElementById('results-section');
  if (hero) hero.style.display = 'none';
  if (results) results.style.display = 'block';

  // Update URL
  const url = new URL(window.location.href);
  url.searchParams.set('q', query);
  window.history.pushState({}, '', url);

  fetchResults(query, 1);
}

/* ── Quick Search (trending tags) ─────────────── */
function quickSearch(term) {
  const heroInput = document.getElementById('hero-search-input');
  if (heroInput) heroInput.value = term;
  triggerSearch();
}

/* ── Fetch Results from Backend ────────────────── */
async function fetchResults(query, page = 1) {
  const grid  = document.getElementById('results-grid');
  const grid2 = document.getElementById('results-grid-2');
  const countEl = document.getElementById('results-count');
  const queryEl = document.getElementById('query-label');

  if (page === 1) {
    if (grid) grid.innerHTML = renderSkeletons(6);
    if (grid2) grid2.innerHTML = '';
    if (countEl) countEl.textContent = 'Searching...';
    if (queryEl) queryEl.textContent = `"${query}"`;
  }

  try {
    const token = localStorage.getItem('ph_token');
    const filters = getFilters();

    const res = await fetch(
      `${API_BASE}/search?q=${encodeURIComponent(query)}&page=${page}&${new URLSearchParams(filters)}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      }
    );

    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();

    currentResults = [...currentResults, ...(data.results || [])];

    if (page === 1) {
      if (grid) grid.innerHTML = '';
      if (countEl) countEl.textContent = `${data.totalCount || data.results?.length || 0} results`;
    }

    renderCards(data.results || [], page);

    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.style.display = data.hasMore ? 'inline-flex' : 'none';
    }

  } catch (err) {
    if (grid) grid.innerHTML = `<div class="error-state">
      <p>⚠️ Could not load results. Please try again.</p>
    </div>`;
    console.error('Search error:', err);
  }
}

/* ── Render Product Cards ──────────────────────── */
function renderCards(products, page) {
  const grid  = document.getElementById('results-grid');
  const grid2 = document.getElementById('results-grid-2');
  if (!grid) return;

  // Split: first 6 in grid (above ad), rest in grid2
  const firstBatch = page === 1 ? products.slice(0, 6) : [];
  const restBatch  = page === 1 ? products.slice(6) : products;

  if (firstBatch.length) {
    grid.innerHTML = firstBatch.map((p, i) => cardHTML(p, i)).join('');
  }
  if (grid2 && restBatch.length) {
    grid2.innerHTML += restBatch.map((p, i) => cardHTML(p, i + firstBatch.length)).join('');
  }
}

function cardHTML(p, idx) {
  const delay = Math.min(idx * 0.05, 0.5);
  const discount = p.originalPrice && p.price < p.originalPrice
    ? Math.round((1 - p.price / p.originalPrice) * 100)
    : 0;

  return `
  <div class="product-card" onclick="openProductModal('${p.id}')" style="animation-delay:${delay}s">
    ${p.isLowestEver ? '<div class="card-badge-lowest">Lowest Ever!</div>' : ''}
    <button class="card-wishlist ${isWishlisted(p.id) ? 'active' : ''}"
            onclick="event.stopPropagation(); toggleWishlist('${p.id}', this)"
            title="Add to Wishlist">
      ${isWishlisted(p.id) ? '♥' : '♡'}
    </button>
    <img class="card-img"
         src="${p.image || 'https://via.placeholder.com/200x180?text=Product'}"
         alt="${escapeHTML(p.name)}"
         onerror="this.src='https://via.placeholder.com/200x180?text=Product'" />
    <div class="card-body">
      <div class="card-store">${escapeHTML(p.store || 'Marketplace')}</div>
      <div class="card-name">${escapeHTML(p.name)}</div>
      <div class="card-price-row">
        <span class="card-price">₹${formatPrice(p.price)}</span>
        ${p.originalPrice ? `<span class="card-original">₹${formatPrice(p.originalPrice)}</span>` : ''}
        ${discount > 0 ? `<span class="card-discount">−${discount}%</span>` : ''}
      </div>
      <div class="card-meta">
        <span class="card-offers" style="color:var(--primary); font-weight: 500">${p.prices && p.prices.length > 1 ? `⚖️ Compare ${p.prices.length} Stores` : `✨ Best Price Guaranteed`}</span>
        ${p.lowestEver ? `<span class="card-lowest">⬇ Lowest: ₹${formatPrice(p.lowestEver)}</span>` : ''}
        ${p.url ? `<a href="${p.url}" target="_blank" rel="noopener" style="display:block; margin-top:12px; padding:10px; background:var(--primary); color:#fff; border-radius:8px; text-align:center; font-weight:600; text-decoration:none;" onclick="event.stopPropagation()">View on ${escapeHTML(p.store || 'Store')} →</a>` : ''}
      </div>
    </div>
  </div>`;
}

/* ── Skeleton Loaders ──────────────────────────── */
function renderSkeletons(n) {
  return Array.from({ length: n }, () => '<div class="skeleton"></div>').join('');
}

/* ── Get Active Filters ────────────────────────── */
function getFilters() {
  const marketplaces = [...document.querySelectorAll('#marketplace-filters input:checked')]
    .map(el => el.value).join(',');
  return {
    category:    document.getElementById('filter-category')?.value || '',
    marketplaces,
    priceMin:    document.getElementById('price-min')?.value || '',
    priceMax:    document.getElementById('price-max')?.value || '',
    sortBy:      document.getElementById('sort-by')?.value || 'relevance',
    offersOnly:  document.getElementById('filter-offers')?.checked ? '1' : '',
    inStockOnly: document.getElementById('filter-instock')?.checked ? '1' : '',
  };
}

/* ── Apply Filters (re-search) ─────────────────── */
function applyFilters() {
  if (!currentQuery) return;
  currentPage = 1;
  currentResults = [];
  fetchResults(currentQuery, 1);
}

/* ── Load More ─────────────────────────────────── */
function loadMore() {
  currentPage++;
  fetchResults(currentQuery, currentPage);
}

/* ── Open Product Detail Modal ─────────────────── */
async function openProductModal(productId) {
  const modal = document.getElementById('product-modal');
  const content = document.getElementById('modal-content');
  if (!modal || !content) return;

  modal.classList.add('open');
  content.innerHTML = `<div style="padding:60px;text-align:center;color:var(--text-3)">Loading...</div>`;

  try {
    const token = localStorage.getItem('ph_token');
    const res = await fetch(`${API_BASE}/product/${productId}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error();
    const p = await res.json();
    content.innerHTML = renderModal(p);

  } catch {
    content.innerHTML = `<div style="padding:40px;color:var(--red)">⚠️ Failed to load product details.</div>`;
  }
}

function renderModal(p) {
  // ── Store price rows ──────────────────────────
  const storeRows = (p.prices || []).map((s, i) => {
    const discount = s.originalPrice && s.originalPrice > s.price
      ? Math.round((1 - s.price / s.originalPrice) * 100) : 0;
    const storeBadge = {
      'Amazon':           '🟠',
      'Flipkart':         '🔵',
      'Meesho':           '🩷',
      'Myntra':           '🟣',
      'Croma':            '🟢',
      'Reliance Digital': '🔴',
    }[s.store] || '🛒';

    return `
    <tr class="${i === 0 ? 'best-row' : ''}">
      <td class="store-name">${storeBadge} ${escapeHTML(s.store)}${i === 0 ? ' <span class="badge green" style="font-size:0.65rem;padding:2px 6px">BEST</span>' : ''}</td>
      <td><strong style="font-size:1.05rem">₹${formatPrice(s.price)}</strong></td>
      <td>${s.originalPrice && s.originalPrice > s.price ? `<span style="text-decoration:line-through;color:var(--text-3);font-size:0.85rem">₹${formatPrice(s.originalPrice)}</span>` : '—'}</td>
      <td>${discount > 0 ? `<span class="badge green" style="font-size:0.75rem">${discount}% off</span>` : '—'}</td>
      <td>${s.inStock !== false ? '<span class="badge green" style="font-size:0.75rem">In Stock</span>' : '<span class="badge red" style="font-size:0.75rem">Out of Stock</span>'}</td>
      <td><a href="${escapeHTML(s.url || '#')}" target="_blank" rel="noopener" class="buy-btn" onclick="event.stopPropagation()">Buy →</a></td>
    </tr>`;
  }).join('');

  // ── Specification rows ─────────────────────────
  const specs = p.specs || {};
  const specRows = Object.entries(specs).map(([key, val]) => `
    <tr>
      <td style="color:var(--text-3);font-size:0.82rem;padding:6px 12px;white-space:nowrap">${escapeHTML(key)}</td>
      <td style="font-size:0.85rem;padding:6px 12px">${escapeHTML(String(val))}</td>
    </tr>`).join('');

  // ── Offer pills ───────────────────────────────
  const offerPills = (p.offers || []).map(o =>
    `<span class="offer-pill">🏷️ ${escapeHTML(o)}</span>`
  ).join('');

  return `
  <div class="modal-content">
    <!-- Header: Image + Name + Best Price -->
    <div class="modal-product-header">
      <img class="modal-product-img"
           src="${escapeHTML(p.image || '')}"
           alt="${escapeHTML(p.name)}"
           onerror="this.style.display='none'" />
      <div style="flex:1">
        <div style="font-size:0.75rem;color:var(--text-3);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">${escapeHTML(p.category || 'Product')}</div>
        <div class="modal-product-name">${escapeHTML(p.name)}</div>
        <div class="modal-best-price">₹${formatPrice(p.bestPrice)}</div>
        <div class="modal-lowest-ever">
          Lowest Ever: <strong>₹${formatPrice(p.lowestEver || p.bestPrice)}</strong>
          ${p.lowestEverDate ? `<span style="color:var(--text-3)"> · ${escapeHTML(p.lowestEverDate)}</span>` : ''}
        </div>
        <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">
          <button class="set-alert-btn" onclick="setAlert('${escapeHTML(String(p.id))}', ${p.bestPrice})">
            🔔 Set Price Alert
          </button>
          ${p.prices?.[0]?.url ? `<a href="${escapeHTML(p.prices[0].url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:var(--primary);color:#000;border-radius:10px;font-weight:700;font-size:0.85rem;text-decoration:none">Buy Best Price →</a>` : ''}
        </div>
      </div>
    </div>

    <!-- Price Comparison Table -->
    <div style="margin-top:28px">
      <h4 style="font-family:var(--font-display);margin-bottom:12px;font-size:1rem">
        🏪 Prices Across ${(p.prices || []).length} Stores
      </h4>
      ${p.prices && p.prices.length > 0 ? `
      <div style="overflow-x:auto;border-radius:12px;border:1px solid var(--border)">
        <table class="price-table" style="width:100%;min-width:500px">
          <thead>
            <tr>
              <th>Store</th><th>Price</th><th>MRP</th><th>Discount</th><th>Stock</th><th>Action</th>
            </tr>
          </thead>
          <tbody>${storeRows}</tbody>
        </table>
      </div>` : `<div style="color:var(--text-3);padding:20px;text-align:center">No price data available yet. Try refreshing.</div>`}
    </div>

    <!-- Specifications -->
    ${specRows ? `
    <div style="margin-top:28px">
      <h4 style="font-family:var(--font-display);margin-bottom:12px;font-size:1rem">📋 Specifications</h4>
      <div style="overflow:hidden;border-radius:12px;border:1px solid var(--border)">
        <table style="width:100%;border-collapse:collapse">
          <tbody>${specRows}</tbody>
        </table>
      </div>
    </div>` : `
    <div style="margin-top:24px;padding:16px;background:var(--surface-2);border-radius:10px;color:var(--text-3);font-size:0.85rem">
      ⏳ Specifications are being fetched in the background. Reopen this product in a few seconds to see them.
    </div>`}

    <!-- Offers -->
    ${offerPills ? `
    <div class="offers-section" style="margin-top:24px">
      <h4 style="font-family:var(--font-display);margin-bottom:10px;font-size:1rem">🏷️ Active Offers</h4>
      <div>${offerPills}</div>
    </div>` : ''}
  </div>`;
}

function closeModal(e) {
  if (e.target.id === 'product-modal') closeProductModal();
}
function closeProductModal() {
  document.getElementById('product-modal')?.classList.remove('open');
}

/* ── Set Price Alert ───────────────────────────── */
async function setAlert(productId, currentPrice) {
  const token = localStorage.getItem('ph_token');
  if (!token) {
    showToast('Please sign in to set price alerts.', 'error'); return;
  }
  const targetPrice = prompt(`Set alert when price drops below:\nCurrent: ₹${formatPrice(currentPrice)}\n\nEnter target price (₹):`);
  if (!targetPrice || isNaN(targetPrice)) return;

  try {
    const res = await fetch(`${API_BASE}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ productId, targetPrice: Number(targetPrice) })
    });
    if (res.ok) showToast('✅ Price alert set! We\'ll email you.', 'success');
    else showToast('Failed to set alert.', 'error');
  } catch { showToast('Network error.', 'error'); }
}

/* ── Wishlist ───────────────────────────────────── */
function getWishlist() {
  return JSON.parse(localStorage.getItem('ph_wishlist') || '[]');
}
function isWishlisted(id) {
  return getWishlist().includes(id);
}
function toggleWishlist(id, btn) {
  let list = getWishlist();
  if (list.includes(id)) {
    list = list.filter(x => x !== id);
    btn.innerHTML = '♡';
    btn.classList.remove('active');
    showToast('Removed from wishlist.', 'info');
  } else {
    list.push(id);
    btn.innerHTML = '♥';
    btn.classList.add('active');
    showToast('❤️ Added to wishlist!', 'success');
  }
  localStorage.setItem('ph_wishlist', JSON.stringify(list));
}

/* ── On Page Load: Check URL Params ────────────── */
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q) {
    const heroInput = document.getElementById('hero-search-input');
    const navInput  = document.getElementById('nav-search-input');
    if (heroInput) heroInput.value = q;
    if (navInput)  navInput.value  = q;
    triggerSearch();
  }
});
