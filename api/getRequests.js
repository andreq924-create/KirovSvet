export default async function handler(req, res) {

  try {

    // Получаем username
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        error: 'Username required'
      });
    }

    // Загружаем requests_all.json
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

      requests = JSON.parse(text);

    } catch (e) {

      return res.status(500).json({
        error: 'Ошибка чтения JSON'
      });

    }

    // Только заявки пользователя
    const filteredRequests = requests.filter(
      request => request.username === username
    );

    return res.status(200).json(filteredRequests);

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: err.message
    });

  }

}