// Vercel serverless function — proxies Sanity GROQ query server-side
export default async function handler(req, res) {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset   = process.env.SANITY_DATASET || 'production';
  const apiVer    = '2024-01-01';

  if (!projectId) {
    return res.status(500).json({ error: 'Missing SANITY_PROJECT_ID env var' });
  }

  // Fetch latest 30 posts ordered by creation date, include raw body blocks for preview
  const query = encodeURIComponent(
    '*[_type == "post"] | order(_createdAt desc) [0..29] {' +
      '_id, title, slug, excerpt, description, summary,' +
      '_createdAt, publishedAt,' +
      'body[]{ _type, children[]{ text } },' +
      '"category": categories[0]->{ title, "slug": slug.current },' +
      '"tag": tags[0]->{ title, "slug": slug.current },' +
      '"author": author->{ name },' +
      '"imageUrl": mainImage.asset->url' +
    '}'
  );

  const url = `https://${projectId}.api.sanity.io/v${apiVer}/data/query/${dataset}?query=${query}`;

  try {
    const upstream = await fetch(url, {
      headers: { Accept: 'application/json' },
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return res.status(upstream.status).json({ error: 'Sanity API error', detail: text });
    }

    const data = await upstream.json();

    // Extract plain-text preview from Portable Text body blocks
    if (Array.isArray(data.result)) {
      data.result = data.result.map(post => {
        if (!post.excerpt && !post.description && !post.summary && Array.isArray(post.body)) {
          const text = post.body
            .filter(b => b._type === 'block' && Array.isArray(b.children))
            .map(b => b.children.map(c => c.text || '').join(''))
            .join(' ')
            .trim();
          post.bodyPreview = text.length > 280 ? text.slice(0, 280) + '…' : text;
        }
        delete post.body; // don't send full body to client
        return post;
      });
    }

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Internal error', detail: err.message });
  }
}
