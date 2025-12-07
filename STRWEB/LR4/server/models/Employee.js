const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  position: {
    type: String,
    required: true,
    enum: ['Zookeeper', 'Veterinarian', 'Nutritionist', 'Administrator', 'Maintenance Staff', 'Tour Guide']
  },
  specialization: {
    type: String,
    enum: ['Mammals', 'Birds', 'Reptiles', 'Aquatic Animals', 'All Species', null]
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  salary: {
    type: Number,
    min: [0, 'Salary cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Employee', employeeSchema);