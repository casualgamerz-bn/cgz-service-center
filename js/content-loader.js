/**
 * CGZ Content Loader
 * Fetches content.json and fills elements with data-cid / data-cid-href attributes.
 * Runs on every page — no configuration needed.
 */
(function () {
  var CONTENT_URL = '/content.json';
  var FALLBACK_URL = 'https://raw.githubusercontent.com/casualgamerz-bn/cgz-service-center/main/content.json';

  /** Traverse nested object with dot-path, e.g. "home.hero_title_line1" */
  function get(obj, path) {
    return path.split('.').reduce(function (o, k) {
      return o != null ? o[k] : undefined;
    }, obj);
  }

  function apply(content) {
    // Fill text / innerHTML
    document.querySelectorAll('[data-cid]').forEach(function (el) {
      var val = get(content, el.getAttribute('data-cid'));
      if (val !== undefined && val !== null) {
        el.innerHTML = val;
      }
    });
    // Fill href attributes
    document.querySelectorAll('[data-cid-href]').forEach(function (el) {
      var val = get(content, el.getAttribute('data-cid-href'));
      if (val !== undefined && val !== null) {
        el.href = val;
      }
    });
  }

  function load(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('fetch failed');
      return r.json();
    });
  }

  // Try relative path first (works when served from the repo root),
  // fall back to GitHub raw if running from file:// or a CDN.
  load(CONTENT_URL)
    .catch(function () { return load(FALLBACK_URL); })
    .then(apply)
    .catch(function () { /* silent — default HTML text stays visible */ });
})();
