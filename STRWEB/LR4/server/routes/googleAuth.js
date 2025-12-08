// routes/googleAuth.js
const express = require('express');
const router = express.Router();
const passport = require('passport');

// Инициализация Google OAuth
router.get('/', (req, res, next) => {
  console.log('🚀 Starting Google OAuth flow...');
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false, // ОТКЛЮЧАЕМ СЕССИИ
    accessType: 'offline',
    prompt: 'select_account'
  })(req, res, next);
});

// Google OAuth callback
router.get('/callback',
  passport.authenticate('google', { 
    session: false, // ОТКЛЮЧАЕМ СЕССИИ
    failureRedirect: process.env.FRONTEND_URL + '/login?error=google_auth_failed'
  }),
  async (req, res) => {
    try {
      console.log('✅ Google auth successful for:', req.user.email);
      
      // Генерируем JWT токен
      const token = req.user.generateAuthToken();
      
      // Логируем токен для отладки (только в development)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔑 Generated JWT token (first 50 chars):', token.substring(0, 50) + '...');
      }
      
      // Перенаправляем на фронтенд
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${encodeURIComponent(token)}`;
      console.log('🔄 Redirecting to:', redirectUrl);
      
      res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('❌ Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`);
    }
  }
);

// Тестовый эндпоинт для проверки конфигурации
router.get('/config', (req, res) => {
  res.json({
    clientId: process.env.GOOGLE_CLIENT_ID ? '✅ Настроен' : '❌ Отсутствует',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'Не настроен',
    frontendUrl: process.env.FRONTEND_URL || 'Не настроен',
    note: 'Проверьте что в Google Cloud Console callback URL совпадает'
  });
});

module.exports = router;