import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Загружаем данные с сервера при монтировании компонента
    fetchItems();
    fetchWelcomeMessage();
  }, []);

  const fetchWelcomeMessage = async () => {
    try {
      const response = await axios.get('/');
      setMessage(response.data.message);
    } catch (error) {
      console.error('Ошибка при загрузке сообщения:', error);
      setMessage('Не удалось загрузить сообщение с сервера');
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/items');
      setItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
      setLoading(false);
    }
  };

  const addItem = async () => {
    try {
      const newItem = { 
        id: items.length + 1, 
        name: `Элемент ${items.length + 1}` 
      };
      
      // В реальном приложении здесь будет POST запрос
      setItems([...items, newItem]);
    } catch (error) {
      console.error('Ошибка при добавлении элемента:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Лабораторная работа 4: React + Node.js</h1>
        <p><strong>Сообщение с сервера:</strong> {message}</p>
        
        <div className="content">
          <h2>Список элементов</h2>
          
          <button onClick={addItem} style={{ margin: '10px', padding: '10px 20px' }}>
            Добавить элемент
          </button>
          
          {loading ? (
            <p>Загрузка данных...</p>
          ) : (
            <ul style={{ textAlign: 'left', display: 'inline-block' }}>
              {items.map(item => (
                <li key={item.id} style={{ margin: '5px 0' }}>
                  <strong>{item.id}.</strong> {item.name}
                </li>
              ))}
            </ul>
          )}
          
          <p style={{ marginTop: '30px' }}>
            <small>Клиент: React 19 | Сервер: Express 5</small>
          </p>
        </div>
      </header>
    </div>
  );
}

export default App;