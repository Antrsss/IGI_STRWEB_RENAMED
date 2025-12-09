import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { logout } = useAuth();
  const [stats, setStats] = useState({
    totalAnimals: 0,
    totalEmployees: 0,
    totalEnclosures: 0,
    upcomingFeedings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Если у пользователя есть токен, но его нет в axios заголовках
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      const animalsRes = await axios.get('/api/animals');
        setStats(prev => ({
          ...prev,
          totalAnimals: animalsRes.data.length
        }));

      setLoading(false);

    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      
      if (error.response?.status === 401) {
        setError('Сессия истекла. Пожалуйста, войдите снова.');
        logout();
        navigate('/login');
      } else if (error.response?.status === 403) {
        setError('Недостаточно прав для просмотра данных.');
      } else {
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">

      {/* Основной контент */}
      <main className="dashboard-main">
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            {error}
            <button onClick={fetchDashboardData} className="retry-btn">
              Повторить
            </button>
          </div>
        )}

        {/* Быстрые действия */}
        <div className="quick-actions">
          <h2>Быстрые действия</h2>
          <div className="actions-grid">
            <Link to="/animals" className="action-card">
              <span className="action-icon">🐾</span>
              <h3>Животные</h3>
              <p>Управление животными</p>
            </Link>
          </div>
        </div>

        {/* Статистика */}
        <div className="statistics-section">
          <h2>📊 Статистика</h2>
          <div className="stats-grid">
            <div className="stat-card stat-animals">
              <div className="stat-content">
                <h3>Животных</h3>
                <p className="stat-number">{stats.totalAnimals}</p>
                <Link to="/animals" className="stat-link">Просмотреть всех →</Link>
              </div>
              <div className="stat-icon">🐾</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;