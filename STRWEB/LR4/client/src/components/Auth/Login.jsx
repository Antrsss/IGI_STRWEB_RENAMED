import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 📡 URL backend-сервера
  const API_URL = 'http://localhost:5000'; // Жёстко прописан для надёжности при локальной разработке

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, formData, {
        withCredentials: true,
      });

      // Сохраняем токен и данные пользователя
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🔐 Login</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Пароль:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="divider">
          <span>или</span>
        </div>

        <a
          href="http://localhost:5000/api/auth/google"
          className="btn btn-google"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            textDecoration: 'none',
          }}
        >
          <img
            src="https://img.icons8.com/color/16/000000/google-logo.png"
            alt="Google"
            style={{ width: '18px', height: '18px' }}
          />
          Войти через Google
        </a>

        <div className="auth-links">
          <a href="/register">Нет аккаунта? Зарегистрироваться</a>
          <a href="/forgot-password">Забыли пароль?</a>
        </div>
      </div>
    </div>
  );
}

export default Login;