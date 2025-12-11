const mongoose = require('mongoose');

const feedingSchema = new mongoose.Schema({
  animal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal',
    required: [true, 'Animal is required']
  },
  foodType: {
    type: String,
    required: true,
    enum: ['Meat', 'Fish', 'Fruits', 'Vegetables', 'Grain', 'Hay', 'Special Feed', 'Vitamins']
  },
  quantity: {
    type: Number,
    required: true,
    min: [0.01, 'Quantity must be positive']
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'l', 'pcs']
  },
  feedingTime: {
    type: Date,
    default: Date.now,
    required: true
  },
  fedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  }
}, {
  timestamps: true
});

feedingSchema.index({ animal: 1, feedingTime: -1 });

module.exports = mongoose.model('Feeding', feedingSchema);