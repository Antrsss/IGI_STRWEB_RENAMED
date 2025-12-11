// src/components/layout/Navbar.jsx
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

  const isActive = (path) => {
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo">
            Zoo
          </Link>
        </div>

        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/') && !isActive('/animals') && !isActive('/employees') && !isActive('/enclosures') && !isActive('/feedings') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/animals" className={`nav-link ${isActive('/animals') ? 'active' : ''}`}>
            Animals
          </Link>
          <Link to="/employees" className={`nav-link ${isActive('/employees') ? 'active' : ''}`}>
            Employees
          </Link>
          <Link to="/enclosures" className={`nav-link ${isActive('/enclosures') ? 'active' : ''}`}>
            Enclosures
          </Link>
          <Link to="/feedings" className={`nav-link ${isActive('/feedings') ? 'active' : ''}`}>
            Feeding
          </Link>
        </div>

        <div className="navbar-user-section">
          {user ? (
            <div className="user-info-panel">
              <div className="user-details">
                <span className="user-name">{user?.username || user?.email}</span>
              </div>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
              <Link to="/register" className="btn btn-secondary">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;