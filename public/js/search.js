/* ===================================================
   DEALBAAZI — search.js
   Unified Search & Category Filtering Logic
   =================================================== */

// Use window to ensure global availability
window.triggerSearch = function() {
  console.info('[search.js] triggerSearch called');
  const heroInput = document.getElementById('hero-search-input');
  const navInput  = document.getElementById('nav-search-input');
  
  let query = (heroInput?.value || navInput?.value || '').trim();
  
  if (!query && window.currentCategory === 'all') return;

  if (heroInput) heroInput.value = query;
  if (navInput)  navInput.value  = query;

  window.currentQuery = query;
  window.currentPage  = 1;
  window.showResultsSection();

  const url = new URL(window.location.href);
  if (query) url.searchParams.set('q', query);
  else url.searchParams.delete('q');
  
  if (window.currentCategory !== 'all') url.searchParams.set('cat', window.currentCategory);
  else url.searchParams.delete('cat');

  window.history.pushState({}, '', url);
  window.fetchResults(window.currentQuery, 1, window.currentCategory);
};

window.showCat = function(category, btn) {
  console.info('[search.js] showCat called for:', category);
  const btns = document.querySelectorAll('.cat-btn');
  btns.forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  window.currentCategory = category;
  window.currentPage = 1;

  window.showResultsSection();
  window.fetchResults(window.currentQuery, 1, window.currentCategory);
};

window.showResultsSection = function() {
  const hero = document.getElementById('hero-section');
  const main = document.getElementById('main-content');
  const ads  = document.getElementById('featured-ads');
  const results = document.getElementById('results-section');
  
  if (hero) hero.style.display = 'none';
  if (main) main.style.display = 'none';
  if (ads)  ads.style.display  = 'none';
  if (results) results.style.display = 'block';
};

window.fetchResults = async function(query, page = 1, category = 'all') {
  console.info('[search.js] fetching results:', { query, page, category });
  const grid = document.getElementById('results-grid');
  const countEl = document.getElementById('results-count');
  const queryLabel = document.getElementById('query-label');

  if (page === 1) {
    if (grid) grid.innerHTML = window.renderSkeletons(8);
    if (countEl) countEl.textContent = 'Searching...';
    if (queryLabel) queryLabel.textContent = query ? `"${query}"` : `in ${category}`;
  }

  try {
    let url = `/api/search?page=${page}`;
    if (query) url += `&q=${encodeURIComponent(query)}`;
    if (category && category !== 'all') url += `&category=${encodeURIComponent(category)}`;

    const res = await fetch(url);
    const data = await res.json();

    if (page === 1) {
      if (grid) grid.innerHTML = '';
      if (countEl) countEl.textContent = `${data.totalCount} results found`;
    }

    if (data.results && data.results.length > 0) {
      window.renderCards(data.results);
    } else if (page === 1) {
      if (grid) grid.innerHTML = `<div class="empty-state"><h3>No products found</h3><p>Try different search terms.</p></div>`;
    }

    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) loadMoreBtn.style.display = data.hasMore ? 'block' : 'none';

  } catch (err) {
    console.error('[search.js] fetch error:', err);
  }
};

window.renderCards = function(products) {
  const grid = document.getElementById('results-grid');
  if (!grid) return;
  const html = products.map((p, i) => {
    const delay = (i % 6) * 0.05;
    const links = p.marketplaceLinks || {};
    return `
    <div class="product-card" style="animation-delay: ${delay}s" onclick="openProductModal('${p.id}')">
      <div class="card-img-wrap"><img src="${p.image || ''}" alt="${p.name}" /></div>
      <div class="card-body">
        <div class="card-meta-top">
          <span class="card-brand">${p.brand || ''}</span>
          <div class="card-rating">⭐ ${p.rating || '4.5'}</div>
        </div>
        <h3 class="card-name">${p.name}</h3>
        <div class="card-price-row"><span class="card-price">₹${Number(p.bestPrice).toLocaleString('en-IN')}</span></div>
        <div class="card-divider" style="height:1px; background:var(--line); margin:12px 0"></div>
        <div class="card-direct-links">
          <a href="${links.amazon}" target="_blank" class="link-pill az" onclick="event.stopPropagation()">Amazon</a>
          <a href="${links.flipkart}" target="_blank" class="link-pill fk" onclick="event.stopPropagation()">Flipkart</a>
          <a href="${links.reliance}" target="_blank" class="link-pill rl" onclick="event.stopPropagation()">Reliance</a>
          <a href="${links.croma}" target="_blank" class="link-pill cm" onclick="event.stopPropagation()">Croma</a>
        </div>
      </div>
    </div>`;
  }).join('');
  grid.insertAdjacentHTML('beforeend', html);
};

window.renderSkeletons = function(n) {
  return Array.from({ length: n }, () => `<div class="skeleton" style="height:380px; border-radius:12px"></div>`).join('');
};

window.currentCategory = 'all';
window.currentQuery = '';
window.currentPage = 1;

// Initialize
function initSearch() {
  console.info('[search.js] init');
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  const cat = params.get('cat');

  if (cat) window.currentCategory = cat;
  if (q) window.currentQuery = q;

  const hIn = document.getElementById('hero-search-input');
  const nIn = document.getElementById('nav-search-input');
  if (hIn && q) hIn.value = q;
  if (nIn && q) nIn.value = q;

  [hIn, nIn].forEach(inp => {
    if (inp) inp.addEventListener('keypress', (e) => { if (e.key === 'Enter') window.triggerSearch(); });
  });

  if (q || (cat && cat !== 'all')) window.triggerSearch();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSearch);
else initSearch();
