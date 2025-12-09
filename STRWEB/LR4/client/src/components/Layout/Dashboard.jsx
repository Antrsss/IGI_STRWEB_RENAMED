import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { logout } = useAuth();
  const [stats, setStats] = useState({
    totalAnimals: 0,
    totalEmployees: 0,
    totalEnclosures: 0,
    upcomingFeedings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // If user has a token but it's not in axios headers
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      const animalsRes = await axios.get('/api/animals');
        setStats(prev => ({
          ...prev,
          totalAnimals: animalsRes.data.length
        }));

      setLoading(false);

    } catch (error) {
      console.error('Error loading data:', error);
      
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        logout();
        navigate('/login');
      } else if (error.response?.status === 403) {
        setError('Insufficient permissions to view data.');
      } else {
        setError('Failed to load data. Please try again later.');
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">

      {/* Main content */}
      <main className="dashboard-main">
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={fetchDashboardData} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        {/* Quick actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/animals" className="action-card">
              <h3>Animals</h3>
              <p>Manage animals</p>
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="statistics-section">
          <h2>Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card stat-animals">
              <div className="stat-content">
                <h3>Animals</h3>
                <p className="stat-number">{stats.totalAnimals}</p>
                <Link to="/animals" className="stat-link">View all →</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;