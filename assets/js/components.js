/* ============================================================
   INVENEW — Shared Nav & Footer Components
   ============================================================ */

(function () {
  'use strict';

  const NAV_LINKS = [
    { href: 'intelligence.html', label: 'Intelligence' },
    { href: 'labs.html',         label: 'Labs' },
    { href: 'newsletter.html',   label: 'Newsletter' },
    { href: 'blog.html',         label: 'Blog' },
    { href: 'about.html',        label: 'About' },
  ];

  function moonIcon() {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  }

  function buildNav() {
    const el = document.getElementById('site-nav');
    if (!el) return;

    const links = NAV_LINKS.map(function (l) {
      return `<li><a href="${l.href}">${l.label}</a></li>`;
    }).join('');

    const mobileLinks = NAV_LINKS.map(function (l) {
      return `<a href="${l.href}">${l.label}</a>`;
    }).join('');

    el.innerHTML = `
<nav class="nav" role="navigation" aria-label="Main navigation">
  <div class="nav-inner">
    <a href="index.html" class="nav-logo" aria-label="INVENEW home">
      <img src="assets/img/INVENEW-light-long1.png" alt="INVENEW" class="logo-light">
      <img src="assets/img/INVENEW-dark-long1.png"  alt="INVENEW" class="logo-dark">
    </a>
    <ul class="nav-links" role="list">${links}</ul>
    <div class="nav-right">
      <button class="btn-icon" id="theme-toggle" aria-label="Switch to dark mode">${moonIcon()}</button>
      <button class="nav-hamburger" id="nav-hamburger" aria-expanded="false" aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>
      <a href="newsletter.html" class="btn-subscribe">Subscribe</a>
    </div>
  </div>
  <div class="mobile-nav" id="mobile-nav" role="dialog" aria-label="Mobile navigation">
    ${mobileLinks}
    <a href="newsletter.html" class="btn-subscribe">Subscribe free</a>
  </div>
</nav>`;
  }

  function buildFooter() {
    const el = document.getElementById('site-footer');
    if (!el) return;

    el.innerHTML = `
<div class="partner-bar">
  <div class="container">
    <div class="partner-bar-inner">
      <p>INVENEW is reader-supported and independently operated. Sponsorships are clearly disclosed.</p>
      <a href="sponsors.html">Partner with INVENEW &rarr;</a>
    </div>
  </div>
</div>
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <img src="assets/img/INVENEW-light-long1.png" alt="INVENEW" class="logo-light">
        <img src="assets/img/INVENEW-dark-long1.png"  alt="INVENEW" class="logo-dark">
        <p>Founder-led intelligence for AI-native infrastructure, operations, and the future software stack.</p>
      </div>
      <div class="footer-col">
        <h5>PLATFORM</h5>
        <a href="intelligence.html">Intelligence</a>
        <a href="labs.html">Labs</a>
        <a href="newsletter.html">Newsletter</a>
        <a href="blog.html">Blog</a>
      </div>
      <div class="footer-col">
        <h5>COMPANY</h5>
        <a href="about.html">About</a>
        <a href="sponsors.html">Partner with us</a>
        <a href="privacy.html">Privacy</a>
        <a href="legal.html">Legal</a>
      </div>
      <div class="footer-col">
        <h5>CONNECT</h5>
        <a href="https://linkedin.com/in/yourprofile" target="_blank" rel="noopener">LinkedIn</a>
        <a href="newsletter.html">Subscribe</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 INVENEW Inc. All rights reserved.</p>
      <a href="newsletter.html" class="btn-subscribe" style="font-size:12px; padding:7px 16px;">Subscribe free</a>
    </div>
  </div>
</footer>`;
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildNav();
    buildFooter();

    // Sync theme icon now that the button exists in the DOM
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    if (window.__invenew && window.__invenew.updateThemeIcon) {
      window.__invenew.updateThemeIcon(theme);
    }

    // Mobile nav needs re-init after nav is injected
    const hamburger = document.getElementById('nav-hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', function () {
        const open = mobileNav.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', String(open));
      });
      document.addEventListener('click', function (e) {
        if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
          mobileNav.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Active nav link
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(function (a) {
      const hrefFile = (a.getAttribute('href') || '').split('/').pop();
      if (hrefFile === path || (path === '' && hrefFile === 'index.html')) {
        a.classList.add('active');
      }
    });
  });

})();
