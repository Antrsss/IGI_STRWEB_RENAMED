import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EnclosureForm.css';

const EnclosureForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Open',
    size: {
      area: '',
      capacity: ''
    },
    location: 'North Zone',
    temperatureRange: {
      min: '',
      max: ''
    },
    maintenanceStatus: 'Good',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('size.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        size: {
          ...prev.size,
          [field]: value
        }
      }));
    } else if (name.startsWith('temperatureRange.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        temperatureRange: {
          ...prev.temperatureRange,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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

      const dataToSend = {
        ...formData,
        size: {
          area: Number(formData.size.area),
          capacity: formData.size.capacity ? Number(formData.size.capacity) : undefined
        },
        temperatureRange: {
          min: formData.temperatureRange.min ? Number(formData.temperatureRange.min) : undefined,
          max: formData.temperatureRange.max ? Number(formData.temperatureRange.max) : undefined
        }
      };

      await axios.post('http://localhost:5000/api/enclosures', dataToSend, config);
      alert('Enclosure created successfully!');
      navigate('/enclosures');
    } catch (error) {
      console.error('Create error:', error);
      setError(error.response?.data?.error || 'Error creating enclosure');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="enclosure-form-container">
      <div className="enclosure-form-header">
        <h1>➕ Add New Enclosure</h1>
        <button onClick={() => navigate('/enclosures')} className="btn-back">
          ← Back to List
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="enclosure-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Enclosure Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="e.g., Big Aviary"
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Enclosure Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Aquarium">Aquarium</option>
              <option value="Terrarium">Terrarium</option>
              <option value="Aviary">Aviary</option>
              <option value="Isolation">Isolation</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="North Zone">North Zone</option>
              <option value="South Zone">South Zone</option>
              <option value="East Zone">East Zone</option>
              <option value="West Zone">West Zone</option>
              <option value="Central Zone">Central Zone</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="size.area">Area (m²) *</label>
            <input
              type="number"
              id="size.area"
              name="size.area"
              value={formData.size.area}
              onChange={handleChange}
              min="1"
              required
              disabled={loading}
              placeholder="e.g., 100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="size.capacity">Capacity (animals)</label>
            <input
              type="number"
              id="size.capacity"
              name="size.capacity"
              value={formData.size.capacity}
              onChange={handleChange}
              min="1"
              disabled={loading}
              placeholder="e.g., 5"
            />
          </div>

          <div className="form-group">
            <label htmlFor="maintenanceStatus">Maintenance Status</label>
            <select
              id="maintenanceStatus"
              name="maintenanceStatus"
              value={formData.maintenanceStatus}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Requires Repair">Requires Repair</option>
              <option value="Under Reconstruction">Under Reconstruction</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="temperatureRange.min">Min Temperature (°C)</label>
            <input
              type="number"
              id="temperatureRange.min"
              name="temperatureRange.min"
              value={formData.temperatureRange.min}
              onChange={handleChange}
              disabled={loading}
              placeholder="e.g., 18"
            />
          </div>

          <div className="form-group">
            <label htmlFor="temperatureRange.max">Max Temperature (°C)</label>
            <input
              type="number"
              id="temperatureRange.max"
              name="temperatureRange.max"
              value={formData.temperatureRange.max}
              onChange={handleChange}
              disabled={loading}
              placeholder="e.g., 25"
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            maxLength="1000"
            disabled={loading}
            placeholder="Describe enclosure features, special requirements, etc..."
          />
          <small className="char-count">{formData.description.length}/1000 characters</small>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/enclosures')}
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
            {loading ? 'Creating...' : 'Create Enclosure'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnclosureForm;