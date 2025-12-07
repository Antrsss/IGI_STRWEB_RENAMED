const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Проверяем наличие токена в заголовках
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Доступ запрещен. Требуется авторизация.' 
      });
    }

    // 2. Извлекаем токен
    const token = authHeader.replace('Bearer ', '');
    
    // 3. Верифицируем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Ищем пользователя в базе
    const user = await User.findById(decoded.userId)
      .select('-password -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Аккаунт деактивирован' });
    }

    // 5. Добавляем пользователя в запрос
    req.user = user;
    req.token = token;
    
    // 6. Обновляем время последнего входа (раз в день)
    const now = new Date();
    const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
    
    if (!lastLogin || (now - lastLogin) > 24 * 60 * 60 * 1000) {
      user.lastLogin = now;
      await user.save();
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Неверный токен' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Срок действия токена истек' });
    }
    
    res.status(500).json({ error: 'Ошибка сервера при аутентификации' });
  }
};

// Middleware для проверки ролей
const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Доступ запрещен. Недостаточно прав.' 
      });
    }

    next();
  };
};

module.exports = { authMiddleware, roleMiddleware };