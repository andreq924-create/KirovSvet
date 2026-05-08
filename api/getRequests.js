export default async function handler(req, res) {
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/andreq924-create/admin-panel/main/requests_all.json'
    );

    if (!response.ok) {
      return res.status(500).json({
        error: 'Не удалось загрузить requests_all.json'
      });
    }

    const text = await response.text();

    let requests = [];

    try {
      const cleanText = text.replace(/^\uFEFF/, '');
      requests = JSON.parse(cleanText);
    } catch (e) {
      console.error('JSON parse error:', e);
      return res.status(500).json({
        error: 'Ошибка чтения JSON'
      });
    }

    return res.status(200).json(requests);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Ошибка сервера'
    });
  }
}