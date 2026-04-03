/* ============================================================
   DealBaazi v2 — dashboard.js
   Refined Dashboard Logic: Populated real data from API
   ============================================================ */

const CATEGORY_MAP = ['phones', 'laptops', 'gaming', 'audio', 'tvs', 'appliances'];

window.fetchFeaturedProducts = async function() {
  console.info('[dashboard.js] fetchFeaturedProducts started');
  
  for (const cat of CATEGORY_MAP) {
    const gridId = `grid-${cat === 'phones' ? 'phones' : cat}`;
    const grid = document.getElementById(gridId);
    if (!grid) {
      console.warn(`[dashboard.js] Grid element not found for ${cat}: ${gridId}`);
      continue;
    }

    try {
      console.info(`[dashboard.js] Fetching ${cat}...`);
      const res = await fetch(`/api/search?category=${cat}&page=1`);
      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        console.info(`[dashboard.js] Populating ${cat} with ${data.results.length} items`);
        grid.innerHTML = data.results.slice(0, 4).map((p, i) => window.productCardHTML_Home(p, i)).join('');
      } else {
        console.info(`[dashboard.js] No results for ${cat}, hiding section`);
        const section = grid.closest('.product-section');
        if (section) section.style.display = 'none';
      }
    } catch (err) {
      console.error(`[dashboard.js] Error fetching ${cat}:`, err);
    }
  }
};

window.productCardHTML_Home = function(p, idx) {
  const delay = Math.min(idx * 0.05, 0.4);
  const links = p.marketplaceLinks || {};
  
  return `
<div class="product-card" style="animation-delay:${delay}s" onclick="openProductModal('${p.id}')">
  <div class="card-img-wrap">
    <img src="${p.image || 'https://via.placeholder.com/200x180?text=Product'}" alt="${p.name}" loading="lazy"/>
  </div>
  <div class="card-body">
    <div class="card-meta-top">
      <span class="card-brand">${p.brand || 'Premium'}</span>
      <span class="card-rating">★ ${p.rating || '4.5'}</span>
    </div>
    <div class="card-name">${p.name}</div>
    <div class="card-price-row">
      <span class="card-price">₹${Number(p.bestPrice).toLocaleString('en-IN')}</span>
      <span class="card-discount-pct">Best Price</span>
    </div>
    <div class="card-divider" style="height:1px; background:var(--line); margin:12px 0"></div>
    <div class="card-direct-links">
      <a href="${links.amazon}" target="_blank" class="link-pill az" onclick="event.stopPropagation()">Amazon</a>
      <a href="${links.flipkart}" target="_blank" class="link-pill fk" onclick="event.stopPropagation()">Flipkart</a>
      <a href="${links.reliance}" target="_blank" class="link-pill rl" onclick="event.stopPropagation()">Reliance</a>
      <a href="${links.croma}" target="_blank" class="link-pill cm" onclick="event.stopPropagation()">Croma</a>
    </div>
  </div>
</div>`;
};

window.openProductModal = async function(id) {
  console.info('[dashboard.js] openProductModal:', id);
  const modal = document.getElementById('product-modal');
  const body = document.getElementById('modal-body');
  if (!modal || !body) return;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  body.innerHTML = '<div style="padding:60px;text-align:center;color:var(--t3)">Loading details...</div>';

  try {
    const res = await fetch(`/api/product/${id}`);
    const p = await res.json();
    body.innerHTML = window.buildModalHTML_Home(p);
  } catch (err) {
    body.innerHTML = '<div style="padding:40px;color:var(--t3)">Error loading product details.</div>';
  }
};

window.buildModalHTML_Home = function(p) {
  const links = p.marketplaceLinks || {};
  const specs = p.specs || {};
  const specRows = Object.entries(specs).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');

  return `
    <div class="modal-product" style="padding:32px">
      <div class="modal-product-grid" style="display:grid; grid-template-columns:280px 1fr; gap:32px">
        <div class="modal-img-wrap" style="background:var(--bg-raised); border-radius:12px; padding:24px; display:flex; align-items:center; justify-content:center">
          <img src="${p.image}" alt="${p.name}" style="max-width:100%; max-height:240px; object-fit:contain" />
        </div>
        <div>
          <div class="modal-brand" style="font-size:0.75rem; color:var(--t3); text-transform:uppercase; font-weight:700; margin-bottom:8px">${p.brand}</div>
          <h2 class="modal-name" style="font-size:1.6rem; font-weight:700; margin-bottom:16px">${p.name}</h2>
          <div class="modal-best-price" style="font-size:2.4rem; font-weight:700; color:var(--em); margin-bottom:24px">₹${p.bestPrice.toLocaleString('en-IN')}</div>
          
          <div class="modal-actions" style="display:flex; gap:12px; margin-bottom:32px">
            <button class="btn btn-em btn-sm" onclick="trackProduct('${p.id}')">📦 Track Price</button>
            <button class="btn btn-outline btn-sm" onclick="setAlert('${p.id}', ${p.bestPrice})">🔔 Alert Me</button>
          </div>

          <table class="specs-table" style="width:100%; font-size:0.85rem">
            <tbody>${specRows}</tbody>
          </table>
        </div>
      </div>
      <div class="compare-title" style="margin-top:40px; margin-bottom:20px; font-weight:700">Official Direct Links</div>
      <div class="card-direct-links" style="grid-template-columns:repeat(4, 1fr); gap:12px">
        <a href="${links.amazon}" target="_blank" class="link-pill az">Amazon ↗</a>
        <a href="${links.flipkart}" target="_blank" class="link-pill fk">Flipkart ↗</a>
        <a href="${links.reliance}" target="_blank" class="link-pill rl">Reliance ↗</a>
        <a href="${links.croma}" target="_blank" class="link-pill cm">Croma ↗</a>
      </div>
    </div>
  `;
};

window.closeModal = function() {
  const modal = document.getElementById('product-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
};

// Global Listeners & Initialization
function initDashboard() {
  console.info('[dashboard.js] initialization');
  if (typeof loadUserNav === 'function') loadUserNav();
  window.fetchFeaturedProducts();
  
  if (typeof startDealCountdown === 'function') startDealCountdown();
  
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      document.getElementById('nav-search-input')?.focus();
    }
    if (e.key === 'Escape') window.closeModal();
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initDashboard);
else initDashboard();
