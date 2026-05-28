// Vercel serverless function — proxies Beehiiv API so the key stays server-side
export default async function handler(req, res) {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId  = process.env.BEEHIIV_PUBLICATION_ID;

  if (!apiKey || !pubId) {
    return res.status(500).json({ error: 'Server configuration error: missing env vars' });
  }

  try {
    // Fetch 30 confirmed posts (newest first) with full free web content
    const apiUrl =
      `https://api.beehiiv.com/v2/publications/${pubId}/posts` +
      `?status=confirmed&limit=30&expand[]=free_web_content&order_by=publish_date&direction=desc`;

    const upstream = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept:        'application/json',
      },
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return res.status(upstream.status).json({ error: 'Beehiiv API error', detail: text });
    }

    const data = await upstream.json();

    // Cache at the edge for 5 minutes; serve stale while revalidating
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}
