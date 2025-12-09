// src/components/layout/Navbar.jsx - обновленная версия
// Добавляем ссылки на все 4 страницы
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Проверяем активный маршрут
  const isActive = (path) => {
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Левый блок - логотип и название */}
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo">
            🦒 Зоопарк
          </Link>
        </div>

        {/* Центральный блок - навигация */}
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/') && !isActive('/animals') && !isActive('/employees') && !isActive('/enclosures') && !isActive('/feedings') ? 'active' : ''}`}>
            🏠 Главная
          </Link>
          <Link to="/animals" className={`nav-link ${isActive('/animals') ? 'active' : ''}`}>
            🐾 Животные
          </Link>
          <Link to="/employees" className={`nav-link ${isActive('/employees') ? 'active' : ''}`}>
            👨‍⚕️ Сотрудники
          </Link>
          <Link to="/enclosures" className={`nav-link ${isActive('/enclosures') ? 'active' : ''}`}>
            🏠 Вольеры
          </Link>
          <Link to="/feedings" className={`nav-link ${isActive('/feedings') ? 'active' : ''}`}>
            🥕 Кормление
          </Link>
          {user && (
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
              📊 Панель управления
            </Link>
          )}
        </div>

        {/* Правый блок - пользователь */}
        <div className="navbar-user-section">
          {user ? (
            <div className="user-info-panel">
              <div className="user-details">
                <span className="user-name">{user?.username || user?.email}</span>
              </div>
              <button onClick={handleLogout} className="logout-btn">
                <span className="logout-icon">🚪</span>
                Выйти
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-primary">
                🔑 Войти
              </Link>
              <Link to="/register" className="btn btn-secondary">
                📝 Регистрация
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;