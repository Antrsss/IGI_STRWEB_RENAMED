import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalAnimals: 0,
    totalEmployees: 0,
    totalEnclosures: 0,
    upcomingFeedings: 0
  });
  const [recentAnimals, setRecentAnimals] = useState([]);
  const [recentFeedings, setRecentFeedings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

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
        setRecentAnimals(animalsRes.data.slice(0, 3));

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
      {/* Верхняя панель */}
      <header className="dashboard-header">
        <div className="dashboard-title">
          <h1>🦒 Панель управления зоопарком</h1>
          <p className="dashboard-subtitle">
            Добро пожаловать, <span className="user-highlight">{user?.username || user?.email}</span>!
          </p>
        </div>
        
        <div className="user-actions">
          <div className="user-info-panel">
            <span className="user-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} />
              ) : (
                user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()
              )}
            </span>
            <div className="user-details">
              <span className="user-name">{user?.username || user?.email}</span>
              <span className={`user-role-badge role-${user?.role}`}>
                {user?.role === 'user' && '👤 Пользователь'}
                {user?.role === 'employee' && '👨‍⚕️ Сотрудник'}
                {user?.role === 'admin' && '🛡️ Администратор'}
              </span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <span className="logout-icon">🚪</span>
              Выйти
            </button>
          </div>
        </div>
      </header>

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

      {/* Футер */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <p className="footer-copyright">
            © {new Date().getFullYear()} Система управления зоопарком
          </p>
          <div className="footer-links">
            <Link to="/about">О системе</Link>
            <Link to="/help">Помощь</Link>
            <Link to="/contact">Контакты</Link>
            <Link to="/privacy">Конфиденциальность</Link>
          </div>
          <div className="system-info">
            <small>Версия 2.0.0 | Пользователь: {user?.username || user?.email}</small>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;