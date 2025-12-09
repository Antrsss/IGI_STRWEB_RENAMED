// src/components/animals/AnimalForm.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AnimalForm.css';

const AnimalForm = () => {
  const { user } = useAuth();
  const { id } = useParams(); // For editing
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enclosures, setEnclosures] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    species: 'Lion',
    age: '',
    weight: '',
    healthStatus: 'Good',
    enclosure: '',
    caretaker: '',
    dietType: 'Carnivore',
    specialNeeds: ''
  });

  const fetchDropdownData = useCallback(async () => {
    try {
      // Load enclosures and employees for dropdowns
      const [enclosuresRes, employeesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/enclosures'),
        axios.get('http://localhost:5000/api/employees')
      ]);
      
      setEnclosures(enclosuresRes.data);
      setEmployees(employeesRes.data);
      
      // Set default values if available
      if (enclosuresRes.data.length > 0 && !formData.enclosure) {
        setFormData(prev => ({ ...prev, enclosure: enclosuresRes.data[0]._id }));
      }
      
      if (employeesRes.data.length > 0 && !formData.caretaker) {
        setFormData(prev => ({ ...prev, caretaker: employeesRes.data[0]._id }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [formData.enclosure, formData.caretaker]);

  const fetchAnimalData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/animals/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Error loading animal:', error);
      setError('Failed to load animal data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchDropdownData();
    
    // If editing, load animal data
    if (id) {
      fetchAnimalData();
    }
  }, [id, user, navigate, fetchDropdownData, fetchAnimalData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      if (id) {
        // Update existing animal
        await axios.put(`http://localhost:5000/api/animals/${id}`, formData, config);
        alert('Animal updated successfully!');
      } else {
        // Create new animal
        await axios.post('http://localhost:5000/api/animals', formData, config);
        alert('Animal added successfully!');
      }
      
      navigate('/animals');
    } catch (error) {
      console.error('Save error:', error);
      setError(error.response?.data?.message || 'Error saving data');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="animal-form-container">
      <div className="animal-form-header">
        <h1>{id ? 'Edit Animal' : '➕ Add New Animal'}</h1>
        <button onClick={() => navigate('/animals')} className="btn-back">
          ← Back to list
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="animal-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Animal Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="species">Species *</label>
            <select
              id="species"
              name="species"
              value={formData.species}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="Lion">Lion</option>
              <option value="Tiger">Tiger</option>
              <option value="Elephant">Elephant</option>
              <option value="Giraffe">Giraffe</option>
              <option value="Monkey">Monkey</option>
              <option value="Panda">Panda</option>
              <option value="Crocodile">Crocodile</option>
              <option value="Bird">Bird</option>
              <option value="Reptile">Reptile</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="age">Age (years)</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="0"
              max="150"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="weight">Weight (kg)</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              min="0"
              step="0.1"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="healthStatus">Health Status</label>
            <select
              id="healthStatus"
              name="healthStatus"
              value={formData.healthStatus}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Satisfactory">Satisfactory</option>
              <option value="Requires treatment">Requires treatment</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="enclosure">Enclosure *</label>
            <select
              id="enclosure"
              name="enclosure"
              value={formData.enclosure}
              onChange={handleChange}
              required
              disabled={loading || enclosures.length === 0}
            >
              {enclosures.map(enclosure => (
                <option key={enclosure._id} value={enclosure._id}>
                  {enclosure.name} ({enclosure.type})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="caretaker">Responsible Employee *</label>
            <select
              id="caretaker"
              name="caretaker"
              value={formData.caretaker}
              onChange={handleChange}
              required
              disabled={loading || employees.length === 0}
            >
              {employees.map(employee => (
                <option key={employee._id} value={employee._id}>
                  {employee.firstName} {employee.lastName} ({employee.position})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dietType">Diet Type *</label>
            <select
              id="dietType"
              name="dietType"
              value={formData.dietType}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="Carnivore">Carnivore</option>
              <option value="Herbivore">Herbivore</option>
              <option value="Omnivore">Omnivore</option>
              <option value="Special">Special</option>
            </select>
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="specialNeeds">Special Needs</label>
          <textarea
            id="specialNeeds"
            name="specialNeeds"
            value={formData.specialNeeds}
            onChange={handleChange}
            rows="3"
            maxLength="500"
            disabled={loading}
            placeholder="Describe any special needs of the animal..."
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/animals')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (id ? 'Update' : 'Save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnimalForm;