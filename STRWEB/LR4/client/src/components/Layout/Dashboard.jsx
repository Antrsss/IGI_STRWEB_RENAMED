import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout, isEmployee, isAdmin } = useAuth();
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

      // Запрашиваем данные в зависимости от роли
      if (isEmployee || isAdmin) {
        const [animalsRes, employeesRes, enclosuresRes, feedingsRes] = await Promise.all([
          axios.get('/api/animals'),
          axios.get('/api/employees'),
          axios.get('/api/enclosures'),
          axios.get('/api/feedings?limit=5')
        ]);

        setStats({
          totalAnimals: animalsRes.data.length,
          totalEmployees: employeesRes.data.length,
          totalEnclosures: enclosuresRes.data.length,
          upcomingFeedings: feedingsRes.data.filter(f => 
            new Date(f.scheduledTime) > new Date()
          ).length
        });

        setRecentAnimals(animalsRes.data.slice(0, 5));
        setRecentFeedings(feedingsRes.data.slice(0, 5));
      } else {
        // Для обычных пользователей - только базовые данные
        const animalsRes = await axios.get('/api/animals');
        setStats(prev => ({
          ...prev,
          totalAnimals: animalsRes.data.length
        }));
        setRecentAnimals(animalsRes.data.slice(0, 3));
      }

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
            
            {(isEmployee || isAdmin) && (
              <>
                <Link to="/employees" className="action-card">
                  <span className="action-icon">👨‍⚕️</span>
                  <h3>Сотрудники</h3>
                  <p>Управление персоналом</p>
                </Link>
                
                <Link to="/enclosures" className="action-card">
                  <span className="action-icon">🏠</span>
                  <h3>Вольеры</h3>
                  <p>Управление вольерами</p>
                </Link>
                
                <Link to="/feedings" className="action-card">
                  <span className="action-icon">🥕</span>
                  <h3>Кормления</h3>
                  <p>Расписание кормлений</p>
                </Link>
              </>
            )}
            
            {!isEmployee && !isAdmin && (
              <div className="action-card action-info">
                <span className="action-icon">ℹ️</span>
                <h3>Расширенные функции</h3>
                <p>Доступны сотрудникам</p>
              </div>
            )}
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
            
            {(isEmployee || isAdmin) && (
              <>
                <div className="stat-card stat-employees">
                  <div className="stat-content">
                    <h3>Сотрудников</h3>
                    <p className="stat-number">{stats.totalEmployees}</p>
                    <Link to="/employees" className="stat-link">Список сотрудников →</Link>
                  </div>
                  <div className="stat-icon">👨‍⚕️</div>
                </div>
                
                <div className="stat-card stat-enclosures">
                  <div className="stat-content">
                    <h3>Вольеров</h3>
                    <p className="stat-number">{stats.totalEnclosures}</p>
                    <Link to="/enclosures" className="stat-link">Все вольеры →</Link>
                  </div>
                  <div className="stat-icon">🏠</div>
                </div>
                
                <div className="stat-card stat-feedings">
                  <div className="stat-content">
                    <h3>Предстоящих кормлений</h3>
                    <p className="stat-number">{stats.upcomingFeedings}</p>
                    <Link to="/feedings" className="stat-link">Расписание →</Link>
                  </div>
                  <div className="stat-icon">🥕</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Недавние животные */}
        <div className="recent-section">
          <div className="recent-animals">
            <div className="section-header">
              <h2>🦁 Недавно добавленные животные</h2>
              <Link to="/animals" className="view-all">Все животные →</Link>
            </div>
            
            {recentAnimals.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🐘</span>
                <p>Животных пока нет в системе</p>
                {isEmployee && (
                  <Link to="/animals/new" className="btn-primary">
                    Добавить животное
                  </Link>
                )}
              </div>
            ) : (
              <div className="animals-grid">
                {recentAnimals.map(animal => (
                  <div key={animal._id} className="animal-card">
                    <div className="animal-header">
                      <h3>{animal.name}</h3>
                      <span className={`health-status status-${animal.healthStatus?.toLowerCase()}`}>
                        {animal.healthStatus}
                      </span>
                    </div>
                    <div className="animal-details">
                      <p><strong>Вид:</strong> {animal.species}</p>
                      <p><strong>Возраст:</strong> {animal.age || 'Не указан'}</p>
                      <p><strong>Вольер:</strong> {animal.enclosure?.name || 'Не назначен'}</p>
                    </div>
                    <div className="animal-footer">
                      <Link to={`/animals/${animal._id}`} className="view-details">
                        Подробнее →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Недавние кормления (только для сотрудников) */}
          {(isEmployee || isAdmin) && recentFeedings.length > 0 && (
            <div className="recent-feedings">
              <div className="section-header">
                <h2>🥕 Недавние кормления</h2>
                <Link to="/feedings" className="view-all">Все кормления →</Link>
              </div>
              
              <div className="feedings-list">
                {recentFeedings.map(feeding => (
                  <div key={feeding._id} className="feeding-item">
                    <div className="feeding-time">
                      {formatDate(feeding.scheduledTime)}
                    </div>
                    <div className="feeding-details">
                      <strong>{feeding.animal?.name}</strong>
                      <span>{feeding.foodType}</span>
                    </div>
                    <div className="feeding-employee">
                      {feeding.employee?.firstName} {feeding.employee?.lastName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Информация о пользователе */}
        <div className="user-profile-section">
          <h2>👤 Ваш профиль</h2>
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar-large">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  <span className="avatar-placeholder">
                    {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="profile-info">
                <h3>{user?.username || user?.email}</h3>
                <div className="profile-meta">
                  <span className="profile-email">{user?.email}</span>
                  <span className={`profile-role role-${user?.role}`}>
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="stat-label">Дата регистрации</span>
                <span className="stat-value">
                  {user?.createdAt ? formatDate(user.createdAt) : 'Не указана'}
                </span>
              </div>
              <div className="profile-stat">
                <span className="stat-label">Последний вход</span>
                <span className="stat-value">
                  {user?.lastLogin ? formatDate(user.lastLogin) : 'Сейчас'}
                </span>
              </div>
            </div>
            
            {!isEmployee && !isAdmin && (
              <div className="upgrade-prompt">
                <h4>Хотите больше возможностей?</h4>
                <p>Станьте сотрудником зоопарка для доступа к расширенным функциям</p>
                <button className="btn-secondary" onClick={() => navigate('/contact')}>
                  Связаться с администрацией
                </button>
              </div>
            )}
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