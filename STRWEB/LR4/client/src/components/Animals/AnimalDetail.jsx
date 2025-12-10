// src/components/animals/AnimalDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AnimalDetail.css';

// Импортируем утилиты для работы с временем
import {
  formatLocalDateTime,
  formatUTCDateTime
} from '../../utils/dateUtils';

const AnimalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnimalDetail();
  }, [id]);

  const fetchAnimalDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/animals/${id}`);
      setAnimal(response.data);
    } catch (error) {
      console.error('Loading error:', error);
      setError('Failed to load animal information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!animal) return <div className="not-found">Animal not found</div>;

  return (
    <div className="animal-detail-container">
      <div className="animal-detail-header">
        <button onClick={() => navigate('/animals')} className="btn-back">
          ← Back to list
        </button>
        <h1>{animal.name}</h1>
      </div>

      <div className="animal-detail-content">
        <div className="animal-info-card">
          {/* Основная информация с изображением */}
          <div className="animal-main-info">
            <div className="animal-image-container">
              <img 
                src={animal.imageUrl} 
                alt={animal.name}
                className="animal-image"
                onError={(e) => {
                  e.target.src = `https://placehold.co/400x300/4a5568/ffffff?text=${encodeURIComponent(animal.name)}`;
                }}
              />
            </div>
            
            <div className="animal-basic-info">
              <div className="info-row">
                <span className="info-label">Species:</span>
                <span className="info-value species-badge">{animal.species}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Age:</span>
                <span className="info-value">{animal.age || 'N/A'} years</span>
              </div>
              <div className="info-row">
                <span className="info-label">Weight:</span>
                <span className="info-value">{animal.weight || 'N/A'} kg</span>
              </div>
              <div className="info-row">
                <span className="info-label">Health Status:</span>
                <span className={`health-badge health-${animal.healthStatus.toLowerCase().replace(' ', '-')}`}>
                  {animal.healthStatus}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Diet Type:</span>
                <span className="info-value diet-badge diet-${animal.dietType.toLowerCase()}">
                  {animal.dietType}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Arrival Date:</span>
                <span className="info-value">
                  {animal.arrivalDate ? formatLocalDateTime(animal.arrivalDate) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {animal.specialNeeds && (
            <div className="special-needs-section">
              <h3>Special Needs</h3>
              <p>{animal.specialNeeds}</p>
            </div>
          )}

          <div className="related-info">
            <div className="enclosure-info">
              <h3>Enclosure Information</h3>
              {animal.enclosure ? (
                <>
                  <p><strong>Name:</strong> {animal.enclosure.name}</p>
                  <p><strong>Type:</strong> {animal.enclosure.type}</p>
                  <p><strong>Location:</strong> {animal.enclosure.location}</p>
                  <p><strong>Area:</strong> {animal.enclosure.size?.area || 'N/A'} m²</p>
                  <p><strong>Condition:</strong> {animal.enclosure.maintenanceStatus || 'N/A'}</p>
                </>
              ) : (
                <p className="no-data">No enclosure information available</p>
              )}
            </div>

            <div className="caretaker-info">
              <h3>Responsible Employee</h3>
              {animal.caretaker ? (
                <>
                  <p><strong>Name:</strong> {animal.caretaker.firstName} {animal.caretaker.lastName}</p>
                  <p><strong>Position:</strong> {animal.caretaker.position}</p>
                  {animal.caretaker.specialization && (
                    <p><strong>Specialization:</strong> {animal.caretaker.specialization}</p>
                  )}
                  {animal.caretaker.email && (
                    <p><strong>Email:</strong> {animal.caretaker.email}</p>
                  )}
                </>
              ) : (
                <p className="no-data">No caretaker assigned</p>
              )}
            </div>
          </div>

          {/* Временные метки */}
          <div className="timestamp-section">
            <h3>Timestamps</h3>
            <div className="timestamp-grid">
              <div className="timestamp-group">
                <h4>Record Created</h4>
                <div className="timestamp-row">
                  <span className="time-label">Local Time:</span>
                  <span className="time-value">{formatLocalDateTime(animal.createdAt)}</span>
                </div>
                <div className="timestamp-row">
                  <span className="time-label">UTC Time:</span>
                  <span className="time-value">{formatUTCDateTime(animal.createdAt)}</span>
                </div>
              </div>
              
              <div className="timestamp-group">
                <h4>Last Updated</h4>
                <div className="timestamp-row">
                  <span className="time-label">Local Time:</span>
                  <span className="time-value">{formatLocalDateTime(animal.updatedAt)}</span>
                </div>
                <div className="timestamp-row">
                  <span className="time-label">UTC Time:</span>
                  <span className="time-value">{formatUTCDateTime(animal.updatedAt)}</span>
                </div>
              </div>
              
              <div className="timestamp-group">
                <h4>Arrival Date</h4>
                <div className="timestamp-row">
                  <span className="time-label">Local Time:</span>
                  <span className="time-value">{formatLocalDateTime(animal.arrivalDate)}</span>
                </div>
                <div className="timestamp-row">
                  <span className="time-label">UTC Time:</span>
                  <span className="time-value">{formatUTCDateTime(animal.arrivalDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalDetail;