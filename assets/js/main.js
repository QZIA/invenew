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

  /* ── Hero canvas: animated particle network ── */
  function initHeroCanvas() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var ctx = canvas.getContext('2d');
    var COUNT = 58;
    var MAX_DIST = 155;
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var nodes = [];
    var raf;

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      canvas.width  = rect.width  * DPR;
      canvas.height = rect.height * DPR;
      canvas.style.width  = rect.width  + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.scale(DPR, DPR);
      var w = rect.width, h = rect.height;
      nodes = [];
      for (var i = 0; i < COUNT; i++) {
        nodes.push({
          x:  Math.random() * w,
          y:  Math.random() * h,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r:  Math.random() * 1.4 + 0.5
        });
      }
    }

    function getColors() {
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      return {
        node: dark ? 'rgba(122,154,181,0.28)' : 'rgba(95,118,140,0.18)',
        lineBase: dark ? 'rgba(122,154,181,' : 'rgba(95,118,140,'
      };
    }

    function draw() {
      var w = canvas.width  / DPR;
      var h = canvas.height / DPR;
      ctx.clearRect(0, 0, w, h);
      var c = getColors();

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx;  n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      ctx.lineWidth = 0.7;
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var dx = nodes[i].x - nodes[j].x;
          var dy = nodes[i].y - nodes[j].y;
          var d  = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_DIST) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = c.lineBase + ((1 - d / MAX_DIST) * 0.14) + ')';
            ctx.stroke();
          }
        }
      }

      for (var i = 0; i < nodes.length; i++) {
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, nodes[i].r, 0, Math.PI * 2);
        ctx.fillStyle = c.node;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { resize(); draw(); }, 120);
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
