/**
 * CGZ Top 10 Retro Games — classic titles across all consoles
 * Images: Steam CDN where available; console-styled gradient cards for originals.
 * Tap/click any cover to enlarge via shared _cgzLightbox.
 */
(function () {
  var SECTION    = document.getElementById('retro-games-section');
  var GRID       = document.getElementById('retro-games-grid');
  var FILTER_EL  = document.getElementById('retro-games-filter');

  if (!SECTION || !GRID) return;

  /* ── Console meta (badge colour + emoji + abbreviation) ── */
  var CONSOLES = {
    nes:     { label: 'NES',      emoji: '🎮', color: '#c0392b', bg: 'rgba(192,57,43,0.15)'   },
    snes:    { label: 'SNES',     emoji: '🕹️', color: '#8e44ad', bg: 'rgba(142,68,173,0.15)'  },
    n64:     { label: 'N64',      emoji: '🟢', color: '#27ae60', bg: 'rgba(39,174,96,0.15)'   },
    genesis: { label: 'Genesis',  emoji: '🔵', color: '#2980b9', bg: 'rgba(41,128,185,0.15)'  },
    ps1:     { label: 'PS1',      emoji: '🔷', color: '#1a5276', bg: 'rgba(26,82,118,0.15)'   },
    arcade:  { label: 'Arcade',   emoji: '🕹️', color: '#d35400', bg: 'rgba(211,84,0,0.15)'    },
    gb:      { label: 'Game Boy', emoji: '🟩', color: '#1e8449', bg: 'rgba(30,132,73,0.15)'   },
    atari:   { label: 'Atari',    emoji: '🔶', color: '#b7950b', bg: 'rgba(183,149,11,0.15)'  },
    gba:     { label: 'GBA',      emoji: '🟣', color: '#7d3c98', bg: 'rgba(125,60,152,0.15)'  },
    dc:      { label: 'Dreamcast',emoji: '🟠', color: '#e67e22', bg: 'rgba(230,126,34,0.15)'  },
    saturn:  { label: 'Saturn',   emoji: '🪐', color: '#6c3483', bg: 'rgba(108,52,131,0.15)'  },
    psx:     { label: 'PS1',      emoji: '🔷', color: '#1a5276', bg: 'rgba(26,82,118,0.15)'   }
  };

  /* ── Steam CDN shorthand ── */
  var S = 'https://cdn.akamai.steamstatic.com/steam/apps/';

  /* ── Top 10 Retro Games ── */
  var GAMES = [
    {
      rank: 1,
      name: 'The Legend of Zelda: Ocarina of Time',
      console: 'n64',
      year: 1998,
      score: 99,
      genre: 'Action-Adventure',
      img: '',            // no Steam release; will render gradient card
      note: 'Greatest game ever made — defined 3D adventure gaming.'
    },
    {
      rank: 2,
      name: 'Super Mario Bros.',
      console: 'nes',
      year: 1985,
      score: 97,
      genre: 'Platformer',
      img: '',
      note: 'Started it all. The blueprint for every platformer since.'
    },
    {
      rank: 3,
      name: 'Final Fantasy VII',
      console: 'ps1',
      year: 1997,
      score: 92,
      genre: 'RPG',
      img: S + '39140/header.jpg'   // FF7 on Steam
    },
    {
      rank: 4,
      name: 'Sonic the Hedgehog 2',
      console: 'genesis',
      year: 1992,
      score: 91,
      genre: 'Platformer',
      img: S + '71164/header.jpg'   // Sonic 2 on Steam
    },
    {
      rank: 5,
      name: 'GoldenEye 007',
      console: 'n64',
      year: 1997,
      score: 96,
      genre: 'FPS',
      img: '',
      note: 'Reinvented multiplayer gaming for a generation.'
    },
    {
      rank: 6,
      name: 'Street Fighter II',
      console: 'arcade',
      year: 1991,
      score: 92,
      genre: 'Fighting',
      img: S + '586200/header.jpg'  // SF 30th Anniversary Collection
    },
    {
      rank: 7,
      name: 'Crash Bandicoot',
      console: 'ps1',
      year: 1996,
      score: 88,
      genre: 'Platformer',
      img: S + '731490/header.jpg'  // N. Sane Trilogy on Steam
    },
    {
      rank: 8,
      name: 'Tetris',
      console: 'gb',
      year: 1989,
      score: 99,
      genre: 'Puzzle',
      img: S + '1003590/header.jpg' // Tetris Effect: Connected
    },
    {
      rank: 9,
      name: 'Pac-Man',
      console: 'arcade',
      year: 1980,
      score: 94,
      genre: 'Arcade',
      img: S + '1313290/header.jpg' // PAC-MAN Museum+
    },
    {
      rank: 10,
      name: 'Donkey Kong Country',
      console: 'snes',
      year: 1994,
      score: 92,
      genre: 'Platformer',
      img: '',
      note: 'Groundbreaking pre-rendered graphics that shocked the world.'
    }
  ];

  /* ── Active filter ── */
  var activeFilter = 'all';

  /* ── Score badge colour ── */
  function scoreColor(s) {
    if (s >= 95) return '#ffd700';
    if (s >= 88) return '#00f5ff';
    if (s >= 75) return '#a8ff78';
    return '#ffb347';
  }

  /* ── Single retro card ── */
  function gameCard(g) {
    var con      = CONSOLES[g.console] || CONSOLES.arcade;
    var sc       = scoreColor(g.score);
    var safeImg  = (g.img  || '').replace(/'/g, "\\'");
    var safeName = g.name.replace(/'/g, "\\'");
    var imgHTML  = g.img
      ? '<img src="' + g.img + '" alt="' + g.name + '" loading="lazy" title="Tap to enlarge" ' +
        'onclick="window._cgzLightbox(\'' + safeImg + '\',\'' + safeName + '\')" ' +
        'ontouchend="event.preventDefault();window._cgzLightbox(\'' + safeImg + '\',\'' + safeName + '\')" ' +
        'style="width:110px;height:73px;object-fit:cover;border-radius:10px;flex-shrink:0;' +
        'cursor:zoom-in;touch-action:manipulation;-webkit-tap-highlight-color:transparent;' +
        'transition:transform 0.2s,box-shadow 0.2s;" ' +
        'onmouseover="this.style.transform=\'scale(1.08)\';this.style.boxShadow=\'0 4px 20px ' + con.color + '55\'" ' +
        'onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'" />'
      : '<div style="width:110px;height:73px;border-radius:10px;flex-shrink:0;' +
        'background:linear-gradient(135deg,' + con.bg + ',' + con.bg.replace('0.15','0.3') + ');' +
        'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;' +
        'border:1px solid ' + con.color + '44;">' +
        '<span style="font-size:1.6rem;">' + con.emoji + '</span>' +
        '<span style="font-size:0.52rem;font-weight:700;color:' + con.color + ';letter-spacing:0.06em;' +
        'font-family:var(--font-display);">' + con.label + '</span>' +
        '</div>';

    return '<div data-console="' + g.console + '" ' +
           'style="display:flex;align-items:center;gap:1rem;padding:0.85rem 1rem;' +
           'background:var(--gradient-card);border:var(--border-glow);border-radius:14px;' +
           'margin-bottom:0.65rem;transition:transform 0.2s;" ' +
           'onmouseover="this.style.transform=\'translateX(4px)\'" ' +
           'onmouseout="this.style.transform=\'\'">' +
             /* rank */
             '<div style="font-family:var(--font-display);font-size:1.2rem;font-weight:900;' +
             'color:' + sc + ';min-width:26px;text-align:center;opacity:0.75;">' + g.rank + '</div>' +
             /* cover */
             imgHTML +
             /* info */
             '<div style="flex:1;min-width:0;">' +
               '<div style="font-weight:700;font-size:0.88rem;white-space:nowrap;overflow:hidden;' +
               'text-overflow:ellipsis;color:var(--text-primary);">' + g.name + '</div>' +
               '<div style="display:flex;align-items:center;gap:0.4rem;margin-top:3px;flex-wrap:wrap;">' +
                 '<span style="font-size:0.65rem;font-weight:700;padding:1px 6px;border-radius:4px;' +
                 'background:' + con.bg + ';color:' + con.color + ';border:1px solid ' + con.color + '55;' +
                 'font-family:var(--font-display);letter-spacing:0.04em;">' + con.label + '</span>' +
                 '<span style="font-size:0.7rem;color:var(--text-secondary);">' + g.genre + ' · ' + g.year + '</span>' +
               '</div>' +
             '</div>' +
             /* score */
             '<div style="font-family:var(--font-display);font-size:1rem;font-weight:900;' +
             'color:' + sc + ';flex-shrink:0;text-align:center;">' +
               g.score +
               '<div style="font-size:0.52rem;font-weight:400;color:var(--text-secondary);' +
               'letter-spacing:0.05em;">SCORE</div>' +
             '</div>' +
           '</div>';
  }

  /* ── Render filtered grid ── */
  function renderGrid() {
    var list = activeFilter === 'all'
      ? GAMES
      : GAMES.filter(function(g) { return g.console === activeFilter; });

    if (!list.length) {
      GRID.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem 0;">No games found for this filter.</p>';
      return;
    }

    /* Two-column layout on desktop */
    var half = Math.ceil(list.length / 2);
    var col1 = list.slice(0, half);
    var col2 = list.slice(half);

    var col1Html = col1.map(gameCard).join('');
    var col2Html = col2.map(gameCard).join('');

    GRID.innerHTML =
      '<div style="display:flex;gap:2rem;flex-wrap:wrap;align-items:flex-start;">' +
        '<div style="flex:1;min-width:280px;">' + col1Html + '</div>' +
        (col2Html ? '<div style="flex:1;min-width:280px;">' + col2Html + '</div>' : '') +
      '</div>';
  }

  /* ── Filter bar ── */
  function renderFilters() {
    /* Collect unique consoles in game order */
    var seen = {};
    var consoleList = [{ id: 'all', label: 'All Consoles' }];
    GAMES.forEach(function(g) {
      if (!seen[g.console]) {
        seen[g.console] = true;
        var c = CONSOLES[g.console];
        if (c) consoleList.push({ id: g.console, label: c.emoji + ' ' + c.label, color: c.color });
      }
    });

    var html = '';
    consoleList.forEach(function(f) {
      var active = f.id === activeFilter;
      var col    = f.color || 'var(--neon-yellow)';
      html += '<button onclick="window._cgzRetroFilter(\'' + f.id + '\')" style="' +
              'padding:0.4rem 0.9rem;border-radius:50px;font-size:0.78rem;font-family:inherit;cursor:pointer;' +
              'touch-action:manipulation;-webkit-tap-highlight-color:transparent;transition:all 0.2s;' +
              'border:1px solid ' + (active ? col : 'rgba(255,183,0,0.2)') + ';' +
              'background:' + (active ? col + '22' : 'transparent') + ';' +
              'color:' + (active ? col : 'var(--text-secondary)') + ';">' +
              f.label + '</button>';
    });
    FILTER_EL.innerHTML = html;
  }

  window._cgzRetroFilter = function(id) {
    activeFilter = id;
    renderFilters();
    renderGrid();
  };

  /* ── Init ── */
  function init() {
    renderFilters();
    renderGrid();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
