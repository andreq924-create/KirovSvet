export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body;

    const { username, password } = body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
      return res.status(500).json({ error: 'Missing GITHUB_TOKEN' });
    }

    const REPO = 'andreq924-create/admin-panel';
    const FILE_PATH = 'users.json';
    const BRANCH = 'main';

    const getResponse = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'vercel-app'
        },
      }
    );

    if (!getResponse.ok) {
      const text = await getResponse.text();
      throw new Error(`Get file error: ${text}`);
    }

    const getData = await getResponse.json();
    const sha = getData.sha;

    const currentUsers = JSON.parse(
      Buffer.from(getData.content, 'base64').toString('utf8')
    );

    if (!Array.isArray(currentUsers)) {
      throw new Error('users.json is not an array');
    }

    const exists = currentUsers.find(user => user.username === username);

    if (exists) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    currentUsers.push({
      username,
      password
    });

    const content = Buffer.from(
      JSON.stringify(currentUsers, null, 2)
    ).toString('base64');

    const putResponse = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'vercel-app'
        },
        body: JSON.stringify({
          message: 'Update users.json via Vercel',
          content: content,
          sha: sha,
          branch: BRANCH,
        }),
      }
    );

    if (!putResponse.ok) {
      const text = await putResponse.text();
      throw new Error(`Update file error: ${text}`);
    }

    const data = await putResponse.json();

    return res.status(200).json(data);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}