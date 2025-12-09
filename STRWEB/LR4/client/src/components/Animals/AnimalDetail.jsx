// src/components/animals/AnimalDetail.jsx
import React, { useState, useEffect } from 'react';
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
      console.error('Ошибка загрузки:', error);
      setError('Не удалось загрузить информацию о животном');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!animal) return <div className="not-found">Животное не найдено</div>;

  return (
    <div className="animal-detail-container">
      <div className="animal-detail-header">
        <button onClick={() => navigate('/animals')} className="btn-back">
          ← Назад к списку
        </button>
        <h1>🐾 {animal.name}</h1>
      </div>

      <div className="animal-detail-content">
        <div className="animal-info-card">
          <div className="animal-basic-info">
            <div className="info-row">
              <span className="info-label">Вид:</span>
              <span className="info-value">{animal.species}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Возраст:</span>
              <span className="info-value">{animal.age} лет</span>
            </div>
            <div className="info-row">
              <span className="info-label">Вес:</span>
              <span className="info-value">{animal.weight} кг</span>
            </div>
            <div className="info-row">
              <span className="info-label">Состояние здоровья:</span>
              <span className={`health-badge health-${animal.healthStatus.toLowerCase().replace(' ', '-')}`}>
                {animal.healthStatus}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Тип питания:</span>
              <span className="info-value">{animal.dietType}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Дата прибытия:</span>
              <span className="info-value">
                {new Date(animal.arrivalDate).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>

          {animal.specialNeeds && (
            <div className="special-needs-section">
              <h3>Особые потребности</h3>
              <p>{animal.specialNeeds}</p>
            </div>
          )}

          <div className="related-info">
            <div className="enclosure-info">
              <h3>Вольер</h3>
              <p><strong>Название:</strong> {animal.enclosure?.name}</p>
              <p><strong>Тип:</strong> {animal.enclosure?.type}</p>
              <p><strong>Расположение:</strong> {animal.enclosure?.location}</p>
            </div>

            <div className="caretaker-info">
              <h3>Ответственный сотрудник</h3>
              <p><strong>Имя:</strong> {animal.caretaker?.firstName} {animal.caretaker?.lastName}</p>
              <p><strong>Должность:</strong> {animal.caretaker?.position}</p>
              {animal.caretaker?.specialization && (
                <p><strong>Специализация:</strong> {animal.caretaker.specialization}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalDetail;