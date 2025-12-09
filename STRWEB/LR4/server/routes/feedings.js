// server/routes/feedings.js
const express = require('express');
const router = express.Router();
const Feeding = require('../models/Feeding');
const Animal = require('../models/Animal');
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');

// GET all feeding records (public access)
router.get('/', async (req, res) => {
  try {
    const feedings = await Feeding.find()
      .populate('animal', 'name species')
      .populate('fedBy', 'firstName lastName position')
      .sort({ feedingTime: -1 });
    
    res.json(feedings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new feeding record (requires authentication)
router.post('/', auth, async (req, res) => {
  try {
    // Check if animal exists
    const animal = await Animal.findById(req.body.animal);
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    // Check if employee exists
    const employee = await Employee.findById(req.body.fedBy);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // If feedingTime not specified, set current time
    if (!req.body.feedingTime) {
      req.body.feedingTime = new Date();
    }

    const feeding = new Feeding(req.body);
    await feeding.save();

    // Get record with populate
    const populatedFeeding = await Feeding.findById(feeding._id)
      .populate('animal', 'name species')
      .populate('fedBy', 'firstName lastName position');
    
    res.status(201).json(populatedFeeding);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE delete feeding record (requires authentication)
router.delete('/:id', auth, async (req, res) => {
  try {
    const feeding = await Feeding.findByIdAndDelete(req.params.id);
    
    if (!feeding) {
      return res.status(404).json({ error: 'Feeding record not found' });
    }
    
    res.json({ 
      message: 'Feeding record successfully deleted',
      deletedFeeding: {
        id: feeding._id,
        animal: feeding.animal,
        feedingTime: feeding.feedingTime
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;