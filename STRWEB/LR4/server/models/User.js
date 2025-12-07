const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Local authentication
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^\S+@\S+\.\S+$/
  },
  password: {
    type: String,
    minlength: 6
  },
  
  // Google OAuth
  googleId: String,
  displayName: String,
  avatar: String,
  
  // Role-based access
  role: {
    type: String,
    enum: ['user', 'employee', 'admin'],
    default: 'user'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastLogin: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      role: this.role,
      username: this.username
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = mongoose.model('User', userSchema);