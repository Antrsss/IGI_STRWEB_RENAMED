const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Добро пожаловать в MERN-приложение!' });
});

app.get('/api/items', (req, res) => {
  res.json([{ id: 1, name: 'Пример элемента' }]);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});