/* ============================================================
   INVENEW — Blog page: loads posts from /api/blog (Sanity proxy)
   ============================================================ */

(function () {
  'use strict';

  var allPosts     = [];
  var currentTopic = 'all';

  /* ── Helpers ──────────────────────────────────────────── */

  function formatDate(str) {
    if (!str) return '';
    try {
      return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) { return str; }
  }

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Append Sanity CDN size params to image URL
  function imgUrl(url, w, h) {
    if (!url) return null;
    return url + '?w=' + w + '&h=' + h + '&fit=crop&auto=format&q=80';
  }

  // SVG image icon used inside placeholders
  var IMG_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="3" y="3" width="18" height="18" rx="2"/>' +
    '<circle cx="8.5" cy="8.5" r="1.5"/>' +
    '<polyline points="21 15 16 10 5 21"/>' +
    '</svg>';

  /* ── Featured post ────────────────────────────────────── */

  function renderFeatured(post) {
    var el = document.getElementById('blog-featured');
    if (!el) return;

    var slug    = post.slug && post.slug.current ? post.slug.current : post._id;
    var cat     = (post.category && post.category.title) ||
                  (post.tag      && post.tag.title)      || 'Insight';
    var date    = formatDate(post.publishedAt || post._createdAt);
    var title   = esc(post.title   || 'Untitled');
    var excerpt = esc(post.excerpt || post.description || post.summary || post.bodyPreview || '');
    var author  = post.author && post.author.name ? esc(post.author.name) : '';
    var src     = imgUrl(post.imageUrl, 840, 480);

    var imgContent = src
      ? '<img src="' + src + '" alt="' + title + '" loading="eager" decoding="async">'
      : '<div class="post-img-placeholder">' + IMG_ICON + '</div>';

    el.innerHTML =
      '<article class="featured-post">' +
        '<div class="featured-post-body">' +
          '<div class="meta">' +
            '<span class="card-tag">' + esc(cat) + '</span>' +
            (date   ? '<time>'                     + date   + '</time>'  : '') +
            (author ? '<span class="featured-author">By ' + author + '</span>' : '') +
          '</div>' +
          '<h2>' + title + '</h2>' +
          (excerpt ? '<p>' + excerpt + '</p>' : '') +
          '<div class="read-more">' +
            '<a href="post.html?slug=' + encodeURIComponent(slug) + '" class="btn-text">' +
              'Read article ' +
              '<svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/>' +
              '<polyline points="12 5 19 12 12 19"/></svg>' +
            '</a>' +
          '</div>' +
        '</div>' +
        '<div class="featured-post-img">' + imgContent + '</div>' +
      '</article>';
  }

  /* ── Blog card grid ───────────────────────────────────── */

  function renderGrid(posts) {
    var container = document.getElementById('blog-posts');
    if (!container) return;

    if (!posts.length) {
      container.innerHTML = '';
      return;
    }

    var html = '';
    posts.forEach(function (post) {
      var slug    = post.slug && post.slug.current ? post.slug.current : post._id;
      var cat     = (post.category && post.category.title) ||
                    (post.tag      && post.tag.title)      || 'Insight';
      var date    = formatDate(post.publishedAt || post._createdAt);
      var title   = esc(post.title   || 'Untitled');
      var excerpt = esc(post.excerpt || post.description || post.summary || post.bodyPreview || '');
      var src     = imgUrl(post.imageUrl, 480, 270);

      var imgInner = src
        ? '<img src="' + src + '" alt="' + title + '" loading="lazy" decoding="async">'
        : '<svg class="blog-card-img-placeholder" xmlns="http://www.w3.org/2000/svg" ' +
          'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ' +
          'stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="3" y="3" width="18" height="18" rx="2"/>' +
          '<circle cx="8.5" cy="8.5" r="1.5"/>' +
          '<polyline points="21 15 16 10 5 21"/></svg>';

      html +=
        '<article class="blog-card">' +
          '<div class="blog-card-img">' + imgInner + '</div>' +
          '<div class="blog-card-body">' +
            '<div class="meta">' +
              '<span class="card-tag">' + esc(cat) + '</span>' +
              (date ? '<time>' + date + '</time>' : '') +
            '</div>' +
            '<h3>' + title + '</h3>' +
            (excerpt ? '<p>' + excerpt + '</p>' : '') +
            '<div class="read-more">' +
              '<a href="post.html?slug=' + encodeURIComponent(slug) + '" class="btn-text">' +
                'Read article ' +
                '<svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/>' +
                '<polyline points="12 5 19 12 12 19"/></svg>' +
              '</a>' +
            '</div>' +
          '</div>' +
        '</article>';
    });
    container.innerHTML = html;
  }

  /* ── Render all (featured + grid) ────────────────────── */

  function renderPosts(posts, topic) {
    var featuredEl = document.getElementById('blog-featured');
    var gridEl     = document.getElementById('blog-posts');
    if (!gridEl) return;

    var filtered = topic === 'all' ? posts : posts.filter(function (p) {
      var cat = p.category ? (p.category.slug || p.category.title || '').toLowerCase() : '';
      var tag = p.tag      ? (p.tag.slug      || p.tag.title      || '').toLowerCase() : '';
      return cat.indexOf(topic) !== -1 || tag.indexOf(topic) !== -1;
    });

    if (!filtered.length) {
      if (featuredEl) featuredEl.innerHTML = '';
      gridEl.innerHTML =
        '<div class="loading-state" style="grid-column:1/-1;">' +
          '<p>No posts found in this category yet.</p>' +
        '</div>';
      return;
    }

    renderFeatured(filtered[0]);
    renderGrid(filtered.slice(1));
  }

  /* ── Fallback ─────────────────────────────────────────── */

  function showFallback() {
    var container = document.getElementById('blog-posts');
    var featured  = document.getElementById('blog-featured');
    var fallback  = document.getElementById('blog-fallback');
    if (container) container.innerHTML = '';
    if (featured)  featured.innerHTML  = '';
    if (fallback)  fallback.style.display = 'block';
  }

  /* ── Load posts ───────────────────────────────────────── */

  function loadPosts() {
    var container = document.getElementById('blog-posts');
    if (!container) return;

    var timer = setTimeout(showFallback, 10000);

    fetch('/api/blog')
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        clearTimeout(timer);
        allPosts = data.result || [];
        if (!allPosts.length) { showFallback(); return; }
        renderPosts(allPosts, currentTopic);
      })
      .catch(function (err) {
        clearTimeout(timer);
        console.error('[INVENEW] blog load error:', err);
        showFallback();
      });
  }

  /* ── Filters ──────────────────────────────────────────── */

  function initFilters() {
    var row = document.getElementById('filter-row');
    if (!row) return;
    row.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-btn');
      if (!btn) return;
      row.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentTopic = btn.dataset.topic || 'all';
      renderPosts(allPosts, currentTopic);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFilters();
    loadPosts();
  });

})();
