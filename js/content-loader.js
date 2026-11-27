(function () {
  // Resolve content.json path correctly on GitHub Pages (/cgz-service-center/) and locally
  var CONTENT_URL = (function() {
    var h = location.hostname;
    var base = h === 'casualgamerz-bn.github.io'
      ? '/cgz-service-center/content.json'
      : (location.pathname.indexOf('/pages/') !== -1 ? '../content.json' : 'content.json');
    // Cache-bust so browsers always fetch the latest version after an admin save
    return base + '?v=' + Date.now();
  })();
  var FALLBACK_URL = 'https://raw.githubusercontent.com/casualgamerz-bn/cgz-service-center/main/content.json';

  var SECTION_COLORS = { pc:'cyan', laptop:'pink', console:'green', sw:'orange', peri:'purple' };

  function get(obj, path) {
    return path.split('.').reduce(function(o,k){ return o!=null?o[k]:undefined; }, obj);
  }

  /* ── data-cid text injection ── */
  function applyText(content) {
    document.querySelectorAll('[data-cid]').forEach(function(el) {
      var val = get(content, el.getAttribute('data-cid'));
      if (val !== undefined && val !== null) el.innerHTML = val;
    });
    document.querySelectorAll('[data-cid-href]').forEach(function(el) {
      var val = get(content, el.getAttribute('data-cid-href'));
      if (val !== undefined && val !== null) el.href = val;
    });
  }

  /* ── SERVICES PAGE — dynamic repair-category cards ── */
  function renderServiceCards(content) {
    var svc = content.services;
    if (!svc) return;
    ['pc','laptop','console','sw','peri'].forEach(function(key) {
      var grid  = document.getElementById('grid-' + key);
      if (!grid) return;
      var cards = svc[key + '_cards'];
      if (!Array.isArray(cards)) return;
      var color = SECTION_COLORS[key] || 'cyan';
      var html  = '';
      cards.forEach(function(card) {
        if (!card.visible) return;
        html += '<a href="repair.html" class="service-card">' +
                  '<div class="service-icon-wrap ' + color + '">' + (card.icon||'🔧') + '</div>' +
                  '<h3>' + (card.title||'') + '</h3>' +
                  '<p>'  + (card.desc ||'') + '</p>' +
                  '<span class="service-link">Book This Service →</span>' +
                '</a>';
      });
      grid.innerHTML = html;
      // Hide the entire section (header + grid) when no cards are visible
      var section = grid.closest('section');
      if (section) section.style.display = html === '' ? 'none' : '';
    });
  }

  /* ── HOMEPAGE — service overview cards ── */
  function renderHomeServiceCards(content) {
    var grid = document.getElementById('grid-home-services');
    if (!grid) return;
    var cards = get(content, 'home.service_cards');
    if (!Array.isArray(cards)) return;
    var html = '';
    cards.forEach(function(card) {
      if (!card.visible) return;
      var tagsHtml = '';
      if (Array.isArray(card.tags)) {
        card.tags.forEach(function(t){ tagsHtml += '<span class="tag">' + t + '</span>'; });
      }
      var link = card.link || 'pages/services.html';
      // links on the homepage are relative from root; on other pages they'd need ../
      html += '<a href="' + link + '" class="service-card">' +
                '<div class="service-icon-wrap ' + (card.color||'cyan') + '">' + (card.icon||'🔧') + '</div>' +
                '<h3>' + (card.title||'') + '</h3>' +
                '<p>'  + (card.desc ||'') + '</p>' +
                (tagsHtml ? '<div class="service-tags">' + tagsHtml + '</div>' : '') +
                '<span class="service-link">Learn More →</span>' +
              '</a>';
    });
    grid.innerHTML = html;
  }

  /* ── HOMEPAGE — testimonial / review cards ── */
  function renderHomeReviewCards(content) {
    var grid = document.getElementById('grid-home-reviews');
    if (!grid) return;
    var cards = get(content, 'home.review_cards');
    if (!Array.isArray(cards)) return;
    var html = '';
    cards.forEach(function(card) {
      if (!card.visible) return;
      html += '<div class="testimonial-card">' +
                '<div class="stars">★★★★★</div>' +
                '<blockquote>"' + (card.text||'') + '"</blockquote>' +
                '<div class="testimonial-author">' +
                  '<div class="author-avatar">' + (card.initials||'?') + '</div>' +
                  '<div>' +
                    '<div class="author-name">' + (card.name||'') + '</div>' +
                    '<div class="author-role">' + (card.role||'') + '</div>' +
                  '</div>' +
                '</div>' +
              '</div>';
    });
    grid.innerHTML = html;
  }

  /* ── ABOUT — values cards ── */
  function renderAboutValuesCards(content) {
    var grid = document.getElementById('grid-about-values');
    if (!grid) return;
    var cards = get(content, 'about.values_cards');
    if (!Array.isArray(cards)) return;
    var html = '';
    cards.forEach(function(card) {
      if (!card.visible) return;
      html += '<div class="service-card" style="cursor:default;">' +
                '<div class="service-icon-wrap ' + (card.color||'cyan') + '">' + (card.icon||'⭐') + '</div>' +
                '<h3>' + (card.title||'') + '</h3>' +
                '<p>'  + (card.desc ||'') + '</p>' +
              '</div>';
    });
    grid.innerHTML = html;
  }

  /* ── ABOUT — team member cards ── */
  function renderAboutTeamCards(content) {
    var grid = document.getElementById('grid-about-team');
    if (!grid) return;
    var cards = get(content, 'about.team_cards');
    if (!Array.isArray(cards)) return;
    var html = '';
    cards.forEach(function(card) {
      if (!card.visible) return;
      var gradient = card.gradient || '135deg,#00f5ff,#ff0080';
      html += '<div class="testimonial-card" style="text-align:center;">' +
                '<div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(' + gradient + ');display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:1.5rem;font-weight:900;color:var(--dark-bg);margin:0 auto 1rem;">' + (card.initials||'CG') + '</div>' +
                '<h3 style="font-size:1rem;margin-bottom:0.25rem;">' + (card.name||'') + '</h3>' +
                '<p style="color:var(--neon-cyan);font-size:0.8rem;font-family:var(--font-display);letter-spacing:0.05em;margin-bottom:0.75rem;">' + (card.role||'') + '</p>' +
                '<p style="font-size:0.85rem;color:var(--text-secondary);">' + (card.bio||'') + '</p>' +
              '</div>';
    });
    grid.innerHTML = html;
  }

  /* ── ABOUT — customer review cards ── */
  function renderAboutReviewCards(content) {
    var grid = document.getElementById('grid-about-reviews');
    if (!grid) return;
    var cards = get(content, 'about.review_cards');
    if (!Array.isArray(cards)) return;
    var html = '';
    cards.forEach(function(card) {
      if (!card.visible) return;
      html += '<div class="testimonial-card">' +
                '<div class="stars">★★★★★</div>' +
                '<blockquote>"' + (card.text||'') + '"</blockquote>' +
                '<div class="testimonial-author">' +
                  '<div class="author-avatar">' + (card.initials||'?') + '</div>' +
                  '<div>' +
                    '<div class="author-name">' + (card.name||'') + '</div>' +
                    '<div class="author-role">' + (card.role||'') + '</div>' +
                  '</div>' +
                '</div>' +
              '</div>';
    });
    grid.innerHTML = html;
  }

  /* ── SERVICES — static section show/hide ── */
  function applyServicesSectionVisibility(content) {
    var vis = get(content, 'services.section_visibility');
    if (!vis) return;
    var map = {
      custom_build: 'custom-build'
    };
    Object.keys(map).forEach(function(key) {
      var el = document.getElementById(map[key]);
      if (!el) return;
      var show = vis[key] !== false;
      el.style.display = show ? '' : 'none';
    });
  }

  /* ── HOME — static section show/hide ── */
  function applyHomeSectionVisibility(content) {
    var vis = get(content, 'home.section_visibility');
    if (!vis) return;
    var map = {
      consoles_gallery: 'consoles-gallery',
      creative_apps:    'creative-apps',
      brands_logos:     'brands-logos',
      home_reviews:     'home-reviews',
      pc_games:         'pc-games'
    };
    Object.keys(map).forEach(function(key) {
      var el = document.getElementById(map[key]);
      if (!el) return;
      var show = vis[key] !== false; // default visible if key missing
      el.style.display = show ? '' : 'none';
    });
  }

  /* ── CUSTOM SECTIONS — slot-based rendering across all pages ── */
  function renderCustomSections(content) {
    var sections = content.custom_sections;
    if (!Array.isArray(sections)) return;

    // Backward compat: migrate old page→slot if needed
    var pageBottomMap = { home:'home-bottom', services:'services-bottom', about:'about-after-reviews', contact:'contact-bottom', repair:'repair-bottom' };
    sections.forEach(function(s) {
      if (!s.slot && s.page) { s.slot = pageBottomMap[s.page] || (s.page + '-bottom'); }
    });

    // Find every slot container on this page and fill it
    var slotEls = document.querySelectorAll('[id^="cgz-slot-"]');
    slotEls.forEach(function(container) {
      var slotId = container.id.replace('cgz-slot-', '');
      var html = '';
      sections.forEach(function(section) {
        if (!section.visible) return;
        if (section.slot !== slotId) return;
        var items = section.items || [];
        var hasCards = items.some(function(i) { return i.type === 'card' && i.visible !== false; });

        html += '<section class="section"><div class="container">';
        if (section.title) {
          html += '<div class="section-header">';
          html += '<h2 class="section-title">' + section.title + '</h2>';
          if (section.subtitle) {
            html += '<p style="color:var(--text-secondary);max-width:600px;margin:0.5rem auto 0;">' + section.subtitle + '</p>';
          }
          html += '<div class="glow-divider"></div></div>';
        }
        // Render text and images in order, grouping consecutive images side-by-side
        var idx = 0;
        while (idx < items.length) {
          var it = items[idx];
          if (it.type === 'text') {
            html += '<div style="max-width:720px;margin:0 auto 2rem;line-height:1.8;color:var(--text-secondary);text-align:center;">' + (it.content || '') + '</div>';
            idx++;
          } else if (it.type === 'image') {
            // Collect consecutive image items
            var imgs = [];
            while (idx < items.length && items[idx].type === 'image') { imgs.push(items[idx]); idx++; }
            function imgStyle(img, fullWidth) {
              var base = fullWidth ? 'width:100%;' : 'max-width:100%;';
              var round = 'border-radius:16px;';
              if (img.boxed) return base + round + 'border:var(--border-glow);box-shadow:var(--shadow-cyan);';
              return base + round;
            }
            if (imgs.length === 1) {
              html += '<div style="text-align:center;margin:2rem auto;max-width:680px;">';
              html += '<img src="' + (imgs[0].url || '') + '" alt="' + (imgs[0].alt || '') + '" style="' + imgStyle(imgs[0], false) + '" />';
              if (imgs[0].caption) html += '<p style="color:var(--text-secondary);font-size:0.85rem;margin-top:0.75rem;">' + imgs[0].caption + '</p>';
              html += '</div>';
            } else {
              html += '<div style="display:flex;gap:1.25rem;justify-content:center;flex-wrap:wrap;margin:2rem auto;">';
              imgs.forEach(function(img) {
                html += '<div style="flex:1;min-width:200px;max-width:420px;text-align:center;">';
                html += '<img src="' + (img.url || '') + '" alt="' + (img.alt || '') + '" style="' + imgStyle(img, true) + '" />';
                if (img.caption) html += '<p style="color:var(--text-secondary);font-size:0.85rem;margin-top:0.75rem;">' + img.caption + '</p>';
                html += '</div>';
              });
              html += '</div>';
            }
          } else {
            idx++; // skip card items here — rendered below
          }
        }
        if (hasCards) {
          html += '<div class="services-grid">';
          items.forEach(function(item) {
            if (item.type !== 'card' || item.visible === false) return;
            html += '<div class="service-card" style="cursor:default;">';
            html += '<div class="service-icon-wrap ' + (item.color || 'cyan') + '">' + (item.icon || '📌') + '</div>';
            html += '<h3>' + (item.title || '') + '</h3>';
            html += '<p>' + (item.desc || '') + '</p>';
            html += '</div>';
          });
          html += '</div>';
        }
        html += '</div></section>';
      });
      container.innerHTML = html;
    });
  }

  /* ── master apply ── */
  function apply(content) {
    window.cgzContent = content; // expose for other scripts (e.g. top-games.js)
    applyText(content);
    applyHomeSectionVisibility(content);
    applyServicesSectionVisibility(content);
    renderServiceCards(content);
    renderHomeServiceCards(content);
    renderHomeReviewCards(content);
    renderAboutValuesCards(content);
    renderAboutTeamCards(content);
    renderAboutReviewCards(content);
    renderCustomSections(content);
  }

  function load(url) {
    return fetch(url).then(function(r) {
      if (!r.ok) throw new Error('fetch failed');
      return r.json();
    });
  }

  load(CONTENT_URL)
    .catch(function() { return load(FALLBACK_URL); })
    .then(apply)
    .catch(function() {});
})();
