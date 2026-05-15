export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Метод не разрешён'
    });
  }

  try {
    let { username, password } = req.body || {};

    username = String(username || '').trim();
    password = String(password || '').trim();

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Заполните все поля'
      });
    }

    const url = 'https://api.github.com/repos/andreq924-create/admin-panel/contents/users.json?ref=main';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'User-Agent': 'admin-panel-login'
      }
    });

    if (!response.ok) {
      return res.status(500).json({
        success: false,
        message: 'Не удалось загрузить users.json'
      });
    }

    const data = await response.json();

    if (!data.content) {
      return res.status(500).json({
        success: false,
        message: 'Файл users.json пустой или недоступен'
      });
    }

    const jsonString = Buffer.from(
      data.content.replace(/\n/g, ''),
      'base64'
    ).toString('utf8');

    const users = JSON.parse(jsonString);

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