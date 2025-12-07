const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

// Initialize Passport
require('../config/passport');

// Route for starting Google authentication
router.get('/', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

// Google callback route - ИСПРАВЛЕННАЯ ВЕРСИЯ
router.get('/callback',
  (req, res, next) => {
    passport.authenticate('google', { 
      session: false 
    }, (err, user, info) => {
      if (err) {
        console.error('Google auth error:', err);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`);
      }
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=no_user`);
      }
      
      // Сохраняем user в req для использования в следующем middleware
      req.user = user;
      next();
    })(req, res, next);
  },
  async (req, res) => {
    try {
      const user = req.user;
      
      // Генерируем JWT токен
      const token = jwt.sign(
        { 
          userId: user._id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Перенаправляем на фронтенд с токеном
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}&userId=${user._id}`;
      res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('Google callback processing error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=server_error`);
    }
  }
);

// Get user information after OAuth
router.post('/google/userinfo', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token not provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId)
      .select('-password')
      .populate('employeeProfile');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Google authentication successful',
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
    console.error('Google userinfo error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Link Google account with existing account
router.post('/google/link', async (req, res) => {
  try {
    const { email, googleId, displayName, avatar } = req.body;
    
    // Find user by email
    let user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if Google account is already linked
    if (user.googleId) {
      return res.status(400).json({ 
        error: 'Google account is already linked to this user' 
      });
    }
    
    // Link Google account
    user.googleId = googleId;
    user.displayName = displayName || user.displayName;
    user.avatar = avatar || user.avatar;
    user.emailVerified = true;
    
    await user.save();
    
    const token = user.generateAuthToken();
    
    res.json({
      message: 'Google account successfully linked',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Google link error:', error);
    res.status(500).json({ error: 'Error linking Google account' });
  }
});

// Unlink Google account
router.post('/google/unlink', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.googleId) {
      return res.status(400).json({ 
        error: 'Google account is not linked to this user' 
      });
    }
    
    // Check if there's another login method
    if (!user.password) {
      return res.status(400).json({ 
        error: 'Cannot unlink Google account if password is not set' 
      });
    }
    
    // Unlink Google account
    user.googleId = null;
    // Can keep displayName and avatar if they were set via Google
    
    await user.save();
    
    res.json({
      message: 'Google account successfully unlinked',
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Google unlink error:', error);
    res.status(500).json({ error: 'Error unlinking Google account' });
  }
});

module.exports = router;