// Vercel serverless function — fetches a single Sanity post by slug
export default async function handler(req, res) {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset   = process.env.SANITY_DATASET || 'production';
  const apiVer    = '2024-01-01';

  if (!projectId) {
    return res.status(500).json({ error: 'Missing SANITY_PROJECT_ID env var' });
  }

  const slug = (req.query.slug || '').trim();
  if (!slug) {
    return res.status(400).json({ error: 'Missing slug parameter' });
  }

  // Use GROQ $params to avoid injection
  const query = encodeURIComponent(
    '*[_type == "post" && slug.current == $slug][0] {' +
      '_id, title, slug, _createdAt, publishedAt,' +
      'body[]{' +
        '_type, _key, style, listItem, level,' +
        'children[]{ _key, text, marks },' +
        'markDefs[]{ _key, _type, href },' +
        '"imageUrl": asset->url' +
      '},' +
      '"category": categories[0]->{ title },' +
      '"tag": tags[0]->{ title },' +
      '"author": author->{ name },' +
      '"imageUrl": mainImage.asset->url' +
    '}'
  );

  const paramSlug = encodeURIComponent(JSON.stringify(slug));
  const url = `https://${projectId}.api.sanity.io/v${apiVer}/data/query/${dataset}` +
              `?query=${query}&%24slug=${paramSlug}`;

  try {
    const upstream = await fetch(url, { headers: { Accept: 'application/json' } });

    if (!upstream.ok) {
      const text = await upstream.text();
      return res.status(upstream.status).json({ error: 'Sanity API error', detail: text });
    }

    const data = await upstream.json();
    const post = data.result;

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Convert Portable Text blocks to safe HTML server-side
    post.bodyHtml = blocksToHtml(post.body || []);
    delete post.body; // don't send raw blocks to the client

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    return res.status(200).json({ result: post });
  } catch (err) {
    return res.status(500).json({ error: 'Internal error', detail: err.message });
  }
}

/* ── Portable Text → HTML ──────────────────────────────── */

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function applyMarks(text, marks, markDefs) {
  let out = escHtml(text);
  (marks || []).forEach(mark => {
    const def = (markDefs || []).find(d => d._key === mark);
    if (def && def._type === 'link') {
      out = `<a href="${escHtml(def.href)}" target="_blank" rel="noopener">${out}</a>`;
    } else if (mark === 'strong')    { out = `<strong>${out}</strong>`; }
    else if (mark === 'em')          { out = `<em>${out}</em>`; }
    else if (mark === 'code')        { out = `<code>${out}</code>`; }
    else if (mark === 'underline')   { out = `<u>${out}</u>`; }
    else if (mark === 'strike-through') { out = `<s>${out}</s>`; }
  });
  return out;
}

function blockText(block) {
  return (block.children || [])
    .map(c => applyMarks(c.text, c.marks, block.markDefs))
    .join('');
}

function blocksToHtml(blocks) {
  const out = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    // Image blocks
    if (block._type === 'image' && block.imageUrl) {
      out.push(`<img src="${escHtml(block.imageUrl)}" alt="" loading="lazy">`);
      i++;
      continue;
    }

    if (block._type !== 'block') { i++; continue; }

    // List items — collect consecutive items of the same type
    if (block.listItem) {
      const tag  = block.listItem === 'number' ? 'ol' : 'ul';
      const type = block.listItem;
      const items = [];
      while (i < blocks.length && blocks[i].listItem === type) {
        items.push(`<li>${blockText(blocks[i])}</li>`);
        i++;
      }
      out.push(`<${tag}>${items.join('')}</${tag}>`);
      continue;
    }

    const inner = blockText(block);
    const style = block.style || 'normal';

    if      (style === 'h1')         { out.push(`<h1>${inner}</h1>`); }
    else if (style === 'h2')         { out.push(`<h2>${inner}</h2>`); }
    else if (style === 'h3')         { out.push(`<h3>${inner}</h3>`); }
    else if (style === 'h4')         { out.push(`<h4>${inner}</h4>`); }
    else if (style === 'blockquote') { out.push(`<blockquote>${inner}</blockquote>`); }
    else if (inner.trim())           { out.push(`<p>${inner}</p>`); }

    i++;
  }

  return out.join('\n');
}
