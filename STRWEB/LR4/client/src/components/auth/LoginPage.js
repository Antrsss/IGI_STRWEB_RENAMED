import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../auth/Auth.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginWithGoogle, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🦒 Zoo Management System</h2>
        <h3>Login</h3>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-separator">
          <span>or</span>
        </div>
        
        <button onClick={handleGoogleLogin} className="btn-google">
          <img src="https://www.google.com/favicon.ico" alt="Google" />
          Sign in with Google
        </button>
        
        <div className="auth-links">
          <Link to="/register">Don't have an account? Register</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;