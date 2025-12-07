const express = require('express');
const router = express.Router();
const Animal = require('../models/Animal');
const Enclosure = require('../models/Enclosure');
const Employee = require('../models/Employee');

// Get all animals with enclosure and employee information
router.get('/', async (req, res) => {
  try {
    const animals = await Animal.find()
      .populate('enclosure', 'name type location')
      .populate('caretaker', 'firstName lastName position')
      .sort({ createdAt: -1 });
    
    res.json(animals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific animal
router.get('/:id', async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id)
      .populate('enclosure')
      .populate('caretaker');
    
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    
    res.json(animal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new animal
router.post('/', async (req, res) => {
  try {
    // Check if enclosure and employee exist
    const [enclosure, employee] = await Promise.all([
      Enclosure.findById(req.body.enclosure),
      Employee.findById(req.body.caretaker)
    ]);
    
    if (!enclosure) {
      return res.status(400).json({ error: 'Enclosure not found' });
    }
    if (!employee) {
      return res.status(400).json({ error: 'Employee not found' });
    }
    
    const animal = new Animal(req.body);
    await animal.save();
    
    const populatedAnimal = await Animal.findById(animal._id)
      .populate('enclosure', 'name type')
      .populate('caretaker', 'firstName lastName');
    
    res.status(201).json(populatedAnimal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update animal
router.put('/:id', async (req, res) => {
  try {
    const animal = await Animal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('enclosure').populate('caretaker');
    
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    
    res.json(animal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete animal
router.delete('/:id', async (req, res) => {
  try {
    const animal = await Animal.findByIdAndDelete(req.params.id);
    
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    
    res.json({ message: 'Animal deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get animals by species
router.get('/species/:species', async (req, res) => {
  try {
    const animals = await Animal.find({ species: req.params.species })
      .populate('enclosure', 'name location')
      .populate('caretaker', 'firstName lastName');
    
    res.json(animals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;