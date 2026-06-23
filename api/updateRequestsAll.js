export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO = 'andreq924-create/admin-panel';
  const FILE_PATH = 'requests_all.json';
  const BRANCH = 'main';

  try {
    const { request } = req.body; // 👈 ОДНА заявка

    if (!request || typeof request !== 'object') {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // 1️⃣ читаем файл
    const getResponse = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    let requests = [];
    let sha = null;

    if (getResponse.ok) {
      const getData = await getResponse.json();
      sha = getData.sha;

      const content = Buffer.from(getData.content, 'base64').toString();
      requests = JSON.parse(content || "[]");
    }

    // 2️⃣ ДОБАВЛЯЕМ новую заявку
    requests.push(request);

    // 3️⃣ записываем обратно
    const putResponse = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
        },
        body: JSON.stringify({
          message: 'Добавлена новая заявка',
          content: Buffer.from(JSON.stringify(requests, null, 2)).toString('base64'),
          sha: sha,
          branch: BRANCH,
        }),
      }
    );

    const putData = await putResponse.json();

    return res.status(200).json(putData);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}