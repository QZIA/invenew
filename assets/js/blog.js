/* ============================================================
   INVENEW — Blog page: Sanity CMS loader
   ============================================================
   SETUP:
   1. Replace SANITY_PROJECT_ID with your Sanity project ID.
      Find it in: sanity.io/manage → your project → Settings → API
   2. Replace SANITY_DATASET if not using "production".
   3. The GROQ query below assumes posts have: title, slug, excerpt,
      publishedAt, mainImage, categories[]->{title, slug}
      Adjust to match your actual Sanity schema if needed.
   ============================================================ */

(function () {
  'use strict';

  var SANITY_PROJECT_ID = 'YOUR_PROJECT_ID';
  var SANITY_DATASET    = 'production';
  var SANITY_API_VER    = '2024-01-01';
  var LOAD_TIMEOUT_MS   = 7000;

  var currentTopic = 'all';

  var GROQ_QUERY = encodeURIComponent(
    '*[_type == "post" && defined(publishedAt)] | order(publishedAt desc) [0..19] {' +
      '_id, title, slug, excerpt, publishedAt,' +
      '"category": categories[0]->{ title, "slug": slug.current }' +
    '}'
  );

  function sanityUrl() {
    return 'https://' + SANITY_PROJECT_ID + '.api.sanity.io/v' + SANITY_API_VER +
           '/data/query/' + SANITY_DATASET + '?query=' + GROQ_QUERY;
  }

  function formatDate(str) {
    if (!str) return '';
    try {
      return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) { return str; }
  }

  function escHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderPosts(posts, topic) {
    var container = document.getElementById('blog-posts');
    if (!container) return;

    var filtered = topic === 'all' ? posts : posts.filter(function (p) {
      var cat = (p.category && p.category.slug) ? p.category.slug.toLowerCase() : '';
      return cat.indexOf(topic) !== -1;
    });

    if (filtered.length === 0) {
      container.innerHTML = '<div class="loading-state" style="grid-column:1/-1;"><p>No posts found in this category yet.</p></div>';
      return;
    }

    var html = '';
    filtered.forEach(function (post) {
      var slug  = post.slug && post.slug.current ? post.slug.current : post._id;
      var cat   = post.category ? post.category.title : 'Insight';
      var date  = formatDate(post.publishedAt);
      var title = escHtml(post.title || 'Untitled');
      var blurb = escHtml(post.excerpt || '');
      html += '<article class="blog-card">' +
        '<div class="meta">' +
          '<span class="card-tag">' + escHtml(cat) + '</span>' +
          (date ? '<time>' + date + '</time>' : '') +
        '</div>' +
        '<h3>' + title + '</h3>' +
        (blurb ? '<p>' + blurb + '</p>' : '') +
        '<div class="read-more">' +
          '<a href="post.html?slug=' + encodeURIComponent(slug) + '" class="btn-text">' +
            'Read article <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
          '</a>' +
        '</div>' +
      '</article>';
    });
    container.innerHTML = html;
  }

  var allPosts = [];

  function showFallback() {
    var container = document.getElementById('blog-posts');
    var fallback  = document.getElementById('blog-fallback');
    if (container) container.innerHTML = '';
    if (fallback)  fallback.style.display = 'block';
  }

  function loadPosts() {
    var container = document.getElementById('blog-posts');
    if (!container) return;

    if (SANITY_PROJECT_ID === 'YOUR_PROJECT_ID') {
      container.innerHTML = '<div style="grid-column:1/-1; padding: 24px 0;">' +
        '<p style="font-size:14px; color: var(--color-text-muted);">Configure your Sanity project ID in <code>assets/js/blog.js</code> to load posts here.</p>' +
      '</div>';
      return;
    }

    var timer = setTimeout(showFallback, LOAD_TIMEOUT_MS);

    fetch(sanityUrl())
      .then(function (res) {
        if (!res.ok) throw new Error('Sanity fetch failed');
        return res.json();
      })
      .then(function (data) {
        clearTimeout(timer);
        allPosts = data.result || [];
        renderPosts(allPosts, currentTopic);
      })
      .catch(function () {
        clearTimeout(timer);
        showFallback();
      });
  }

  function initFilters() {
    var filterRow = document.getElementById('filter-row');
    if (!filterRow) return;
    filterRow.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filterRow.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
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
