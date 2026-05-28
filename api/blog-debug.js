// Temporary debug endpoint — delete after use
export default async function handler(req, res) {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset   = process.env.SANITY_DATASET || 'production';

  const query = encodeURIComponent(
    'array::unique(*[]._type)'
  );

  const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`;

  try {
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    const d = await r.json();
    return res.status(200).json(d);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
