/* ============================================================
   INVENEW — Main JS
   Dark/light mode toggle, mobile nav, active nav link
   ============================================================ */

(function () {
  'use strict';

  /* ── Theme ── */
  const THEME_KEY = 'invenew-theme';

  function getStoredTheme() {
    return localStorage.getItem(THEME_KEY);
  }

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    updateThemeIcon(theme);
  }

  function updateThemeIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    btn.innerHTML = theme === 'dark' ? iconSun() : iconMoon();
  }

  function iconMoon() {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  }

  function iconSun() {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  }

  /* ── Mobile Nav ── */
  function initMobileNav() {
    const hamburger = document.getElementById('nav-hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    if (!hamburger || !mobileNav) return;

    hamburger.addEventListener('click', function () {
      const open = mobileNav.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open);
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Active nav link ── */
  function setActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(function (a) {
      const href = a.getAttribute('href') || '';
      const hrefFile = href.split('/').pop();
      if (hrefFile === path || (path === '' && hrefFile === 'index.html')) {
        a.classList.add('active');
      }
    });
  }

  /* ── Language switcher ── */
  function initLangSwitcher() {
    const btn = document.getElementById('lang-toggle');
    if (!btn) return;

    const LANGUAGES = [
      { code: 'en', label: 'English',    flag: '🇺🇸' },
      { code: 'fr', label: 'Français',   flag: '🇫🇷' },
      { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
      { code: 'es', label: 'Español',    flag: '🇪🇸' },
      { code: 'ar', label: 'العربية',    flag: '🇸🇦' },
      { code: 'ja', label: '日本語',      flag: '🇯🇵' },
    ];

    // Build dropdown and attach to body so it's never clipped by the nav
    var dropdown = document.createElement('div');
    dropdown.className = 'lang-dropdown';
    dropdown.setAttribute('role', 'menu');
    dropdown.setAttribute('aria-label', 'Select language');

    LANGUAGES.forEach(function (lang) {
      var a = document.createElement('a');
      var base = window.location.href.split('?')[0].split('#')[0];
      if (lang.code === 'en') {
        a.href = base;
        a.className = 'active';
      } else {
        a.href = 'https://translate.google.com/translate?sl=en&tl=' +
                 lang.code + '&u=' + encodeURIComponent(base);
        a.target = '_blank';
        a.rel = 'noopener';
      }
      a.setAttribute('role', 'menuitem');
      a.innerHTML = '<span class="lang-flag">' + lang.flag + '</span>' +
                    '<span>' + lang.label + '</span>';
      dropdown.appendChild(a);
    });

    document.body.appendChild(dropdown);

    function open() {
      var r = btn.getBoundingClientRect();
      dropdown.style.top   = (r.bottom + 6) + 'px';
      dropdown.style.right = (window.innerWidth - r.right) + 'px';
      dropdown.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }

    function close() {
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.classList.contains('open') ? close() : open();
    });

    document.addEventListener('click', function (e) {
      if (!btn.contains(e.target) && !dropdown.contains(e.target)) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    window.addEventListener('resize', function () {
      if (dropdown.classList.contains('open')) open();
    });
  }

  /* ── Newsletter form (inline forms) ── */
  function initNewsletterForms() {
    document.querySelectorAll('.nl-form').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]');
        if (!email || !email.value) return;
        // Redirect to Beehiiv subscribe URL — replace with actual publication URL
        const beehiivUrl = 'https://invenew.beehiiv.com/subscribe?email=' + encodeURIComponent(email.value);
        window.open(beehiivUrl, '_blank');
      });
    });
  }

  /* ── Hero canvas: INVENEW platform visualization ── */
  function initHeroCanvas() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var ctx = canvas.getContext('2d');
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var raf, W, H, tick = 0;

    // Semantic nodes — anchor positions as fractions of canvas size
    var DEFS = [
      // Platform nodes (amber, prominent)
      { abbr:'INT', label:'Intelligence',  cat:'platform',  ax:0.13, ay:0.24 },
      { abbr:'LAB', label:'Labs',          cat:'platform',  ax:0.82, ay:0.26 },
      { abbr:'VNT', label:'Ventures',      cat:'platform',  ax:0.51, ay:0.72 },
      { abbr:'NWS', label:'Newsletter',    cat:'platform',  ax:0.24, ay:0.84 },
      // Tech nodes (slate)
      { abbr:'AI',  label:'AI / ML',       cat:'tech',      ax:0.29, ay:0.13 },
      { abbr:'INF', label:'Infrastructure',cat:'tech',      ax:0.65, ay:0.15 },
      { abbr:'CLD', label:'Cloud',         cat:'tech',      ax:0.79, ay:0.50 },
      { abbr:'COD', label:'Code',          cat:'tech',      ax:0.16, ay:0.57 },
      { abbr:'DAT', label:'Data',          cat:'tech',      ax:0.45, ay:0.38 },
      { abbr:'OPS', label:'DevOps',        cat:'tech',      ax:0.62, ay:0.50 },
      { abbr:'SEC', label:'Security',      cat:'tech',      ax:0.35, ay:0.82 },
      // Community nodes (muted)
      { abbr:'ENT', label:'Enterprise',    cat:'community', ax:0.08, ay:0.44 },
      { abbr:'FND', label:'Founders',      cat:'community', ax:0.89, ay:0.66 },
      { abbr:'COM', label:'Community',     cat:'community', ax:0.70, ay:0.87 },
    ];

    // Edges: [from-index, to-index] — meaningful platform relationships
    var EDGES = [
      [0,1],[0,2],[1,2],          // platform triangle
      [4,0],[4,1],[5,1],[5,0],    // AI, Infra feed Intel & Labs
      [6,1],[6,9],                // Cloud → Labs, DevOps
      [8,0],[8,2],[8,9],          // Data → Intel, Ventures, DevOps
      [7,0],[9,0],                // Code, DevOps → Intel
      [10,0],[10,9],              // Security → Intel, DevOps
      [11,0],[12,2],[13,0],[3,0], // Enterprise, Founders, Community, Newsletter
      [4,8],[5,6],[7,9],          // Tech interconnections
    ];

    var nodes;

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width  = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      nodes = DEFS.map(function (d, i) {
        return { def:d, bx:d.ax*W, by:d.ay*H, phase:i*0.618, x:0, y:0 };
      });
    }

    function palette() {
      var dk = document.documentElement.getAttribute('data-theme') === 'dark';
      return {
        dk:  dk,
        am:  dk ? 'rgba(212,168,64,'  : 'rgba(186,146,55,',
        sl:  dk ? 'rgba(122,154,181,' : 'rgba(82,105,128,',
        mu:  dk ? 'rgba(140,140,140,' : 'rgba(105,105,105,',
        lbl: dk ? 'rgba(190,190,190,' : 'rgba(75,75,75,',
      };
    }

    // One pulse per edge, staggered start positions
    var pulses = EDGES.map(function (e, i) {
      return { ei:i, t:(i/EDGES.length), spd:0.0013 + (i % 5) * 0.00015 };
    });

    function draw() {
      tick += 0.016;
      ctx.clearRect(0, 0, W, H);
      var c = palette();

      // Update node positions — gentle sine-wave bobbing
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x = n.bx + Math.cos(tick * 0.28 + n.phase * 1.3) * 3.5;
        n.y = n.by + Math.sin(tick * 0.38 + n.phase)       * 5.0;
      }

      // Draw edges
      ctx.lineWidth = 0.6;
      for (var i = 0; i < EDGES.length; i++) {
        var a = nodes[EDGES[i][0]], b = nodes[EDGES[i][1]];
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = c.sl + (c.dk ? '0.13)' : '0.11)');
        ctx.stroke();
      }

      // Draw amber pulse dots travelling along edges
      for (var i = 0; i < pulses.length; i++) {
        var p = pulses[i];
        p.t = (p.t + p.spd) % 1;
        var a = nodes[EDGES[p.ei][0]], b = nodes[EDGES[p.ei][1]];
        for (var tr = 0; tr < 4; tr++) {
          var tp = p.t - tr * 0.045;
          if (tp < 0) tp += 1;
          var px = a.x + (b.x - a.x) * tp;
          var py = a.y + (b.y - a.y) * tp;
          var alpha = (1 - tr * 0.22) * (c.dk ? 0.62 : 0.55);
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.1, 1.4 - tr * 0.28), 0, Math.PI * 2);
          ctx.fillStyle = c.am + alpha + ')';
          ctx.fill();
        }
      }

      // Draw nodes
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var d = n.def;
        var isPlat = d.cat === 'platform';
        var isTech = d.cat === 'tech';
        var r   = isPlat ? 16 : (isTech ? 11 : 9);
        var col = isPlat ? c.am : (isTech ? c.sl : c.mu);

        // Soft radial glow behind platform nodes
        if (isPlat) {
          var gr = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2.8);
          gr.addColorStop(0, c.am + (c.dk ? '0.14)' : '0.11)'));
          gr.addColorStop(1, c.am + '0)');
          ctx.beginPath();
          ctx.arc(n.x, n.y, r * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = gr;
          ctx.fill();
        }

        // Node body
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle   = col + (isPlat ? (c.dk?'0.18)':'0.13)') : (c.dk?'0.11)':'0.08)'));
        ctx.fill();
        ctx.lineWidth   = isPlat ? 1.0 : 0.7;
        ctx.strokeStyle = col + (isPlat ? (c.dk?'0.60)':'0.52)') : (c.dk?'0.35)':'0.28)'));
        ctx.stroke();

        // Abbreviation label inside node
        ctx.font         = (isPlat?'600 ':'500 ') + (isPlat?'7.5':'6.5') + 'px -apple-system,BlinkMacSystemFont,sans-serif';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle    = col + (isPlat ? (c.dk?'0.85)':'0.75)') : (c.dk?'0.65)':'0.55)'));
        ctx.fillText(d.abbr, n.x, n.y);

        // Node name below
        ctx.font         = '9px -apple-system,BlinkMacSystemFont,sans-serif';
        ctx.textBaseline = 'top';
        ctx.fillStyle    = c.lbl + (isPlat ? (c.dk?'0.68)':'0.58)') : (c.dk?'0.42)':'0.34)'));
        ctx.fillText(d.label, n.x, n.y + r + 3);
      }

      raf = requestAnimationFrame(draw);
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { ctx.setTransform(1,0,0,1,0,0); resize(); draw(); }, 120);
    });

    resize();
    draw();
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function () {
    // Re-apply theme to sync the icon (nav is now in HTML so the button exists)
    const stored = getStoredTheme();
    applyTheme(stored || getSystemTheme());

    // Enable CSS transitions now that the page has loaded.
    // This prevents transition animations from firing on page load
    // (which would cause a dark→light flash) while still allowing
    // smooth transitions when the user clicks the theme toggle.
    document.documentElement.classList.add('theme-ready');

    // Use event delegation so the click works regardless of when the
    // button is injected into the DOM by components.js
    document.addEventListener('click', function (e) {
      if (e.target.closest('#theme-toggle')) {
        const current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
      }
    });

    initHeroCanvas();
    initMobileNav();
    setActiveNav();
    initNewsletterForms();
    initLangSwitcher();
  });

  // Expose updateThemeIcon so components.js can sync the icon after nav injection
  window.__invenew = window.__invenew || {};
  window.__invenew.updateThemeIcon = updateThemeIcon;

  // The nav is now baked into HTML so #theme-toggle exists as soon as
  // this deferred script runs.  Update the icon immediately — before
  // DOMContentLoaded — so dark-mode users never see the wrong icon.
  (function () {
    const stored = getStoredTheme();
    const theme = stored || getSystemTheme();
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
  })();

})();
