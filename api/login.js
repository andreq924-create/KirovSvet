export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Метод не разрешён'
    });
  }

  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Заполните все поля'
      });
    }

    // Тестовые пользователи
    const users = [
      {
        username: 'Admin',
        password: 'Admin',
        role: 'admin'
      },
      {
        username: '111',
        password: '111',
        role: 'user'
      }
    ];

    const user = users.find(
      u =>
        u.username === username &&
        u.password === password
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
      role: user.role
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
}