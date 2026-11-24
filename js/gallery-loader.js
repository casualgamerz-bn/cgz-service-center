/**
 * CGZ Gallery Loader — v1
 * Auto-loads images from GitHub repo folders via GitHub Contents API.
 * Caches results in localStorage (10 min TTL) to avoid rate limits.
 * Uses IntersectionObserver so galleries load only when scrolled into view.
 *
 * Usage in HTML:
 *   <div class="auto-gallery" data-folder="images/workshop" data-type="repair"></div>
 *
 * data-type options: "repair" | "game" | "console" | "logo" | "app" | "grid"
 */

(function () {
  var OWNER  = 'casualgamerz-bn';
  var REPO   = 'cgz-service-center';
  var BRANCH = 'main';
  var CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  var IMG_RE = /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i;

  /* ── helpers ──────────────────────────────────────────── */

  function cacheKey(folder) { return 'cgz_gallery_' + folder.replace(/\//g, '_'); }

  function readCache(folder) {
    try {
      var raw = localStorage.getItem(cacheKey(folder));
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (Date.now() - obj.ts > CACHE_TTL) return null;
      return obj.files;
    } catch (e) { return null; }
  }

  function writeCache(folder, files) {
    try { localStorage.setItem(cacheKey(folder), JSON.stringify({ ts: Date.now(), files: files })); } catch (e) {}
  }

  function rawUrl(file) {
    return 'https://raw.githubusercontent.com/' + OWNER + '/' + REPO + '/' + BRANCH + '/' + file.path;
  }

  function niceName(filename) {
    return filename
      .replace(/^\d+[-_]/, '')          // strip leading sort number like "01-"
      .replace(/\.[^.]+$/, '')          // strip extension
      .replace(/[-_]/g, ' ')            // dashes → spaces
      .replace(/\b\w/g, function (c) { return c.toUpperCase(); }); // Title Case
  }

  /* ── card builders ────────────────────────────────────── */

  function buildRepairCard(file) {
    var url   = rawUrl(file);
    var label = niceName(file.name);
    return '<div class="gallery-card">' +
      '<img src="' + url + '" alt="' + label + '" loading="lazy" onerror="this.style.display=\'none\'">' +
      '<div class="gallery-card-label">' + label + '</div>' +
      '</div>';
  }

  function buildGameCard(file) {
    var url   = rawUrl(file);
    var label = niceName(file.name);
    return '<div class="game-card">' +
      '<div class="game-card-cover" style="padding:0;overflow:hidden;">' +
        '<img src="' + url + '" alt="' + label + '" loading="lazy" ' +
             'style="width:100%;height:100%;object-fit:cover;" ' +
             'onerror="this.parentElement.innerHTML=\'🎮\'">' +
      '</div>' +
      '<div class="game-card-info">' +
        '<div class="game-card-title">' + label + '</div>' +
      '</div>' +
      '</div>';
  }

  function buildConsoleCard(file) {
    var url   = rawUrl(file);
    var label = niceName(file.name);
    return '<div class="console-gallery-card">' +
      '<img src="' + url + '" alt="' + label + '" loading="lazy" onerror="this.style.display=\'none\'">' +
      '<div class="console-gallery-label">' + label + '</div>' +
      '</div>';
  }

  function buildLogoCard(file) {
    var url   = rawUrl(file);
    var label = niceName(file.name);
    return '<div class="logo-gallery-card">' +
      '<img src="' + url + '" alt="' + label + '" loading="lazy" onerror="this.style.display=\'none\'">' +
      '</div>';
  }

  function buildAppCard(file) {
    var url   = rawUrl(file);
    var label = niceName(file.name);
    return '<div class="app-gallery-card">' +
      '<div class="app-gallery-cover">' +
        '<img src="' + url + '" alt="' + label + '" loading="lazy" onerror="this.style.display=\'none\'">' +
      '</div>' +
      '<div class="app-gallery-label">' + label + '</div>' +
      '</div>';
  }

  function buildGridCard(file) {
    var url   = rawUrl(file);
    var label = niceName(file.name);
    return '<div class="grid-gallery-card">' +
      '<img src="' + url + '" alt="' + label + '" loading="lazy" onerror="this.style.display=\'none\'">' +
      '<div class="grid-gallery-label">' + label + '</div>' +
      '</div>';
  }

  var BUILDERS = {
    repair:  buildRepairCard,
    game:    buildGameCard,
    console: buildConsoleCard,
    logo:    buildLogoCard,
    app:     buildAppCard,
    grid:    buildGridCard
  };

  /* ── skeleton / empty states ──────────────────────────── */

  function skeleton(type) {
    var cls = type === 'game' ? 'games-scroll' :
              type === 'logo' ? 'logo-gallery-grid' :
              type === 'app'  ? 'app-gallery-grid' :
              'repair-gallery-grid';
    return '<div class="' + cls + ' gallery-loading">' +
      [1,2,3,4].map(function () {
        return '<div class="gallery-skeleton"></div>';
      }).join('') +
      '</div>';
  }

  function emptyState() {
    return '<div class="gallery-empty">' +
      '<div style="font-size:2.5rem;margin-bottom:0.75rem;">📸</div>' +
      '<p>Photos coming soon — check back later!</p>' +
      '</div>';
  }

  /* ── render ───────────────────────────────────────────── */

  function render(el, files, type) {
    var builder = BUILDERS[type] || buildGridCard;
    var images  = files.filter(function (f) { return IMG_RE.test(f.name); });

    if (images.length === 0) {
      el.innerHTML = emptyState();
      return;
    }

    var wrapClass = type === 'game'    ? 'games-scroll' :
                    type === 'logo'    ? 'logo-gallery-grid' :
                    type === 'app'     ? 'app-gallery-grid' :
                    type === 'console' ? 'console-gallery-grid' :
                    'repair-gallery-grid';

    var html = '<div class="' + wrapClass + '">' +
      images.map(builder).join('') +
      '</div>';

    // scrollable wrapper for game-type
    if (type === 'game') {
      html = '<div class="games-scroll-wrap">' + html + '</div>';
    }

    el.innerHTML = html;
    el.classList.add('loaded');
  }

  /* ── fetch ────────────────────────────────────────────── */

  function loadFolder(el) {
    var folder = el.getAttribute('data-folder');
    var type   = el.getAttribute('data-type') || 'grid';

    if (!folder) return;

    // show skeleton
    el.innerHTML = skeleton(type);

    // check cache
    var cached = readCache(folder);
    if (cached) {
      render(el, cached, type);
      return;
    }

    var apiUrl = 'https://api.github.com/repos/' + OWNER + '/' + REPO +
                 '/contents/' + folder + '?ref=' + BRANCH;

    fetch(apiUrl, { headers: { 'Accept': 'application/vnd.github.v3+json' } })
      .then(function (res) {
        if (res.status === 403) throw new Error('rate_limit');
        if (!res.ok) throw new Error('api_error');
        return res.json();
      })
      .then(function (data) {
        if (!Array.isArray(data)) throw new Error('bad_response');
        var files = data.filter(function (f) { return f.type === 'file'; });
        writeCache(folder, files);
        render(el, files, type);
      })
      .catch(function (err) {
        // graceful fallback: hide if no images, show empty state
        el.innerHTML = emptyState();
      });
  }

  /* ── intersection observer (lazy load) ───────────────── */

  function init() {
    var els = document.querySelectorAll('.auto-gallery');
    if (!els.length) return;

    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            loadFolder(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: '200px' });

      els.forEach(function (el) { obs.observe(el); });
    } else {
      // fallback: load all immediately
      els.forEach(loadFolder);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
