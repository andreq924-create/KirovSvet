export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO = 'andreq924-create/admin-panel';
  const OWNER = 'andreq924-create';
  const FILE_PATH = 'warehouse.json';
  const BRANCH = 'main';

  try {
    const { warehouse } = req.body;

    if (!warehouse) {
      return res.status(400).json({ error: 'No warehouse data provided' });
    }

    const headers = {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
    };

    // 1️⃣ Получаем последний commit на ветке main
    const refRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`,
      { headers }
    );
    if (!refRes.ok) throw new Error(`Failed to get branch ref: ${await refRes.text()}`);
    const refData = await refRes.json();
    const latestCommitSha = refData.object.sha;

    // 2️⃣ Получаем дерево последнего коммита
    const commitRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/commits/${latestCommitSha}`,
      { headers }
    );
    if (!commitRes.ok) throw new Error(`Failed to get commit: ${await commitRes.text()}`);
    const commitData = await commitRes.json();
    const baseTreeSha = commitData.tree.sha;

    // 3️⃣ Создаём новый blob с содержимым warehouse.json
    const blobRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/blobs`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: JSON.stringify(warehouse, null, 2),
          encoding: 'utf-8',
        }),
      }
    );
    if (!blobRes.ok) throw new Error(`Failed to create blob: ${await blobRes.text()}`);
    const blobData = await blobRes.json();

    // 4️⃣ Создаём новое дерево на основе предыдущего, заменяя только warehouse.json
    const treeRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/trees`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          base_tree: baseTreeSha,
          tree: [
            {
              path: FILE_PATH,
              mode: '100644',
              type: 'blob',
              sha: blobData.sha,
            },
          ],
        }),
      }
    );
    if (!treeRes.ok) throw new Error(`Failed to create tree: ${await treeRes.text()}`);
    const treeData = await treeRes.json();

    // 5️⃣ Создаём новый коммит
    const commitRes2 = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/commits`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: 'Обновление warehouse.json через Git Data API',
          tree: treeData.sha,
          parents: [latestCommitSha],
        }),
      }
    );
    if (!commitRes2.ok) throw new Error(`Failed to create commit: ${await commitRes2.text()}`);
    const newCommitData = await commitRes2.json();

    // 6️⃣ Обновляем ветку main на новый коммит
    const updateRefRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ sha: newCommitData.sha }),
      }
    );
    if (!updateRefRes.ok) throw new Error(`Failed to update branch: ${await updateRefRes.text()}`);

    return res.status(200).json({ ok: true, commitSha: newCommitData.sha });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}