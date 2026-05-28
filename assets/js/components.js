/* ============================================================
   INVENEW — Shared Footer Component
   The nav is baked into every HTML page so it renders on the
   first paint with no JS dependency.  This file only handles
   the footer injection and marking the active nav link.
   ============================================================ */

(function () {
  'use strict';

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
    buildFooter();
  });

})();
