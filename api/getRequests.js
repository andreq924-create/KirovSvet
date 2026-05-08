export default async function handler(req, res) {
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/andreq924-create/admin-panel/main/requests_all.json'
    );

    if (!response.ok) {
      return res.status(500).json({
        error: 'Не удалось загрузить заявки'
      });
    }

    const requests = await response.json();

    return res.status(200).json(requests);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Ошибка сервера'
    });
  }
}