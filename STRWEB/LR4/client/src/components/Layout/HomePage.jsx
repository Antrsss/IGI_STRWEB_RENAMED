// src/components/layout/HomePage.jsx - updated version
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
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
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

      {!user && (
        <section className="cta-section">
          <div className="cta-content">
            <h2>Get full access to the system!</h2>
            <p>Register to add new records and manage all data</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                Register
              </Link>
              <Link to="/login" className="btn btn-outline btn-large">
                Login
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;