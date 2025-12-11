// server/routes/enclosures.js
const express = require('express');
const router = express.Router();
const Enclosure = require('../models/Enclosure');
const Animal = require('../models/Animal');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const enclosures = await Enclosure.find().sort({ name: 1 });
    res.json(enclosures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth(), async (req, res) => {
  try {
    const existingEnclosure = await Enclosure.findOne({ name: req.body.name });
    if (existingEnclosure) {
      return res.status(400).json({ error: 'Enclosure with this name already exists' });
    }

    const enclosure = new Enclosure(req.body);
    await enclosure.save();
    res.status(201).json(enclosure);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth(), async (req, res) => {
  try {
    const animalsInEnclosure = await Animal.find({ enclosure: req.params.id });
    if (animalsInEnclosure.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete enclosure: there are animals inside',
        animalsCount: animalsInEnclosure.length
      });
    }

    const enclosure = await Enclosure.findByIdAndDelete(req.params.id);
    
    if (!enclosure) {
      return res.status(404).json({ error: 'Enclosure not found' });
    }
    
    res.json({ 
      message: 'Enclosure successfully deleted',
      deletedEnclosure: enclosure.name
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;