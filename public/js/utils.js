/* ===================================================
   DEALBAAZI — utils.js
   Shared utilities, config, and helpers
   =================================================== */

// Global API Constants
window.API_BASE = '/api';
window.API      = '/api'; // common alias used across files

/**
 * Formats a number as Indian Currency (INR)
 * e.g., 50000 -> 50,000
 */
function formatPrice(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return Number(n).toLocaleString('en-IN');
}

/**
 * Sanitizes strings for safe HTML rendering, preventing XSS.
 */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

/**
 * Displays a non-blocking toast notification.
 * @param {string} msg - The message to show.
 * @param {string} type - 'success', 'error', or 'info'.
 */
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = msg;
  container.appendChild(toast);

  // Auto-remove after 3.5s
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 3500);
}

/**
 * Simple authentication check helper
 * Redirects if token is missing
 */
function requireAuth() {
  const token = localStorage.getItem('ph_token');
  if (!token) {
    if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
       window.location.href = '/index.html';
    }
    return null;
  }
  return token;
}

/**
 * Standard logout helper
 */
function logout() {
  localStorage.removeItem('ph_token');
  localStorage.removeItem('ph_user');
  window.location.href = '/index.html';
}
