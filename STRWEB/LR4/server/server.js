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

const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  console.log('.env file found');
  const envContent = fs.readFileSync(envPath, 'utf8');
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
  console.log('.env file not found!');
}

require('dotenv').config({ path: envPath });

const app = express();

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS preflight request for:', req.url);
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }
  next();
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({
  type: 'application/json',
  charset: 'utf-8'
}));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const folders = ['animals', 'employees', 'enclosures', 'feedings'];
folders.forEach(folder => {
  const folderPath = path.join(uploadsDir, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
});

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

app.use(passport.initialize());
require('./config/passport');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zoo_management')
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

app.use('/api/auth', authRoutes);
app.use('/api/auth/google', googleAuthRoutes);
app.use('/api/animals', animalsRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/enclosures', enclosureRoutes);
app.use('/api/feedings', feedingRoutes);

app.use('/api/animal-recognition', animalRecognitionRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Zoo Management System with Authentication',
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

app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found', path: req.url });
});

app.use((err, req, res, next) => {
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
    ==========================================
    Server running on port ${PORT}
    ==========================================
    Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
    Authentication: JWT + Google OAuth
    Uploads: ${uploadsDir}
    Health: http://localhost:${PORT}/api/health
  `);
});
