// src/components/feedings/FeedingList.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './FeedingList.css';

// Импортируем утилиты для работы с временем
import {
  getUserTimeZone,
  getUTCOffset,
  formatLocalDateTime,
  formatUTCDateTime
} from '../../utils/dateUtils';

const FeedingList = () => {
  const { user } = useAuth();
  const [feedings, setFeedings] = useState([]);
  const [filteredFeedings, setFilteredFeedings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('feedingTime');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Текущая дата и временная зона пользователя
  const [currentDateTime, setCurrentDateTime] = useState({
    local: '',
    utc: '',
    timezone: '',
    offset: ''
  });

  useEffect(() => {
    fetchFeedings();
    updateCurrentDateTime();
    
    // Обновляем время каждую минуту
    const interval = setInterval(updateCurrentDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Функция для обновления текущей даты и времени
  const updateCurrentDateTime = () => {
    const now = new Date();
    
    setCurrentDateTime({
      local: formatLocalDateTime(now),
      utc: formatUTCDateTime(now),
      timezone: getUserTimeZone(),
      offset: `UTC${getUTCOffset() >= 0 ? '+' : ''}${getUTCOffset()}`
    });
  };

  const filterAndSortFeedings = useCallback(() => {
    let result = [...feedings];

    // Search
    if (searchTerm) {
      result = result.filter(feeding =>
        (feeding.animal?.name && feeding.animal.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        feeding.foodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (feeding.fedBy?.firstName && `${feeding.fedBy.firstName} ${feeding.fedBy.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sorting
    result.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'feedingTime' || sortField === 'createdAt' || sortField === 'updatedAt') {
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
      console.error('Error loading feedings:', error);
      setError('Failed to load feeding list');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feeding record?')) {
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
      console.error('Delete error:', error);
      alert('Failed to delete feeding record');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="feeding-list-container">
      <div className="feeding-list-header">
        <h1>Animal Feeding</h1>
        
        {user && (
          <Link to="/feedings/new" className="btn btn-primary">
            ➕ Add Feeding Record
          </Link>
        )}
      </div>

      <div className="search-sort-panel">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by animal, food type, or employee..."
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
            <option value="feedingTime">By feeding date</option>
            <option value="foodType">By food type</option>
            <option value="quantity">By quantity</option>
            <option value="createdAt">By creation date</option>
            <option value="updatedAt">By update date</option>
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
              <th>Animal</th>
              <th>Food Type</th>
              <th>Quantity</th>
              <th>Feeding Date</th>
              <th>Fed By</th>
              <th>Timestamps</th>
              {user && <th>Actions</th>}
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
                  ) : 'Unknown'}
                </td>
                <td>{feeding.foodType}</td>
                <td>{feeding.quantity} {feeding.unit}</td>
                <td>
                  <div className="time-display">
                    <div className="time-row">
                      <span className="time-type">Local:</span>
                      <span className="time-value">{formatLocalDateTime(feeding.feedingTime)}</span>
                    </div>
                    <div className="time-row">
                      <span className="time-type">UTC:</span>
                      <span className="time-value">{formatUTCDateTime(feeding.feedingTime)}</span>
                    </div>
                  </div>
                </td>
                <td>
                  {feeding.fedBy ? (
                    <span className="fed-by">
                      {feeding.fedBy.firstName} {feeding.fedBy.lastName}
                    </span>
                  ) : 'Unknown'}
                </td>
                
                {/* Временные метки создания/обновления */}
                <td>
                  <div className="timestamp-details">
                    <details className="timestamp-dropdown">
                      <summary className="timestamp-summary">View Timestamps</summary>
                      <div className="timestamp-content">
                        <div className="timestamp-group">
                          <h5>Record Created</h5>
                          <div className="timestamp-row">
                            <span className="timestamp-label">Local:</span>
                            <span className="timestamp-value">{formatLocalDateTime(feeding.createdAt)}</span>
                          </div>
                          <div className="timestamp-row">
                            <span className="timestamp-label">UTC:</span>
                            <span className="timestamp-value">{formatUTCDateTime(feeding.createdAt)}</span>
                          </div>
                        </div>
                        
                        <div className="timestamp-group">
                          <h5>Last Updated</h5>
                          <div className="timestamp-row">
                            <span className="timestamp-label">Local:</span>
                            <span className="timestamp-value">{formatLocalDateTime(feeding.updatedAt)}</span>
                          </div>
                          <div className="timestamp-row">
                            <span className="timestamp-label">UTC:</span>
                            <span className="timestamp-value">{formatUTCDateTime(feeding.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>
                </td>
                
                {user && (
                  <td className="actions-cell">
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
            <p>No feeding records found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedingList;