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

  /* ── AI Stack canvas animation ── */
  function initAIStackCanvas() {
    var canvas = document.getElementById('ai-stack-canvas');
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var ctx = canvas.getContext('2d');
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var raf, W, H, tick = 0;

    // Five nodes mirroring the AI tech stack diagram layout
    var NODES = [
      { id:'ml',    icon:'neuralnet', cx:0.22, cy:0.26, cat:'amber' },  // Machine Learning
      { id:'dl',    icon:'layers',    cx:0.76, cy:0.26, cat:'amber' },  // Deep Learning
      { id:'data',  icon:'grid',      cx:0.24, cy:0.68, cat:'slate' },  // Data & Algorithms
      { id:'model', icon:'cube',      cx:0.76, cy:0.68, cat:'slate' },  // Modeling
      { id:'infra', icon:'server',    cx:0.50, cy:0.87, cat:'muted' },  // Infrastructure
    ];

    // Connections following the diagram's arrows
    var EDGES = [
      [0,1],[0,2],[1,3],[2,3],[2,4],[3,4],[0,3],[1,2]
    ];

    // 4 satellite dots orbiting each node
    var SATS = NODES.map(function(n, ni) {
      return [0,1,2,3].map(function(j) {
        return {
          angle: (j / 4) * Math.PI * 2 + ni * 0.77,
          orbitR: 40 + j * 6,
          speed: (j % 2 === 0 ? 1 : -1) * (0.007 + j * 0.002)
        };
      });
    });

    var pulses = EDGES.map(function(e, i) {
      return { ei:i, t:(i/EDGES.length), spd:0.0035 + i * 0.0004 };
    });

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      W = rect.width;
      H = W * 0.72; // ~4:3.5 feels balanced in the hero
      canvas.width  = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function pal() {
      var dk = document.documentElement.getAttribute('data-theme') === 'dark';
      return {
        dk: dk,
        am: dk ? [212,168,64]  : [175,134,42],
        sl: dk ? [122,154,181] : [72,96,118],
        mu: dk ? [140,140,140] : [96,96,96],
      };
    }
    function rc(arr, a) { return 'rgba('+arr[0]+','+arr[1]+','+arr[2]+','+a+')'; }
    function col(cat, c) { return cat==='amber' ? c.am : cat==='slate' ? c.sl : c.mu; }

    /* ── Icon drawing ── */
    function drawIcon(cx, cy, id, r, color, alpha) {
      var s = r * 0.52;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (id === 'neuralnet') {
        // 3-layer neural net  (3→2→1)
        var lx = [-s*0.68, 0, s*0.68];
        var ly = [[-s*0.42, 0, s*0.42], [-s*0.24, s*0.24], [0]];
        // connections
        for (var li = 0; li < 2; li++) {
          for (var ni = 0; ni < ly[li].length; ni++) {
            for (var nj = 0; nj < ly[li+1].length; nj++) {
              ctx.beginPath();
              ctx.moveTo(lx[li], ly[li][ni]);
              ctx.lineTo(lx[li+1], ly[li+1][nj]);
              ctx.strokeStyle = rc(color, alpha * 0.35);
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }
        // nodes
        for (var li = 0; li < lx.length; li++) {
          for (var ni = 0; ni < ly[li].length; ni++) {
            ctx.beginPath();
            ctx.arc(lx[li], ly[li][ni], s * 0.14, 0, Math.PI*2);
            ctx.fillStyle = rc(color, alpha * 0.90);
            ctx.fill();
          }
        }

      } else if (id === 'layers') {
        // Stacked layer bars (deep learning)
        var bars = 3, bh = s*0.30, gap = s*0.40;
        for (var bi = 0; bi < bars; bi++) {
          var by  = (bi - 1) * gap;
          var bw  = s * (1.4 - bi * 0.20);
          var dots = bars - bi;
          ctx.beginPath();
          ctx.rect(-bw, by - bh/2, bw*2, bh);
          ctx.fillStyle = rc(color, alpha * (0.10 + bi * 0.04));
          ctx.fill();
          ctx.strokeStyle = rc(color, alpha * (0.58 - bi * 0.10));
          ctx.lineWidth = 0.8;
          ctx.stroke();
          // dots inside bar
          for (var di = 0; di < dots; di++) {
            var dx = ((di / (dots-1||1)) - 0.5) * bw * 1.1;
            ctx.beginPath();
            ctx.arc(dx, by, s*0.09, 0, Math.PI*2);
            ctx.fillStyle = rc(color, alpha * 0.85);
            ctx.fill();
          }
        }

      } else if (id === 'grid') {
        // 4×3 data grid
        for (var gRow = 0; gRow < 3; gRow++) {
          for (var gCol = 0; gCol < 4; gCol++) {
            var gx = (gCol - 1.5) * s * 0.55;
            var gy = (gRow - 1)   * s * 0.55;
            var hi = (gRow===1 && gCol>=2);
            ctx.beginPath();
            ctx.arc(gx, gy, s * 0.11, 0, Math.PI*2);
            ctx.fillStyle = rc(color, alpha * (hi ? 0.92 : 0.38));
            ctx.fill();
          }
        }
        // faint grid lines
        for (var gr = 0; gr < 3; gr++) {
          ctx.beginPath();
          ctx.moveTo(-s*1.0, (gr-1)*s*0.55);
          ctx.lineTo( s*1.0, (gr-1)*s*0.55);
          ctx.strokeStyle = rc(color, alpha * 0.16);
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

      } else if (id === 'cube') {
        // Isometric cube (hexagon split into 3 rhombi)
        var cw = s*0.58, ch = cw*0.50;
        var P = {
          t:  {x:0,   y:-ch*2}, tr:{x:cw, y:-ch},
          br: {x:cw,  y:ch},    b: {x:0,  y:ch*2},
          bl: {x:-cw, y:ch},    tl:{x:-cw, y:-ch},
          c:  {x:0,   y:0}
        };
        // top face
        ctx.beginPath(); ctx.moveTo(P.t.x,P.t.y); ctx.lineTo(P.tr.x,P.tr.y);
        ctx.lineTo(P.c.x,P.c.y); ctx.lineTo(P.tl.x,P.tl.y); ctx.closePath();
        ctx.fillStyle = rc(color, alpha*0.18); ctx.fill();
        ctx.strokeStyle = rc(color, alpha*0.65); ctx.lineWidth = 0.9; ctx.stroke();
        // right face
        ctx.beginPath(); ctx.moveTo(P.tr.x,P.tr.y); ctx.lineTo(P.br.x,P.br.y);
        ctx.lineTo(P.b.x,P.b.y); ctx.lineTo(P.c.x,P.c.y); ctx.closePath();
        ctx.fillStyle = rc(color, alpha*0.10); ctx.fill();
        ctx.strokeStyle = rc(color, alpha*0.52); ctx.lineWidth = 0.9; ctx.stroke();
        // left face
        ctx.beginPath(); ctx.moveTo(P.tl.x,P.tl.y); ctx.lineTo(P.c.x,P.c.y);
        ctx.lineTo(P.b.x,P.b.y); ctx.lineTo(P.bl.x,P.bl.y); ctx.closePath();
        ctx.fillStyle = rc(color, alpha*0.13); ctx.fill();
        ctx.strokeStyle = rc(color, alpha*0.58); ctx.lineWidth = 0.9; ctx.stroke();

      } else if (id === 'server') {
        // 3-unit server rack
        var sw = s*1.30, sh = s*0.28, sg = s*0.40;
        for (var si = 0; si < 3; si++) {
          var sy = (si-1)*sg;
          ctx.beginPath();
          ctx.rect(-sw/2, sy-sh/2, sw, sh);
          ctx.fillStyle   = rc(color, alpha*0.09);
          ctx.fill();
          ctx.strokeStyle = rc(color, alpha*0.55);
          ctx.lineWidth   = 0.8;
          ctx.stroke();
          // LED
          ctx.beginPath();
          ctx.arc(sw/2 - s*0.18, sy, s*0.09, 0, Math.PI*2);
          ctx.fillStyle = rc(color, alpha*(si===1 ? 0.95 : 0.38));
          ctx.fill();
          // detail line
          ctx.beginPath();
          ctx.moveTo(-sw/2 + s*0.16, sy);
          ctx.lineTo( sw/2 - s*0.38, sy);
          ctx.strokeStyle = rc(color, alpha*0.22);
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    function draw() {
      tick += 0.016;
      ctx.clearRect(0, 0, W, H);
      var c = pal();

      // Compute bobbing node positions
      var pos = NODES.map(function(n, i) {
        return {
          x: n.cx*W + Math.cos(tick*0.22 + i*1.2) * 2.8,
          y: n.cy*H + Math.sin(tick*0.28 + i*0.9) * 3.5,
          color: col(n.cat, c),
          n: n
        };
      });

      // Edges
      ctx.lineWidth = 0.7;
      EDGES.forEach(function(e) {
        var a = pos[e[0]], b = pos[e[1]];
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = rc(c.sl, c.dk ? 0.16 : 0.11);
        ctx.stroke();
      });

      // Pulse dots along edges
      pulses.forEach(function(p) {
        p.t = (p.t + p.spd) % 1;
        var a = pos[EDGES[p.ei][0]], b = pos[EDGES[p.ei][1]];
        for (var tr = 0; tr < 4; tr++) {
          var tp = p.t - tr * 0.055;
          if (tp < 0) tp += 1;
          ctx.beginPath();
          ctx.arc(a.x+(b.x-a.x)*tp, a.y+(b.y-a.y)*tp,
                  Math.max(0.1, 1.9 - tr*0.38), 0, Math.PI*2);
          ctx.fillStyle = rc(c.am, (1-tr*0.22)*(c.dk?0.70:0.58));
          ctx.fill();
        }
      });

      // Satellite dots
      pos.forEach(function(np, i) {
        SATS[i].forEach(function(sat) {
          sat.angle += sat.speed;
          var sx = np.x + Math.cos(sat.angle) * sat.orbitR;
          var sy = np.y + Math.sin(sat.angle) * sat.orbitR;
          var glow = 0.5 + 0.5 * Math.sin(tick*2.2 + sat.angle);
          ctx.beginPath();
          ctx.arc(sx, sy, 2.0 + glow*0.4, 0, Math.PI*2);
          ctx.fillStyle = rc(np.color, (c.dk?0.38:0.28) + glow*0.12);
          ctx.fill();
        });
      });

      // Main nodes
      pos.forEach(function(np, i) {
        var pulse = 0.5 + 0.5*Math.sin(tick*0.75 + i*1.4);
        var r = 30 + pulse*2.5;

        // Outer glow
        var grd = ctx.createRadialGradient(np.x, np.y, 0, np.x, np.y, r*2.4);
        grd.addColorStop(0, rc(np.color, (c.dk?0.16:0.11) + pulse*0.06));
        grd.addColorStop(1, rc(np.color, 0));
        ctx.beginPath();
        ctx.arc(np.x, np.y, r*2.4, 0, Math.PI*2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Circle fill + stroke
        ctx.beginPath();
        ctx.arc(np.x, np.y, r, 0, Math.PI*2);
        ctx.fillStyle   = rc(np.color, c.dk ? 0.13 : 0.09);
        ctx.fill();
        ctx.lineWidth   = 1.2;
        ctx.strokeStyle = rc(np.color, (c.dk?0.58:0.44) + pulse*0.14);
        ctx.stroke();

        // Icon
        drawIcon(np.x, np.y, np.n.icon, r, np.color, c.dk ? 0.85 : 0.72);
      });

      raf = requestAnimationFrame(draw);
    }

    var resizeTimer;
    window.addEventListener('resize', function() {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        ctx.setTransform(1,0,0,1,0,0);
        resize();
        draw();
      }, 120);
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

    initAIStackCanvas();
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
