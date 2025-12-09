// src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Footer.css';

const Footer = () => {
  const { user } = useAuth();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-title">Zoo Management System</h3>
          <p className="footer-description">
            Modern system for managing zoo animals, employees, and enclosures
          </p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p className="footer-copyright">
          © {new Date().getFullYear()} Zoo Management System. All rights reserved.
        </p>
        <div className="system-info">
          <small>Version 2.0.0 {user && `| User: ${user?.username || user?.email}`}</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;