export default async function handler(req, res) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO = 'andreq924-create/admin-panel';
  const FILE_PATH = 'warehouse.json';
  const BRANCH = 'main';

  try {
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
      const text = await getResponse.text();
      throw new Error(`Failed to get file: ${text}`);
    }

    const data = await getResponse.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    const warehouse = JSON.parse(content);

    return res.status(200).json({ warehouse });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}