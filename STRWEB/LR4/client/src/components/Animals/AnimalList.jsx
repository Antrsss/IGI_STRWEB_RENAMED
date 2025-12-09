// src/components/animals/AnimalList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AnimalList.css';

const AnimalList = () => {
  const { user } = useAuth();
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Для поиска и сортировки
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchAnimals();
  }, []);

  // Используем useCallback, чтобы функция не пересоздавалась при каждом рендере
  const filterAndSortAnimals = useCallback(() => {
    let result = [...animals];

    // Поиск
    if (searchTerm) {
      result = result.filter(animal =>
        animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.species.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Сортировка
    result.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'arrivalDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredAnimals(result);
  }, [animals, searchTerm, sortField, sortDirection]);

  useEffect(() => {
    filterAndSortAnimals();
  }, [filterAndSortAnimals]); // Теперь зависимость стабильна благодаря useCallback

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/animals');
      setAnimals(response.data);
      setError(null);
    } catch (error) {
      console.error('Ошибка загрузки животных:', error);
      setError('Не удалось загрузить список животных');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить это животное?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/animals/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchAnimals(); // Обновляем список
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Не удалось удалить животное');
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="animal-list-container">
      <div className="animal-list-header">
        <h1>🐾 Список животных</h1>
        
        {user && (
          <Link to="/animals/new" className="btn btn-primary">
            ➕ Добавить новое животное
          </Link>
        )}
      </div>

      {/* Панель поиска и сортировки */}
      <div className="search-sort-panel">
        <div className="search-box">
          <input
            type="text"
            placeholder="Поиск по имени или виду..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="sort-controls">
          <select 
            value={sortField} 
            onChange={(e) => setSortField(e.target.value)}
            className="sort-select"
          >
            <option value="name">По имени</option>
            <option value="species">По виду</option>
            <option value="age">По возрасту</option>
            <option value="arrivalDate">По дате прибытия</option>
          </select>

          <button 
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="sort-direction-btn"
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Таблица животных */}
      <div className="animals-table-container">
        <table className="animals-table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Вид</th>
              <th>Возраст</th>
              <th>Вес</th>
              <th>Состояние здоровья</th>
              <th>Дата прибытия</th>
              {user && <th>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {filteredAnimals.map(animal => (
              <tr key={animal._id}>
                <td>{animal.name}</td>
                <td>{animal.species}</td>
                <td>{animal.age} лет</td>
                <td>{animal.weight} кг</td>
                <td>
                  <span className={`health-status health-${animal.healthStatus.toLowerCase().replace(' ', '-')}`}>
                    {animal.healthStatus}
                  </span>
                </td>
                <td>{new Date(animal.arrivalDate).toLocaleDateString('ru-RU')}</td>
                
                {user && (
                  <td className="actions-cell">
                    <Link to={`/animals/${animal._id}`} className="btn-view">
                      👁️ Просмотр
                    </Link>
                    <Link to={`/animals/edit/${animal._id}`} className="btn-edit">
                      ✏️ Редактировать
                    </Link>
                    <button 
                      onClick={() => handleDelete(animal._id)}
                      className="btn-delete"
                    >
                      🗑️ Удалить
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAnimals.length === 0 && (
          <div className="no-results">
            <p>Животные не найдены</p>
          </div>
        )}
      </div>

      {/* Статистика */}
      <div className="animal-stats">
        <div className="stat-card">
          <h3>Всего животных</h3>
          <p className="stat-number">{animals.length}</p>
        </div>
        <div className="stat-card">
          <h3>Отображено</h3>
          <p className="stat-number">{filteredAnimals.length}</p>
        </div>
      </div>
    </div>
  );
};

export default AnimalList;