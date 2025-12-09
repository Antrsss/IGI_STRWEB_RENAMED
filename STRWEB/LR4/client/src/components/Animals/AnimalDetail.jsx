// src/components/animals/AnimalDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AnimalDetail.css';

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
        <h1>🐾 {animal.name}</h1>
      </div>

      <div className="animal-detail-content">
        <div className="animal-info-card">
          <div className="animal-basic-info">
            <div className="info-row">
              <span className="info-label">Species:</span>
              <span className="info-value">{animal.species}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Age:</span>
              <span className="info-value">{animal.age} years</span>
            </div>
            <div className="info-row">
              <span className="info-label">Weight:</span>
              <span className="info-value">{animal.weight} kg</span>
            </div>
            <div className="info-row">
              <span className="info-label">Health Status:</span>
              <span className={`health-badge health-${animal.healthStatus.toLowerCase().replace(' ', '-')}`}>
                {animal.healthStatus}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Diet Type:</span>
              <span className="info-value">{animal.dietType}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Arrival Date:</span>
              <span className="info-value">
                {new Date(animal.arrivalDate).toLocaleDateString('en-US')}
              </span>
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
              <h3>Enclosure</h3>
              <p><strong>Name:</strong> {animal.enclosure?.name}</p>
              <p><strong>Type:</strong> {animal.enclosure?.type}</p>
              <p><strong>Location:</strong> {animal.enclosure?.location}</p>
            </div>

            <div className="caretaker-info">
              <h3>Responsible Employee</h3>
              <p><strong>Name:</strong> {animal.caretaker?.firstName} {animal.caretaker?.lastName}</p>
              <p><strong>Position:</strong> {animal.caretaker?.position}</p>
              {animal.caretaker?.specialization && (
                <p><strong>Specialization:</strong> {animal.caretaker.specialization}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalDetail;