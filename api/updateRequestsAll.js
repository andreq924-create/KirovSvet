export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO = 'andreq924-create/admin-panel';
  const FILE_PATH = 'requests_all.json';
  const BRANCH = 'main';

  try {
    const { request } = req.body; // 🔥 было requests

    if (!request) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // 1️⃣ Получаем файл
    const getResponse = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    let fileContent = [];

    if (getResponse.ok) {
      const getData = await getResponse.json();

      fileContent = JSON.parse(
        Buffer.from(getData.content, 'base64').toString('utf8')
      );
    }

    // 2️⃣ ДОБАВЛЯЕМ новую заявку
    fileContent.push(request);

    // 3️⃣ Сохраняем обратно
    const putResponse = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
        },
        body: JSON.stringify({
          message: 'Добавление новой заявки',
          content: Buffer.from(JSON.stringify(fileContent, null, 2)).toString('base64'),
          sha: (await getResponse.json().catch(() => ({})))?.sha,
          branch: BRANCH,
        }),
      }
    );

    if (!putResponse.ok) {
      const text = await putResponse.text();
      throw new Error(`Failed to update file: ${text}`);
    }

    const putData = await putResponse.json();

    return res.status(200).json(putData);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}