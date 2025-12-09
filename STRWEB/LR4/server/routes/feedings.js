// server/routes/feedings.js
const express = require('express');
const router = express.Router();
const Feeding = require('../models/Feeding');
const Animal = require('../models/Animal');
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');

// GET всех записей о кормлении (публичный доступ)
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

// POST создание новой записи о кормлении (требуется авторизация)
router.post('/', auth, async (req, res) => {
  try {
    // Проверяем существование животного
    const animal = await Animal.findById(req.body.animal);
    if (!animal) {
      return res.status(404).json({ error: 'Животное не найдено' });
    }

    // Проверяем существование сотрудника
    const employee = await Employee.findById(req.body.fedBy);
    if (!employee) {
      return res.status(404).json({ error: 'Сотрудник не найден' });
    }

    // Если feedingTime не указан, устанавливаем текущее время
    if (!req.body.feedingTime) {
      req.body.feedingTime = new Date();
    }

    const feeding = new Feeding(req.body);
    await feeding.save();

    // Получаем запись с populate
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

// DELETE удаление записи о кормлении (требуется авторизация)
router.delete('/:id', auth, async (req, res) => {
  try {
    const feeding = await Feeding.findByIdAndDelete(req.params.id);
    
    if (!feeding) {
      return res.status(404).json({ error: 'Запись о кормлении не найдена' });
    }
    
    res.json({ 
      message: 'Запись о кормлении успешно удалена',
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