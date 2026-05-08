export default async function handler(req, res) {

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {

    const response = await fetch(
      'https://raw.githubusercontent.com/andreq924-create/admin-panel/main/requests_all.json',
      {
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    );

    if (!response.ok) {

      return res.status(500).json({
        error: 'Не удалось загрузить requests_all.json'
      });
    }

    const text = await response.text();

    let requests;

    try {

      requests = JSON.parse(text);

    } catch (e) {

      console.error('Ошибка JSON:', e);
      console.log(text);

      return res.status(500).json({
        error: 'Файл requests_all.json поврежден'
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