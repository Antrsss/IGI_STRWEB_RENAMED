const mongoose = require('mongoose');

const enclosureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Enclosure name is required'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Open', 'Closed', 'Aquarium', 'Terrarium', 'Aviary', 'Isolation']
  },
  size: {
    area: {
      type: Number,
      min: [1, 'Area must be at least 1 sq.m'],
      required: true
    },
    capacity: {
      type: Number,
      min: [1, 'Capacity must be at least 1 animal']
    }
  },
  location: {
    type: String,
    required: true,
    enum: ['North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone']
  },
  temperatureRange: {
    min: Number,
    max: Number
  },
  maintenanceStatus: {
    type: String,
    enum: ['Excellent', 'Good', 'Requires Repair', 'Under Reconstruction'],
    default: 'Good'
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Enclosure', enclosureSchema);