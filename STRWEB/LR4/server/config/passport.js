const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Local strategy
passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        
        if (!user) {
          return done(null, false, { message: 'User not found' });
        }
        
        if (!user.password) {
          return done(null, false, { 
            message: 'This account uses Google login' 
          });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password' });
        }
        
        if (!user.isActive) {
          return done(null, false, { message: 'Account deactivated' });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Find user by googleId
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
          // Update profile information
          user.displayName = profile.displayName;
          user.avatar = profile.photos?.[0]?.value;
          await user.save();
          return done(null, user);
        }
        
        // Find user by email
        user = await User.findOne({ email: profile.emails?.[0]?.value });
        
        if (user) {
          // Link existing account with Google
          user.googleId = profile.id;
          user.displayName = profile.displayName;
          user.avatar = profile.photos?.[0]?.value;
          user.emailVerified = true;
          await user.save();
          return done(null, user);
        }
        
        // Create new user
        user = new User({
          googleId: profile.id,
          email: profile.emails?.[0]?.value,
          username: profile.emails?.[0]?.value.split('@')[0],
          displayName: profile.displayName,
          avatar: profile.photos?.[0]?.value,
          emailVerified: true,
          role: 'user'
        });
        
        await user.save();
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// User serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// User deserialization
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;