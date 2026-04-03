/* ============================================================
   DealBaazi v2 — dashboard.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  loadUserNav();
  renderAllSections();
  startDealCountdown();
  handleUrlQuery();

  // Keyboard shortcut: / focuses search
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      document.getElementById('nav-q')?.focus();
    }
    if (e.key === 'Escape') closeModal();
  });
});

/* ════════════════════════════════════════
   NAV
   ════════════════════════════════════════ */
function toggleDrop() {
  document.getElementById('nav-drop')?.classList.toggle('open');
}
document.addEventListener('click', e => {
  if (!e.target.closest('#nav-avatar') && !e.target.closest('#nav-drop')) {
    document.getElementById('nav-drop')?.classList.remove('open');
  }
});

/* ════════════════════════════════════════
   RENDER ALL SECTIONS
   ════════════════════════════════════════ */
const SECTION_MAP = {
  laptops:         { gridId: 'grid-laptops',    key: 'laptops',        show: 4 },
  phones:          { gridId: 'grid-phones',     key: 'phones',         show: 4 },
  gaming:          { gridId: 'grid-gaming',     key: 'gaming',         show: 6 },
  audio:           { gridId: 'grid-audio',      key: 'audio',          show: 4 },
  tvs:             { gridId: 'grid-tvs',        key: 'tvs',            show: 4 },
  appliances:      { gridId: 'grid-appliances', key: 'appliances',     show: 4 },
  'fashion-men':   { gridId: 'grid-men',        key: 'fashion-men',    show: 4 },
  'fashion-women': { gridId: 'grid-women',      key: 'fashion-women',  show: 4 },
  shoes:           { gridId: 'grid-shoes',      key: 'shoes',          show: 4 },
  cameras:         { gridId: 'grid-cameras',    key: 'cameras',        show: 3 },
  tablets:         { gridId: 'grid-tablets',    key: 'tablets',        show: 3 }
};

function renderAllSections() {
  Object.values(SECTION_MAP).forEach(({ gridId, key, show }) => {
    const el = document.getElementById(gridId);
    if (!el) return;
    const items = (window.PRODUCTS[key] || []).slice(0, show);
    el.innerHTML = items.map((p, i) => productCardHTML(p, i)).join('');
  });
}

/* ════════════════════════════════════════
   CATEGORY FILTER
   ════════════════════════════════════════ */
function showCat(cat, btn) {
  // Update active tab
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const hero    = document.getElementById('hero-section');
  const deal    = document.getElementById('deal-banner');
  const sections = document.querySelectorAll('.product-section');

  if (hero) hero.style.display = 'none';

  sections.forEach(s => {
    const cats = s.dataset.cat?.split(' ') || [];
    s.style.display = (cat === 'all' || cats.includes(cat)) ? 'block' : 'none';
  });

  if (cat === 'all') {
    if (deal) deal.style.display = '';
  } else {
    if (deal) deal.style.display = 'none';
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ════════════════════════════════════════
   SEARCH
   ════════════════════════════════════════ */
function runSearch(query) {
  if (!query?.trim()) return;
  query = query.trim();

  const hero = document.getElementById('hero-section');
  if (hero) hero.style.display = 'none';

  document.getElementById('nav-q').value = query;

  // Reset cat tabs
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.cat-btn')?.classList.add('active');

  // Search across all products
  const q = query.toLowerCase();
  const results = (window.PRODUCTS_FLAT || []).filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    Object.values(p.specs || {}).some(v => String(v).toLowerCase().includes(q))
  );

  // Show all sections hidden, then inject results
  document.querySelectorAll('.product-section').forEach(s => s.style.display = 'none');
  document.getElementById('deal-banner').style.display = 'none';

  let searchSec = document.getElementById('search-results-section');
  if (!searchSec) {
    searchSec = document.createElement('div');
    searchSec.id = 'search-results-section';
    searchSec.className = 'product-section';
    document.getElementById('main-content').prepend(searchSec);
  }
  searchSec.style.display = 'block';
  searchSec.innerHTML = `
    <div class="section-head">
      <div class="section-title">Search results for "<span style="color:var(--em)">${escH(query)}</span>"</div>
      <span class="section-more" onclick="clearSearch()">&times; Clear</span>
    </div>
    <div class="product-grid" id="search-grid">
      ${results.length
        ? results.map((p, i) => productCardHTML(p, i)).join('')
        : `<div class="empty-state"><div class="empty-state-icon">🔍</div><h3>No results found</h3><p>Try a different search term or browse categories above.</p></div>`
      }
    </div>
  `;
  searchSec.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Update URL
  const url = new URL(window.location.href);
  url.searchParams.set('q', query);
  window.history.pushState({}, '', url);
}

function clearSearch() {
  const sec = document.getElementById('search-results-section');
  if (sec) sec.remove();
  document.querySelectorAll('.product-section').forEach(s => s.style.display = 'block');
  document.getElementById('deal-banner').style.display = '';
  document.getElementById('hero-section').style.display = '';
  const url = new URL(window.location.href);
  url.searchParams.delete('q');
  window.history.pushState({}, '', url);
  document.getElementById('nav-q').value = '';
}

function handleUrlQuery() {
  const q = new URLSearchParams(window.location.search).get('q');
  if (q) { document.getElementById('nav-q').value = q; runSearch(q); }
}

/* ════════════════════════════════════════
   PRODUCT CARD
   ════════════════════════════════════════ */
function productCardHTML(p, idx) {
  const delay  = Math.min(idx * 0.06, 0.5);
  const prices = p.prices || [];
  const best   = prices.reduce((a, b) => a.price <= b.price ? a : b, prices[0] || {});
  const mrp    = best?.mrp || best?.price || 0;
  const pct    = mrp > best?.price ? Math.round((1 - best.price / mrp) * 100) : 0;
  const storeNames = prices.slice(0, 3);

  const badges = (p.badges || []).map(b => `<span class="badge badge-em">${escH(b)}</span>`).join('');

  return `
<div class="product-card" style="animation-delay:${delay}s" onclick="openModal('${p.id}')">
  <div class="card-badges">${badges}</div>
  <button class="card-wishlist-btn ${isWishlisted(p.id) ? 'wishlisted' : ''}"
          onclick="event.stopPropagation(); toggleWishlist('${p.id}', this)"
          title="Add to Wishlist">
    ${isWishlisted(p.id) ? '❤' : '♡'}
  </button>
  <div class="card-img-wrap">
    <img src="${p.image}" alt="${escH(p.name)}"
         loading="lazy"
         onerror="this.src='https://placehold.co/200x160/111520/4b5d74?text=Product'"/>
  </div>
  <div class="card-body">
    <div class="card-meta-top">
      <span class="card-brand">${escH(p.brand)}</span>
      <span class="card-rating">★ ${p.rating}<span>(${(p.reviews||0).toLocaleString('en-IN')})</span></span>
    </div>
    <div class="card-name">${escH(p.name)}</div>
    <div class="card-price-row">
      <span class="card-price">₹${fmtP(best.price)}</span>
      ${mrp > best.price ? `<span class="card-mrp">₹${fmtP(mrp)}</span>` : ''}
      ${pct > 0 ? `<span class="card-discount-pct">${pct}% off</span>` : ''}
    </div>
    <div class="card-stores">
      ${storeNames.map((s, i) =>
        `<span class="card-store-pill ${i===0?'cheapest':''}">${escH(s.store.split(' ')[0])}</span>`
      ).join('')}
      ${prices.length > 3 ? `<span class="card-store-pill">+${prices.length-3} more</span>` : ''}
    </div>
    <div class="card-footer">
      <button class="card-btn-primary" onclick="event.stopPropagation(); openModal('${p.id}')">
        Compare All Prices
      </button>
      <button class="card-btn-icon" onclick="event.stopPropagation(); window.open('${best.url||'#'}','_blank')" title="Buy now">
        🛒
      </button>
    </div>
  </div>
</div>`;
}

/* ════════════════════════════════════════
   PRODUCT MODAL
   ════════════════════════════════════════ */
function openModal(productId) {
  const p = (window.PRODUCTS_FLAT || []).find(x => x.id === productId);
  const modal = document.getElementById('product-modal');
  const body  = document.getElementById('modal-body');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (!p) { body.innerHTML = '<div style="padding:40px;color:var(--t3)">Product not found.</div>'; return; }
  body.innerHTML = buildModalHTML(p);
}

function buildModalHTML(p) {
  const prices  = (p.prices || []).sort((a,b) => a.price - b.price);
  const best    = prices[0] || {};
  const mrp     = best.mrp || best.price || 0;
  const pct     = mrp > best.price ? Math.round((1 - best.price/mrp)*100) : 0;
  const lowestEver = p.lowestEver ? `₹${fmtP(p.lowestEver)}` : `₹${fmtP(best.price)}`;

  const specsRows = Object.entries(p.specs || {}).map(([k,v]) =>
    `<tr><td>${escH(k)}</td><td>${escH(String(v))}</td></tr>`
  ).join('');

  const priceRows = prices.map((s, i) => `
    <tr class="${i===0?'best-row':''}">
      <td><span class="cmp-store">${i===0?'🏆 ':''} ${escH(s.store)}</span></td>
      <td><span class="cmp-price">₹${fmtP(s.price)}</span></td>
      <td>${s.mrp && s.mrp > s.price ? `<span style="text-decoration:line-through;color:var(--t3)">₹${fmtP(s.mrp)}</span>` : '—'}</td>
      <td>${s.mrp && s.mrp > s.price ? `<span class="badge badge-em">${Math.round((1-s.price/s.mrp)*100)}%</span>` : '—'}</td>
      <td>${s.inStock ? '<span class="badge badge-em">In Stock</span>' : '<span class="badge badge-red">Out of Stock</span>'}</td>
      <td>
        ${s.inStock
          ? `<a href="${escH(s.url||'#')}" target="_blank" rel="noopener" class="cmp-buy-btn" onclick="event.stopPropagation()">Buy Now ↗</a>`
          : `<span style="color:var(--t3);font-size:.78rem">Unavailable</span>`
        }
      </td>
    </tr>
    ${(s.offers||[]).length ? `<tr class="${i===0?'best-row':''}"><td colspan="6" style="padding:4px 14px 12px;border-bottom:1px solid var(--line)">
      ${s.offers.map(o=>`<span class="offer-tag">🏷 ${escH(o)}</span>`).join('')}
    </td></tr>` : ''}
  `).join('');

  return `
  <div class="modal-product">
    <div class="modal-product-grid">
      <div>
        <div class="modal-img-wrap">
          <img src="${p.image}" alt="${escH(p.name)}"
               onerror="this.src='https://placehold.co/220x180/111520/4b5d74?text=Product'"/>
        </div>
      </div>
      <div>
        <div class="modal-brand">${escH(p.brand)}</div>
        <div class="modal-name">${escH(p.name)}</div>
        <div class="modal-best-label">Best Price Today</div>
        <div class="modal-best-price">
          ₹${fmtP(best.price)}
          ${pct > 0 ? `<span class="badge badge-em" style="margin-left:10px;vertical-align:middle">${pct}% off</span>` : ''}
        </div>
        <div class="modal-lowest-ever">
          Lowest ever: <strong>${lowestEver}</strong>
          &nbsp;·&nbsp; ★ ${p.rating} (${(p.reviews||0).toLocaleString('en-IN')} reviews)
        </div>
        <div class="modal-action-row">
          <a href="${best.url||'#'}" target="_blank" rel="noopener" class="btn btn-em btn-sm">
            Buy on ${escH((best.store||'').split(' ')[0])} ↗
          </a>
          <button class="btn btn-outline btn-sm" onclick="setAlert('${p.id}',${best.price})">
            🔔 Set Price Alert
          </button>
          <button class="btn btn-outline btn-sm" onclick="trackProduct('${p.id}')">
            📦 Track Price
          </button>
        </div>

        ${specsRows ? `
          <div class="specs-title">Specifications</div>
          <table class="specs-table"><tbody>${specsRows}</tbody></table>
        ` : ''}
      </div>
    </div>

    <div class="compare-title">Price Comparison — ${prices.length} Stores</div>
    <table class="compare-table">
      <thead>
        <tr>
          <th>Store</th><th>Price</th><th>MRP</th><th>Discount</th><th>Stock</th><th>Action</th>
        </tr>
      </thead>
      <tbody>${priceRows}</tbody>
    </table>
  </div>`;
}

function closeModal() {
  document.getElementById('product-modal')?.classList.remove('open');
  document.body.style.overflow = '';
}
function closeModalOut(e) {
  if (e.target.id === 'product-modal') closeModal();
}

/* ════════════════════════════════════════
   DEAL OF THE DAY COUNTDOWN
   ════════════════════════════════════════ */
function startDealCountdown() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  function tick() {
    const diff = end - Date.now();
    if (diff <= 0) { clearInterval(t); return; }
    const h = String(Math.floor(diff/3600000)).padStart(2,'0');
    const m = String(Math.floor((diff%3600000)/60000)).padStart(2,'0');
    const s = String(Math.floor((diff%60000)/1000)).padStart(2,'0');
    const dh = document.getElementById('dh');
    const dm = document.getElementById('dm');
    const ds = document.getElementById('ds');
    if(dh) dh.textContent = h;
    if(dm) dm.textContent = m;
    if(ds) ds.textContent = s;
  }
  tick();
  const t = setInterval(tick, 1000);
}

/* ════════════════════════════════════════
   WISHLIST
   ════════════════════════════════════════ */
function getWishlist() { return JSON.parse(localStorage.getItem('db_wishlist')||'[]'); }
function isWishlisted(id) { return getWishlist().includes(id); }
function toggleWishlist(id, btn) {
  let list = getWishlist();
  if (list.includes(id)) {
    list = list.filter(x=>x!==id);
    btn.innerHTML = '♡'; btn.classList.remove('wishlisted');
    showToast('Removed from wishlist.','info');
  } else {
    list.push(id);
    btn.innerHTML = '❤'; btn.classList.add('wishlisted');
    showToast('❤ Added to wishlist!','success');
  }
  localStorage.setItem('db_wishlist', JSON.stringify(list));
}

/* ════════════════════════════════════════
   PRICE ALERT & TRACK
   ════════════════════════════════════════ */
async function setAlert(productId, currentPrice) {
  const token = localStorage.getItem('db_token');
  if (!token) { showToast('Please sign in to set alerts.','error'); return; }
  const target = prompt(`Set alert when price drops below:\nCurrent: ₹${fmtP(currentPrice)}\n\nEnter target price (₹):`);
  if (!target || isNaN(target)) return;
  try {
    const res = await fetch('/api/alerts', {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
      body: JSON.stringify({ productId, targetPrice: Number(target) })
    });
    if (res.ok) showToast('✅ Alert set! You\'ll be emailed when price drops.','success');
    else showToast('Could not set alert.','error');
  } catch { showToast('Network error.','error'); }
}

async function trackProduct(productId) {
  const token = localStorage.getItem('db_token');
  if (!token) { showToast('Please sign in to track products.','error'); return; }
  try {
    const res = await fetch(`/api/user/tracked/${productId}`, {
      method:'POST', headers:{'Authorization':`Bearer ${token}`}
    });
    if (res.ok) showToast('📦 Now tracking this product!','success');
    else showToast('Could not track product.','error');
  } catch { showToast('Network error.','error'); }
}

/* ════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════ */
function fmtP(n) { return n ? Number(n).toLocaleString('en-IN') : '—'; }
function escH(s) {
  const d = document.createElement('div');
  d.textContent = String(s||'');
  return d.innerHTML;
}
