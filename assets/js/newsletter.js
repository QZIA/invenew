/* ============================================================
   INVENEW — Newsletter page
   Fetches 30 posts from /api/newsletters, paginates at 10/page,
   opens a slide-up reader when a post is selected.
   ============================================================ */

(function () {
  'use strict';

  var PAGE_SIZE   = 10;
  var allPosts    = [];
  var currentPage = 0;

  /* ── Helpers ── */
  function formatDate(ts) {
    if (!ts) return '';
    try {
      var d = new Date(typeof ts === 'number' ? ts * 1000 : ts);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) { return ''; }
  }

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Extract <body> content if Beehiiv returns a full HTML document
  function extractBody(html) {
    if (!html) return '';
    var m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return m ? m[1] : html;
  }

  /* ── List rendering ── */
  function renderPage(page) {
    var container = document.getElementById('newsletter-issues');
    if (!container) return;

    currentPage = page;
    var start      = page * PAGE_SIZE;
    var pageItems  = allPosts.slice(start, start + PAGE_SIZE);
    var totalPages = Math.ceil(allPosts.length / PAGE_SIZE);

    var html = '<ul class="issue-list">';
    pageItems.forEach(function (post, i) {
      var title    = esc(post.title    || post.subject || 'INVENEW Intelligence');
      var subtitle = esc(post.subtitle || '');
      var date     = esc(formatDate(post.publish_date || post.displayed_date || post.created));
      var idx      = start + i;

      var thumb = post.thumbnail_url || '';
      var thumbHtml = thumb
        ? '<div class="issue-thumb"><img src="' + esc(thumb) + '" alt="" ' +
            'width="88" height="60" loading="lazy" decoding="async"></div>'
        : '<div class="issue-thumb issue-thumb--empty"></div>';

      html +=
        '<li class="issue-item" data-idx="' + idx + '" role="button" tabindex="0" ' +
            'aria-label="Read: ' + title + '">' +
          '<div class="issue-item-main">' +
            '<div class="issue-title">' + title + '</div>' +
            (subtitle ? '<div class="issue-subtitle">' + subtitle + '</div>' : '') +
            (date     ? '<div class="issue-date">'     + date     + '</div>' : '') +
          '</div>' +
          thumbHtml +
          '<span class="issue-cta">Read &rarr;</span>' +
        '</li>';
    });
    html += '</ul>';

    if (totalPages > 1) {
      html +=
        '<div class="issue-pagination">' +
          '<button class="issue-pager btn-outline" data-page="' + (page - 1) + '" ' +
              (page === 0 ? 'disabled' : '') + '>&larr; Prev</button>' +
          '<span class="issue-page-info">Page ' + (page + 1) + ' of ' + totalPages + '</span>' +
          '<button class="issue-pager btn-outline" data-page="' + (page + 1) + '" ' +
              (page >= totalPages - 1 ? 'disabled' : '') + '>Next &rarr;</button>' +
        '</div>';
    }

    container.innerHTML = html;
    bindListEvents(container);
  }

  function bindListEvents(container) {
    container.querySelectorAll('.issue-item').forEach(function (item) {
      function open() {
        openReader(allPosts[parseInt(item.getAttribute('data-idx'), 10)]);
      }
      item.addEventListener('click', open);
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
    });

    container.querySelectorAll('.issue-pager').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var pg = parseInt(btn.getAttribute('data-page'), 10);
        renderPage(pg);
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ── Reader (slide-up panel) ── */
  function openReader(post) {
    var existing = document.getElementById('nl-reader');
    if (existing) existing.remove();

    var title  = post.title   || post.subject || 'INVENEW Intelligence';
    var date   = formatDate(post.publish_date || post.displayed_date || post.created);
    var webUrl = post.web_url || '#';
    var body   = extractBody(
      (post.content && post.content.free && post.content.free.web) || ''
    );

    var modal = document.createElement('div');
    modal.id = 'nl-reader';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', esc(title));

    modal.innerHTML =
      '<div class="nl-reader-overlay"></div>' +
      '<div class="nl-reader-panel">' +
        '<div class="nl-reader-header">' +
          '<div class="nl-reader-meta">' +
            '<h2 class="nl-reader-title">' + esc(title) + '</h2>' +
            (date ? '<p class="nl-reader-date">' + esc(date) + '</p>' : '') +
          '</div>' +
          '<div class="nl-reader-controls">' +
            '<a href="' + esc(webUrl) + '" target="_blank" rel="noopener" ' +
                'class="btn-outline nl-reader-ext" style="font-size:13px;padding:8px 16px;">' +
              'Open on Beehiiv &rarr;' +
            '</a>' +
            '<button class="nl-reader-close btn-icon" aria-label="Close reader">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true">' +
                '<line x1="18" y1="6" x2="6" y2="18"/>' +
                '<line x1="6" y1="6" x2="18" y2="18"/>' +
              '</svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div class="nl-reader-body">' +
          (body ||
            '<p class="nl-reader-empty">Full content not available — ' +
              '<a href="' + esc(webUrl) + '" target="_blank" rel="noopener">read on Beehiiv</a>.' +
            '</p>'
          ) +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { modal.classList.add('nl-reader--open'); });

    modal.querySelector('.nl-reader-overlay').addEventListener('click', closeReader);
    modal.querySelector('.nl-reader-close').addEventListener('click', closeReader);
    document.addEventListener('keydown', handleEsc);
  }

  function handleEsc(e) { if (e.key === 'Escape') closeReader(); }

  function closeReader() {
    var modal = document.getElementById('nl-reader');
    if (!modal) return;
    modal.classList.remove('nl-reader--open');
    document.removeEventListener('keydown', handleEsc);
    setTimeout(function () {
      modal.remove();
      document.body.style.overflow = '';
    }, 300);
  }

  /* ── Data loading ── */
  function showFallback() {
    var container = document.getElementById('newsletter-issues');
    var fallback  = document.getElementById('newsletter-fallback');
    if (container) container.innerHTML = '';
    if (fallback)  fallback.style.display = 'block';
  }

  function load() {
    var container = document.getElementById('newsletter-issues');
    if (!container) return;

    var timer = setTimeout(showFallback, 10000);

    fetch('/api/newsletters')
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        clearTimeout(timer);
        allPosts = (data.data || data.posts || []);
        if (!allPosts.length) { showFallback(); return; }
        renderPage(0);
      })
      .catch(function (err) {
        clearTimeout(timer);
        console.error('[INVENEW] newsletter load failed:', err);
        showFallback();
      });
  }

  document.addEventListener('DOMContentLoaded', load);
})();
