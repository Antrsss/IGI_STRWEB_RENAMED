const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // For local authentication
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters long'],
    // Password is not required for users registered via Google/Github
    required: function() {
      return !this.googleId && !this.githubId;
    }
  },
  
  // For Google OAuth
  googleId: {
    type: String,
    sparse: true
  },
  displayName: String,
  avatar: String,
  
  // Roles and permissions
  role: {
    type: String,
    enum: ['user', 'employee', 'admin'],
    default: 'user'
  },
  
  // Connection to Employee model (if user is an employee)
  employeeProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Tokens for password reset and verification
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  
  lastLogin: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  
  // Хешируем пароль
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { 
      userId: this._id,
      email: this.email,
      role: this.role,
      employeeProfile: this.employeeProfile 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Virtual field for full name
userSchema.virtual('fullName').get(function() {
  return this.displayName || this.username || this.email.split('@')[0];
});

module.exports = mongoose.model('User', userSchema);