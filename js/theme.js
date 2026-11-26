/**
 * CGZ Theme Toggle — v2
 * Cycles: dark → light → white → dark
 * Persists user's preference in localStorage.
 * Sets data-theme on <html> and updates the toggle button icon.
 */
(function () {
  var KEY = 'cgz-theme';

  var ICONS = { dark: '☀️', light: '⬜', white: '🌙' };
  var NEXT  = { dark: 'light', light: 'white', white: 'dark' };

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = ICONS[theme] || '☀️';
    try { localStorage.setItem(KEY, theme); } catch (e) {}
  }

  // Apply saved or default (dark) theme immediately to avoid flash
  apply(localStorage.getItem(KEY) || 'dark');

  document.addEventListener('DOMContentLoaded', function () {
    // Re-apply so the button icon is set after the DOM is ready
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    apply(current);

    var btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme') || 'dark';
        apply(NEXT[current] || 'dark');
      });
    }
  });
})();
