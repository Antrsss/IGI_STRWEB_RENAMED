import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { DateTimeDisplay } from '../../utils/dateUtils';
import './AnimalList.css';

const AnimalList = () => {
  const { user } = useAuth();
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  useEffect(() => {
    fetchAnimals();
  }, []);

  const filterAndSortAnimals = useCallback(() => {
    let result = [...animals];

    if (searchTerm) {
      result = result.filter(animal =>
        animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (animal.specialNeeds && animal.specialNeeds.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    result.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'arrivalDate' || sortField === 'createdAt' || sortField === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortField === 'weight') {
        aValue = a.weight;
        bValue = b.weight;
      }

      if (sortField === 'age') {
        aValue = a.age;
        bValue = b.age;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredAnimals(result);
  }, [animals, searchTerm, sortField, sortDirection]);

  useEffect(() => {
    filterAndSortAnimals();
  }, [filterAndSortAnimals]);

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
      fetchAnimals();
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

      <div className="search-sort-panel">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, species, or special needs..."
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
            <option value="weight">By weight</option>
            <option value="arrivalDate">By arrival date</option>
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

      <div className="animals-grid">
        {filteredAnimals.map(animal => (
          <div key={animal._id} className="animal-card">
            <div className="animal-image">
              <img 
                src={animal.imageUrl || `https://placehold.co/400x300/4a5568/ffffff?text=${encodeURIComponent(animal.name)}`} 
                alt={animal.name}
                onError={(e) => {
                  e.target.src = `https://placehold.co/400x300/4a5568/ffffff?text=${encodeURIComponent(animal.name)}`;
                }}
              />
            </div>
            
            <div className="animal-card-body">
              <h3 className="animal-name">{animal.name}</h3>
              <p className="animal-species">{animal.species}</p>
              
              <div className="animal-info">
                <p><strong>Age:</strong> {animal.age} years</p>
                <p><strong>Weight:</strong> {animal.weight} kg</p>
                <p><strong>Diet:</strong> {animal.dietType}</p>
                <p>
                  <strong>Health:</strong>
                  <span className={`health-status health-${animal.healthStatus.toLowerCase().replace(' ', '-')}`}>
                    {animal.healthStatus}
                  </span>
                </p>
              </div>
              
              <div className="animal-dates">
                <div className="date-info">
                  <small><strong>Arrived:</strong></small>
                  <DateTimeDisplay 
                    date={animal.arrivalDate} 
                    showRelative={true}
                    showLocal={false}
                    showUTC={false}
                  />
                </div>
                
                {animal.specialNeeds && (
                  <div className="special-needs">
                    <small><strong>Special Needs:</strong> {animal.specialNeeds}</small>
                  </div>
                )}
              </div>
              
              {user && (
                <div className="animal-actions">
                  <Link to={`/animals/${animal._id}`} className="btn-view">
                    Details
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
                </div>
              )}
            </div>
            
            <div className="animal-card-footer">
              <small className="text-muted">
                <strong>Created:</strong> <DateTimeDisplay date={animal.createdAt} showRelative={true} showLocal={false} showUTC={false} />
                <br />
                <strong>Updated:</strong> <DateTimeDisplay date={animal.updatedAt} showRelative={true} showLocal={false} showUTC={false} />
              </small>
            </div>
          </div>
        ))}

        {filteredAnimals.length === 0 && (
          <div className="no-results">
            <p>No animals found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimalList;