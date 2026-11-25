(function () {
  // Resolve content.json path correctly on GitHub Pages (/cgz-service-center/) and locally
  var CONTENT_URL = (function() {
    var h = location.hostname;
    if (h === 'casualgamerz-bn.github.io') return '/cgz-service-center/content.json';
    // Local: detect if we're in a pages/ subdirectory
    return location.pathname.indexOf('/pages/') !== -1 ? '../content.json' : 'content.json';
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

  /* ── master apply ── */
  function apply(content) {
    applyText(content);
    renderServiceCards(content);
    renderHomeServiceCards(content);
    renderHomeReviewCards(content);
    renderAboutValuesCards(content);
    renderAboutTeamCards(content);
    renderAboutReviewCards(content);
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
