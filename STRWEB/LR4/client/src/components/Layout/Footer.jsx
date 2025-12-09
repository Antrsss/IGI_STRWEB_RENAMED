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
        
        <div className="footer-section">
          <h4>Navigation</h4>
          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/animals">Animals</Link>
            {user && <Link to="/dashboard">Dashboard</Link>}
            <Link to="/about">About</Link>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Account</h4>
          <div className="footer-links">
            {user ? (
              <>
                <span className="user-info">Logged in as: {user?.username || user?.email}</span>
                <Link to="/profile">Profile</Link>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Support</h4>
          <div className="footer-links">
            <Link to="/help">Help</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms of Use</Link>
          </div>
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