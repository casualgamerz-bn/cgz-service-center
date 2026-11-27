/**
 * CGZ Top 10 Retro Games — 10 per console, 7 consoles
 * Images: Steam CDN (modern releases) + Wikipedia Commons (originals)
 * onerror → console-gradient card fallback
 * Tap/click any cover → shared _cgzLightbox
 */
(function () {
  var SECTION   = document.getElementById('retro-games-section');
  var GRID      = document.getElementById('retro-games-grid');
  var FILTER_EL = document.getElementById('retro-games-filter');
  if (!SECTION || !GRID) return;

  /* ── External image bases ── */
  var ST  = 'https://cdn.akamai.steamstatic.com/steam/apps/';
  var WK  = 'https://upload.wikimedia.org/wikipedia/en/';

  /* ── Console config ── */
  var CONSOLES = [
    { id: 'nes',     label: '🎮 NES',      color: '#e53935', bg: 'rgba(229,57,53,0.14)'   },
    { id: 'snes',    label: '🕹️ SNES',     color: '#8e24aa', bg: 'rgba(142,36,170,0.14)'  },
    { id: 'n64',     label: '🟢 N64',       color: '#43a047', bg: 'rgba(67,160,71,0.14)'   },
    { id: 'genesis', label: '🔵 Genesis',   color: '#1e88e5', bg: 'rgba(30,136,229,0.14)'  },
    { id: 'ps1',     label: '🔷 PS1',       color: '#00b0ff', bg: 'rgba(0,176,255,0.14)'   },
    { id: 'arcade',  label: '🕹️ Arcade',   color: '#fb8c00', bg: 'rgba(251,140,0,0.14)'   },
    { id: 'gb',      label: '🟩 Game Boy',  color: '#00897b', bg: 'rgba(0,137,123,0.14)'   }
  ];
  var CON_MAP = {};
  CONSOLES.forEach(function(c){ CON_MAP[c.id] = c; });

  /* ── 70 games — 10 per console ── */
  var WC = 'https://upload.wikimedia.org/wikipedia/commons/';
  var GAMES = {
    nes: [
      { rank:1,  name:'Super Mario Bros.',          year:1985, score:97, genre:'Platformer',       img: WK+'0/03/Super_Mario_Bros._box.png' },
      { rank:2,  name:'The Legend of Zelda',         year:1986, score:95, genre:'Action-Adventure', img: WK+'4/41/Legend_of_zelda_cover_%28with_cartridge%29_gold.png' },
      { rank:3,  name:'Mega Man 2',                  year:1988, score:95, genre:'Platformer',       img: WK+'a/a3/Megaman2box.jpg' },
      { rank:4,  name:'Contra',                      year:1988, score:92, genre:'Run & Gun',        img: WK+'8/82/Contra_cover.jpg' },
      { rank:5,  name:'Castlevania',                 year:1986, score:90, genre:'Action',           img: WK+'0/0b/Castlevania_NES_box_art.jpg' },
      { rank:6,  name:'Metroid',                     year:1986, score:88, genre:'Action-Adventure', img: WK+'5/50/NES_Metroid_Box_Art.jpg' },
      { rank:7,  name:'Ninja Gaiden',                year:1988, score:90, genre:'Action',           img: WK+'0/09/NES_Ninja_Gaiden_cover.jpg' },
      { rank:8,  name:'DuckTales',                   year:1989, score:88, genre:'Platformer',       img: WK+'2/2c/DuckTales_NES_box.PNG' },
      { rank:9,  name:'Battletoads',                 year:1991, score:85, genre:"Beat 'em Up",      img: WK+'e/e3/Battletoads_NES_boxart.jpg' },
      { rank:10, name:'Excitebike',                  year:1984, score:83, genre:'Racing',           img: WK+'e/e4/Excitebike_box.jpg' }
    ],
    snes: [
      { rank:1,  name:'Super Mario World',           year:1990, score:96, genre:'Platformer',       img: WK+'3/32/Super_Mario_World_Coverart.png' },
      { rank:2,  name:'Zelda: A Link to the Past',   year:1991, score:95, genre:'Action-Adventure', img: WK+'0/09/The_Legend_of_Zelda_-_A_Link_to_the_Past_%28SNES%29.png' },
      { rank:3,  name:'Chrono Trigger',              year:1995, score:97, genre:'RPG',              img: ST+'613830/header.jpg' },
      { rank:4,  name:'Super Metroid',               year:1994, score:96, genre:'Action-Adventure', img: WK+'e/e8/Supermetroidboxart.jpg' },
      { rank:5,  name:'Donkey Kong Country',         year:1994, score:92, genre:'Platformer',       img: WK+'3/37/Donkey_Kong_Country_SNES_cover.jpg' },
      { rank:6,  name:'Final Fantasy VI',            year:1994, score:94, genre:'RPG',              img: WK+'0/02/FFVI_SNES_NA_box_art.jpg' },
      { rank:7,  name:'Street Fighter II Turbo',     year:1992, score:92, genre:'Fighting',         img: WK+'d/da/SNES_Street_Fighter_2_Turbo.jpg' },
      { rank:8,  name:'Secret of Mana',              year:1993, score:87, genre:'Action RPG',       img: WK+'2/26/Secret_of_Mana_Box_Art.jpg' },
      { rank:9,  name:'Super Mario Kart',            year:1992, score:90, genre:'Racing',           img: WK+'0/0e/Super_Mario_Kart_NA.jpg' },
      { rank:10, name:'Star Fox',                    year:1993, score:89, genre:'Shoot \'em Up',    img: WK+'f/f1/Star_Fox.jpg' }
    ],
    n64: [
      { rank:1,  name:'Zelda: Ocarina of Time',      year:1998, score:99, genre:'Action-Adventure', img: WK+'5/57/The_Legend_of_Zelda_Ocarina_of_time.jpg' },
      { rank:2,  name:'Super Mario 64',              year:1996, score:97, genre:'Platformer',       img: WK+'6/6a/Super_Mario_64_box_cover.jpg' },
      { rank:3,  name:'GoldenEye 007',               year:1997, score:96, genre:'FPS',              img: WK+'3/37/Goldeneye007n64.jpg' },
      { rank:4,  name:'Banjo-Kazooie',               year:1998, score:92, genre:'Platformer',       img: WK+'5/5d/Banjo_Kazooie_Cover.jpg' },
      { rank:5,  name:"Majora's Mask",               year:2000, score:95, genre:'Action-Adventure', img: WK+'5/5f/Legend_of_Zelda_Majora%27s_Mask.jpg' },
      { rank:6,  name:'Perfect Dark',                year:2000, score:97, genre:'FPS',              img: WK+'1/1a/Perfect_Dark_N64_NA.jpg' },
      { rank:7,  name:'Star Fox 64',                 year:1997, score:90, genre:'Shoot \'em Up',    img: WK+'8/8d/Starfox64_pak.jpg' },
      { rank:8,  name:'Super Smash Bros.',           year:1999, score:88, genre:'Fighting',         img: WK+'9/92/Super_smash_bros_N64_box_art.jpg' },
      { rank:9,  name:'Mario Kart 64',               year:1996, score:83, genre:'Racing',           img: WK+'8/8d/Mario_Kart_64_USA.jpg' },
      { rank:10, name:'Donkey Kong 64',              year:1999, score:88, genre:'Platformer',       img: WK+'5/51/Donkey_Kong_64.jpg' }
    ],
    genesis: [
      { rank:1,  name:'Sonic the Hedgehog 2',        year:1992, score:91, genre:'Platformer',       img: ST+'71164/header.jpg' },
      { rank:2,  name:'Streets of Rage 2',           year:1992, score:92, genre:"Beat 'em Up",      img: WK+'8/88/Streets_of_Rage_2.jpg' },
      { rank:3,  name:'Sonic 3 & Knuckles',          year:1994, score:93, genre:'Platformer',       img: WK+'4/4e/Sonic_the_Hedgehog_3_cover.jpg' },
      { rank:4,  name:"Disney's Aladdin",            year:1993, score:86, genre:'Platformer',       img: ST+'1227830/header.jpg' },
      { rank:5,  name:'Mortal Kombat II',            year:1994, score:90, genre:'Fighting',         img: WK+'d/d9/Mortal_Kombat_II_flyer.jpg' },
      { rank:6,  name:'Comix Zone',                  year:1995, score:83, genre:"Beat 'em Up",      img: WK+'1/13/Comix_Zone_Box_Art.jpg' },
      { rank:7,  name:'Gunstar Heroes',              year:1993, score:90, genre:'Run & Gun',        img: WK+'a/a3/Gunstar_Heroes_box.jpg' },
      { rank:8,  name:'Earthworm Jim',               year:1994, score:86, genre:'Platformer',       img: WK+'7/7a/Earthworm_Jim_cover.jpg' },
      { rank:9,  name:'ToeJam & Earl',               year:1991, score:80, genre:'Adventure',        img: ST+'462600/header.jpg' },
      { rank:10, name:'Shinobi III',                 year:1993, score:88, genre:'Action',           img: WK+'b/bc/Shinobi_III_cover.jpg' }
    ],
    ps1: [
      { rank:1,  name:'Final Fantasy VII',           year:1997, score:92, genre:'RPG',              img: WK+'d/de/FFVII_NACover.jpg' },
      { rank:2,  name:'Metal Gear Solid',            year:1998, score:94, genre:'Stealth Action',   img: WK+'e/e3/MetalGearSolid.jpg' },
      { rank:3,  name:'Tekken 3',                    year:1998, score:96, genre:'Fighting',         img: WK+'5/5c/Tekken_3_PlayStation_cover_art.png' },
      { rank:4,  name:'Resident Evil 2',             year:1998, score:93, genre:'Survival Horror',  img: WK+'2/2a/Resident_Evil_2_cover_art.jpg' },
      { rank:5,  name:'Gran Turismo',                year:1997, score:95, genre:'Racing',           img: WK+'8/88/Gran_Turismo_1_cover.jpg' },
      { rank:6,  name:'Crash Bandicoot',             year:1996, score:88, genre:'Platformer',       img: WK+'a/a7/Crash_Bandicoot_1_Game_Cover.jpg' },
      { rank:7,  name:'Castlevania: Symphony of the Night', year:1997, score:93, genre:'Action RPG', img: WK+'2/2b/Castlevania_SotN_NA.jpg' },
      { rank:8,  name:'Spyro the Dragon',            year:1998, score:85, genre:'Platformer',       img: WK+'4/4a/Spyro_the_Dragon_%28video_game%29.jpg' },
      { rank:9,  name:'Chrono Cross',                year:1999, score:94, genre:'RPG',              img: WK+'2/2c/Chrono_Cross_Coverart.png' },
      { rank:10, name:'Final Fantasy IX',            year:2000, score:94, genre:'RPG',              img: WK+'9/9b/Final_Fantasy_IX_cover.jpg' }
    ],
    arcade: [
      { rank:1,  name:'Pac-Man',                     year:1980, score:94, genre:'Arcade',           img: ST+'1313290/header.jpg' },
      { rank:2,  name:'Street Fighter II',           year:1991, score:92, genre:'Fighting',         img: WK+'d/d5/Street_Fighter_II_%28arcade%29_flyer.jpg' },
      { rank:3,  name:'Galaga',                      year:1981, score:91, genre:'Shoot \'em Up',    img: WC+'8/8e/Galaga.png' },
      { rank:4,  name:'Space Invaders',              year:1978, score:93, genre:'Shoot \'em Up',    img: WC+'2/20/Space_Invaders_flyer%2C_1978_-_Taito.png' },
      { rank:5,  name:'Donkey Kong',                 year:1981, score:90, genre:'Platformer',       img: WC+'8/8e/Donkey_Kong_flyer.png' },
      { rank:6,  name:'Mortal Kombat',               year:1992, score:88, genre:'Fighting',         img: WK+'0/0d/Mortal_Kombat_arcade_flyer.jpg' },
      { rank:7,  name:'Metal Slug 3',                year:2000, score:92, genre:'Run & Gun',        img: ST+'250180/header.jpg' },
      { rank:8,  name:'The King of Fighters \'98',  year:1998, score:90, genre:'Fighting',         img: ST+'222940/header.jpg' },
      { rank:9,  name:'Frogger',                     year:1981, score:85, genre:'Arcade',           img: WC+'9/9d/Frogger_game_arcade.png' },
      { rank:10, name:'Contra (Arcade)',             year:1987, score:88, genre:'Run & Gun',        img: WK+'8/82/Contra_cover.jpg' }
    ],
    gb: [
      { rank:1,  name:'Tetris',                      year:1989, score:99, genre:'Puzzle',           img: WK+'e/ea/Tetris_NES_box_art.png' },
      { rank:2,  name:'Pokémon Red / Blue',          year:1996, score:89, genre:'RPG',              img: WK+'a/af/Pokemon_red_en_boxart.jpg' },
      { rank:3,  name:"Zelda: Link's Awakening",    year:1993, score:90, genre:'Action-Adventure', img: WK+'8/8e/The_Legend_of_Zelda_Link%27s_Awakening.jpg' },
      { rank:4,  name:'Kirby\'s Dream Land',         year:1992, score:83, genre:'Platformer',       img: WK+'8/80/Kirby%27s_Dream_Land_cover.jpg' },
      { rank:5,  name:'Super Mario Land 2',          year:1992, score:86, genre:'Platformer',       img: WK+'a/a7/Super_Mario_Land_2_Box_art.jpg' },
      { rank:6,  name:'Pokémon Gold / Silver',       year:1999, score:91, genre:'RPG',              img: WK+'8/8f/Pokemon_Gold_Version_box_art.png' },
      { rank:7,  name:'Metroid II',                  year:1991, score:80, genre:'Action-Adventure', img: WK+'0/0e/Metroid_ii_return_of_samus.jpg' },
      { rank:8,  name:'Mega Man V',                  year:1994, score:87, genre:'Platformer',       img: WK+'2/2a/Megaman5box.jpg' },
      { rank:9,  name:'Wario Land',                  year:1994, score:83, genre:'Platformer',       img: WK+'5/5d/Wario_Land_-_Super_Mario_Land_3_Coverart.png' },
      { rank:10, name:'Dragon Warrior Monsters',     year:1998, score:83, genre:'RPG',              img: WK+'8/8c/Dragon_Warrior_Monsters.jpg' }
    ]
  };

  /* ── Active console tab ── */
  var activeConsole = 'nes';

  /* ── Score badge colour ── */
  function sc(s) {
    if (s >= 95) return '#ffd700';
    if (s >= 88) return '#00f5ff';
    if (s >= 75) return '#a8ff78';
    return '#ffb347';
  }

  /* ── Build the placeholder div HTML string ── */
  function placeholderDiv(con) {
    return '<div style="width:110px;height:73px;border-radius:10px;flex-shrink:0;' +
           'background:linear-gradient(135deg,' + con.bg + ',' + con.bg.replace('0.14','0.28') + ');' +
           'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;' +
           'border:1px solid ' + con.color + '44;">' +
           '<span style="font-size:1.5rem;">' + con.label.split(' ')[0] + '</span>' +
           '<span style="font-size:0.5rem;font-weight:700;color:' + con.color + ';' +
           'font-family:var(--font-display);letter-spacing:0.06em;">' +
           con.label.replace(/^[^\s]+\s/,'') + '</span>' +
           '</div>';
  }

  /* ── Single retro card ── */
  function gameCard(g) {
    var con      = CON_MAP[activeConsole];
    var color    = sc(g.score);
    var safeImg  = (g.img || '').replace(/'/g, "\\'");
    var safeName = g.name.replace(/'/g, "\\'");
    var ph       = placeholderDiv(con).replace(/"/g, '&quot;');

    var imgHTML = g.img
      ? '<img src="' + g.img + '" alt="' + g.name + '" loading="lazy" title="Tap to enlarge" ' +
        'onclick="window._cgzLightbox(\'' + safeImg + '\',\'' + safeName + '\')" ' +
        'ontouchend="event.preventDefault();window._cgzLightbox(\'' + safeImg + '\',\'' + safeName + '\')" ' +
        'onerror="this.outerHTML=\'' + ph + '\'" ' +
        'style="width:110px;height:73px;object-fit:cover;border-radius:10px;flex-shrink:0;' +
        'cursor:zoom-in;touch-action:manipulation;-webkit-tap-highlight-color:transparent;' +
        'transition:transform 0.2s,box-shadow 0.2s;" ' +
        'onmouseover="this.style.transform=\'scale(1.08)\';this.style.boxShadow=\'0 4px 20px ' + con.color + '55\'" ' +
        'onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'" />'
      : placeholderDiv(con);

    return '<div style="display:flex;align-items:center;gap:0.85rem;padding:0.75rem 0.9rem;' +
           'background:var(--gradient-card);border:var(--border-glow);border-radius:14px;' +
           'margin-bottom:0.6rem;transition:transform 0.2s;" ' +
           'onmouseover="this.style.transform=\'translateX(4px)\'" ' +
           'onmouseout="this.style.transform=\'\'">' +
             '<div style="font-family:var(--font-display);font-size:1.1rem;font-weight:900;' +
             'color:' + color + ';min-width:24px;text-align:center;opacity:0.8;">' + g.rank + '</div>' +
             imgHTML +
             '<div style="flex:1;min-width:0;">' +
               '<div style="font-weight:700;font-size:0.86rem;white-space:nowrap;overflow:hidden;' +
               'text-overflow:ellipsis;color:var(--text-primary);">' + g.name + '</div>' +
               '<div style="font-size:0.7rem;color:var(--text-secondary);margin-top:2px;">' +
               g.genre + ' · ' + g.year + '</div>' +
             '</div>' +
             '<div style="font-family:var(--font-display);font-size:0.95rem;font-weight:900;' +
             'color:' + color + ';flex-shrink:0;text-align:center;min-width:36px;">' +
               g.score +
               '<div style="font-size:0.5rem;font-weight:400;color:var(--text-secondary);' +
               'letter-spacing:0.05em;">SCORE</div>' +
             '</div>' +
           '</div>';
  }

  /* ── Render the active console's 10 games in 2 columns ── */
  function renderGrid() {
    var list = GAMES[activeConsole] || [];
    var half = Math.ceil(list.length / 2);
    var c1   = list.slice(0, half).map(gameCard).join('');
    var c2   = list.slice(half).map(gameCard).join('');
    GRID.innerHTML =
      '<div style="display:flex;gap:1.5rem;flex-wrap:wrap;align-items:flex-start;">' +
        '<div style="flex:1;min-width:280px;">' + c1 + '</div>' +
        (c2 ? '<div style="flex:1;min-width:280px;">' + c2 + '</div>' : '') +
      '</div>';
  }

  /* ── Console tab bar ── */
  function renderTabs() {
    var html = '';
    CONSOLES.forEach(function(c) {
      var active = c.id === activeConsole;
      html += '<button onclick="window._cgzRetroTab(\'' + c.id + '\')" style="' +
              'padding:0.42rem 0.9rem;border-radius:50px;font-size:0.8rem;font-family:inherit;' +
              'cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;' +
              'transition:all 0.2s;white-space:nowrap;' +
              'border:1px solid ' + (active ? c.color : c.color + '44') + ';' +
              'background:' + (active ? c.color + '22' : 'transparent') + ';' +
              'color:' + (active ? c.color : 'var(--text-secondary)') + ';' +
              'font-weight:' + (active ? '700' : '400') + ';">' +
              c.label + '</button>';
    });
    FILTER_EL.innerHTML = html;
  }

  window._cgzRetroTab = function(id) {
    activeConsole = id;
    renderTabs();
    renderGrid();
  };

  /* ── Init ── */
  function init() { renderTabs(); renderGrid(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
