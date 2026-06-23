export default async function createRequest(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO = 'andreq924-create/admin-panel';
  const FILE_PATH = 'requests_all.json';
  const BRANCH = 'main';

  try {
    const newRequest = req.body;

    if (!newRequest) {
      return res.status(400).json({ error: 'No request data' });
    }

    // 1. читаем текущий файл
    const getResponse = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    let currentRequests = [];
    let sha = null;

    if (getResponse.ok) {
      const getData = await getResponse.json();

      if (getData.content) {
        currentRequests = JSON.parse(
          Buffer.from(getData.content, 'base64').toString('utf-8')
        );
      }

      sha = getData.sha;
    }

    // 2. добавляем новую заявку
    const updatedRequests = [...currentRequests, newRequest];

    // 3. сохраняем обратно
    const putResponse = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
        },
        body: JSON.stringify({
          message: 'Add new request',
          content: Buffer.from(
            JSON.stringify(updatedRequests, null, 2)
          ).toString('base64'),
          sha: sha || undefined,
          branch: BRANCH,
        }),
      }
    );

    const result = await putResponse.json();

    return res.status(200).json({
      success: true,
      result,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}