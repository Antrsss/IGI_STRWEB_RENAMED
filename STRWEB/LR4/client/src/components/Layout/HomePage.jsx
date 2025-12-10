import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { getUserTimeZone } from '../../utils/dateUtils';
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
  
  // Получаем часовой пояс пользователя
  const userTimeZone = getUserTimeZone();
  
  // Текущая дата и время
  const [currentDateTime, setCurrentDateTime] = useState({
    local: new Date().toLocaleString('en-US', { 
      timeZone: userTimeZone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }),
    utc: new Date().toUTCString(),
    date: new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: userTimeZone
    })
  });

  // Обновляем текущее время каждую секунду
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime({
        local: now.toLocaleString('en-US', { 
          timeZone: userTimeZone,
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }),
        utc: now.toUTCString(),
        date: now.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: userTimeZone
        })
      });
    };
    
    // Обновляем сразу
    updateTime();
    
    // Обновляем каждую секунду
    const timer = setInterval(updateTime, 1000);
    
    return () => clearInterval(timer);
  }, [userTimeZone]);

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
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      {/* Информация о времени в самом верху */}
      <div className="time-header">
        <div className="container">
          <div className="time-info-row">
            <div className="time-zone-info">
              <span className="time-label">📅 Date:</span>
              <span className="time-value">{currentDateTime.date}</span>
            </div>
            <div className="time-zone-info">
              <span className="time-label">⏰ Local Time:</span>
              <span className="time-value">{currentDateTime.local}</span>
            </div>
            <div className="time-zone-info">
              <span className="time-label">🌐 UTC Time:</span>
              <span className="time-value">{currentDateTime.utc}</span>
            </div>
            <div className="time-zone-info">
              <span className="time-label">📍 Your Time Zone:</span>
              <span className="time-value">{userTimeZone}</span>
            </div>
          </div>
        </div>
      </div>

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to the Zoo Management System
          </h1>
          <p className="hero-subtitle">
            Manage animals, employees, enclosures, and feedings all in one place
          </p>
          
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">{stats.totalAnimals}</span>
              <span className="stat-label">Animals</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.totalEmployees}</span>
              <span className="stat-label">Employees</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.totalEnclosures}</span>
              <span className="stat-label">Enclosures</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.totalFeedings}</span>
              <span className="stat-label">Feedings</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2>Zoo Management System</h2>
        <p className="section-description">
          Information system for efficient management of all aspects of zoo operations
        </p>
        
        <div className="features-grid">
          <Link to="/animals" className="feature-card">
            <h3>Animals</h3>
            <p>Track all animals, their condition, nutrition, and medical data</p>
            <div className="feature-stats">
              <span className="feature-stat">{stats.totalAnimals} records</span>
            </div>
          </Link>
          
          <Link to="/employees" className="feature-card">
            <h3>Employees</h3>
            <p>Manage personnel, positions, schedules, and responsibilities</p>
            <div className="feature-stats">
              <span className="feature-stat">{stats.totalEmployees} records</span>
            </div>
          </Link>
          
          <Link to="/enclosures" className="feature-card">
            <h3>Enclosures</h3>
            <p>Information about enclosures, their condition, size, and maintenance</p>
            <div className="feature-stats">
              <span className="feature-stat">{stats.totalEnclosures} records</span>
            </div>
          </Link>
          
          <Link to="/feedings" className="feature-card">
            <h3>Feeding</h3>
            <p>Track animal feedings, diets, and food expenses</p>
            <div className="feature-stats">
              <span className="feature-stat">{stats.totalFeedings} records</span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;