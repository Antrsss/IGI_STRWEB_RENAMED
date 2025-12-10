const googleVisionService = require('../services/googleVisionService');
const fs = require('fs').promises;

class AnimalRecognitionController {
  recognizeAnimal = async (req, res) => {
    console.log('🔄 Processing animal recognition request...');

    try {
      if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({
          success: false,
          message: 'No image file uploaded. Please select an image.',
          code: 'NO_FILE'
        });
      }

      console.log(`Uploaded file: ${req.file.originalname}, Size: ${req.file.size} bytes`);

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        console.log(`Invalid file type: ${req.file.mimetype}`);
        await this.cleanupFile(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed.',
          allowedTypes: allowedTypes,
          code: 'INVALID_TYPE'
        });
      }

      const maxSize = 10 * 1024 * 1024;
      if (req.file.size > maxSize) {
        console.log(`File too large: ${req.file.size} bytes`);
        await this.cleanupFile(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 10MB.',
          maxSize: maxSize,
          code: 'FILE_TOO_LARGE'
        });
      }

      try {
        const stats = await fs.stat(req.file.path);
        if (stats.size === 0) {
          throw new Error('Empty file');
        }
      } catch (error) {
        console.log('Invalid image file:', error.message);
        await this.cleanupFile(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'Invalid image file. The file may be corrupted.',
          code: 'INVALID_IMAGE'
        });
      }

      console.log('Starting animal recognition with Google Vision API...');
      const startTime = Date.now();
      const result = await googleVisionService.recognizeAnimal(req.file.path);
      const processingTime = Date.now() - startTime;

      console.log(`Recognition completed in ${processingTime}ms`);
      console.log(`Best match: ${result.bestMatch.name} (${(result.bestMatch.confidence * 100).toFixed(1)}%)`);

      await this.cleanupFile(req.file.path);

      res.status(200).json({
        success: true,
        message: 'Animal recognized successfully',
        processingTime: `${processingTime}ms`,
        recognition: result
      });
    } catch (error) {
      console.error('Recognition error:', error.message);

      if (req.file?.path) await this.cleanupFile(req.file.path);

      res.status(500).json({
        success: false,
        message: error.message,
        code: 'API_ERROR'
      });
    }
  };
}

module.exports = new AnimalRecognitionController();