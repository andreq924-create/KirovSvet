export default async function handler(req, res) {
  try {

    const { username } = req.query;

    const response = await fetch(
      'https://raw.githubusercontent.com/andreq924-create/admin-panel/main/requests_all.json'
    );

    if (!response.ok) {
      return res.status(500).json({
        error: 'GitHub файл недоступен'
      });
    }

    let text = await response.text();

    // 🔥 ФИКС: убираем лишние запятые перед } и ]
    text = text
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']');

    let data;

    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        error: 'JSON всё ещё сломан',
        raw: text.slice(0, 300)
      });
    }

    if (!Array.isArray(data)) {
      return res.status(500).json({
        error: 'JSON должен быть массивом'
      });
    }

    const filtered = username
      ? data.filter(r => r.username === username)
      : data;

    return res.status(200).json(filtered);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message
    });
  }
}