const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists' 
      });
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password
    });
    
    await user.save();
    
    // Generate token
    const token = user.generateAuthToken();
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      token
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
// routes/auth.js - ОБНОВЛЕННЫЙ роут /login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 ========== LOGIN ATTEMPT ==========');
    console.log('📧 Email:', email);
    console.log('🔑 Password provided:', password ? 'YES (length: ' + password.length + ')' : 'NO');
    
    // 1. Ищем пользователя
    console.log('🔍 Searching for user with email:', email);
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log('✅ User found:', {
      id: user._id,
      email: user.email,
      username: user.username,
      hasPassword: !!user.password,
      passwordLength: user.password?.length || 0,
      googleId: user.googleId || 'none'
    });
    
    // 2. Проверяем, это Google-пользователь?
    if (user.googleId && !user.password) {
      console.log('⚠️ This is a Google-only user (no password set)');
      return res.status(400).json({ 
        error: 'This account uses Google Sign In. Please use Google authentication.' 
      });
    }
    
    // 3. Проверяем пароль
    if (!user.password) {
      console.log('❌ User has no password field at all');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log('🔑 Comparing password...');
    const isPasswordValid = await user.comparePassword(password);
    console.log('🔐 Password comparison result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password comparison failed');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // 4. Обновляем lastLogin
    user.lastLogin = new Date();
    await user.save();
    console.log('🕒 Last login updated');
    
    // 5. Генерируем токен
    const token = user.generateAuthToken();
    console.log('🎫 Token generated (first 30 chars):', token.substring(0, 30) + '...');
    
    console.log('✅ ========== LOGIN SUCCESSFUL ==========');
    
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        displayName: user.displayName
      },
      token
    });
    
  } catch (error) {
    console.error('❌ ========== LOGIN ERROR ==========');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile (protected)
router.get('/profile', authMiddleware(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Logout (client-side - just remove token)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;