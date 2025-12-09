// src/components/layout/HomePage.jsx - обновленная версия
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './HomePage.css';

const HomePage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAnimals: 0,
    totalEmployees: 0,
    totalEnclosures: 0,
    totalFeedings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [animalsRes, employeesRes, enclosuresRes, feedingsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/animals'),
        axios.get('http://localhost:5000/api/employees'),
        axios.get('http://localhost:5000/api/enclosures'),
        axios.get('http://localhost:5000/api/feedings')
      ]);

      setStats({
        totalAnimals: animalsRes.data.length,
        totalEmployees: employeesRes.data.length,
        totalEnclosures: enclosuresRes.data.length,
        totalFeedings: feedingsRes.data.length
      });
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            🦒 Добро пожаловать в систему управления зоопарком
          </h1>
          <p className="hero-subtitle">
            Управляйте животными, сотрудниками, вольерами и кормлениями в одном месте
          </p>
          
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">{stats.totalAnimals}</span>
              <span className="stat-label">Животных</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.totalEmployees}</span>
              <span className="stat-label">Сотрудников</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.totalEnclosures}</span>
              <span className="stat-label">Вольеров</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.totalFeedings}</span>
              <span className="stat-label">Кормлений</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2>Система управления зоопарком</h2>
        <p className="section-description">
          Информационная система для эффективного управления всеми аспектами работы зоопарка
        </p>
        
        <div className="features-grid">
          <Link to="/animals" className="feature-card">
            <div className="feature-icon">🐾</div>
            <h3>Животные</h3>
            <p>Учет всех животных, их состояние, питание и медицинские данные</p>
            <div className="feature-stats">
              <span className="feature-stat">{stats.totalAnimals} записей</span>
            </div>
          </Link>
          
          <Link to="/employees" className="feature-card">
            <div className="feature-icon">👨‍⚕️</div>
            <h3>Сотрудники</h3>
            <p>Управление персоналом, должностями, расписанием и обязанностями</p>
            <div className="feature-stats">
              <span className="feature-stat">{stats.totalEmployees} записей</span>
            </div>
          </Link>
          
          <Link to="/enclosures" className="feature-card">
            <div className="feature-icon">🏠</div>
            <h3>Вольеры</h3>
            <p>Информация о вольерах, их состоянии, размерах и условиях содержания</p>
            <div className="feature-stats">
              <span className="feature-stat">{stats.totalEnclosures} записей</span>
            </div>
          </Link>
          
          <Link to="/feedings" className="feature-card">
            <div className="feature-icon">🥕</div>
            <h3>Кормление</h3>
            <p>Учет кормлений животных, рационов и расходов на питание</p>
            <div className="feature-stats">
              <span className="feature-stat">{stats.totalFeedings} записей</span>
            </div>
          </Link>
        </div>
      </section>

      {!user && (
        <section className="cta-section">
          <div className="cta-content">
            <h2>Получите полный доступ к системе!</h2>
            <p>Зарегистрируйтесь, чтобы добавлять новые записи и управлять всеми данными</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                📝 Зарегистрироваться
              </Link>
              <Link to="/login" className="btn btn-outline btn-large">
                🔑 Войти в систему
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;