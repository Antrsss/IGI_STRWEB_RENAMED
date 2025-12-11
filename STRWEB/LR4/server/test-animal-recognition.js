const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testAnimalRecognition() {
  try {
    console.log('Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@gmail.com',
      password: '625100'
    });
    
    const token = loginResponse.data.token;
    console.log('Logged in, token received');

    const formData = new FormData();
    formData.append('image', fs.createReadStream('snake.webp'));
    
    console.log('Sending image for recognition...');
    const response = await axios.post(
      'http://localhost:5000/api/animal-recognition/recognize',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...formData.getHeaders()
        }
      }
    );

    console.log('✅ Recognition successful!');
    console.log('Best match:', response.data.recognition.bestMatch);
    console.log('All matches:', response.data.recognition.allMatches.length);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAnimalRecognition();