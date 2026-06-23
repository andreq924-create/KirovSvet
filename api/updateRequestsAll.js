export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO = 'andreq924-create/admin-panel';
  const FILE_PATH = 'requests_all.json';
  const BRANCH = 'main';

  try {
    const { request } = req.body;

    if (!request) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // 1. Получаем текущий файл
    const getResponse = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    if (!getResponse.ok) {
      throw new Error(await getResponse.text());
    }

    const fileData = await getResponse.json();

    const currentContent = JSON.parse(
      Buffer.from(fileData.content, 'base64').toString('utf-8')
    );

    // 2. Добавляем новую запись
    const updatedContent = Array.isArray(currentContent)
      ? [...currentContent, request]
      : [request];

    // 3. Обновляем файл
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
          content: Buffer.from(JSON.stringify(updatedContent, null, 2)).toString('base64'),
          sha: fileData.sha,
          branch: BRANCH,
        }),
      }
    );

    if (!putResponse.ok) {
      throw new Error(await putResponse.text());
    }

    const result = await putResponse.json();

    return res.status(200).json(result);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}