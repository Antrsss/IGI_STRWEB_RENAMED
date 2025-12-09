// src/components/animals/AnimalList.jsx
import { useState, useEffect, useCallback } from 'react';
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
  
  // For search and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchAnimals();
  }, []);

  // Use useCallback so the function doesn't get recreated on every render
  const filterAndSortAnimals = useCallback(() => {
    let result = [...animals];

    // Search
    if (searchTerm) {
      result = result.filter(animal =>
        animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.species.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sorting
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
  }, [filterAndSortAnimals]); // Now dependency is stable thanks to useCallback

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/animals');
      setAnimals(response.data);
      setError(null);
    } catch (error) {
      console.error('Error loading animals:', error);
      setError('Failed to load animal list');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this animal?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/animals/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchAnimals(); // Refresh list
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete animal');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="animal-list-container">
      <div className="animal-list-header">
        <h1>Animal List</h1>
        
        {user && (
          <Link to="/animals/new" className="btn btn-primary">
            ➕ Add New Animal
          </Link>
        )}
      </div>

      {/* Search and sort panel */}
      <div className="search-sort-panel">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or species..."
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
            <option value="species">By species</option>
            <option value="age">By age</option>
            <option value="arrivalDate">By arrival date</option>
          </select>

          <button 
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="sort-direction-btn"
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Animals table */}
      <div className="animals-table-container">
        <table className="animals-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Species</th>
              <th>Age</th>
              <th>Weight</th>
              <th>Health Status</th>
              <th>Arrival Date</th>
              {user && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredAnimals.map(animal => (
              <tr key={animal._id}>
                <td>{animal.name}</td>
                <td>{animal.species}</td>
                <td>{animal.age} years</td>
                <td>{animal.weight} kg</td>
                <td>
                  <span className={`health-status health-${animal.healthStatus.toLowerCase().replace(' ', '-')}`}>
                    {animal.healthStatus}
                  </span>
                </td>
                <td>{new Date(animal.arrivalDate).toLocaleDateString('en-US')}</td>
                
                {user && (
                  <td className="actions-cell">
                    <Link to={`/animals/${animal._id}`} className="btn-view">
                      View
                    </Link>
                    <Link to={`/animals/edit/${animal._id}`} className="btn-edit">
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(animal._id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAnimals.length === 0 && (
          <div className="no-results">
            <p>No animals found</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="animal-stats">
        <div className="stat-card">
          <h3>Total Animals</h3>
          <p className="stat-number">{animals.length}</p>
        </div>
        <div className="stat-card">
          <h3>Displayed</h3>
          <p className="stat-number">{filteredAnimals.length}</p>
        </div>
      </div>
    </div>
  );
};

export default AnimalList;