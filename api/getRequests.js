export default async function handler(req, res) {

  try {

    // Загружаем requests_all.json с GitHub
    const response = await fetch(
      'https://raw.githubusercontent.com/andreq924-create/admin-panel/main/requests_all.json'
    );

    // Проверка загрузки
    if (!response.ok) {

      return res.status(500).json({
        error: 'Не удалось загрузить requests_all.json'
      });

    }

    // Получаем текст файла
    const text = await response.text();

    let requests = [];

    // Парсим JSON
    try {

      requests = JSON.parse(text);

    } catch (e) {

      return res.status(500).json({
        error: 'Ошибка чтения JSON'
      });

    }

    // Возвращаем заявки
    return res.status(200).json(requests);

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: err.message
    });

  }

}