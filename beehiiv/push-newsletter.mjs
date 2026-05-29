/**
 * push-newsletter.mjs
 * Reads every newsletter folder under beehiiv/newsletters/ on GitHub,
 * converts body.md → HTML, and creates a DRAFT post in Beehiiv.
 * Already-pushed newsletters (matched by title) are skipped.
 *
 * Expected folder structure:
 *   beehiiv/newsletters/<slug>/
 *     payload.json   ← metadata
 *     body.md        ← newsletter body in Markdown
 *
 * Usage: node beehiiv/push-newsletter.mjs
 */

import { randomBytes } from 'crypto';

// ── Credentials (env vars → local fallback) ──────────────────────────────────
const BEEHIIV_API_KEY        = process.env.BEEHIIV_API_KEY;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;
const BEEHIIV_API_VER        = 'v2';
const BEEHIIV_BASE           = `https://api.beehiiv.com/${BEEHIIV_API_VER}`;

if (!BEEHIIV_API_KEY)        { console.error('❌ Missing BEEHIIV_API_KEY');        process.exit(1); }
if (!BEEHIIV_PUBLICATION_ID) { console.error('❌ Missing BEEHIIV_PUBLICATION_ID'); process.exit(1); }

// ── Defaults (from your setup answers) ───────────────────────────────────────
const DEFAULTS = {
  authors:        ['Qamar Zia'],
  status:         'draft',
  emailEnabled:   true,
  webEnabled:     true,
  ctaUrl:         'https://invenew.com/sponsors',
};

const GITHUB_API = 'https://api.github.com/repos/QZIA/invenew/contents/beehiiv/newsletters';
const GITHUB_RAW = 'https://raw.githubusercontent.com/QZIA/invenew/main/beehiiv/newsletters/';

// ── Markdown → email-safe HTML ────────────────────────────────────────────────

/** Escape HTML special chars */
function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Process inline markdown: **bold**, *em*, `code`, [link](url) */
function inline(text) {
  return esc(text)
    // unescape temporarily to handle already-escaped HTML from esc()
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => `<a href="${u}">${t}</a>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em>$1</em>')
    .replace(/`([^`]+)`/g,     '<code>$1</code>');
}

/** Convert Markdown string → HTML suitable for Beehiiv email/web */
function mdToHtml(md) {
  const lines = md.split('\n');
  const out   = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headings
    const hm = line.match(/^(#{1,4})\s+(.*)/);
    if (hm) {
      const level = hm[1].length;
      out.push(`<h${level}>${inline(hm[2])}</h${level}>`);
      i++; continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      out.push('<hr>');
      i++; continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        rows.push(`<p>${inline(lines[i].slice(2))}</p>`);
        i++;
      }
      out.push(`<blockquote>${rows.join('')}</blockquote>`);
      continue;
    }

    // Bullet list
    if (/^[-*]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^[-*]\s/, ''))}</li>`);
        i++;
      }
      out.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\d+\.\s/, ''))}</li>`);
        i++;
      }
      out.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    // Blank line
    if (line.trim() === '') { i++; continue; }

    // Paragraph — collect consecutive non-special lines
    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^#{1,4}\s|^[-*]\s|^\d+\.\s|^>\s|^(-{3,}|\*{3,}|_{3,})$/.test(lines[i])
    ) {
      para.push(lines[i].trim());
      i++;
    }
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
  }

  return out.join('\n');
}

/** Wrap body HTML with a default CTA footer */
function wrapWithCta(bodyHtml, ctaUrl) {
  return bodyHtml + `
<hr>
<p style="text-align:center;font-size:13px;color:#888888;">
  Want to reach AI-native infrastructure decision-makers?<br>
  <a href="${ctaUrl}">Partner with INVENEW →</a>
</p>`;
}

// ── Beehiiv helpers ───────────────────────────────────────────────────────────

async function beehiivGet(path) {
  const r = await fetch(`${BEEHIIV_BASE}${path}`, {
    headers: { Authorization: `Bearer ${BEEHIIV_API_KEY}`, Accept: 'application/json' },
  });
  if (!r.ok) throw new Error(`Beehiiv GET ${path} → ${r.status}`);
  return r.json();
}

async function beehiivPost(path, body) {
  const r = await fetch(`${BEEHIIV_BASE}${path}`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${BEEHIIV_API_KEY}`,
      'Content-Type': 'application/json',
      Accept:         'application/json',
    },
    body: JSON.stringify(body),
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Beehiiv POST ${path} → ${r.status}: ${JSON.stringify(json)}`);
  return json;
}

/** Fetch all existing post titles from Beehiiv (confirmed + draft) */
async function fetchExistingTitles() {
  const titles = new Set();
  for (const status of ['confirmed', 'draft']) {
    try {
      const data = await beehiivGet(
        `/publications/${BEEHIIV_PUBLICATION_ID}/posts?limit=100&status=${status}`
      );
      (data.data || []).forEach(p => {
        if (p.title) titles.add(p.title.trim().toLowerCase());
      });
    } catch (e) {
      // ignore if a status type returns an error
    }
  }
  return titles;
}

// ── Push a single newsletter ──────────────────────────────────────────────────

async function pushNewsletter(folder, existingTitles) {
  // Fetch payload.json
  const payloadResp = await fetch(`${GITHUB_RAW}${folder}/payload.json`);
  if (!payloadResp.ok) {
    console.log(`  ⚠️  No payload.json in ${folder} — skipping`);
    return false;
  }
  const payload = await payloadResp.json();

  // Fetch body.md
  const bodyResp = await fetch(`${GITHUB_RAW}${folder}/body.md`);
  if (!bodyResp.ok) {
    console.log(`  ⚠️  No body.md in ${folder} — skipping`);
    return false;
  }
  const bodyMd = await bodyResp.text();

  // Skip if already in Beehiiv
  if (existingTitles.has(payload.title?.trim().toLowerCase())) {
    console.log(`  ⏭  Already in Beehiiv: "${payload.title}"`);
    return false;
  }

  // Convert markdown → HTML
  const bodyHtml = wrapWithCta(mdToHtml(bodyMd), payload.ctaUrl || DEFAULTS.ctaUrl);

  // Build the Beehiiv post payload
  const post = {
    title:         payload.title,
    subtitle:      payload.subtitle      || undefined,
    preview_text:  payload.previewText   || payload.subtitle || undefined,
    authors:       payload.authors       || DEFAULTS.authors,
    status:        DEFAULTS.status,                // always 'draft'
    email_enabled: DEFAULTS.emailEnabled,
    web_enabled:   DEFAULTS.webEnabled,
    content_tags:  payload.tags          || [],
    thumbnail_url: payload.thumbnailUrl  || undefined,
    content: {
      free: {
        web:   bodyHtml,
        email: bodyHtml,
      },
    },
  };

  // Remove undefined fields
  Object.keys(post).forEach(k => post[k] === undefined && delete post[k]);

  const result = await beehiivPost(
    `/publications/${BEEHIIV_PUBLICATION_ID}/posts`,
    post
  );

  const postId  = result?.data?.id  || result?.id  || '?';
  const postUrl = result?.data?.url || result?.url || '';
  console.log(`  ✅ Draft created: "${payload.title}"`);
  console.log(`     Beehiiv ID: ${postId}`);
  if (postUrl) console.log(`     URL: ${postUrl}`);
  return true;
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log('Fetching newsletter folders from GitHub…');
const listResp = await fetch(GITHUB_API);
if (!listResp.ok) {
  // Might be an empty / not-yet-created directory
  if (listResp.status === 404) {
    console.log('ℹ️  beehiiv/newsletters/ folder not found on GitHub yet — nothing to push.');
    process.exit(0);
  }
  console.error('GitHub API error:', listResp.status);
  process.exit(1);
}

const entries = await listResp.json();
const folders = entries.filter(e => e.type === 'dir').map(e => e.name);
console.log(`Found ${folders.length} newsletter folder(s).\n`);

if (folders.length === 0) {
  console.log('No newsletter folders found — nothing to push.');
  process.exit(0);
}

console.log('Fetching existing Beehiiv posts…');
const existingTitles = await fetchExistingTitles();
console.log(`${existingTitles.size} post(s) already in Beehiiv.\n`);

let pushed = 0;
for (const folder of folders) {
  try {
    const ok = await pushNewsletter(folder, existingTitles);
    if (ok) pushed++;
  } catch (err) {
    console.error(`  ❌ Error pushing "${folder}":`, err.message);
  }
}

console.log(`\nDone — ${pushed} new newsletter(s) pushed to Beehiiv as drafts.`);
