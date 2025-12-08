// config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      console.log('🔐 Google OAuth profile received:', {
        id: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName
      });

      // 1. Проверяем по googleId
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        console.log('✅ Existing Google user found:', user.email);
        return done(null, user);
      }

      // 2. Проверяем по email
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // Объединяем аккаунт (локальный + Google)
        console.log('🔄 Merging local account with Google:', user.email);
        user.googleId = profile.id;
        user.avatar = profile.photos[0]?.value || user.avatar;
        user.displayName = profile.displayName || user.displayName;
        await user.save();
        return done(null, user);
      }

      // 3. Создаем нового пользователя
      console.log('👤 Creating new Google user:', profile.emails[0].value);
      user = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        displayName: profile.displayName,
        avatar: profile.photos[0]?.value,
        username: profile.emails[0].value.split('@')[0] + '_google'
      });

      await user.save();
      console.log('✅ New Google user created:', user._id);
      
      return done(null, user);
    } catch (error) {
      console.error('❌ Google OAuth error:', error);
      return done(error, null);
    }
  }
));