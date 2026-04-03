/* ===================================================
   DEALBAAZI — dashboard.js
   Dashboard UI init, nav, misc interactions
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Require login to access dashboard
  // Uncomment in production:
  // const user = requireAuth();
  // if (!user) return;

  loadUserNav();

  // Keyboard shortcut: press / to focus search
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      const input = document.getElementById('nav-search-input');
      if (input) input.focus();
    }
  });

  // Escape closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProductModal();
  });

  // Init AdSense (if approved, remove placeholder)
  initAds();
});

function initAds() {
  // AdSense auto-ads will handle this once your publisher account is approved.
  // Uncomment and replace with your publisher ID:
  // (adsbygoogle = window.adsbygoogle || []).push({});
}
