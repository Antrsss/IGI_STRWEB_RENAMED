const express = require('express');
const router = express.Router();
const Animal = require('../models/Animal');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Настройка multer для загрузки изображений
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/animals';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
});

// GET /api/animals - Публичный доступ
router.get('/', async (req, res) => {
  try {
    const animals = await Animal.find()
      .populate('enclosure')
      .populate('caretaker', 'firstName lastName position specialization');
    res.json(animals);
  } catch (error) {
    console.error('Error fetching animals:', error);
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
    console.error('Error fetching animal:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/animals - Требуется авторизация + загрузка файла
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('Creating animal with data:', req.body);
    console.log('File:', req.file ? req.file.filename : 'No file');
    
    const animalData = { ...req.body };
    
    // Если загружено изображение
    if (req.file) {
      animalData.image = req.file.filename;
    }
    
    // Создаем животное
    const animal = new Animal(animalData);
    await animal.save();
    
    // Получаем полные данные с populate
    const populatedAnimal = await Animal.findById(animal._id)
      .populate('enclosure')
      .populate('caretaker', 'firstName lastName position specialization');
    
    console.log('Animal created successfully:', populatedAnimal._id);
    
    res.status(201).json(populatedAnimal);
  } catch (error) {
    console.error('Error creating animal:', error);
    
    // Удаляем загруженный файл в случае ошибки
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/animals/:id - Требуется авторизация + загрузка файла
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('Updating animal:', req.params.id);
    console.log('Update data:', req.body);
    console.log('File:', req.file ? req.file.filename : 'No file');
    
    const animalData = { ...req.body };
    
    // Если загружено новое изображение
    if (req.file) {
      animalData.image = req.file.filename;
      
      // Удаляем старое изображение если оно было и это не URL
      const existingAnimal = await Animal.findById(req.params.id);
      if (existingAnimal && existingAnimal.image && !existingAnimal.image.startsWith('http')) {
        const oldImagePath = path.join('uploads/animals', existingAnimal.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlink(oldImagePath, (err) => {
            if (err) console.error('Error deleting old image:', err);
          });
        }
      }
    }
    
    // Обновляем животное
    const animal = await Animal.findByIdAndUpdate(
      req.params.id,
      animalData,
      { new: true, runValidators: true }
    )
    .populate('enclosure')
    .populate('caretaker', 'firstName lastName position specialization');
    
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    
    console.log('Animal updated successfully:', animal._id);
    
    res.json(animal);
  } catch (error) {
    console.error('Error updating animal:', error);
    
    // Удаляем загруженный файл в случае ошибки
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/animals/:id - Требуется авторизация
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Deleting animal:', req.params.id);
    
    const animal = await Animal.findById(req.params.id);
    
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    
    // Удаляем изображение если оно было и это не URL
    if (animal.image && !animal.image.startsWith('http')) {
      const imagePath = path.join('uploads/animals', animal.image);
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) console.error('Error deleting image file:', err);
        });
      }
    }
    
    // Удаляем запись из базы данных
    await Animal.findByIdAndDelete(req.params.id);
    
    console.log('Animal deleted successfully:', req.params.id);
    
    res.json({ 
      success: true,
      message: 'Animal deleted successfully',
      deletedId: req.params.id
    });
  } catch (error) {
    console.error('Error deleting animal:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;