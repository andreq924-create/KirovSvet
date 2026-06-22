export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    if (!GITHUB_TOKEN) {
      return res.status(500).json({ error: 'Missing GITHUB_TOKEN' });
    }

    const REPO = 'andreq924-create/admin-panel';
    const FILE_PATH = 'requests_all.json';
    const BRANCH = 'main';

    const { username } = req.query;

    const response = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'vercel-app'
        }
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error('GitHub error:', text);
      return res.status(500).json({ error: 'GitHub fetch failed' });
    }

    const data = await response.json();

    // 🔥 защита от пустого файла
    if (!data.content) {
      return res.status(200).json([]);
    }

    let json;

    try {
      json = JSON.parse(
        Buffer.from(data.content, 'base64').toString('utf8')
      );
    } catch (e) {
      console.error('JSON parse error:', e);
      return res.status(200).json([]);
    }

    if (!Array.isArray(json)) {
      return res.status(200).json([]);
    }

    const normalize = (v) =>
      (v || '').toString().trim().toLowerCase();

    let result = json;

    if (username) {
      const u = normalize(username);
      result = json.filter(
        (r) => normalize(r.username) === u
      );
    }

    return res.status(200).json(result);

  } catch (err) {
    console.error('SERVER ERROR:', err);
    return res.status(500).json({ error: err.message });
  }
}