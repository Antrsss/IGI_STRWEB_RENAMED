// Пример маршрутов для животных на сервере
const express = require('express');
const router = express.Router();
const Animal = require('../models/Animal');
const auth = require('../middleware/auth');

// GET /api/animals - Публичный доступ
router.get('/', async (req, res) => {
  try {
    const animals = await Animal.find()
      .populate('enclosure')
      .populate('caretaker', 'firstName lastName position specialization');
    res.json(animals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/animals/:id - Публичный доступ
router.get('/:id', async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id)
      .populate('enclosure')
      .populate('caretaker', 'firstName lastName position specialization');
    
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    
    res.json(animal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/animals - Требуется авторизация
router.post('/', auth, async (req, res) => {
  try {
    const animal = new Animal(req.body);
    await animal.save();
    
    const populatedAnimal = await Animal.findById(animal._id)
      .populate('enclosure')
      .populate('caretaker', 'firstName lastName position specialization');
    
    res.status(201).json(populatedAnimal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/animals/:id - Требуется авторизация
router.put('/:id', auth, async (req, res) => {
  try {
    const animal = await Animal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('enclosure')
    .populate('caretaker', 'firstName lastName position specialization');
    
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    
    res.json(animal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/animals/:id - Требуется авторизация
router.delete('/:id', auth, async (req, res) => {
  try {
    const animal = await Animal.findByIdAndDelete(req.params.id);
    
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    
    res.json({ message: 'Animal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;