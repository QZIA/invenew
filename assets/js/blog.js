/* ============================================================
   INVENEW — Blog page: loads posts from /api/blog (Sanity proxy)
   ============================================================ */

(function () {
  'use strict';

  var allPosts    = [];
  var currentTopic = 'all';

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

  function renderPosts(posts, topic) {
    var container = document.getElementById('blog-posts');
    if (!container) return;

    var filtered = topic === 'all' ? posts : posts.filter(function (p) {
      var cat = p.category ? (p.category.slug || p.category.title || '').toLowerCase() : '';
      var tag = p.tag      ? (p.tag.slug      || p.tag.title      || '').toLowerCase() : '';
      return cat.indexOf(topic) !== -1 || tag.indexOf(topic) !== -1;
    });

    if (!filtered.length) {
      container.innerHTML =
        '<div class="loading-state" style="grid-column:1/-1;">' +
          '<p>No posts found in this category yet.</p>' +
        '</div>';
      return;
    }

    var html = '';
    filtered.forEach(function (post) {
      var slug    = post.slug && post.slug.current ? post.slug.current : post._id;
      var cat     = (post.category && post.category.title) ||
                    (post.tag      && post.tag.title)      || 'Insight';
      var date    = formatDate(post.publishedAt || post._createdAt);
      var title   = esc(post.title   || 'Untitled');
      var excerpt = esc(post.excerpt || post.description || post.summary || '');

      html +=
        '<article class="blog-card">' +
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
        '</article>';
    });
    container.innerHTML = html;
  }

  function showFallback() {
    var container = document.getElementById('blog-posts');
    var fallback  = document.getElementById('blog-fallback');
    if (container) container.innerHTML = '';
    if (fallback)  fallback.style.display = 'block';
  }

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
