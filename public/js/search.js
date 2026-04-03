/* ===================================================
   DEALBAAZI — search.js
   Full Scratch Rebuild: Paginated Results & Direct Links
   =================================================== */

let currentResults = [];
let currentPage = 1;
let currentQuery = '';

const API_BASE = '/api';

/**
 * Main Trigger for Search
 */
function triggerSearch() {
  const heroInput = document.getElementById('hero-search-input');
  const navInput  = document.getElementById('nav-search-input');
  
  let query = (heroInput?.value || navInput?.value || '').trim();
  if (!query) return;

  // Sync inputs
  if (heroInput) heroInput.value = query;
  if (navInput)  navInput.value  = query;

  currentQuery = query;
  currentPage  = 1;
  currentResults = [];

  // UI Management: Dashboard vs. Results
  const hero = document.getElementById('hero-section');
  const main = document.getElementById('main-content');
  const ads  = document.getElementById('featured-ads');
  const results = document.getElementById('results-section');
  
  if (hero) hero.style.display = 'none';
  if (main) main.style.display = 'none';
  if (ads)  ads.style.display  = 'none';
  if (results) results.style.display = 'block';

  // Update Browser URL
  const url = new URL(window.location.href);
  url.searchParams.set('q', query);
  window.history.pushState({}, '', url);

  fetchResults(query, 1);
}

/**
 * Fetch Results from API
 */
async function fetchResults(query, page = 1) {
  const grid = document.getElementById('results-grid');
  const countEl = document.getElementById('results-count');
  const queryLabel = document.getElementById('query-label');

  if (page === 1) {
    grid.innerHTML = renderSkeletons(8);
    countEl.textContent = 'Searching...';
    queryLabel.textContent = `"${query}"`;
  }

  try {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&page=${page}`);
    const data = await res.json();

    if (page === 1) {
      grid.innerHTML = '';
      countEl.textContent = `${data.totalCount} results for "${query}"`;
    }

    renderCards(data.results || []);

    // Load More Visibility
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.style.display = data.hasMore ? 'block' : 'none';
    }

  } catch (err) {
    console.error('Search error:', err);
    grid.innerHTML = `<div class="empty-state"><h3>⚠️ Search Failed</h3><p>Please try a different query.</p></div>`;
  }
}

/**
 * Render Product Cards with Direct Links
 */
function renderCards(products) {
  const grid = document.getElementById('results-grid');
  
  const html = products.map((p, i) => {
    const delay = (i % 6) * 0.05;
    
    // Marketplace Buttons HTML
    const links = p.marketplaceLinks || {};
    const linkButtons = `
      <div class="card-direct-links">
        <a href="${links.amazon}" target="_blank" class="link-pill az">Amazon</a>
        <a href="${links.flipkart}" target="_blank" class="link-pill fk">Flipkart</a>
        <a href="${links.reliance}" target="_blank" class="link-pill rl">Reliance</a>
        <a href="${links.croma}" target="_blank" class="link-pill cm">Croma</a>
      </div>
    `;

    return `
    <div class="product-card" style="animation-delay: ${delay}s" onclick="openProductModal('${p.id}')">
      <div class="card-img-wrap">
        <img src="${p.image || 'https://via.placeholder.com/200x180?text=Product'}" alt="${p.name}" />
      </div>
      <div class="card-body">
        <div class="card-meta-top">
          <span class="card-brand">${p.brand || 'Premium'}</span>
          <div class="card-rating">⭐ ${p.rating} <span>(${p.reviews.toLocaleString()})</span></div>
        </div>
        <h3 class="card-name">${p.name}</h3>
        <div class="card-price-row">
          <span class="card-price">₹${p.bestPrice.toLocaleString()}</span>
          <span class="card-discount-pct">Best Price</span>
        </div>
        
        <div class="card-divider"></div>
        <p style="font-size: 0.72rem; color: var(--t3); margin-bottom: 8px; text-transform: uppercase; font-weight:700">Buy Direct From:</p>
        ${linkButtons}
      </div>
    </div>
    `;
  }).join('');

  grid.insertAdjacentHTML('beforeend', html);
}

function renderSkeletons(n) {
  return Array.from({ length: n }, () => `<div class="skeleton" style="height:350px; border-radius:var(--r-lg)"></div>`).join('');
}

function loadMore() {
  currentPage++;
  fetchResults(currentQuery, currentPage);
}

// Check URL on load
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
