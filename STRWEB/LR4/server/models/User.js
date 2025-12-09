const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: function() {
      return !this.googleId;
    },
    unique: true,
    sparse: true,
    trim: true,
    minlength: 3,
    default: null
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^\S+@\S+\.\S+$/
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId;
    },
    minlength: 6,
    default: null
  },
  
  googleId: {
    type: String,
    sparse: true,
    default: null
  },
  displayName: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function() {
  if (this.password && this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      throw error;
    }
  }
  
  if (this.googleId && !this.username) {
    try {
      const baseUsername = this.email.split('@')[0];
      let username = baseUsername;
      let counter = 1;
      
      while (counter < 100) {
        const existingUser = await mongoose.models.User.findOne({ username });
        if (!existingUser) break;
        username = `${baseUsername}_${counter}`;
        counter++;
      }
      
      this.username = username;
      console.log('👤 Generated username for Google user:', this.username);
    } catch (error) {
      console.error('Username generation error:', error);
    }
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('🔐 ===== comparePassword called =====');
    console.log('User email:', this.email);
    console.log('User has password field?', !!this.password);
    console.log('User password type:', typeof this.password);
    console.log('User password length:', this.password?.length || 0);
    
    if (!this.password || !candidatePassword) {
      return false;
    }
    
    console.log('Candidate password type:', typeof candidatePassword);
    console.log('Candidate password length:', candidatePassword.length);
    
    const result = await bcrypt.compare(candidatePassword, this.password);
    
    return result;
  } catch (error) {
    console.error('Error stack:', error.stack);
    return false;
  }
};

userSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  
  const payload = {
    id: this._id.toString(),
    email: this.email
  };
  
  if (this.username) payload.username = this.username;
  if (this.displayName) payload.displayName = this.displayName;
  if (this.googleId) payload.googleId = this.googleId;
  if (this.avatar) payload.avatar = this.avatar;
  
  const secret = process.env.JWT_SECRET || 'your-fallback-secret-key-for-development-only';
  
  if (!secret || secret === 'your-fallback-secret-key-for-development-only') {
    console.warn('⚠️  Using fallback JWT secret. Set JWT_SECRET in .env for production!');
  }
  
  return jwt.sign(
    payload,
    secret,
    { expiresIn: '7d' }
  );
};

userSchema.statics.findByEmail = async function(email) {
  return await this.findOne({ email: email.toLowerCase().trim() });
};

userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return await this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('User', userSchema);