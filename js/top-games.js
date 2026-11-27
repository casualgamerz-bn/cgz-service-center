/**
 * CGZ Top 5 Games — real-time via RAWG API
 * Docs: https://rawg.io/apidocs  (free key — 20,000 req/month)
 * Falls back to curated static list when no API key is configured.
 */
(function () {
  var CACHE_KEY  = 'cgz_top_games_v3';
  var CACHE_TTL  = 60 * 60 * 1000; // 1 hour
  var SECTION    = document.getElementById('top-games-section');
  var GRID       = document.getElementById('top-games-grid');
  var TABS_EL    = document.getElementById('top-games-tabs');

  if (!SECTION || !GRID) return;

  /* ── RAWG platform IDs ── */
  var PLATFORMS = {
    pc:      '4',                   // PC (Windows)
    console: '187,186,18,1,7,8'     // PS5, Xbox Series, PS4, Xbox One, Switch, PS3
  };

  /* ── Curated fallback data (shown when no API key is set) ── */
  var STEAM = 'https://cdn.akamai.steamstatic.com/steam/apps/';
  var STATIC = {
    pc: [
      { name: 'Baldur\'s Gate 3',     score: 96, genre: 'RPG',        year: 2023, img: STEAM + '1086940/header.jpg' },
      { name: 'Elden Ring',            score: 95, genre: 'Action RPG', year: 2022, img: STEAM + '1245620/header.jpg' },
      { name: 'Red Dead Redemption 2', score: 97, genre: 'Open World', year: 2019, img: STEAM + '1174180/header.jpg' },
      { name: 'The Witcher 3',         score: 93, genre: 'RPG',        year: 2015, img: STEAM + '292030/header.jpg'  },
      { name: 'Cyberpunk 2077',        score: 86, genre: 'Action RPG', year: 2020, img: STEAM + '1091500/header.jpg' }
    ],
    console: [
      { name: 'God of War Ragnarök',          score: 94, genre: 'Action',    year: 2022, img: STEAM + '2322010/header.jpg' },
      { name: 'Ghost of Tsushima',            score: 91, genre: 'Action',    year: 2024, img: STEAM + '2215430/header.jpg' },
      { name: 'Spider-Man Remastered',        score: 90, genre: 'Action',    year: 2022, img: STEAM + '1817070/header.jpg' },
      { name: 'Hades',                        score: 93, genre: 'Roguelite', year: 2020, img: STEAM + '1145360/header.jpg' },
      { name: 'Horizon Forbidden West',       score: 88, genre: 'Action RPG',year: 2022, img: STEAM + '2420110/header.jpg' }
    ]
  };

  /* ── State ── */
  var currentTab = 'all';
  var liveData   = null; // { pc: [], console: [], fetchedAt: timestamp }

  /* ── Score colour ── */
  function scoreColor(s) {
    if (s >= 90) return '#00f5ff';
    if (s >= 75) return '#a8ff78';
    return '#ffb347';
  }

  /* ── Render one game card ── */
  function gameCard(game, rank) {
    var score = game.metacritic || game.score || '—';
    var color = typeof score === 'number' ? scoreColor(score) : '#888';
    var img   = game.background_image || game.img || '';
    var name  = game.name || '';
    var genre = game.genre || (game.genres && game.genres[0] && game.genres[0].name) || '';
    var year  = game.released ? game.released.slice(0, 4) : (game.year || '');

    return '<div style="display:flex;align-items:center;gap:1rem;padding:0.85rem 1rem;' +
           'background:var(--gradient-card);border:var(--border-glow);border-radius:14px;' +
           'margin-bottom:0.65rem;transition:transform 0.2s;" ' +
           'onmouseover="this.style.transform=\'translateX(4px)\'" ' +
           'onmouseout="this.style.transform=\'\'">' +
             '<div style="font-family:var(--font-display);font-size:1.3rem;font-weight:900;' +
             'color:var(--neon-cyan);min-width:28px;text-align:center;opacity:0.6;">' + rank + '</div>' +
             (img
               ? '<img src="' + img + '" alt="' + name + '" loading="lazy" ' +
                 'style="width:60px;height:40px;object-fit:cover;border-radius:8px;flex-shrink:0;" />'
               : '<div style="width:60px;height:40px;border-radius:8px;flex-shrink:0;' +
                 'background:linear-gradient(135deg,rgba(0,245,255,0.15),rgba(255,0,128,0.15));' +
                 'display:flex;align-items:center;justify-content:center;font-size:1.1rem;">🎮</div>') +
             '<div style="flex:1;min-width:0;">' +
               '<div style="font-weight:700;font-size:0.88rem;white-space:nowrap;overflow:hidden;' +
               'text-overflow:ellipsis;color:var(--text-primary);">' + name + '</div>' +
               '<div style="font-size:0.72rem;color:var(--text-secondary);">' +
               (genre ? genre : '') + (genre && year ? ' · ' : '') + (year || '') + '</div>' +
             '</div>' +
             '<div style="font-family:var(--font-display);font-size:1rem;font-weight:900;' +
             'color:' + color + ';flex-shrink:0;text-align:center;">' +
               score + '<div style="font-size:0.55rem;font-weight:400;color:var(--text-secondary);' +
               'letter-spacing:0.05em;">SCORE</div>' +
             '</div>' +
           '</div>';
  }

  /* ── Render two-column layout ── */
  function renderGrid(data) {
    var pc      = (data && data.pc)      || [];
    var console_ = (data && data.console) || [];
    var showPc  = currentTab === 'all' || currentTab === 'pc';
    var showCon = currentTab === 'all' || currentTab === 'console';

    var pcHtml  = '';
    var conHtml = '';

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

  /* ── Tab buttons ── */
  function renderTabs(isLive) {
    var tabs = [
      { id: 'all',     label: '🎯 All' },
      { id: 'pc',      label: '🖥️ PC' },
      { id: 'console', label: '🕹️ Console' }
    ];
    var html = '';
    tabs.forEach(function(t) {
      var active = t.id === currentTab;
      html += '<button onclick="window._cgzGameTab(\'' + t.id + '\')" style="' +
              'padding:0.45rem 1rem;border-radius:50px;border:1px solid ' +
              (active ? 'var(--neon-cyan)' : 'rgba(0,245,255,0.2)') + ';' +
              'background:' + (active ? 'rgba(0,245,255,0.12)' : 'transparent') + ';' +
              'color:' + (active ? 'var(--neon-cyan)' : 'var(--text-secondary)') + ';' +
              'cursor:pointer;font-size:0.82rem;font-family:inherit;transition:all 0.2s;">' +
              t.label + '</button>';
    });
    if (isLive) {
      var d = new Date();
      html += '<span style="font-size:0.72rem;color:var(--text-secondary);align-self:center;' +
              'margin-left:0.5rem;">🔴 Live · ' + d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) + '</span>';
    } else {
      html += '<span style="font-size:0.72rem;color:var(--text-secondary);align-self:center;' +
              'margin-left:0.5rem;">📋 Curated picks</span>';
    }
    TABS_EL.innerHTML = html;
  }

  /* ── Tab switch handler ── */
  window._cgzGameTab = function(tab) {
    currentTab = tab;
    renderTabs(!!liveData);
    renderGrid(liveData || STATIC);
  };

  /* ── Fetch from RAWG ── */
  function fetchRAWG(apiKey) {
    // Check sessionStorage cache first
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

    var base = 'https://api.rawg.io/api/games?key=' + apiKey +
               '&ordering=-metacritic&page_size=5&metacritic=70,100';

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
      // API failed — fall back to static
      renderTabs(false);
      renderGrid(STATIC);
    });
  }

  /* ── Init: wait for content.json to load ── */
  function init() {
    // Try to read the API key from window.cgzContent (set by content-loader.js)
    // content-loader.js fires a custom event when done
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
      // content-loader.js may not have stored to window yet — poll briefly
      var attempts = 0;
      var timer = setInterval(function() {
        attempts++;
        if (window.cgzContent) { clearInterval(timer); tryStart(); return; }
        if (attempts >= 10) {
          clearInterval(timer);
          renderTabs(false);
          renderGrid(STATIC);
        }
      }, 300);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
