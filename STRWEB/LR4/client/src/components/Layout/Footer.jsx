// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Footer.css';

const Footer = () => {
  const { user } = useAuth();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-title">🦒 Система управления зоопарком</h3>
          <p className="footer-description">
            Современная система для управления животными, сотрудниками и вольерами зоопарка
          </p>
        </div>
        
        <div className="footer-section">
          <h4>Навигация</h4>
          <div className="footer-links">
            <Link to="/">Главная</Link>
            <Link to="/animals">Животные</Link>
            {user && <Link to="/dashboard">Панель управления</Link>}
            <Link to="/about">О проекте</Link>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Аккаунт</h4>
          <div className="footer-links">
            {user ? (
              <>
                <span className="user-info">Вы вошли как: {user?.username || user?.email}</span>
                <Link to="/profile">Профиль</Link>
              </>
            ) : (
              <>
                <Link to="/login">Войти</Link>
                <Link to="/register">Регистрация</Link>
              </>
            )}
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Поддержка</h4>
          <div className="footer-links">
            <Link to="/help">Помощь</Link>
            <Link to="/contact">Контакты</Link>
            <Link to="/privacy">Конфиденциальность</Link>
            <Link to="/terms">Условия использования</Link>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p className="footer-copyright">
          © {new Date().getFullYear()} Система управления зоопарком. Все права защищены.
        </p>
        <div className="system-info">
          <small>Версия 2.0.0 {user && `| Пользователь: ${user?.username || user?.email}`}</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;