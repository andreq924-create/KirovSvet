export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // Только POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Метод не разрешён'
    });
  }

  try {
    // Получаем данные
    const { username, password } = req.body;

    // Проверка
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Заполните все поля'
      });
    }

    // Загружаем users.json из GitHub
    const response = await fetch(
      'https://raw.githubusercontent.com/andreq924-create/admin-panel/main/users.json'
    );

    // Если ошибка загрузки
    if (!response.ok) {
      return res.status(500).json({
        success: false,
        message: 'Не удалось загрузить users.json'
      });
    }

    // Получаем пользователей
    const users = await response.json();

    // Ищем пользователя
    const user = users.find(
      u =>
        u.username === username &&
        u.password === password
    );

    // Если не найден
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Неверный логин или пароль'
      });
    }

    // Успешный вход
    return res.status(200).json({
      success: true,
      username: user.username
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
}