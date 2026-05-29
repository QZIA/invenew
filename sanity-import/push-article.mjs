/**
 * push-article.mjs
 * Reads the article JSON, converts markdown body to Portable Text,
 * and creates the post document in Sanity via the Mutations API.
 *
 * Usage: node sanity-import/push-article.mjs
 */

import { readFileSync } from 'fs';
import { randomBytes } from 'crypto';

const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || 'kjneu2g3';
const SANITY_DATASET    = process.env.SANITY_DATASET    || 'production';
const SANITY_API_VER    = '2024-01-01';
const SANITY_TOKEN      = process.env.SANITY_AUTH_TOKEN || process.env.SANITY_TOKEN;

if (!SANITY_TOKEN) {
  console.error('Missing SANITY_AUTH_TOKEN or SANITY_TOKEN environment variable');
  process.exit(1);
}

// Known IDs from Sanity
const AUTHOR_ID   = '324be14f-136c-4413-877e-27828c5cb245'; // Qamar Zia
const CATEGORY_ID = '0fc9427c-2db5-4ed1-a72d-f00bb051ca51'; // AI Strategy

// ── helpers ─────────────────────────────────────────────────────────────────

function key(prefix = 'k') {
  return prefix + randomBytes(6).toString('hex');
}

/** Split text with **bold** and *em* marks into annotated spans */
function parseInline(text, markDefs) {
  const spans = [];
  // Simple regex: handle **bold**, *em*, `code`
  const re = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      spans.push({ _type: 'span', _key: key('s'), text: text.slice(last, m.index), marks: [] });
    }
    if (m[1]) { // **bold**
      spans.push({ _type: 'span', _key: key('s'), text: m[2], marks: ['strong'] });
    } else if (m[3]) { // *em*
      spans.push({ _type: 'span', _key: key('s'), text: m[4], marks: ['em'] });
    } else if (m[5]) { // `code`
      spans.push({ _type: 'span', _key: key('s'), text: m[6], marks: [] });
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    spans.push({ _type: 'span', _key: key('s'), text: text.slice(last), marks: [] });
  }
  if (spans.length === 0) {
    spans.push({ _type: 'span', _key: key('s'), text, marks: [] });
  }
  return spans;
}

function makeBlock(style, text, markDefs = [], extra = {}) {
  return {
    _type: 'block',
    _key: key('b'),
    style,
    markDefs,
    children: parseInline(text, markDefs),
    ...extra,
  };
}

/** Convert markdown string to Sanity Portable Text blocks */
function markdownToPortableText(md) {
  const lines  = md.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headings
    const h4 = line.match(/^####\s+(.*)/);
    const h3 = line.match(/^###\s+(.*)/);
    const h2 = line.match(/^##\s+(.*)/);
    const h1 = line.match(/^#\s+(.*)/);

    if (h4) { blocks.push(makeBlock('h4', h4[1])); i++; continue; }
    if (h3) { blocks.push(makeBlock('h3', h3[1])); i++; continue; }
    if (h2) { blocks.push(makeBlock('h2', h2[1])); i++; continue; }
    if (h1) { blocks.push(makeBlock('h1', h1[1])); i++; continue; }

    // Bullet list items (- or *)
    const ul = line.match(/^[-*]\s+(.*)/);
    if (ul) {
      blocks.push(makeBlock('normal', ul[1], [], { listItem: 'bullet', level: 1 }));
      i++;
      continue;
    }

    // Numbered list items
    const ol = line.match(/^\d+\.\s+(.*)/);
    if (ol) {
      blocks.push(makeBlock('normal', ol[1], [], { listItem: 'number', level: 1 }));
      i++;
      continue;
    }

    // Blank line — skip
    if (line.trim() === '') { i++; continue; }

    // Regular paragraph — collect consecutive non-special lines
    const paraLines = [];
    while (i < lines.length) {
      const pl = lines[i];
      if (pl.trim() === '') break;
      if (/^#{1,4}\s/.test(pl)) break;
      if (/^[-*]\s/.test(pl)) break;
      if (/^\d+\.\s/.test(pl)) break;
      paraLines.push(pl.trim());
      i++;
    }
    const paraText = paraLines.join(' ');
    if (paraText) {
      blocks.push(makeBlock('normal', paraText));
    }
  }

  return blocks;
}

// ── helpers ──────────────────────────────────────────────────────────────────

async function pushArticle(article, existingSlugs) {
  if (existingSlugs.has(article.slug)) {
    console.log(`  ⏭  Skipping (already in Sanity): "${article.title}"`);
    return null;
  }

  const bodyBlocks = markdownToPortableText(article.body);

  const docId = 'drafts.' + randomBytes(12).toString('hex');
  const doc = {
    _id:   docId,
    _type: 'post',
    title: article.title,
    slug:  { _type: 'slug', current: article.slug },
    publishedAt: new Date().toISOString(),
    author:     { _type: 'reference', _ref: AUTHOR_ID },
    categories: [{ _type: 'reference', _ref: CATEGORY_ID, _key: key('cat') }],
    body: bodyBlocks,
  };

  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VER}/data/mutate/${SANITY_DATASET}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SANITY_TOKEN}` },
    body: JSON.stringify({ mutations: [{ createOrReplace: doc }] }),
  });

  const result = await resp.json();
  if (!resp.ok) {
    console.error(`  ❌ Failed: "${article.title}"`, JSON.stringify(result));
    return null;
  }

  console.log(`  ✅ Pushed (${bodyBlocks.length} blocks): "${article.title}"`);
  console.log(`     Draft: https://invenew-blog.sanity.studio/structure/post;${docId}`);
  return docId;
}

// ── main ─────────────────────────────────────────────────────────────────────

const GITHUB_API = 'https://api.github.com/repos/QZIA/invenew/contents/sanity-import/articles';
const GITHUB_RAW = 'https://raw.githubusercontent.com/QZIA/invenew/main/sanity-import/articles/';

// 1. Fetch list of JSON files from GitHub
console.log('Fetching article list from GitHub…');
const listResp = await fetch(GITHUB_API);
if (!listResp.ok) { console.error('GitHub API error', listResp.status); process.exit(1); }
const files = (await listResp.json()).filter(f => f.name.endsWith('.json'));
console.log(`Found ${files.length} article(s) on GitHub.\n`);

// 2. Fetch existing slugs from Sanity
const queryUrl = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VER}/data/query/${SANITY_DATASET}`
               + `?query=*%5B_type%3D%3D%22post%22%5D%7B%22slug%22%3Aslug.current%7D`;
const sanityResp = await fetch(queryUrl, { headers: { Authorization: `Bearer ${SANITY_TOKEN}` } });
const sanityData = await sanityResp.json();
const existingSlugs = new Set((sanityData.result || []).map(p => p.slug));
console.log(`${existingSlugs.size} post(s) already in Sanity.\n`);

// 3. Fetch and push each article
let pushed = 0;
for (const file of files) {
  const raw = await fetch(GITHUB_RAW + file.name);
  if (!raw.ok) { console.error(`  ⚠️  Could not fetch ${file.name}`); continue; }
  const article = await raw.json();
  const id = await pushArticle(article, existingSlugs);
  if (id) pushed++;
}

console.log(`\nDone — ${pushed} new article(s) pushed to Sanity.`);