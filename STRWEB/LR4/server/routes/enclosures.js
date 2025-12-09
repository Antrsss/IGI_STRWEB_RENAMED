// server/routes/enclosures.js
const express = require('express');
const router = express.Router();
const Enclosure = require('../models/Enclosure');
const Animal = require('../models/Animal');
const auth = require('../middleware/auth');

// GET всех вольеров (публичный доступ)
router.get('/', async (req, res) => {
  try {
    const enclosures = await Enclosure.find().sort({ name: 1 });
    res.json(enclosures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST создание нового вольера (требуется авторизация)
router.post('/', auth, async (req, res) => {
  try {
    // Проверка уникальности имени
    const existingEnclosure = await Enclosure.findOne({ name: req.body.name });
    if (existingEnclosure) {
      return res.status(400).json({ error: 'Вольер с таким названием уже существует' });
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

// DELETE удаление вольера (требуется авторизация)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Проверяем, есть ли животные в вольере
    const animalsInEnclosure = await Animal.find({ enclosure: req.params.id });
    if (animalsInEnclosure.length > 0) {
      return res.status(400).json({ 
        error: 'Невозможно удалить вольер: в нем содержатся животные',
        animalsCount: animalsInEnclosure.length
      });
    }

    const enclosure = await Enclosure.findByIdAndDelete(req.params.id);
    
    if (!enclosure) {
      return res.status(404).json({ error: 'Вольер не найден' });
    }
    
    res.json({ 
      message: 'Вольер успешно удален',
      deletedEnclosure: enclosure.name
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;