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

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Initialize Passport
app.use(passport.initialize());
require('./config/passport');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zoo_management')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/google', googleAuthRoutes);
app.use('/api/animals', animalsRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/enclosures', enclosureRoutes);
app.use('/api/feedings', feedingRoutes);

// Base routing
app.get('/', (req, res) => {
  res.json({ 
    message: '🦁 Zoo Management System with Authentication 🦒',
    version: '2.0.0',
    features: [
      'JWT authentication',
      'Google OAuth 2.0',
      'Role model (user, employee, admin)',
      'Protected API endpoints'
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

// Health check
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔐 Authentication: JWT + Google OAuth`);
  console.log(`🌐 API: http://localhost:${PORT}`);
  console.log(`🔗 Google OAuth Callback: ${process.env.GOOGLE_CALLBACK_URL}`);
});