/**
 * CGZ Theme Toggle — v1
 * Persists user's light/dark preference in localStorage.
 * Sets data-theme on <html> and updates the toggle button icon.
 */
(function () {
  var KEY = 'cgz-theme';

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = theme === 'light' ? '🌙' : '☀️';
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
        var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        apply(next);
      });
    }
  });
})();
