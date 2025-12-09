// src/components/enclosures/EnclosureList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './EnclosureList.css';

const EnclosureList = () => {
  const { user } = useAuth();
  const [enclosures, setEnclosures] = useState([]);
  const [filteredEnclosures, setFilteredEnclosures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchEnclosures();
  }, []);

  const filterAndSortEnclosures = useCallback(() => {
    let result = [...enclosures];

    // Поиск
    if (searchTerm) {
      result = result.filter(enclosure =>
        enclosure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enclosure.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enclosure.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Сортировка
    result.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'size.area') {
        aValue = a.size.area;
        bValue = b.size.area;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredEnclosures(result);
  }, [enclosures, searchTerm, sortField, sortDirection]);

  useEffect(() => {
    filterAndSortEnclosures();
  }, [filterAndSortEnclosures]);

  const fetchEnclosures = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/enclosures');
      setEnclosures(response.data);
      setError(null);
    } catch (error) {
      console.error('Ошибка загрузки вольеров:', error);
      setError('Не удалось загрузить список вольеров');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот вольер?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/enclosures/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchEnclosures();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Не удалось удалить вольер');
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="enclosure-list-container">
      <div className="enclosure-list-header">
        <h1>🏠 Вольеры зоопарка</h1>
        
        {user && (
          <Link to="/enclosures/new" className="btn btn-primary">
            ➕ Добавить вольер
          </Link>
        )}
      </div>

      <div className="search-sort-panel">
        <div className="search-box">
          <input
            type="text"
            placeholder="Поиск по названию, типу или расположению..."
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
            <option value="name">По названию</option>
            <option value="type">По типу</option>
            <option value="size.area">По площади</option>
            <option value="location">По расположению</option>
          </select>

          <button 
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="sort-direction-btn"
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className="enclosures-grid">
        {filteredEnclosures.map(enclosure => (
          <div key={enclosure._id} className="enclosure-card">
            <div className="enclosure-card-header">
              <h3>{enclosure.name}</h3>
              <span className={`type-badge type-${enclosure.type.toLowerCase()}`}>
                {enclosure.type}
              </span>
            </div>
            
            <div className="enclosure-card-body">
              <div className="enclosure-info">
                <p><strong>📍 Расположение:</strong> {enclosure.location}</p>
                <p><strong>📏 Площадь:</strong> {enclosure.size.area} м²</p>
                <p><strong>🐾 Вместимость:</strong> {enclosure.size.capacity || 'Не указано'} животных</p>
                <p><strong>⚙️ Состояние:</strong> 
                  <span className={`maintenance-status ${enclosure.maintenanceStatus.toLowerCase().replace(' ', '-')}`}>
                    {enclosure.maintenanceStatus}
                  </span>
                </p>
              </div>
              
              {user && (
                <div className="enclosure-actions">
                  <Link to={`/enclosures/${enclosure._id}`} className="btn-view">
                    👁️ Подробнее
                  </Link>
                  <Link to={`/enclosures/edit/${enclosure._id}`} className="btn-edit">
                    ✏️
                  </Link>
                  <button 
                    onClick={() => handleDelete(enclosure._id)}
                    className="btn-delete"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredEnclosures.length === 0 && (
          <div className="no-results">
            <p>Вольеры не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnclosureList;