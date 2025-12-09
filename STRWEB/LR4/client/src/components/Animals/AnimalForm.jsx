// src/components/animals/AnimalForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AnimalForm.css';

const AnimalForm = () => {
  const { user } = useAuth();
  const { id } = useParams(); // Для редактирования
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
      // Загружаем вольеры и сотрудников для выпадающих списков
      const [enclosuresRes, employeesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/enclosures'),
        axios.get('http://localhost:5000/api/employees')
      ]);
      
      setEnclosures(enclosuresRes.data);
      setEmployees(employeesRes.data);
      
      // Устанавливаем значения по умолчанию, если они есть
      if (enclosuresRes.data.length > 0 && !formData.enclosure) {
        setFormData(prev => ({ ...prev, enclosure: enclosuresRes.data[0]._id }));
      }
      
      if (employeesRes.data.length > 0 && !formData.caretaker) {
        setFormData(prev => ({ ...prev, caretaker: employeesRes.data[0]._id }));
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  }, [formData.enclosure, formData.caretaker]);

  const fetchAnimalData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/animals/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Ошибка загрузки животного:', error);
      setError('Не удалось загрузить данные животного');
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
    
    // Если это редактирование, загружаем данные животного
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
        // Обновление существующего животного
        await axios.put(`http://localhost:5000/api/animals/${id}`, formData, config);
        alert('Животное успешно обновлено!');
      } else {
        // Создание нового животного
        await axios.post('http://localhost:5000/api/animals', formData, config);
        alert('Животное успешно добавлено!');
      }
      
      navigate('/animals');
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      setError(error.response?.data?.message || 'Ошибка при сохранении');
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
        <h1>{id ? '✏️ Редактировать животное' : '➕ Добавить новое животное'}</h1>
        <button onClick={() => navigate('/animals')} className="btn-back">
          ← Назад к списку
        </button>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="animal-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Имя животного *</label>
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
            <label htmlFor="species">Вид *</label>
            <select
              id="species"
              name="species"
              value={formData.species}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="Lion">Лев</option>
              <option value="Tiger">Тигр</option>
              <option value="Elephant">Слон</option>
              <option value="Giraffe">Жираф</option>
              <option value="Monkey">Обезьяна</option>
              <option value="Panda">Панда</option>
              <option value="Crocodile">Крокодил</option>
              <option value="Bird">Птица</option>
              <option value="Reptile">Рептилия</option>
              <option value="Other">Другое</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="age">Возраст (лет)</label>
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
            <label htmlFor="weight">Вес (кг)</label>
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
            <label htmlFor="healthStatus">Состояние здоровья</label>
            <select
              id="healthStatus"
              name="healthStatus"
              value={formData.healthStatus}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Excellent">Отличное</option>
              <option value="Good">Хорошее</option>
              <option value="Satisfactory">Удовлетворительное</option>
              <option value="Requires treatment">Требует лечения</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="enclosure">Вольер *</label>
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
            <label htmlFor="caretaker">Ответственный сотрудник *</label>
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
            <label htmlFor="dietType">Тип питания *</label>
            <select
              id="dietType"
              name="dietType"
              value={formData.dietType}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="Carnivore">Хищник</option>
              <option value="Herbivore">Травоядное</option>
              <option value="Omnivore">Всеядное</option>
              <option value="Special">Специальное</option>
            </select>
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="specialNeeds">Особые потребности</label>
          <textarea
            id="specialNeeds"
            name="specialNeeds"
            value={formData.specialNeeds}
            onChange={handleChange}
            rows="3"
            maxLength="500"
            disabled={loading}
            placeholder="Опишите особые потребности животного..."
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/animals')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Сохранение...' : (id ? 'Обновить' : 'Сохранить')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnimalForm;