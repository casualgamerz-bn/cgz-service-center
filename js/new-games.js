/**
 * CGZ Top 5 Newest Games — real-time via RAWG API
 * Falls back to curated static list when no API key is configured.
 */
(function () {
  var CACHE_KEY = 'cgz_new_games_v1';
  var CACHE_TTL = 60 * 60 * 1000; // 1 hour
  var SECTION   = document.getElementById('new-games-section');
  var GRID      = document.getElementById('new-games-grid');
  var TABS_EL   = document.getElementById('new-games-tabs');

  if (!SECTION || !GRID) return;

  /* ── RAWG platform IDs ── */
  var PLATFORMS = {
    pc:      '4',
    console: '187,186,18,1,7,8'
  };

  /* ── Curated newest games fallback (Steam CDN images) ── */
  var STEAM = 'https://cdn.akamai.steamstatic.com/steam/apps/';
  var STATIC = {
    pc: [
      { name: 'Black Myth: Wukong',              score: 82, genre: 'Action RPG', year: 2024, img: STEAM + '2358720/header.jpg' },
      { name: 'Helldivers 2',                    score: 82, genre: 'Shooter',    year: 2024, img: STEAM + '553850/header.jpg'  },
      { name: 'Dragon\'s Dogma 2',               score: 80, genre: 'Action RPG', year: 2024, img: STEAM + '2054970/header.jpg' },
      { name: 'Palworld',                        score: 80, genre: 'Survival',   year: 2024, img: STEAM + '1623730/header.jpg' },
      { name: 'Indiana Jones: The Great Circle', score: 85, genre: 'Adventure',  year: 2024, img: STEAM + '2677660/header.jpg' }
    ],
    console: [
      { name: 'Metaphor: ReFantazio',    score: 94, genre: 'RPG',     year: 2024, img: STEAM + '2683460/header.jpg' },
      { name: 'Silent Hill 2 Remake',    score: 87, genre: 'Survival',year: 2024, img: STEAM + '2124490/header.jpg' },
      { name: 'Tekken 8',                score: 90, genre: 'Fighting', year: 2024, img: STEAM + '1778820/header.jpg' },
      { name: 'Space Marine 2',          score: 80, genre: 'Action',   year: 2024, img: STEAM + '2183900/header.jpg' },
      { name: 'Dragon Ball Sparking! Zero', score: 76, genre: 'Fighting',year: 2024, img: STEAM + '1790600/header.jpg' }
    ]
  };

  /* ── State ── */
  var currentTab = 'all';
  var liveData   = null;

  /* ── Release year badge colour ── */
  function yearColor(y) {
    var n = parseInt(y, 10);
    if (n >= 2025) return '#ff0080';
    if (n >= 2024) return '#00f5ff';
    return '#a8ff78';
  }

  /* ── One card ── */
  function gameCard(game, rank) {
    var score = game.metacritic || game.score || '—';
    var img   = game.background_image || game.img || '';
    var name  = game.name || '';
    var genre = game.genre || (game.genres && game.genres[0] && game.genres[0].name) || '';
    var year  = game.released ? game.released.slice(0, 4) : (game.year || '');
    var col   = yearColor(year);
    var safeImg  = img.replace(/'/g, "\\'");
    var safeName = name.replace(/'/g, "\\'");

    return '<div style="display:flex;align-items:center;gap:1rem;padding:0.85rem 1rem;' +
           'background:var(--gradient-card);border:var(--border-glow);border-radius:14px;' +
           'margin-bottom:0.65rem;transition:transform 0.2s;" ' +
           'onmouseover="this.style.transform=\'translateX(4px)\'" ' +
           'onmouseout="this.style.transform=\'\'">' +
             '<div style="font-family:var(--font-display);font-size:1.3rem;font-weight:900;' +
             'color:var(--neon-pink);min-width:28px;text-align:center;opacity:0.6;">' + rank + '</div>' +
             (img
               ? '<img src="' + img + '" alt="' + name + '" loading="lazy" title="Tap to enlarge" ' +
                 'onclick="window._cgzLightbox(\'' + safeImg + '\',\'' + safeName + '\')" ' +
                 'ontouchend="event.preventDefault();window._cgzLightbox(\'' + safeImg + '\',\'' + safeName + '\')" ' +
                 'style="width:110px;height:73px;object-fit:cover;border-radius:10px;flex-shrink:0;' +
                 'cursor:zoom-in;touch-action:manipulation;-webkit-tap-highlight-color:transparent;' +
                 'transition:transform 0.2s,box-shadow 0.2s;" ' +
                 'onmouseover="this.style.transform=\'scale(1.08)\';this.style.boxShadow=\'0 4px 20px rgba(255,0,128,0.4)\'" ' +
                 'onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'" />'
               : '<div style="width:110px;height:73px;border-radius:10px;flex-shrink:0;' +
                 'background:linear-gradient(135deg,rgba(255,0,128,0.15),rgba(0,245,255,0.15));' +
                 'display:flex;align-items:center;justify-content:center;font-size:1.5rem;">🆕</div>') +
             '<div style="flex:1;min-width:0;">' +
               '<div style="font-weight:700;font-size:0.88rem;white-space:nowrap;overflow:hidden;' +
               'text-overflow:ellipsis;color:var(--text-primary);">' + name + '</div>' +
               '<div style="font-size:0.72rem;color:var(--text-secondary);">' +
               (genre ? genre : '') + '</div>' +
             '</div>' +
             '<div style="font-family:var(--font-display);font-size:1rem;font-weight:900;' +
             'color:' + col + ';flex-shrink:0;text-align:center;">' +
               year + '<div style="font-size:0.55rem;font-weight:400;color:var(--text-secondary);' +
               'letter-spacing:0.05em;">YEAR</div>' +
             '</div>' +
           '</div>';
  }

  /* ── Grid layout ── */
  function renderGrid(data) {
    var pc       = (data && data.pc)      || [];
    var console_ = (data && data.console) || [];
    var showPc   = currentTab === 'all' || currentTab === 'pc';
    var showCon  = currentTab === 'all' || currentTab === 'console';

    var pcHtml = '', conHtml = '';
    if (showPc && pc.length) {
      pcHtml = '<div style="flex:1;min-width:280px;">' +
               '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;">' +
               '<span style="font-size:1.1rem;">🖥️</span>' +
               '<span style="font-family:var(--font-display);font-weight:700;color:var(--neon-cyan);' +
               'letter-spacing:0.05em;font-size:0.85rem;">PC</span></div>';
      pc.forEach(function(g, i) { pcHtml += gameCard(g, i + 1); });
      pcHtml += '</div>';
    }
    if (showCon && console_.length) {
      conHtml = '<div style="flex:1;min-width:280px;">' +
                '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;">' +
                '<span style="font-size:1.1rem;">🕹️</span>' +
                '<span style="font-family:var(--font-display);font-weight:700;color:var(--neon-pink);' +
                'letter-spacing:0.05em;font-size:0.85rem;">CONSOLE</span></div>';
      console_.forEach(function(g, i) { conHtml += gameCard(g, i + 1); });
      conHtml += '</div>';
    }
    GRID.innerHTML = '<div style="display:flex;gap:2rem;flex-wrap:wrap;align-items:flex-start;">' +
                     pcHtml + conHtml + '</div>';
  }

  /* ── Tabs ── */
  function renderTabs(isLive) {
    var tabs = [
      { id: 'all',     label: '🎯 All' },
      { id: 'pc',      label: '🖥️ PC' },
      { id: 'console', label: '🕹️ Console' }
    ];
    var html = '';
    tabs.forEach(function(t) {
      var active = t.id === currentTab;
      html += '<button onclick="window._cgzNewTab(\'' + t.id + '\')" style="' +
              'padding:0.45rem 1rem;border-radius:50px;border:1px solid ' +
              (active ? 'var(--neon-pink)' : 'rgba(255,0,128,0.2)') + ';' +
              'background:' + (active ? 'rgba(255,0,128,0.12)' : 'transparent') + ';' +
              'color:' + (active ? 'var(--neon-pink)' : 'var(--text-secondary)') + ';' +
              'cursor:pointer;font-size:0.82rem;font-family:inherit;transition:all 0.2s;' +
              'touch-action:manipulation;">' + t.label + '</button>';
    });
    var indicator = isLive
      ? '<span style="font-size:0.72rem;color:var(--text-secondary);align-self:center;margin-left:0.5rem;">🔴 Live</span>'
      : '<span style="font-size:0.72rem;color:var(--text-secondary);align-self:center;margin-left:0.5rem;">📋 Curated picks</span>';
    TABS_EL.innerHTML = html + indicator;
  }

  window._cgzNewTab = function(tab) {
    currentTab = tab;
    renderTabs(!!liveData);
    renderGrid(liveData || STATIC);
  };

  /* ── Fetch newest from RAWG ── */
  function fetchRAWG(apiKey) {
    try {
      var cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        var obj = JSON.parse(cached);
        if (Date.now() - obj.fetchedAt < CACHE_TTL) {
          liveData = obj;
          renderTabs(true);
          renderGrid(liveData);
          return;
        }
      }
    } catch (e) {}

    // today and 180 days ago
    var now   = new Date();
    var past  = new Date(now - 180 * 24 * 60 * 60 * 1000);
    function fmt(d) { return d.toISOString().slice(0, 10); }
    var dates = fmt(past) + ',' + fmt(now);

    var base = 'https://api.rawg.io/api/games?key=' + apiKey +
               '&ordering=-released&page_size=5&dates=' + dates + '&metacritic=65,100';

    Promise.all([
      fetch(base + '&platforms=' + PLATFORMS.pc).then(function(r) { return r.json(); }),
      fetch(base + '&platforms=' + PLATFORMS.console).then(function(r) { return r.json(); })
    ]).then(function(results) {
      liveData = {
        pc:        results[0].results || [],
        console:   results[1].results || [],
        fetchedAt: Date.now()
      };
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(liveData)); } catch (e) {}
      renderTabs(true);
      renderGrid(liveData);
    }).catch(function() {
      renderTabs(false);
      renderGrid(STATIC);
    });
  }

  /* ── Init ── */
  function init() {
    function tryStart() {
      var key = window.cgzContent && window.cgzContent.home &&
                window.cgzContent.home.rawg_api_key;
      if (key && key.trim()) {
        fetchRAWG(key.trim());
      } else {
        renderTabs(false);
        renderGrid(STATIC);
      }
    }
    if (window.cgzContent) {
      tryStart();
    } else {
      var attempts = 0;
      var timer = setInterval(function() {
        attempts++;
        if (window.cgzContent) { clearInterval(timer); tryStart(); return; }
        if (attempts >= 10)    { clearInterval(timer); renderTabs(false); renderGrid(STATIC); }
      }, 300);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
