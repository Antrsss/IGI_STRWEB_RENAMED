// src/components/feedings/FeedingForm.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FeedingForm.css';

const FeedingForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    animal: '',
    foodType: 'Meat',
    quantity: '',
    unit: 'kg',
    feedingTime: new Date().toISOString().slice(0, 16),
    fedBy: '',
    notes: '',
    cost: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchDropdownData();
  }, [user, navigate]);

  const fetchDropdownData = async () => {
    try {
      setLoadingData(true);
      const [animalsRes, employeesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/animals'),
        axios.get('http://localhost:5000/api/employees')
      ]);
      
      setAnimals(animalsRes.data);
      setEmployees(employeesRes.data);
      
      // Set default values if available
      if (animalsRes.data.length > 0 && !formData.animal) {
        setFormData(prev => ({ ...prev, animal: animalsRes.data[0]._id }));
      }
      
      if (employeesRes.data.length > 0 && !formData.fedBy) {
        setFormData(prev => ({ ...prev, fedBy: employeesRes.data[0]._id }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load required data');
    } finally {
      setLoadingData(false);
    }
  };

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

      // Prepare data for sending
      const dataToSend = {
        ...formData,
        quantity: Number(formData.quantity),
        feedingTime: new Date(formData.feedingTime).toISOString(),
        cost: formData.cost ? Number(formData.cost) : undefined
      };

      // Create new feeding
      await axios.post('http://localhost:5000/api/feedings', dataToSend, config);
      alert('Feeding record created successfully!');
      navigate('/feedings');
    } catch (error) {
      console.error('Create error:', error);
      setError(error.response?.data?.error || 'Error creating feeding record');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loadingData) {
    return <div className="loading">Loading data...</div>;
  }

  return (
    <div className="feeding-form-container">
      <div className="feeding-form-header">
        <h1>➕ Add New Feeding Record</h1>
        <button onClick={() => navigate('/feedings')} className="btn-back">
          ← Back to List
        </button>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="feeding-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="animal">Animal *</label>
            <select
              id="animal"
              name="animal"
              value={formData.animal}
              onChange={handleChange}
              required
              disabled={loading || animals.length === 0}
            >
              {animals.map(animal => (
                <option key={animal._id} value={animal._id}>
                  {animal.name} ({animal.species})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="foodType">Food Type *</label>
            <select
              id="foodType"
              name="foodType"
              value={formData.foodType}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="Meat">Meat</option>
              <option value="Fish">Fish</option>
              <option value="Fruits">Fruits</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Grain">Grain</option>
              <option value="Hay">Hay</option>
              <option value="Special Feed">Special Feed</option>
              <option value="Vitamins">Vitamins</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity *</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
              disabled={loading}
              placeholder="e.g., 2.5"
            />
          </div>

          <div className="form-group">
            <label htmlFor="unit">Unit *</label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="l">l</option>
              <option value="pcs">pcs</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="feedingTime">Feeding Time *</label>
            <input
              type="datetime-local"
              id="feedingTime"
              name="feedingTime"
              value={formData.feedingTime}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fedBy">Fed By (Employee) *</label>
            <select
              id="fedBy"
              name="fedBy"
              value={formData.fedBy}
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
            <label htmlFor="cost">Cost ($)</label>
            <input
              type="number"
              id="cost"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              min="0"
              step="0.01"
              disabled={loading}
              placeholder="e.g., 15.50"
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            maxLength="500"
            disabled={loading}
            placeholder="Add any notes about this feeding..."
          />
          <small className="char-count">{formData.notes.length}/500 characters</small>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/feedings')}
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
            {loading ? 'Creating...' : 'Create Feeding Record'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedingForm;