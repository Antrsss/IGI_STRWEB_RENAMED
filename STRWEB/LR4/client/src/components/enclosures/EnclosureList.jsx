// src/components/enclosures/EnclosureList.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './EnclosureList.css';

import {
  getUserTimeZone,
  getUTCOffset,
  formatLocalDateTime,
  formatUTCDateTime
} from '../../utils/dateUtils';

const EnclosureList = () => {
  const { user } = useAuth();
  const [enclosures, setEnclosures] = useState([]);
  const [filteredEnclosures, setFilteredEnclosures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  const [currentDateTime, setCurrentDateTime] = useState({
    local: '',
    utc: '',
    timezone: '',
    offset: ''
  });

  useEffect(() => {
    fetchEnclosures();
    updateCurrentDateTime();
    
    const interval = setInterval(updateCurrentDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const updateCurrentDateTime = () => {
    const now = new Date();
    
    setCurrentDateTime({
      local: formatLocalDateTime(now),
      utc: formatUTCDateTime(now),
      timezone: getUserTimeZone(),
      offset: `UTC${getUTCOffset() >= 0 ? '+' : ''}${getUTCOffset()}`
    });
  };

  const filterAndSortEnclosures = useCallback(() => {
    let result = [...enclosures];

    if (searchTerm) {
      result = result.filter(enclosure =>
        enclosure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enclosure.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enclosure.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    result.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'size.area') {
        aValue = a.size.area;
        bValue = b.size.area;
      }
      
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aValue = new Date(a[sortField]);
        bValue = new Date(b[sortField]);
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
      console.error('Error loading enclosures:', error);
      setError('Failed to load enclosure list');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enclosure?')) {
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
      console.error('Delete error:', error);
      alert('Failed to delete enclosure');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="enclosure-list-container">
      <div className="enclosure-list-header">
        <h1>Zoo Enclosures</h1>
        
        {user && (
          <Link to="/enclosures/new" className="btn btn-primary">
            ➕ Add Enclosure
          </Link>
        )}
      </div>

      <div className="search-sort-panel">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, type, or location..."
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
            <option value="name">By name</option>
            <option value="type">By type</option>
            <option value="size.area">By area</option>
            <option value="location">By location</option>
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
                <p><strong>Location:</strong> {enclosure.location}</p>
                <p><strong>Area:</strong> {enclosure.size.area} m²</p>
                <p><strong>Capacity:</strong> {enclosure.size.capacity || 'Not specified'} animals</p>
                <p><strong>Condition:</strong> 
                  <span className={`maintenance-status ${enclosure.maintenanceStatus.toLowerCase().replace(' ', '-')}`}>
                    {enclosure.maintenanceStatus}
                  </span>
                </p>
                
                <div className="timestamp-info">
                  <div className="timestamp-group">
                    <div className="timestamp-item">
                      <strong className="timestamp-label">Created:</strong>
                      <div className="timestamp-values">
                        <div className="timestamp-row">
                          <span className="time-type">Local:</span>
                          <span className="time-value">{formatLocalDateTime(enclosure.createdAt)}</span>
                        </div>
                        <div className="timestamp-row">
                          <span className="time-type">UTC:</span>
                          <span className="time-value">{formatUTCDateTime(enclosure.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="timestamp-item">
                      <strong className="timestamp-label">Last Updated:</strong>
                      <div className="timestamp-values">
                        <div className="timestamp-row">
                          <span className="time-type">Local:</span>
                          <span className="time-value">{formatLocalDateTime(enclosure.updatedAt)}</span>
                        </div>
                        <div className="timestamp-row">
                          <span className="time-type">UTC:</span>
                          <span className="time-value">{formatUTCDateTime(enclosure.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {user && (
                <div className="enclosure-actions">
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
            <p>No enclosures found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnclosureList;