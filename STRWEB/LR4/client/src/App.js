import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';


function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [animals, setAnimals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [enclosures, setEnclosures] = useState([]);
  const [feedings, setFeedings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login', 'register', 'app'
  const [authError, setAuthError] = useState('');

  // Check authentication on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setIsAuthenticated(true);
        setUser(userData);
        setAuthView('app');
        
        // Set authorization header for all requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Load data after authorization
        fetchDashboardData();
      } catch (error) {
        console.error('Error restoring session:', error);
        handleLogout();
      }
    } else {
      setAuthView('login');
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const [animalsRes, employeesRes, enclosuresRes, feedingsRes] = await Promise.all([
        axios.get('/api/animals'),
        axios.get('/api/employees'),
        axios.get('/api/enclosures'),
        axios.get('/api/feedings?limit=5')
      ]);

      setAnimals(animalsRes.data);
      setEmployees(employeesRes.data);
      setEnclosures(enclosuresRes.data);
      setFeedings(feedingsRes.data);

      // Statistics
      setStats({
        totalAnimals: animalsRes.data.length,
        totalEmployees: employeesRes.data.length,
        totalEnclosures: enclosuresRes.data.length,
        activeEmployees: employeesRes.data.filter(e => e.isActive).length
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
      setLoading(false);
    }
  };

  // Authentication functions
  const handleLogin = async (email, password) => {
    try {
      setAuthError('');
      const response = await axios.post('/api/auth/login', { email, password });
      
      const { user, token } = response.data;
      
      // Save data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update state
      setIsAuthenticated(true);
      setUser(user);
      setAuthView('app');
      
      // Load data
      fetchDashboardData();
      
    } catch (error) {
      setAuthError(error.response?.data?.error || 'Login error');
    }
  };

  const handleRegister = async (formData) => {
    try {
      setAuthError('');
      const response = await axios.post('/api/auth/register', formData);
      
      const { user, token } = response.data;
      
      // Save data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update state
      setIsAuthenticated(true);
      setUser(user);
      setAuthView('app');
      
      // Load data
      fetchDashboardData();
      
    } catch (error) {
      setAuthError(error.response?.data?.error || 'Registration error');
    }
  };

  const handleGoogleLogin = () => {
      window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
    setAuthView('login');
    setAnimals([]);
    setEmployees([]);
    setEnclosures([]);
    setFeedings([]);
  };

  // Existing rendering functions (keep unchanged)
  const renderDashboard = () => (
    <div className="dashboard">
      <div className="user-info-bar">
        <span>👤 {user?.username || user?.email} ({user?.role})</span>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
      
      <h2>📊 Zoo Management Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>🐾 Animals</h3>
          <p className="stat-number">{stats.totalAnimals || 0}</p>
        </div>
        <div className="stat-card">
          <h3>👨‍⚕️ Employees</h3>
          <p className="stat-number">{stats.totalEmployees || 0}</p>
          <small>Active: {stats.activeEmployees || 0}</small>
        </div>
        <div className="stat-card">
          <h3>🏠 Enclosures</h3>
          <p className="stat-number">{stats.totalEnclosures || 0}</p>
        </div>
        <div className="stat-card">
          <h3>🥕 Feedings</h3>
          <p className="stat-number">{feedings.length || 0}</p>
          <small>Last 5 records</small>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>🦁 Recently Arrived Animals</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Species</th>
              <th>Enclosure</th>
              <th>Employee</th>
            </tr>
          </thead>
          <tbody>
            {animals.slice(0, 5).map(animal => (
              <tr key={animal._id}>
                <td>{animal.name}</td>
                <td>{animal.species}</td>
                <td>{animal.enclosure?.name || 'Not specified'}</td>
                <td>{animal.caretaker?.firstName || 'Not specified'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnimals = () => (
    <div className="section">
      <div className="user-info-bar">
        <span>👤 {user?.username || user?.email} ({user?.role})</span>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
      
      <h2>🐾 Animal Management</h2>
      <button onClick={() => {/* Open form */}}>Add Animal</button>
      
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Species</th>
            <th>Age</th>
            <th>Status</th>
            <th>Enclosure</th>
            <th>Employee</th>
          </tr>
        </thead>
        <tbody>
          {animals.map(animal => (
            <tr key={animal._id}>
              <td>{animal.name}</td>
              <td>{animal.species}</td>
              <td>{animal.age || '—'}</td>
              <td>
                <span className={`status-badge status-${animal.healthStatus?.toLowerCase()}`}>
                  {animal.healthStatus}
                </span>
              </td>
              <td>{animal.enclosure?.name || '—'}</td>
              <td>{animal.caretaker?.firstName || '—'} {animal.caretaker?.lastName || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderEmployees = () => (
    <div className="section">
      <div className="user-info-bar">
        <span>👤 {user?.username || user?.email} ({user?.role})</span>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
      
      <h2>👨‍⚕️ Employees</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Specialization</th>
            <th>Hire Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp._id}>
              <td>{emp.firstName} {emp.lastName}</td>
              <td>{emp.position}</td>
              <td>{emp.specialization || '—'}</td>
              <td>{new Date(emp.hireDate).toLocaleDateString()}</td>
              <td>
                <span className={`status-badge ${emp.isActive ? 'status-active' : 'status-inactive'}`}>
                  {emp.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Main render
  if (authView === 'login') {
    return <LoginForm
      onLogin={handleLogin}
      onGoogleLogin={handleGoogleLogin}
      switchToRegister={() => setAuthView('register')}
      authError={authError}
    />;
  }

  if (authView === 'register') {
    return <RegisterForm
      onRegister={handleRegister}
      switchToLogin={() => setAuthView('login')}
      authError={authError}
    />;
  }

  // Main application (after authentication)
  return (
    <div className="App">
      <header className="App-header">
        <h1>🦒 Zoo Management System</h1>
        <div className="user-header">
          <span className="user-name">{user?.username || user?.email}</span>
          <span className="user-role">{user?.role}</span>
          <button onClick={handleLogout} className="btn-logout-header">
            Logout
          </button>
        </div>
        <nav className="nav-tabs">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={activeTab === 'animals' ? 'active' : ''}
            onClick={() => setActiveTab('animals')}
          >
            🐾 Animals
          </button>
          <button 
            className={activeTab === 'employees' ? 'active' : ''}
            onClick={() => setActiveTab('employees')}
          >
            👨‍⚕️ Employees
          </button>
          <button 
            className={activeTab === 'enclosures' ? 'active' : ''}
            onClick={() => setActiveTab('enclosures')}
          >
            🏠 Enclosures
          </button>
          <button 
            className={activeTab === 'feedings' ? 'active' : ''}
            onClick={() => setActiveTab('feedings')}
          >
            🥕 Feedings
          </button>
        </nav>
      </header>

      <main className="App-content">
        {loading ? (
          <div className="loading">Loading data...</div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'animals' && renderAnimals()}
            {activeTab === 'employees' && renderEmployees()}
            {activeTab === 'enclosures' && <div>Enclosures (implement similarly)</div>}
            {activeTab === 'feedings' && <div>Feedings (implement similarly)</div>}
          </>
        )}
      </main>

      <footer className="App-footer">
        <p>Lab Work 4: React + Node.js | Zoo Management System</p>
        <small>User: {user?.username || user?.email} | Role: {user?.role}</small>
        <small>Total Animals: {animals.length} | Employees: {employees.length} | Enclosures: {enclosures.length}</small>
      </footer>
    </div>
  );
}

export default App;