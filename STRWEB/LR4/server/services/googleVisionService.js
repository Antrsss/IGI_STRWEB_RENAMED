const vision = require('@google-cloud/vision');
const path = require('path');
const fs = require('fs').promises;

class GoogleVisionService {
  constructor() {
    try {
      // Инициализация клиента Vision API
      this.client = new vision.ImageAnnotatorClient();
      console.log('✅ Google Vision API client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Vision API client:', error.message);
      throw error;
    }
  }

  /**
   * Распознает животное на изображении
   */
  async recognizeAnimal(imagePath) {
    try {
      console.log(`📸 Analyzing image: ${imagePath}`);

      // Проверяем существование файла
      try {
        await fs.access(imagePath);
      } catch {
        throw new Error(`Image file not found: ${imagePath}`);
      }

      // 1. Детекция объектов (labels)
      console.log('🔍 Performing label detection...');
      const [labelResult] = await this.client.labelDetection({
        image: { source: { filename: imagePath } }
      });

      // 2. Определение веб-сущностей
      console.log('🌐 Performing web detection...');
      const [webDetectionResult] = await this.client.webDetection({
        image: { source: { filename: imagePath } }
      });

      // 3. Детекция логотипов (для зоопарков/заповедников)
      console.log('🏷️ Performing logo detection...');
      const [logoResult] = await this.client.logoDetection({
        image: { source: { filename: imagePath } }
      });

      const labels = labelResult.labelAnnotations || [];
      const webEntities = webDetectionResult.webDetection?.webEntities || [];
      const logos = logoResult.logoAnnotations || [];

      // Фильтруем только животных из результатов
      const animalLabels = this.filterAnimalLabels(labels);
      const webAnimals = this.filterWebEntities(webEntities);
      
      // Объединяем и сортируем результаты
      const allResults = [...animalLabels, ...webAnimals];
      allResults.sort((a, b) => b.confidence - a.confidence);

      // Получаем лучший результат
      const bestMatch = allResults[0] || {
        name: 'Unknown Animal',
        confidence: 0,
        type: 'unknown'
      };

      return {
        success: true,
        detectedAnimals: allResults.slice(0, 10), // Топ-10 результатов
        bestMatch: bestMatch,
        databaseMatches: [], // Позже можно добавить поиск в вашей БД
        additionalInfo: {
          totalLabels: labels.length,
          animalLabels: animalLabels.length,
          webEntities: webEntities.length,
          logos: logos.map(logo => logo.description)
        },
        rawData: {
          labels: labels.slice(0, 5).map(l => ({
            description: l.description,
            confidence: l.score
          })),
          webEntities: webEntities.slice(0, 3).map(e => ({
            description: e.description,
            score: e.score
          })),
          logos: logos.map(l => l.description)
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Google Vision API Error:', error);
      
      // Пробуем определить, какая именно ошибка
      let errorMessage = 'Failed to recognize animal';
      
      if (error.message.includes('credentials')) {
        errorMessage = 'Invalid Google Cloud credentials. Please check your credentials file.';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Permission denied. Check if the service account has Cloud Vision API access.';
      } else if (error.message.includes('quota')) {
        errorMessage = 'API quota exceeded. Please check your Google Cloud quota.';
      } else if (error.message.includes('ENOENT')) {
        errorMessage = 'Image file not found or inaccessible.';
      } else {
        errorMessage = `Vision API error: ${error.message}`;
      }

      throw new Error(errorMessage);
    }
  }

  /**
   * Фильтрует метки, относящиеся к животным
   */
  filterAnimalLabels(labels) {
    const animalKeywords = [
      // Млекопитающие
      'lion', 'tiger', 'elephant', 'giraffe', 'zebra', 'bear', 'wolf', 'fox',
      'deer', 'monkey', 'ape', 'gorilla', 'chimpanzee', 'orangutan', 'panda',
      'koala', 'kangaroo', 'wallaby', 'wombat', 'platypus', 'rhinoceros',
      'hippopotamus', 'buffalo', 'bison', 'antelope', 'gazelle', 'camel',
      'llama', 'alpaca', 'horse', 'donkey', 'zebra', 'tapir',
      
      // Птицы
      'bird', 'eagle', 'hawk', 'falcon', 'owl', 'parrot', 'macaw', 'cockatoo',
      'penguin', 'flamingo', 'ostrich', 'emu', 'kiwi', 'peacock', 'swan',
      'goose', 'duck', 'chicken', 'turkey', 'pigeon', 'dove',
      
      // Рептилии
      'reptile', 'snake', 'python', 'cobra', 'viper', 'lizard', 'gecko',
      'iguana', 'chameleon', 'crocodile', 'alligator', 'turtle', 'tortoise',
      
      // Амфибии
      'amphibian', 'frog', 'toad', 'salamander', 'newt',
      
      // Рыбы
      'fish', 'shark', 'whale', 'dolphin', 'porpoise', 'seal', 'sea lion',
      'walrus', 'octopus', 'squid', 'jellyfish', 'crab', 'lobster', 'shrimp',
      
      // Домашние животные
      'dog', 'puppy', 'cat', 'kitten', 'rabbit', 'hamster', 'guinea pig',
      'ferret', 'mouse', 'rat'
    ];

    return labels
      .filter(label => {
        const labelText = label.description.toLowerCase();
        return animalKeywords.some(keyword => labelText.includes(keyword));
      })
      .map(label => ({
        name: label.description,
        confidence: label.score || 0,
        type: this.getAnimalType(label.description),
        source: 'label_detection'
      }));
  }

  /**
   * Фильтрует веб-сущности
   */
  filterWebEntities(entities) {
    return entities
      .filter(entity => entity.description && entity.description.length > 0)
      .map(entity => ({
        name: entity.description,
        confidence: entity.score || 0.5,
        type: 'web_entity',
        source: 'web_detection'
      }))
      .slice(0, 5); // Берем только топ-5
  }

  /**
   * Определяет тип животного по названию
   */
  getAnimalType(animalName) {
    const name = animalName.toLowerCase();
    
    if (name.includes('bird') || name.includes('eagle') || name.includes('owl')) {
      return 'bird';
    } else if (name.includes('fish') || name.includes('shark')) {
      return 'fish';
    } else if (name.includes('reptile') || name.includes('snake') || name.includes('lizard')) {
      return 'reptile';
    } else if (name.includes('amphibian') || name.includes('frog')) {
      return 'amphibian';
    } else {
      return 'mammal';
    }
  }

  /**
   * Простой тест API
   */
  async testConnection() {
    try {
      console.log('Testing Google Vision API connection...');
      
      // Создаем временный тестовый файл
      const testImagePath = path.join(__dirname, '..', 'uploads', 'temp', 'test.txt');
      await fs.writeFile(testImagePath, 'test');
      
      const [result] = await this.client.labelDetection({
        image: { content: Buffer.from('test').toString('base64') }
      });
      
      await fs.unlink(testImagePath);
      
      console.log('✅ Vision API connection successful');
      return {
        success: true,
        message: 'API connection successful',
        projectId: this.client.projectId
      };
    } catch (error) {
      console.error('❌ Vision API connection failed:', error.message);
      return {
        success: false,
        message: `API connection failed: ${error.message}`,
        error: error.message
      };
    }
  }
}

// Экспортируем синглтон
const visionService = new GoogleVisionService();
module.exports = visionService;