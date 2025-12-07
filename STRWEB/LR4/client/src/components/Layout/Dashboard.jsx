import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (!token || !savedUser) {
      navigate('/login');
      return;
    }

    // Устанавливаем заголовок авторизации
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    try {
      setUser(JSON.parse(savedUser));
      fetchData();
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [animalsRes] = await Promise.all([
        axios.get('/api/animals')
      ]);
      
      setAnimals(animalsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-brand">
          🦁 Система управления зоопарком
        </div>
        <div className="navbar-user">
          <span>Добро пожаловать, {user?.username || user?.email}</span>
          <button onClick={handleLogout} className="btn-logout">
            Выйти
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <h1>Панель управления</h1>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Животных в системе</h3>
            <p className="stat-number">{animals.length}</p>
          </div>
          <div className="stat-card">
            <h3>Ваша роль</h3>
            <p className="stat-role">{user?.role}</p>
          </div>
        </div>

        <div className="animals-section">
          <h2>Список животных</h2>
          {animals.length === 0 ? (
            <p>Животных пока нет в системе</p>
          ) : (
            <div className="animals-grid">
              {animals.slice(0, 5).map(animal => (
                <div key={animal._id} className="animal-card">
                  <h4>{animal.name}</h4>
                  <p><strong>Вид:</strong> {animal.species}</p>
                  <p><strong>Состояние:</strong> {animal.healthStatus}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="user-info">
          <h3>Информация о вашем аккаунте</h3>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Роль:</strong> {user?.role}</p>
          {user?.employeeProfile && (
            <p><strong>Профиль сотрудника:</strong> Создан</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;