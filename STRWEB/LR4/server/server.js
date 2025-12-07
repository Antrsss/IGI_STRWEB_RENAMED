const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const fs = require('fs');
const path = require('path');

// === ЖЕСТКАЯ ЗАГРУЗКА .env ===
const envPath = path.join(__dirname, '.env');
console.log('=== ДИАГНОСТИКА ===');
console.log('Директория:', __dirname);
console.log('Путь к .env:', envPath);

// Проверяем файл
if (fs.existsSync(envPath)) {
  console.log('✅ .env файл найден');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('Содержимое .env:');
  console.log(envContent);
  
  // Принудительно парсим .env
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        process.env[key.trim()] = value;
        console.log(`📦 Установлено: ${key.trim()} = ${value.substring(0, 10)}...`);
      }
    }
  });
} else {
  console.log('❌ .env файл не найден!');
}

// Альтернативно используем dotenv с абсолютным путем
require('dotenv').config({ path: envPath });

console.log('\n=== ПРОВЕРКА ПЕРЕМЕННЫХ ===');
console.log('PORT:', process.env.PORT || 'undefined');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Загружен' : '❌ Отсутствует');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Загружен' : '❌ Отсутствует');
console.log('GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL || 'undefined');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Загружен' : '❌ Отсутствует');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Сессии (для Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'zoo_management_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 день
  }
}));

// Инициализация Passport
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zoo_management')
  .then(() => console.log('✅ MongoDB подключен успешно'))
  .catch(err => console.error('❌ Ошибка подключения MongoDB:', err));

// Маршруты
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth/google', require('./routes/googleAuth'));
app.use('/api/animals', require('./routes/animals'));

// Базовая маршрутизация
app.get('/', (req, res) => {
  res.json({ 
    message: '🦁 Система управления зоопарком с аутентификацией 🦒',
    version: '2.0.0',
    features: [
      'JWT аутентификация',
      'Google OAuth 2.0',
      'Ролевая модель (user, employee, admin)',
      'Защищенные API эндпоинты'
    ],
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
        google: 'GET /api/auth/google'
      },
      animals: 'GET /api/animals',
      employees: 'GET /api/employees',
      enclosures: 'GET /api/enclosures',
      feedings: 'GET /api/feedings'
    }
  });
});

// Проверка здоровья
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMessages = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({
    server: 'running',
    database: statusMessages[dbStatus] || 'unknown',
    authentication: 'JWT + Google OAuth',
    timestamp: new Date().toISOString()
  });
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Внутренняя ошибка сервера',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`🔐 Аутентификация: JWT + Google OAuth`);
  console.log(`🌐 API: http://localhost:${PORT}`);
  console.log(`🔗 Google OAuth Callback: ${process.env.GOOGLE_CALLBACK_URL}`);
});