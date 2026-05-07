export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Метод не разрешён'
    });
  }

  try {
    let { username, password } = req.body || {};

    // защита от пробелов
    username = String(username || '').trim();
    password = String(password || '').trim();

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Заполните все поля'
      });
    }

    // загрузка users.json
    const response = await fetch(
      'https://raw.githubusercontent.com/andreq924-create/admin-panel/main/users.json?nocache=' + Date.now(),
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return res.status(500).json({
        success: false,
        message: 'Не удалось загрузить users.json'
      });
    }

    const users = await response.json();

    // поиск пользователя
    const user = users.find(u =>
      String(u.username).trim() === username &&
      String(u.password).trim() === password
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Неверный логин или пароль'
      });
    }

    return res.status(200).json({
      success: true,
      username: user.username,
      role: user.role || 'user'
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
}