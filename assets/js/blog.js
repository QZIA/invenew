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

  // Normalise a category title to a safe data-topic value
  function slugify(str) {
    return String(str || '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')   // collapse non-alphanumeric runs to hyphens
      .replace(/^-|-$/g, '');          // trim leading/trailing hyphens
  }

  // Return the slugified category label for a post (used for matching)
  function postTopic(post) {
    var title = (post.category && post.category.title) ||
                (post.tag      && post.tag.title)      || '';
    return slugify(title);
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

  /* ── Filter pills (built from fetched categories) ────── */

  function buildFilters(posts) {
    var row = document.getElementById('filter-row');
    if (!row) return;

    // Collect unique category titles in the order they first appear
    var seen  = {};
    var items = [];
    posts.forEach(function (p) {
      var title = (p.category && p.category.title) ||
                  (p.tag      && p.tag.title)      || '';
      if (title && !seen[title]) {
        seen[title] = true;
        items.push({ title: title, slug: slugify(title) });
      }
    });

    // Rebuild pill row, preserving the active state on "All"
    var html = '<button class="filter-btn active" data-topic="all">All</button>';
    items.forEach(function (item) {
      html += '<button class="filter-btn" data-topic="' + esc(item.slug) + '">' +
                esc(item.title) +
              '</button>';
    });
    row.innerHTML = html;
  }

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
      : IMG_ICON;

    el.innerHTML =
      '<article class="featured-post">' +
        '<a href="post.html?slug=' + encodeURIComponent(slug) + '" class="featured-post-link">' +
          '<div class="featured-post-img">' + imgContent + '</div>' +
          '<div class="featured-post-body">' +
            '<div class="meta">' +
              '<span class="card-tag">' + esc(cat) + '</span>' +
              (date   ? '<time>'                     + date   + '</time>'  : '') +
              (author ? '<span class="featured-author">By ' + author + '</span>' : '') +
            '</div>' +
            '<h2>' + title + '</h2>' +
            (excerpt ? '<p>' + excerpt + '</p>' : '') +
            '<div class="read-more">' +
              '<span class="btn-text">' +
                'Read article ' +
                '<svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/>' +
                '<polyline points="12 5 19 12 12 19"/></svg>' +
              '</span>' +
            '</div>' +
          '</div>' +
        '</a>' +
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
          '<a href="post.html?slug=' + encodeURIComponent(slug) + '" class="blog-card-link">' +
            '<div class="blog-card-img">' + imgInner + '</div>' +
            '<div class="blog-card-body">' +
              '<div class="meta">' +
                '<span class="card-tag">' + esc(cat) + '</span>' +
                (date ? '<time>' + date + '</time>' : '') +
              '</div>' +
              '<h3>' + title + '</h3>' +
              (excerpt ? '<p>' + excerpt + '</p>' : '') +
              '<div class="read-more">' +
                '<span class="btn-text">' +
                  'Read article ' +
                  '<svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/>' +
                  '<polyline points="12 5 19 12 12 19"/></svg>' +
                '</span>' +
              '</div>' +
            '</div>' +
          '</a>' +
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
      return postTopic(p) === topic;
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
        currentTopic = 'all';
        buildFilters(allPosts);
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
