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

// === STRICT .env LOADING ===
const envPath = path.join(__dirname, '.env');
console.log('=== DIAGNOSTICS ===');
console.log('Directory:', __dirname);
console.log('.env path:', envPath);

// Check file
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('.env content:');
  console.log(envContent);
  
  // Force parse .env
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

// Alternatively use dotenv with absolute path
require('dotenv').config({ path: envPath });

console.log('\n=== VARIABLES CHECK ===');
console.log('PORT:', process.env.PORT || 'undefined');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Loaded' : '❌ Missing');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Loaded' : '❌ Missing');
console.log('GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL || 'undefined');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Loaded' : '❌ Missing');

const app = express();

// ========== CRITICAL FIX: Обработка OPTIONS запросов для CORS ==========
// Вместо app.options('*', ...) используйте:
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    console.log('🛡️ OPTIONS preflight request for:', req.url);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }
  next();
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ПРАВИЛЬНАЯ обработка JSON с UTF-8
app.use(express.json({
  type: 'application/json',
  charset: 'utf-8'
}));

// ========== СОЗДАНИЕ ПАПОК ДЛЯ ЗАГРУЗКИ ФАЙЛОВ ==========
// Создаем папку uploads если её нет
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Создаем подпапки для разных типов загрузок
const folders = ['animals', 'employees', 'enclosures', 'feedings'];
folders.forEach(folder => {
  const folderPath = path.join(uploadsDir, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`📁 Created ${folder} upload directory`);
  }
});

// ========== СТАТИЧЕСКАЯ РАЗДАЧА ФАЙЛОВ ==========
// Раздаем загруженные файлы статически
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    // Устанавливаем правильные заголовки для изображений
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

// Middleware для логирования ВСЕХ запросов (опционально, можно отключить в production)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Логируем только POST/PUT для отладки
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Headers:', {
      'content-type': req.headers['content-type'],
      'authorization': req.headers.authorization ? 'Present' : 'Missing',
      'content-length': req.headers['content-length']
    });
    
    // Для multipart/form-data не логируем тело
    if (req.headers['content-type'] && 
        !req.headers['content-type'].includes('multipart/form-data')) {
      // Клонируем request для логирования тела
      const oldJson = express.json.json.bind(express.json);
      express.json.json = function(options) {
        return function(req, res, next) {
          let data = '';
          req.on('data', chunk => {
            data += chunk.toString();
          });
          req.on('end', () => {
            console.log('📦 Request body:', data.substring(0, 500));
            req.body = JSON.parse(data);
            next();
          });
        };
      };
    }
  }
  
  // Сохраняем оригинальные методы для логирования ответа
  const originalSend = res.send;
  const originalJson = res.json;
  
  res.send = function(data) {
    console.log(`📤 Response ${res.statusCode}:`, 
      typeof data === 'string' ? data.substring(0, 200) + '...' : '[Object]');
    return originalSend.call(this, data);
  };
  
  res.json = function(data) {
    console.log(`📤 Response ${res.statusCode} JSON:`, 
      JSON.stringify(data).substring(0, 200) + '...');
    return originalJson.call(this, data);
  };
  
  next();
});

// Initialize Passport
app.use(passport.initialize());
require('./config/passport');

// ========== ПОДКЛЮЧЕНИЕ К MONGODB ==========
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zoo_management')
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    
    // Проверяем соединение
    mongoose.connection.on('error', err => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB reconnected');
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// ========== ПЕРЕХВАТ НЕОБРАБОТАННЫХ ОШИБОК ==========
process.on('uncaughtException', (error) => {
  console.error('💥💥💥 FATAL UNCAUGHT EXCEPTION 💥💥💥');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  console.error('💥 Server will continue running but may be unstable');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥💥💥 UNHANDLED REJECTION 💥💥💥');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
});

// ========== МАРШРУТЫ ==========
app.use('/api/auth', authRoutes);
app.use('/api/auth/google', googleAuthRoutes);
app.use('/api/animals', animalsRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/enclosures', enclosureRoutes);
app.use('/api/feedings', feedingRoutes);

// ========== БАЗОВЫЕ МАРШРУТЫ ==========
app.get('/', (req, res) => {
  res.json({ 
    message: '🦁 Zoo Management System with Authentication 🦒',
    version: '2.0.0',
    features: [
      'JWT authentication',
      'Google OAuth 2.0',
      'Role model (user, employee, admin)',
      'Protected API endpoints',
      'File upload support',
      'Real-time data management'
    ],
    uploads: {
      animals: 'POST /api/animals with multipart/form-data',
      staticFiles: 'GET /uploads/:type/:filename'
    },
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

// Health check с информацией о файловой системе
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMessages = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  // Проверяем доступность папок для загрузки
  const uploadsStatus = fs.existsSync(uploadsDir) ? 'available' : 'missing';
  const animalsUploadStatus = fs.existsSync(path.join(uploadsDir, 'animals')) ? 'available' : 'missing';
  
  res.json({
    server: 'running',
    port: PORT,
    database: statusMessages[dbStatus] || 'unknown',
    uploads: {
      main: uploadsStatus,
      animals: animalsUploadStatus
    },
    authentication: 'JWT + Google OAuth',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Тестовый маршрут для загрузки файлов
app.post('/api/test-upload', (req, res) => {
  console.log('🧪 Test upload endpoint called');
  res.json({
    success: true,
    message: 'Upload endpoint is working',
    timestamp: new Date().toISOString(),
    uploadsDir: uploadsDir
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.url,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Error handler:', err.message);
  console.error(err.stack);
  
  // Обработка ошибок Multer
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large',
        message: 'Maximum file size is 5MB'
      });
    }
    if (err.code === 'LIMIT_FILE_TYPE') {
      return res.status(400).json({ 
        error: 'Invalid file type',
        message: 'Only image files are allowed (jpeg, jpg, png, gif, webp)'
      });
    }
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
🚀 ==========================================
🚀 Server running on port ${PORT}
🚀 ==========================================
🔐 Authentication: JWT + Google OAuth
🌐 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
📁 Uploads directory: ${uploadsDir}
📁 Static files: http://localhost:${PORT}/uploads/
🔗 Google OAuth Callback: ${process.env.GOOGLE_CALLBACK_URL}
📊 Health check: http://localhost:${PORT}/api/health
🧪 Test upload: POST http://localhost:${PORT}/api/test-upload
==========================================
  `);
});