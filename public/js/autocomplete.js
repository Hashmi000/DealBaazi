/* ===================================================
   DEALBAAZI — autocomplete.js
   Real-time search suggestions logic
   =================================================== */

class Autocomplete {
  constructor(inputSelector, containerSelector) {
    this.input = document.querySelector(inputSelector);
    this.container = document.querySelector(containerSelector);
    this.debounceTimer = null;
    this.activeIndex = -1;
    this.suggestions = [];

    if (this.input && this.container) {
      this.init();
    }
  }

  init() {
    this.input.addEventListener('input', () => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.fetchSuggestions(), 300);
    });

    this.input.addEventListener('keydown', (e) => this.handleKeydown(e));

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!this.input.contains(e.target) && !this.container.contains(e.target)) {
        this.close();
      }
    });
  }

  async fetchSuggestions() {
    const val = this.input.value.trim();
    if (val.length < 2) {
      this.close();
      return;
    }

    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(val)}`);
      this.suggestions = await res.json();
      this.render();
    } catch (err) {
      console.error('Autocomplete fetch error:', err);
    }
  }

  render() {
    if (this.suggestions.length === 0) {
      this.container.innerHTML = `<div class="sugg-empty">No matching products found</div>`;
    } else {
      let html = `<div class="sugg-header">Suggestions</div>`;
      html += this.suggestions.map((s, i) => `
        <div class="suggestion-item ${i === this.activeIndex ? 'active' : ''}" data-index="${i}">
          <img src="${s.image || 'https://via.placeholder.com/40?text=P'}" class="sugg-img" />
          <div class="sugg-info">
            <div class="sugg-name">${this.highlight(s.name)}</div>
            <div class="sugg-meta">
              <span>${s.category || 'Product'}</span>
              ${s.bestPrice ? `<span class="sugg-price">₹${s.bestPrice.toLocaleString()}</span>` : ''}
            </div>
          </div>
        </div>
      `).join('');
      this.container.innerHTML = html;
    }

    this.container.classList.add('open');
    this.bindItems();
  }

  highlight(text) {
    const q = this.input.value.trim();
    const regex = new RegExp(`(${q})`, 'gi');
    return text.replace(regex, '<span style="color:var(--em); font-weight:700">$1</span>');
  }

  bindItems() {
    this.container.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const index = item.dataset.index;
        this.select(this.suggestions[index]);
      });
    });
  }

  select(item) {
    this.input.value = item.name;
    this.close();
    // Trigger the real search
    if (typeof triggerSearch === 'function') {
      triggerSearch();
    } else {
      window.location.href = `/pages/dashboard.html?q=${encodeURIComponent(item.name)}`;
    }
  }

  handleKeydown(e) {
    if (!this.container.classList.contains('open')) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.activeIndex = (this.activeIndex + 1) % this.suggestions.length;
      this.render();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeIndex = (this.activeIndex - 1 + this.suggestions.length) % this.suggestions.length;
      this.render();
    } else if (e.key === 'Enter' && this.activeIndex > -1) {
      e.preventDefault();
      this.select(this.suggestions[this.activeIndex]);
    } else if (e.key === 'Escape') {
      this.close();
    }
  }

  close() {
    this.container.classList.remove('open');
    this.activeIndex = -1;
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  // Hero Search (Dashboard)
  new Autocomplete('#hero-search-input', '#hero-suggestions');
  // Nav Search (All Pages)
  new Autocomplete('#nav-search-input', '#nav-suggestions');
});
