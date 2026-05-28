/* ============================================================
   INVENEW — Newsletter page: Beehiiv recent issues loader
   ============================================================
   SETUP: Replace BEEHIIV_PUBLICATION_ID with your publication ID.
   Find it in Beehiiv: Settings → Publication → Share / Embed.
   ============================================================ */

(function () {
  'use strict';

  // ── CONFIG — replace this value ──
  var BEEHIIV_PUBLICATION_ID = 'YOUR_PUBLICATION_ID';
  var BEEHIIV_BASE_URL       = 'https://invenew.beehiiv.com'; // replace with your actual Beehiiv URL
  var LOAD_TIMEOUT_MS        = 6000;

  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      var d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) { return dateStr; }
  }

  function renderIssues(issues) {
    var container = document.getElementById('newsletter-issues');
    if (!container) return;

    if (!issues || issues.length === 0) {
      showFallback();
      return;
    }

    var html = '<ul class="issue-list">';
    issues.slice(0, 10).forEach(function (issue) {
      var title = issue.subject || issue.title || 'INVENEW Intelligence';
      var date  = formatDate(issue.publish_date || issue.created || '');
      var url   = issue.web_url || issue.url || (BEEHIIV_BASE_URL + '/p/' + (issue.id || ''));
      html += '<li class="issue-item">' +
        '<div>' +
          '<div class="issue-title">' + escHtml(title) + '</div>' +
          (date ? '<div class="issue-date">' + escHtml(date) + '</div>' : '') +
        '</div>' +
        '<a href="' + escHtml(url) + '" target="_blank" rel="noopener" class="issue-link">Read &rarr;</a>' +
      '</li>';
    });
    html += '</ul>';
    container.innerHTML = html;
  }

  function showFallback() {
    var container = document.getElementById('newsletter-issues');
    var fallback  = document.getElementById('newsletter-fallback');
    if (container) container.innerHTML = '';
    if (fallback)  fallback.style.display = 'block';
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function loadIssues() {
    var container = document.getElementById('newsletter-issues');
    if (!container) return;

    // If no real publication ID configured, show fallback immediately
    if (BEEHIIV_PUBLICATION_ID === 'YOUR_PUBLICATION_ID') {
      container.innerHTML = '<p style="font-size:14px; color: var(--color-text-muted); padding: 12px 0;">' +
        'Configure your Beehiiv publication ID in <code>assets/js/newsletter.js</code> to load recent issues here.' +
      '</p>';
      return;
    }

    // Timeout fallback
    var timer = setTimeout(showFallback, LOAD_TIMEOUT_MS);

    // Beehiiv public posts endpoint
    var apiUrl = 'https://api.beehiiv.com/v2/publications/' + BEEHIIV_PUBLICATION_ID + '/posts?status=confirmed&limit=10';

    fetch(apiUrl)
      .then(function (res) {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(function (data) {
        clearTimeout(timer);
        renderIssues(data.data || data.posts || data);
      })
      .catch(function () {
        clearTimeout(timer);
        showFallback();
      });
  }

  document.addEventListener('DOMContentLoaded', loadIssues);

})();
