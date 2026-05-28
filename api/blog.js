// Vercel serverless function — proxies Sanity GROQ query server-side
export default async function handler(req, res) {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset   = process.env.SANITY_DATASET || 'production';
  const apiVer    = '2024-01-01';

  if (!projectId) {
    return res.status(500).json({ error: 'Missing SANITY_PROJECT_ID env var' });
  }

  // Fetch latest 30 posts ordered by creation date
  const query = encodeURIComponent(
    '*[_type == "post"] | order(_createdAt desc) [0..29] {' +
      '_id, title, slug, excerpt, description, summary,' +
      '_createdAt, publishedAt,' +
      '"bodyPreview": pt::text(body)[0..300],' +
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
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Internal error', detail: err.message });
  }
}
