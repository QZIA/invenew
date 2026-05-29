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

    // Seven nodes — six circles + one center hexagon
    var NODES = [
      { id:'cloud',   icon:'cloudsvr',      cx:0.50, cy:0.14, cat:'b1'                         }, // top-center
      { id:'desk',    icon:'desklaptop',    cx:0.22, cy:0.33, cat:'b2'                         }, // top-left
      { id:'mobile',  icon:'mobiletab',     cx:0.78, cy:0.33, cat:'b3'                         }, // top-right
      { id:'data',    icon:'grid',          cx:0.22, cy:0.67, cat:'b4'                         }, // bottom-left
      { id:'model',   icon:'cube',          cx:0.78, cy:0.67, cat:'blu'                        }, // bottom-right
      { id:'infra',   icon:'server2',       cx:0.50, cy:0.86, cat:'b6'                         }, // bottom-center
      { id:'people',  icon:'sittingpeople', cx:0.50, cy:0.50, cat:'blu', hex:true, scale:1.75  }, // center hex
    ];

    // Edges — original diamond + center spokes
    var EDGES = [
      [0,1],[0,2],           // top-center to top-left, top-right
      [1,2],[1,3],[2,4],     // top row cross
      [1,4],[2,3],           // long diagonals
      [3,4],[3,5],[4,5],     // bottom row
      [0,3],[0,4],           // top-center to bottom
      [6,0],[6,1],[6,2],[6,3],[6,4],[6,5]  // center hex to all
    ];

    // 4 satellite dots orbiting each node
    var SATS = NODES.map(function(n, ni) {
      return [0,1,2,3].map(function(j) {
        return {
          angle: (j/4)*Math.PI*2 + ni*0.77,
          orbitR: 40 + j*6,
          speed: (j%2===0 ? 1 : -1) * (0.007 + j*0.002)
        };
      });
    });

    var pulses = EDGES.map(function(e, i) {
      return { ei:i, t:(i/EDGES.length), spd:0.0035 + i*0.0004 };
    });

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      W = rect.width;
      H = W * 0.80;
      canvas.width  = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function pal() {
      var dk = document.documentElement.getAttribute('data-theme') === 'dark';
      return {
        dk:  dk,
        // Beige/brown family — 6 shades, all with enough contrast
        b1:  dk ? [185,165,138] : [155,132,105],
        b2:  dk ? [175,152,124] : [148,122,94],
        b3:  dk ? [165,140,112] : [140,112,84],
        b4:  dk ? [155,128,100] : [132,104,76],
        b5:  dk ? [145,118,90]  : [122,95,68],
        b6:  dk ? [135,108,80]  : [112,86,60],
        // Brand blue (--color-slate)
        blu: dk ? [122,154,181] : [95,118,140],
        // Sunlight for INVENEW Intelligence beam
        sun: [255,210,55],
      };
    }
    function rc(arr, a) { return 'rgba('+arr[0]+','+arr[1]+','+arr[2]+','+a+')'; }
    function col(cat, c) { return c[cat] || c.b3; }

    // Flat-top hexagon path
    function hexPath(cx, cy, r) {
      ctx.beginPath();
      for (var i = 0; i < 6; i++) {
        var ang = Math.PI/6 + i*Math.PI/3;
        var x = cx + r*Math.cos(ang), y = cy + r*Math.sin(ang);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
    }

    /* ── Icon drawing ── */
    function drawIcon(cx, cy, id, r, color, alpha) {
      var s = r * 0.52;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (id === 'cloudsvr') {
        // Cloud outline with 2-unit server rack inside
        var cw = s*1.20, ch = s*0.50, cy0 = -s*0.14;
        ctx.beginPath();
        ctx.arc(-cw*0.28, cy0,         ch*0.68, Math.PI,      Math.PI*1.92);
        ctx.arc( cw*0.18, cy0-ch*0.22, ch*0.84, Math.PI*1.18, Math.PI*1.98);
        ctx.arc( cw*0.52, cy0+ch*0.08, ch*0.52, Math.PI*1.62, Math.PI*0.38);
        ctx.arc( cw*0.00, cy0+ch*0.55, ch*0.45, 0,            Math.PI);
        ctx.closePath();
        ctx.fillStyle   = rc(color, alpha*0.10);
        ctx.fill();
        ctx.strokeStyle = rc(color, alpha*0.70);
        ctx.lineWidth   = 0.9;
        ctx.stroke();
        // server rack inside cloud
        var sw = s*0.80, sh = s*0.18, sg = s*0.30, soy = s*0.18;
        for (var si = 0; si < 3; si++) {
          var sy = soy + (si-1)*sg;
          ctx.beginPath();
          ctx.rect(-sw/2, sy-sh/2, sw, sh);
          ctx.fillStyle   = rc(color, alpha*0.10);
          ctx.fill();
          ctx.strokeStyle = rc(color, alpha*0.62);
          ctx.lineWidth   = 0.75;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(sw/2 - s*0.12, sy, s*0.07, 0, Math.PI*2);
          ctx.fillStyle = rc(color, alpha*(si===1 ? 0.95 : 0.40));
          ctx.fill();
        }

      } else if (id === 'desklaptop') {
        // Desktop monitor (left) + laptop (right)
        var mw = s*0.82, mh = s*0.58, mox = -s*0.50, moy = -s*0.18;
        // monitor screen
        ctx.beginPath();
        ctx.rect(mox-mw/2, moy-mh/2, mw, mh);
        ctx.fillStyle   = rc(color, alpha*0.09);
        ctx.fill();
        ctx.strokeStyle = rc(color, alpha*0.62);
        ctx.lineWidth   = 0.8;
        ctx.stroke();
        // inner screen
        ctx.beginPath();
        ctx.rect(mox-mw/2+s*0.06, moy-mh/2+s*0.06, mw-s*0.12, mh-s*0.18);
        ctx.fillStyle = rc(color, alpha*0.14);
        ctx.fill();
        // stand
        ctx.beginPath();
        ctx.moveTo(mox, moy+mh/2); ctx.lineTo(mox, moy+mh/2+s*0.18);
        ctx.moveTo(mox-s*0.18, moy+mh/2+s*0.18); ctx.lineTo(mox+s*0.18, moy+mh/2+s*0.18);
        ctx.strokeStyle = rc(color, alpha*0.55); ctx.lineWidth = 0.75; ctx.stroke();
        // laptop screen (right)
        var lw = s*0.72, lh = s*0.48, lox = s*0.50, loy2 = -s*0.22;
        ctx.beginPath();
        ctx.rect(lox-lw/2, loy2-lh, lw, lh);
        ctx.fillStyle   = rc(color, alpha*0.09);
        ctx.fill();
        ctx.strokeStyle = rc(color, alpha*0.62);
        ctx.lineWidth   = 0.8;
        ctx.stroke();
        // laptop base
        ctx.beginPath();
        ctx.rect(lox-lw/2-s*0.06, loy2, lw+s*0.12, s*0.11);
        ctx.fillStyle   = rc(color, alpha*0.12);
        ctx.fill();
        ctx.strokeStyle = rc(color, alpha*0.55);
        ctx.lineWidth   = 0.75;
        ctx.stroke();

      } else if (id === 'mobiletab') {
        // Mobile phone (left) + tablet (right)
        var pw = s*0.34, ph = s*0.60, pr = s*0.05, pox = -s*0.44, poy = -s*0.28;
        ctx.beginPath();
        ctx.roundRect(pox-pw/2, poy, pw, ph, pr);
        ctx.fillStyle   = rc(color, alpha*0.09);
        ctx.fill();
        ctx.strokeStyle = rc(color, alpha*0.65);
        ctx.lineWidth   = 0.8;
        ctx.stroke();
        // phone screen
        ctx.beginPath();
        ctx.rect(pox-pw/2+s*0.04, poy+s*0.05, pw-s*0.08, ph-s*0.18);
        ctx.fillStyle = rc(color, alpha*0.14);
        ctx.fill();
        // home dot
        ctx.beginPath();
        ctx.arc(pox, poy+ph-s*0.08, s*0.04, 0, Math.PI*2);
        ctx.fillStyle = rc(color, alpha*0.62);
        ctx.fill();
        // tablet (right) — wider, taller
        var tw = s*0.58, th = s*0.76, tr2 = s*0.05, tox = s*0.38, toy = -s*0.36;
        ctx.beginPath();
        ctx.roundRect(tox-tw/2, toy, tw, th, tr2);
        ctx.fillStyle   = rc(color, alpha*0.09);
        ctx.fill();
        ctx.strokeStyle = rc(color, alpha*0.65);
        ctx.lineWidth   = 0.8;
        ctx.stroke();
        // tablet screen
        ctx.beginPath();
        ctx.rect(tox-tw/2+s*0.05, toy+s*0.05, tw-s*0.10, th-s*0.18);
        ctx.fillStyle = rc(color, alpha*0.14);
        ctx.fill();
        // home dot
        ctx.beginPath();
        ctx.arc(tox, toy+th-s*0.09, s*0.04, 0, Math.PI*2);
        ctx.fillStyle = rc(color, alpha*0.62);
        ctx.fill();

      } else if (id === 'neuralnet') {
        // 3-layer neural net (3→2→1)
        var lx = [-s*0.68, 0, s*0.68];
        var ly = [[-s*0.42, 0, s*0.42], [-s*0.24, s*0.24], [0]];
        for (var li = 0; li < 2; li++) {
          for (var ni = 0; ni < ly[li].length; ni++) {
            for (var nj = 0; nj < ly[li+1].length; nj++) {
              ctx.beginPath();
              ctx.moveTo(lx[li], ly[li][ni]);
              ctx.lineTo(lx[li+1], ly[li+1][nj]);
              ctx.strokeStyle = rc(color, alpha*0.35);
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }
        for (var li = 0; li < lx.length; li++) {
          for (var ni = 0; ni < ly[li].length; ni++) {
            ctx.beginPath();
            ctx.arc(lx[li], ly[li][ni], s*0.14, 0, Math.PI*2);
            ctx.fillStyle = rc(color, alpha*0.90);
            ctx.fill();
          }
        }

      } else if (id === 'layers') {
        // Stacked layer bars
        var bars = 3, bh = s*0.30, gap = s*0.40;
        for (var bi = 0; bi < bars; bi++) {
          var by  = (bi-1)*gap;
          var bw  = s*(1.4-bi*0.20);
          var dots = bars-bi;
          ctx.beginPath();
          ctx.rect(-bw, by-bh/2, bw*2, bh);
          ctx.fillStyle = rc(color, alpha*(0.10+bi*0.04));
          ctx.fill();
          ctx.strokeStyle = rc(color, alpha*(0.58-bi*0.10));
          ctx.lineWidth = 0.8;
          ctx.stroke();
          for (var di = 0; di < dots; di++) {
            var dx = ((di/(dots-1||1))-0.5)*bw*1.1;
            ctx.beginPath();
            ctx.arc(dx, by, s*0.09, 0, Math.PI*2);
            ctx.fillStyle = rc(color, alpha*0.85);
            ctx.fill();
          }
        }

      } else if (id === 'grid') {
        // 4×3 data grid
        for (var gRow = 0; gRow < 3; gRow++) {
          for (var gCol = 0; gCol < 4; gCol++) {
            var gx = (gCol-1.5)*s*0.55;
            var gy = (gRow-1)*s*0.55;
            var hi = (gRow===1 && gCol>=2);
            ctx.beginPath();
            ctx.arc(gx, gy, s*0.11, 0, Math.PI*2);
            ctx.fillStyle = rc(color, alpha*(hi ? 0.92 : 0.38));
            ctx.fill();
          }
        }
        for (var gr = 0; gr < 3; gr++) {
          ctx.beginPath();
          ctx.moveTo(-s*1.0, (gr-1)*s*0.55);
          ctx.lineTo( s*1.0, (gr-1)*s*0.55);
          ctx.strokeStyle = rc(color, alpha*0.16);
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

      } else if (id === 'cube') {
        // Isometric cube
        var cw = s*0.58, ch = cw*0.50;
        var P = {
          t:{x:0,y:-ch*2}, tr:{x:cw,y:-ch}, br:{x:cw,y:ch},
          b:{x:0,y:ch*2},  bl:{x:-cw,y:ch}, tl:{x:-cw,y:-ch}, c:{x:0,y:0}
        };
        ctx.beginPath(); ctx.moveTo(P.t.x,P.t.y); ctx.lineTo(P.tr.x,P.tr.y);
        ctx.lineTo(P.c.x,P.c.y); ctx.lineTo(P.tl.x,P.tl.y); ctx.closePath();
        ctx.fillStyle = rc(color, alpha*0.18); ctx.fill();
        ctx.strokeStyle = rc(color, alpha*0.65); ctx.lineWidth = 0.9; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(P.tr.x,P.tr.y); ctx.lineTo(P.br.x,P.br.y);
        ctx.lineTo(P.b.x,P.b.y); ctx.lineTo(P.c.x,P.c.y); ctx.closePath();
        ctx.fillStyle = rc(color, alpha*0.10); ctx.fill();
        ctx.strokeStyle = rc(color, alpha*0.52); ctx.lineWidth = 0.9; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(P.tl.x,P.tl.y); ctx.lineTo(P.c.x,P.c.y);
        ctx.lineTo(P.b.x,P.b.y); ctx.lineTo(P.bl.x,P.bl.y); ctx.closePath();
        ctx.fillStyle = rc(color, alpha*0.13); ctx.fill();
        ctx.strokeStyle = rc(color, alpha*0.58); ctx.lineWidth = 0.9; ctx.stroke();

      } else if (id === 'server' || id === 'server2') {
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
          ctx.beginPath();
          ctx.arc(sw/2-s*0.18, sy, s*0.09, 0, Math.PI*2);
          ctx.fillStyle = rc(color, alpha*(si===1 ? 0.95 : 0.38));
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(-sw/2+s*0.16, sy);
          ctx.lineTo( sw/2-s*0.38, sy);
          ctx.strokeStyle = rc(color, alpha*0.22);
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      } else if (id === 'intelnode') {
        // Magnifying glass over data lines — "intelligence / analysis" symbol
        var lr = s * 0.52, lox = s*0.08, loy = -s*0.08;
        // lens circle
        ctx.beginPath();
        ctx.arc(lox, loy, lr, 0, Math.PI*2);
        ctx.fillStyle   = rc(color, alpha*0.11);
        ctx.fill();
        ctx.strokeStyle = rc(color, alpha*0.88);
        ctx.lineWidth   = 1.20;
        ctx.stroke();
        // handle
        var hAng = Math.PI * 0.78;
        ctx.beginPath();
        ctx.moveTo(lox + lr*Math.cos(hAng),       loy + lr*Math.sin(hAng));
        ctx.lineTo(lox + lr*1.72*Math.cos(hAng),  loy + lr*1.72*Math.sin(hAng));
        ctx.strokeStyle = rc(color, alpha*0.80);
        ctx.lineWidth   = 1.60;
        ctx.stroke();
        // three data lines inside lens
        for (var li = 0; li < 3; li++) {
          var dly = loy - lr*0.30 + li*lr*0.30;
          var dlw = lr * (li === 1 ? 0.58 : 0.38);
          ctx.beginPath();
          ctx.moveTo(lox - dlw, dly); ctx.lineTo(lox + dlw, dly);
          ctx.strokeStyle = rc(color, alpha * (li === 1 ? 0.80 : 0.48));
          ctx.lineWidth   = 0.72;
          ctx.stroke();
        }

      } else if (id === 'sittingpeople') {
        // Seated figures facing each other + authority figure above + animated competing arrows
        var ps = s * 0.88;
        // Center vertically: content spans ~-ps*1.55 (authority head) to +ps*0.34 (feet)
        // midpoint ≈ -ps*0.61 → shift down by ps*0.58
        ctx.translate(0, ps * 0.58);

        // ── Authority / board figure at top ──
        var af = ps * 0.34, afy = -ps * 1.48;
        // head
        ctx.beginPath();
        ctx.arc(0, afy, af*0.22, 0, Math.PI*2);
        ctx.fillStyle   = rc(color, alpha*0.18); ctx.fill();
        ctx.strokeStyle = rc(color, alpha*0.85); ctx.lineWidth = 0.80; ctx.stroke();
        // torso
        ctx.beginPath();
        ctx.moveTo(0, afy+af*0.24); ctx.lineTo(0, afy+af*0.75);
        ctx.strokeStyle = rc(color, alpha*0.75); ctx.lineWidth = 1.30; ctx.stroke();
        // arms spread wide (authority/presenting downward)
        ctx.beginPath();
        ctx.moveTo(0, afy+af*0.38); ctx.lineTo(-af*0.40, afy+af*0.62);
        ctx.moveTo(0, afy+af*0.38); ctx.lineTo( af*0.40, afy+af*0.62);
        ctx.strokeStyle = rc(color, alpha*0.68); ctx.lineWidth = 0.88; ctx.stroke();
        // legs
        ctx.beginPath();
        ctx.moveTo(0, afy+af*0.75); ctx.lineTo(-af*0.20, afy+af*1.15);
        ctx.moveTo(0, afy+af*0.75); ctx.lineTo( af*0.20, afy+af*1.15);
        ctx.strokeStyle = rc(color, alpha*0.62); ctx.lineWidth = 0.85; ctx.stroke();
        // downward pressure arrow
        var arTop = afy+af*1.22, arBot = arTop+ps*0.20;
        ctx.beginPath();
        ctx.moveTo(0, arTop); ctx.lineTo(0, arBot);
        ctx.strokeStyle = rc(color, alpha*0.48); ctx.lineWidth = 0.72; ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-ps*0.045, arBot-ps*0.055); ctx.lineTo(0, arBot);
        ctx.lineTo(ps*0.045,  arBot-ps*0.055);
        ctx.strokeStyle = rc(color, alpha*0.48); ctx.lineWidth = 0.72; ctx.stroke();

        // ── Two seated figures ──
        [-ps*0.52, ps*0.52].forEach(function(px, pi) {
          var inDir = pi === 0 ? 1 : -1;
          // subtle animated sway (each person out of phase)
          var lean = Math.sin(tick * 0.42 + pi * Math.PI) * ps * 0.055;

          // Chair
          var seatL = px - inDir*ps*0.24, seatR = px + inDir*ps*0.10, seatY = ps*0.05;
          ctx.beginPath(); ctx.moveTo(seatL, seatY); ctx.lineTo(seatR, seatY);
          ctx.strokeStyle = rc(color, alpha*0.48); ctx.lineWidth = 0.80; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(seatL, seatY); ctx.lineTo(seatL, -ps*0.34);
          ctx.strokeStyle = rc(color, alpha*0.48); ctx.lineWidth = 0.80; ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(seatL, seatY);            ctx.lineTo(seatL, ps*0.34);
          ctx.moveTo(seatR-inDir*s*0.02, seatY); ctx.lineTo(seatR-inDir*s*0.02, ps*0.34);
          ctx.strokeStyle = rc(color, alpha*0.38); ctx.lineWidth = 0.65; ctx.stroke();

          // Head (tilted + animated sway)
          var hx = px + inDir*ps*0.06 + lean, hy = -ps*0.54;
          ctx.beginPath(); ctx.arc(hx, hy, ps*0.17, 0, Math.PI*2);
          ctx.fillStyle   = rc(color, alpha*0.15); ctx.fill();
          ctx.strokeStyle = rc(color, alpha*0.85); ctx.lineWidth = 0.85; ctx.stroke();
          // torso
          ctx.beginPath();
          ctx.moveTo(hx, hy+ps*0.18);
          ctx.lineTo(px+inDir*ps*0.04, seatY-ps*0.02);
          ctx.strokeStyle = rc(color, alpha*0.75); ctx.lineWidth = 1.5; ctx.stroke();
          // thinking arm — elbow on knee, hand at chin
          ctx.beginPath();
          ctx.moveTo(px+inDir*ps*0.04, -ps*0.24);
          ctx.lineTo(px+inDir*ps*0.20, -ps*0.05);
          ctx.lineTo(hx+inDir*ps*0.12, hy+ps*0.17);
          ctx.strokeStyle = rc(color, alpha*0.68); ctx.lineWidth = 0.95; ctx.stroke();
          // other arm
          ctx.beginPath();
          ctx.moveTo(px+inDir*ps*0.04, -ps*0.24);
          ctx.lineTo(px-inDir*ps*0.04, ps*0.02);
          ctx.strokeStyle = rc(color, alpha*0.58); ctx.lineWidth = 0.85; ctx.stroke();
          // thighs + lower legs + feet
          ctx.beginPath();
          ctx.moveTo(px+inDir*ps*0.04, seatY); ctx.lineTo(px+inDir*ps*0.22, seatY);
          ctx.strokeStyle = rc(color, alpha*0.68); ctx.lineWidth = 1.2; ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(px+inDir*ps*0.22, seatY); ctx.lineTo(px+inDir*ps*0.22, ps*0.34);
          ctx.strokeStyle = rc(color, alpha*0.62); ctx.lineWidth = 1.0; ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(px+inDir*ps*0.22, ps*0.34); ctx.lineTo(px+inDir*ps*0.30, ps*0.34);
          ctx.strokeStyle = rc(color, alpha*0.55); ctx.lineWidth = 0.85; ctx.stroke();

          // ── Competing direction arrows (cycling, replace thought bubbles) ──
          // Each person has 3 arrows pointing toward different surrounding nodes
          var dirs = pi === 0
            ? [[ 0.3, -1.0], [-1.0, -0.4], [-0.6,  0.9]]  // left: cloud, desktop, data
            : [[-0.3, -1.0], [ 1.0, -0.4], [ 0.6,  0.9]];  // right: cloud, mobile, model
          var activeIdx = Math.floor((tick * 0.55 + pi * 1.6) % dirs.length);
          dirs.forEach(function(dir, di) {
            var active = (di === activeIdx);
            var aLen   = ps * (active ? 0.32 : 0.17);
            var aAlpha = alpha * (active ? 0.85 : 0.20);
            var mag = Math.sqrt(dir[0]*dir[0] + dir[1]*dir[1]);
            var ex = hx + dir[0]/mag*aLen, ey = hy + dir[1]/mag*aLen;
            ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(ex, ey);
            ctx.strokeStyle = rc(color, aAlpha);
            ctx.lineWidth   = active ? 1.05 : 0.55;
            ctx.stroke();
            // arrowhead
            var ang = Math.atan2(ey-hy, ex-hx), hl = ps*0.06;
            ctx.beginPath();
            ctx.moveTo(ex-hl*Math.cos(ang-0.40), ey-hl*Math.sin(ang-0.40));
            ctx.lineTo(ex, ey);
            ctx.lineTo(ex-hl*Math.cos(ang+0.40), ey-hl*Math.sin(ang+0.40));
            ctx.strokeStyle = rc(color, aAlpha);
            ctx.lineWidth   = active ? 1.0 : 0.50;
            ctx.stroke();
          });
        });
      }

      ctx.restore();
    }

    function draw() {
      tick += 0.016;
      ctx.clearRect(0, 0, W, H);
      var c = pal();

      // Bobbing node positions
      var pos = NODES.map(function(n, i) {
        return {
          x: n.cx*W + Math.cos(tick*0.22+i*1.2)*2.8,
          y: n.cy*H + Math.sin(tick*0.28+i*0.9)*3.5,
          color: col(n.cat, c),
          n: n
        };
      });

      // ── INVENEW Intelligence spotlight beam ──
      var srcX = (pos[0].x + pos[2].x) / 2 + W * 0.04;
      var srcY = (pos[0].y + pos[2].y) / 2 - H * 0.07;
      var hexC = pos[6];

      // Animated pulse: slow breathe + faster flicker layered together
      var breathe = 0.50 + 0.50 * Math.sin(tick * 0.55);
      var flicker = 0.92 + 0.08 * Math.sin(tick * 4.80 + 1.2);
      var bp      = breathe * flicker;
      var beamW   = 50 + bp * 16;

      // Cone fill — animated orangish yellow
      var oy = [255, 178, 48];
      var beamGrd = ctx.createLinearGradient(srcX, srcY, hexC.x, hexC.y);
      beamGrd.addColorStop(0,    rc(oy, (c.dk ? 0.42 : 0.32) * bp));
      beamGrd.addColorStop(0.60, rc(oy, (c.dk ? 0.18 : 0.13) * bp));
      beamGrd.addColorStop(1,    rc(oy, 0));
      ctx.beginPath();
      ctx.moveTo(srcX, srcY);
      ctx.lineTo(hexC.x - beamW, hexC.y);
      ctx.lineTo(hexC.x + beamW, hexC.y);
      ctx.closePath();
      ctx.fillStyle = beamGrd;
      ctx.fill();

      // Source dot — pulses with beam, same orangish-yellow as spotlight
      var dotR = 16 + bp * 7;
      var dotGrd = ctx.createRadialGradient(srcX, srcY, 0, srcX, srcY, dotR * 1.6);
      dotGrd.addColorStop(0,   rc(oy, (c.dk ? 0.90 : 0.72) * bp));
      dotGrd.addColorStop(0.5, rc(oy, (c.dk ? 0.40 : 0.30) * bp));
      dotGrd.addColorStop(1,   rc(oy, 0));
      ctx.beginPath();
      ctx.arc(srcX, srcY, dotR * 1.6, 0, Math.PI*2);
      ctx.fillStyle = dotGrd;
      ctx.fill();

      // Label — orangish-yellow; top-right corner on mobile, beside dot on desktop
      ctx.save();
      var labelMobile = W < 480;
      var fontSize    = Math.max(9, Math.round(W * 0.019));
      var labelA      = (c.dk ? 0.88 : 0.72) * (0.7 + 0.3 * bp);
      ctx.font      = 'bold ' + fontSize + 'px system-ui,sans-serif';
      ctx.fillStyle = rc(oy, labelA);
      if (labelMobile) {
        // Anchor to top-right of canvas — always clear space
        ctx.textAlign    = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText('INVENEW',      W - 8, 8);
        ctx.fillText('Intelligence', W - 8, 8 + fontSize * 1.35);
      } else {
        ctx.textAlign    = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('INVENEW Intelligence', srcX + 24, srcY);
      }
      ctx.restore();

      // Edges
      ctx.lineWidth = 0.7;
      EDGES.forEach(function(e) {
        var a = pos[e[0]], b = pos[e[1]];
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = rc(c.b4, c.dk ? 0.20 : 0.14);
        ctx.stroke();
      });

      // Pulse dots along edges
      pulses.forEach(function(p) {
        p.t = (p.t + p.spd) % 1;
        var a = pos[EDGES[p.ei][0]], b = pos[EDGES[p.ei][1]];
        for (var tr = 0; tr < 4; tr++) {
          var tp = p.t - tr*0.055;
          if (tp < 0) tp += 1;
          ctx.beginPath();
          ctx.arc(a.x+(b.x-a.x)*tp, a.y+(b.y-a.y)*tp,
                  Math.max(0.1, 1.9-tr*0.38), 0, Math.PI*2);
          ctx.fillStyle = rc(c.b3, (1-tr*0.22)*(c.dk?0.70:0.58));
          ctx.fill();
        }
      });

      // Main nodes
      pos.forEach(function(np, i) {
        var r = 30 * (np.n.scale || 1);

        if (np.n.hex) {
          // Hexagonal node — no glow, solid stroke
          hexPath(np.x, np.y, r);
          ctx.fillStyle   = rc(np.color, c.dk ? 0.14 : 0.10);
          ctx.fill();
          ctx.lineWidth   = 1.4;
          ctx.strokeStyle = rc(np.color, c.dk ? 0.65 : 0.52);
          ctx.stroke();
          hexPath(np.x, np.y, r*0.82);
          ctx.strokeStyle = rc(np.color, c.dk ? 0.22 : 0.14);
          ctx.lineWidth   = 0.55;
          ctx.stroke();
        } else {
          // Circle node — no glow, solid stroke
          ctx.beginPath();
          ctx.arc(np.x, np.y, r, 0, Math.PI*2);
          ctx.fillStyle   = rc(np.color, c.dk ? 0.14 : 0.10);
          ctx.fill();
          ctx.lineWidth   = 1.2;
          ctx.strokeStyle = rc(np.color, c.dk ? 0.60 : 0.48);
          ctx.stroke();
        }

        drawIcon(np.x, np.y, np.n.icon, r, np.color, c.dk ? 0.85 : 0.72);

        // Node labels — circle nodes below, hex node centered inside at bottom
        var LABELS = ['Cloud Infra','Endpoints','Mobile / Edge','Data Layer','AI Models','On-Prem','You'];
        if (LABELS[i]) {
          ctx.save();
          ctx.font         = Math.max(9, Math.round(W * 0.019)) + 'px system-ui,sans-serif';
          ctx.fillStyle    = rc(np.color, c.dk ? 0.60 : 0.46);
          ctx.textAlign    = 'center';
          if (np.n.hex) {
            // Draw "You" inside the hexagon, near the bottom
            ctx.textBaseline = 'middle';
            ctx.fillText(LABELS[i], np.x, np.y + r * 0.72);
          } else {
            ctx.textBaseline = 'top';
            ctx.fillText(LABELS[i], np.x, np.y + r + 10);
          }
          ctx.restore();
        }
      });

      // "$" cost signal riding along people→cloud edge (index 12 = [6,0])
      var costPulse = pulses[12];
      if (costPulse) {
        var ca = pos[EDGES[12][0]], cb2 = pos[EDGES[12][1]];
        var ct = costPulse.t;
        var cpx = ca.x + (cb2.x - ca.x) * ct;
        var cpy = ca.y + (cb2.y - ca.y) * ct;
        ctx.save();
        ctx.font = 'bold ' + Math.max(10, Math.round(W * 0.022)) + 'px system-ui,sans-serif';
        ctx.fillStyle   = rc(c.sun, c.dk ? 0.85 : 0.70);
        ctx.textAlign   = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', cpx, cpy);
        ctx.restore();
      }

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
