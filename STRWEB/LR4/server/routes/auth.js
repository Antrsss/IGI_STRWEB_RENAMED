const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Employee = require('../models/Employee');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Регистрация пользователя
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, role } = req.body;

    // Проверка существования пользователя
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Пользователь с таким email или именем уже существует' 
      });
    }

    // Создание нового пользователя
    const user = new User({
      email,
      password,
      username: username || email.split('@')[0],
      role: role || 'user',
      emailVerified: false
    });

    await user.save();

    // Если роль employee, создаем профиль сотрудника
    let employeeProfile = null;
    if (role === 'employee') {
      const employee = new Employee({
        firstName: user.username,
        lastName: 'Пользователь',
        position: 'Смотритель',
        email: user.email,
        isActive: true
      });
      
      await employee.save();
      user.employeeProfile = employee._id;
      await user.save();
      employeeProfile = employee;
    }

    // Генерация токена
    const token = user.generateAuthToken();

    // Отправка ответа
    res.status(201).json({
      message: 'Регистрация успешна',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        employeeProfile: employeeProfile
      },
      token,
      tokenExpires: '7d'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      error: error.message || 'Ошибка при регистрации' 
    });
  }
});

// Вход пользователя
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Поиск пользователя
    const user = await User.findOne({ email })
      .populate('employeeProfile', 'firstName lastName position');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Неверный email или пароль' 
      });
    }

    // Проверка активности аккаунта
    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Аккаунт деактивирован. Обратитесь к администратору.' 
      });
    }

    // Проверка пароля (только для локальных пользователей)
    if (user.password) {
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          error: 'Неверный email или пароль' 
        });
      }
    } else {
      // Пользователь зарегистрирован через OAuth
      return res.status(401).json({ 
        error: 'Этот аккаунт использует вход через Google. Пожалуйста, войдите через Google.' 
      });
    }

    // Обновление времени последнего входа
    user.lastLogin = new Date();
    await user.save();

    // Генерация токена
    const token = user.generateAuthToken();

    res.json({
      message: 'Вход выполнен успешно',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        role: user.role,
        employeeProfile: user.employeeProfile
      },
      token,
      tokenExpires: '7d'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера при входе' 
    });
  }
});

// Получение профиля текущего пользователя
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .populate('employeeProfile');

    res.json({
      user,
      permissions: getPermissionsByRole(user.role)
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении профиля' });
  }
});

// Обновление профиля
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['username', 'avatar'];
    
    // Фильтруем разрешенные поля
    Object.keys(updates).forEach(key => {
      if (!allowedUpdates.includes(key)) {
        delete updates[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');

    res.json({
      message: 'Профиль обновлен',
      user
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Смена пароля
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.password) {
      return res.status(400).json({ 
        error: 'У этого аккаунта нет пароля (используется OAuth)' 
      });
    }

    // Проверка текущего пароля
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({ error: 'Неверный текущий пароль' });
    }

    // Установка нового пароля
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Выход (на клиенте просто удалить токен)
router.post('/logout', authMiddleware, async (req, res) => {
  // В JWT реализации выход происходит на клиенте
  // Здесь можно добавить логику для blacklist токенов при необходимости
  res.json({ message: 'Выход выполнен успешно' });
});

// Проверка токена
router.post('/verify-token', authMiddleware, (req, res) => {
  res.json({ 
    valid: true, 
    user: req.user,
    permissions: getPermissionsByRole(req.user.role)
  });
});

// Функция для получения разрешений по роли
function getPermissionsByRole(role) {
  const permissions = {
    user: ['view:animals', 'view:enclosures', 'view:employees'],
    employee: ['view:animals', 'view:enclosures', 'view:employees', 
               'edit:animals', 'create:feedings', 'view:feedings'],
    admin: ['view:*', 'edit:*', 'create:*', 'delete:*', 'manage:users']
  };
  
  return permissions[role] || permissions.user;
}

module.exports = router;