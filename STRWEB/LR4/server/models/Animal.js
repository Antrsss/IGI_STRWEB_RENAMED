const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Animal name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  species: {
    type: String,
    required: [true, 'Animal species is required'],
    enum: ['Lion', 'Tiger', 'Elephant', 'Giraffe', 'Monkey', 'Panda', 'Crocodile', 'Bird', 'Reptile', 'Other']
  },
  age: {
    type: Number,
    min: [0, 'Age cannot be negative'],
    max: [150, 'Age is too high']
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  healthStatus: {
    type: String,
    enum: ['Excellent', 'Good', 'Satisfactory', 'Requires treatment'],
    default: 'Good'
  },
  enclosure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enclosure',
    required: [true, 'Enclosure is required']
  },
  caretaker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee is required']
  },
  arrivalDate: {
    type: Date,
    default: Date.now
  },
  dietType: {
    type: String,
    enum: ['Carnivore', 'Herbivore', 'Omnivore', 'Special'],
    required: true
  },
  specialNeeds: {
    type: String,
    maxlength: [500, 'Special needs cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Animal', animalSchema);