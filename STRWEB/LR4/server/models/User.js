const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Local authentication
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
  
  // Google OAuth
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

// === ИСПРАВЛЕННЫЙ pre-save middleware БЕЗ next ===
userSchema.pre('save', async function() {
  // Только для локальной регистрации (когда есть пароль)
  if (this.password && this.isModified('password')) {
    try {
      console.log('🔐 Hashing password for user:', this.email);
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      console.error('Password hashing error:', error);
      throw error; // Просто выбрасываем ошибку вместо next(error)
    }
  }
  
  // Установим username для Google-пользователей если его нет
  if (this.googleId && !this.username) {
    try {
      const baseUsername = this.email.split('@')[0];
      let username = baseUsername;
      let counter = 1;
      
      // Проверяем уникальность username
      while (counter < 100) { // Добавляем лимит на случай бесконечного цикла
        const existingUser = await mongoose.models.User.findOne({ username });
        if (!existingUser) break;
        username = `${baseUsername}_${counter}`;
        counter++;
      }
      
      this.username = username;
      console.log('👤 Generated username for Google user:', this.username);
    } catch (error) {
      console.error('Username generation error:', error);
      // Не выбрасываем ошибку - просто пропускаем
    }
  }
});

// === Compare password method ===
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Для Google-пользователей нет пароля
  if (!this.password) return false;
  
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// === Generate JWT token ===
userSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  
  const payload = {
    id: this._id.toString(),
    email: this.email
  };
  
  // Добавляем опциональные поля
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

// === Статический метод для поиска по email ===
userSchema.statics.findByEmail = async function(email) {
  return await this.findOne({ email: email.toLowerCase().trim() });
};

// === Метод для обновления lastLogin ===
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return await this.save({ validateBeforeSave: false }); // Отключаем валидацию для быстрого сохранения
};

module.exports = mongoose.model('User', userSchema);