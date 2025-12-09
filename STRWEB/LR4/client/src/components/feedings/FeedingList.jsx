// src/components/feedings/FeedingList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './FeedingList.css';

const FeedingList = () => {
  const { user } = useAuth();
  const [feedings, setFeedings] = useState([]);
  const [filteredFeedings, setFilteredFeedings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('feedingTime');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchFeedings();
  }, []);

  const filterAndSortFeedings = useCallback(() => {
    let result = [...feedings];

    // Поиск
    if (searchTerm) {
      result = result.filter(feeding =>
        (feeding.animal?.name && feeding.animal.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        feeding.foodType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Сортировка
    result.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'feedingTime') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortField === 'quantity') {
        aValue = a.quantity;
        bValue = b.quantity;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredFeedings(result);
  }, [feedings, searchTerm, sortField, sortDirection]);

  useEffect(() => {
    filterAndSortFeedings();
  }, [filterAndSortFeedings]);

  const fetchFeedings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/feedings');
      setFeedings(response.data);
      setError(null);
    } catch (error) {
      console.error('Ошибка загрузки кормлений:', error);
      setError('Не удалось загрузить список кормлений');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту запись о кормлении?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/feedings/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchFeedings();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Не удалось удалить запись о кормлении');
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="feeding-list-container">
      <div className="feeding-list-header">
        <h1>🥕 Кормление животных</h1>
        
        {user && (
          <Link to="/feedings/new" className="btn btn-primary">
            ➕ Добавить запись о кормлении
          </Link>
        )}
      </div>

      <div className="search-sort-panel">
        <div className="search-box">
          <input
            type="text"
            placeholder="Поиск по животному или типу корма..."
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
            <option value="feedingTime">По дате кормления</option>
            <option value="foodType">По типу корма</option>
            <option value="quantity">По количеству</option>
          </select>

          <button 
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="sort-direction-btn"
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className="feedings-table-container">
        <table className="feedings-table">
          <thead>
            <tr>
              <th>Животное</th>
              <th>Тип корма</th>
              <th>Количество</th>
              <th>Дата кормления</th>
              <th>Кормил</th>
              {user && <th>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {filteredFeedings.map(feeding => (
              <tr key={feeding._id}>
                <td>
                  {feeding.animal?.name ? (
                    <Link to={`/animals/${feeding.animal._id}`} className="animal-link">
                      {feeding.animal.name}
                    </Link>
                  ) : 'Неизвестно'}
                </td>
                <td>{feeding.foodType}</td>
                <td>{feeding.quantity} {feeding.unit}</td>
                <td>{new Date(feeding.feedingTime).toLocaleString('ru-RU')}</td>
                <td>
                  {feeding.fedBy ? (
                    <span className="fed-by">
                      {feeding.fedBy.firstName} {feeding.fedBy.lastName}
                    </span>
                  ) : 'Неизвестно'}
                </td>
                
                {user && (
                  <td className="actions-cell">
                    <Link to={`/feedings/${feeding._id}`} className="btn-view">
                      👁️
                    </Link>
                    <Link to={`/feedings/edit/${feeding._id}`} className="btn-edit">
                      ✏️
                    </Link>
                    <button 
                      onClick={() => handleDelete(feeding._id)}
                      className="btn-delete"
                    >
                      🗑️
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredFeedings.length === 0 && (
          <div className="no-results">
            <p>Записи о кормлении не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedingList;