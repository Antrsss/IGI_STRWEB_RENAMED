const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const fs = require('fs');
const path = require('path');

const authRoutes = require('./routes/auth');
const googleAuthRoutes = require('./routes/googleAuth');
const animalsRoutes = require('./routes/animals');
const employeesRoutes = require('./routes/employees');
const enclosureRoutes = require('./routes/enclosures');
const feedingRoutes = require('./routes/feedings');

const animalRecognitionRoutes = require('./routes/animalRecognition');

// === STRICT .env LOADING ===
const envPath = path.join(__dirname, '.env');
console.log('=== DIAGNOSTICS ===');
console.log('Directory:', __dirname);
console.log('.env path:', envPath);

if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('.env content:');
  console.log(envContent);
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        process.env[key.trim()] = value;
        console.log(`📦 Set: ${key.trim()} = ${value.substring(0, 10)}...`);
      }
    }
  });
} else {
  console.log('❌ .env file not found!');
}

require('dotenv').config({ path: envPath });

console.log('\n=== VARIABLES CHECK ===');
console.log('PORT:', process.env.PORT || 'undefined');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Loaded' : '❌ Missing');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Loaded' : '❌ Missing');
console.log('GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL || 'undefined');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Loaded' : '❌ Missing');

const app = express();

// ✅ FIX: корректная обработка OPTIONS preflight
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    console.log('🛡️ OPTIONS preflight request for:', req.url);
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }
  next();
});

// ✅ CORS middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ✅ JSON body parser
app.use(express.json({
  type: 'application/json',
  charset: 'utf-8'
}));

// ✅ Создание папок для загрузок
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

const folders = ['animals', 'employees', 'enclosures', 'feedings'];
folders.forEach(folder => {
  const folderPath = path.join(uploadsDir, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`📁 Created ${folder} upload directory`);
  }
});

// ✅ Статическая раздача файлов
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
}));

// ✅ Лёгкое логирование запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Headers:', {
      'content-type': req.headers['content-type'],
      'authorization': req.headers.authorization ? 'Present' : 'Missing',
      'content-length': req.headers['content-length']
    });
  }

  const originalSend = res.send;
  const originalJson = res.json;

  res.send = function (data) {
    console.log(`📤 Response ${res.statusCode}:`, typeof data === 'string' ? data.substring(0, 200) : '[Object]');
    return originalSend.call(this, data);
  };

  res.json = function (data) {
    console.log(`📤 Response ${res.statusCode} JSON:`, JSON.stringify(data).substring(0, 200) + '...');
    return originalJson.call(this, data);
  };

  next();
});

// ✅ Инициализация Passport
app.use(passport.initialize());
require('./config/passport');

// ✅ Подключение MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zoo_management')
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// ✅ Обработка ошибок Node
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION:', error);
});
process.on('unhandledRejection', (reason) => {
  console.error('💥 UNHANDLED REJECTION:', reason);
});

// ✅ Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/auth/google', googleAuthRoutes);
app.use('/api/animals', animalsRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/enclosures', enclosureRoutes);
app.use('/api/feedings', feedingRoutes);

app.use('/api/animal-recognition', animalRecognitionRoutes);

// ✅ Базовый маршрут
app.get('/', (req, res) => {
  res.json({
    message: '🦁 Zoo Management System with Authentication 🦒',
    version: '2.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile'
      },
      animals: 'GET /api/animals',
      employees: 'GET /api/employees',
      enclosures: 'GET /api/enclosures',
      feedings: 'GET /api/feedings'
    }
  });
});

// ✅ Health check
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    server: 'running',
    db: statusMap[dbStatus],
    time: new Date().toISOString()
  });
});

// ✅ 404 handler
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found', path: req.url });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Error handler:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ✅ Старт сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
🚀 ==========================================
🚀 Server running on port ${PORT}
==========================================
🌐 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
🔐 Authentication: JWT + Google OAuth
📁 Uploads: ${uploadsDir}
📊 Health: http://localhost:${PORT}/api/health
  `);
});
