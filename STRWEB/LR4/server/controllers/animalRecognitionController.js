const googleVisionService = require('../services/googleVisionService');
const path = require('path');
const fs = require('fs').promises;

class AnimalRecognitionController {
  /**
   * Распознает животное по загруженному изображению
   */
  async recognizeAnimal(req, res) {
    console.log('🔄 Processing animal recognition request...');
    
    try {
      // Проверяем наличие файла
      if (!req.file) {
        console.log('❌ No file uploaded');
        return res.status(400).json({
          success: false,
          message: 'No image file uploaded. Please select an image.',
          code: 'NO_FILE'
        });
      }

      console.log(`📁 Uploaded file: ${req.file.originalname}, Size: ${req.file.size} bytes`);

      // Проверяем тип файла
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        console.log(`❌ Invalid file type: ${req.file.mimetype}`);
        await this.cleanupFile(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed.',
          allowedTypes: allowedTypes,
          code: 'INVALID_TYPE'
        });
      }

      // Проверяем размер файла (макс. 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (req.file.size > maxSize) {
        console.log(`❌ File too large: ${req.file.size} bytes`);
        await this.cleanupFile(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 10MB.',
          maxSize: maxSize,
          code: 'FILE_TOO_LARGE'
        });
      }

      // Проверяем, что файл действительно изображение
      try {
        const stats = await fs.stat(req.file.path);
        if (stats.size === 0) {
          throw new Error('Empty file');
        }
      } catch (error) {
        console.log('❌ Invalid image file:', error.message);
        await this.cleanupFile(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'Invalid image file. The file may be corrupted.',
          code: 'INVALID_IMAGE'
        });
      }

      console.log('🖼️ Starting animal recognition with Google Vision API...');
      
      // Распознаем животное
      const startTime = Date.now();
      console.log('🧠 Calling googleVisionService.recognizeAnimal...');
      const result = await googleVisionService.recognizeAnimal(req.file.path);
      console.log('🧠 Vision API returned result:', result);
      const processingTime = Date.now() - startTime;

      console.log(`✅ Recognition completed in ${processingTime}ms`);
      console.log(`🎯 Best match: ${result.bestMatch.name} (${(result.bestMatch.confidence * 100).toFixed(1)}%)`);

      // Удаляем временный файл
      await this.cleanupFile(req.file.path);

      // Форматируем ответ
      const response = {
        success: true,
        message: 'Animal recognized successfully',
        processingTime: `${processingTime}ms`,
        imageInfo: {
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        },
        recognition: {
          bestMatch: {
            name: result.bestMatch.name,
            confidence: result.bestMatch.confidence,
            confidencePercentage: (result.bestMatch.confidence * 100).toFixed(1) + '%',
            type: result.bestMatch.type,
            emoji: this.getAnimalEmoji(result.bestMatch.name)
          },
          allMatches: result.detectedAnimals.map(animal => ({
            name: animal.name,
            confidence: animal.confidence,
            confidencePercentage: (animal.confidence * 100).toFixed(1) + '%',
            type: animal.type,
            source: animal.source,
            emoji: this.getAnimalEmoji(animal.name)
          })),
          totalMatches: result.detectedAnimals.length,
          databaseMatches: result.databaseMatches
        },
        additionalInfo: result.additionalInfo,
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);

    } catch (error) {
      console.error('❌ Recognition error:', error.message);
      
      // Удаляем временный файл в случае ошибки
      if (req.file && req.file.path) {
        await this.cleanupFile(req.file.path);
      }

      // Определяем статус ошибки
      let statusCode = 500;
      let errorCode = 'API_ERROR';
      
      if (error.message.includes('credentials') || error.message.includes('permission')) {
        statusCode = 503;
        errorCode = 'SERVICE_UNAVAILABLE';
      } else if (error.message.includes('quota')) {
        statusCode = 429;
        errorCode = 'QUOTA_EXCEEDED';
      }

      res.status(statusCode).json({
        success: false,
        message: error.message,
        code: errorCode,
        timestamp: new Date().toISOString(),
        suggestion: 'Please try again with a different image or contact support if the problem persists.'
      });
    }
  }

  /**
   * Тестирует подключение к Google Vision API
   */
  async testAPI(req, res) {
    try {
      console.log('🧪 Testing Google Vision API connection...');
      const testResult = await googleVisionService.testConnection();
      
      if (testResult.success) {
        res.status(200).json({
          success: true,
          message: 'Google Vision API is working correctly',
          projectId: testResult.projectId,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(503).json({
          success: false,
          message: testResult.message,
          error: testResult.error,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ API test failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to test Google Vision API',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Удаляет временный файл
   */
  async cleanupFile(filePath) {
    try {
      if (filePath && fs.existsSync) {
        await fs.unlink(filePath);
        console.log(`🗑️ Temporary file deleted: ${filePath}`);
      }
    } catch (error) {
      console.error('Failed to delete temp file:', error.message);
    }
  }

  /**
   * Возвращает эмодзи для животного
   */
  getAnimalEmoji(animalName) {
    const emojiMap = {
      'lion': '🦁', 'tiger': '🐯', 'elephant': '🐘', 'giraffe': '🦒',
      'zebra': '🦓', 'bear': '🐻', 'wolf': '🐺', 'fox': '🦊',
      'deer': '🦌', 'monkey': '🐒', 'gorilla': '🦍', 'panda': '🐼',
      'koala': '🐨', 'kangaroo': '🦘', 'penguin': '🐧', 'eagle': '🦅',
      'owl': '🦉', 'snake': '🐍', 'crocodile': '🐊', 'turtle': '🐢',
      'frog': '🐸', 'shark': '🦈', 'whale': '🐋', 'dolphin': '🐬',
      'horse': '🐴', 'cow': '🐮', 'sheep': '🐑', 'goat': '🐐',
      'dog': '🐕', 'cat': '🐈', 'bird': '🐦', 'fish': '🐟',
      'rabbit': '🐇', 'hedgehog': '🦔', 'bat': '🦇', 'unicorn': '🦄'
    };

    const lowerName = animalName.toLowerCase();
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (lowerName.includes(key)) {
        return emoji;
      }
    }
    return '🐾';
  }
}

module.exports = new AnimalRecognitionController();