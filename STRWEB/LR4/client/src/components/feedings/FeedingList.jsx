// src/components/feedings/FeedingList.jsx
import { useState, useEffect, useCallback } from 'react';
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

    // Search
    if (searchTerm) {
      result = result.filter(feeding =>
        (feeding.animal?.name && feeding.animal.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        feeding.foodType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sorting
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
            placeholder="Search by animal or food type..."
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
                <td>{new Date(feeding.feedingTime).toLocaleString('en-US')}</td>
                <td>
                  {feeding.fedBy ? (
                    <span className="fed-by">
                      {feeding.fedBy.firstName} {feeding.fedBy.lastName}
                    </span>
                  ) : 'Unknown'}
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
            <p>No feeding records found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedingList;