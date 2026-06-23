export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO = 'andreq924-create/admin-panel';
  const FILE_PATH = 'requests_all.json';
  const BRANCH = 'main';

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'GITHUB_TOKEN is not set' });
  }

  try {
    const newRequest = req.body;

    if (!newRequest || typeof newRequest !== 'object') {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // 1) читаем файл с GitHub
    const getRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    let requests = [];
    let sha = undefined;

    if (getRes.ok) {
      const data = await getRes.json();
      sha = data.sha;

      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      requests = JSON.parse(content || '[]');
    } else if (getRes.status !== 404) {
      const errText = await getRes.text();
      return res.status(getRes.status).json({
        error: 'Failed to read GitHub file',
        details: errText,
      });
    }

    // 2) добавляем новую заявку
    const requestToSave = {
      ...newRequest,
      id: Date.now(),
    };

    requests.push(requestToSave);

    // 3) сохраняем обратно в GitHub
    const putRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'New request added',
          content: Buffer.from(JSON.stringify(requests, null, 2)).toString('base64'),
          branch: BRANCH,
          ...(sha ? { sha } : {}),
        }),
      }
    );

    const result = await putRes.json();

    if (!putRes.ok) {
      return res.status(putRes.status).json({
        error: 'Failed to update GitHub file',
        details: result,
      });
    }

    return res.status(200).json({
      ok: true,
      savedRequest: requestToSave,
      github: result,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}