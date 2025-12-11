// routes/googleAuth.js
const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', (req, res, next) => {
  console.log('Starting Google OAuth flow...');
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    accessType: 'offline',
    prompt: 'select_account'
  })(req, res, next);
});

router.get('/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: process.env.FRONTEND_URL + '/login?error=google_auth_failed'
  }),
  async (req, res) => {
    try {
      console.log('✅ Google auth successful for:', req.user.email);
      
      const token = req.user.generateAuthToken();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Generated JWT token (first 50 chars):', token.substring(0, 50) + '...');
      }
      
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${encodeURIComponent(token)}`;
      console.log('Redirecting to:', redirectUrl);
      
      res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`);
    }
  }
);

router.get('/config', (req, res) => {
  res.json({
    clientId: process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Missing',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'Not configured',
    frontendUrl: process.env.FRONTEND_URL || 'Not configured',
    note: 'Check that callback URL matches Google Cloud Console'
  });
});

module.exports = router;