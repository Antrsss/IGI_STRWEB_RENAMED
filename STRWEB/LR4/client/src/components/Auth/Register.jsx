import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Проверка паролей
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/auth/register', {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        role: formData.role
      });

      setSuccess('Регистрация успешна! Вы будете перенаправлены на страницу входа.');
      
      // Автоматический вход после регистрации
      setTimeout(() => {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Регистрация</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
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
            <label>Имя пользователя:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength="3"
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
                    minLength="6"
            />
          </div>

<div className="form-group">
  <label>Подтвердите пароль:</label>
  <input
    type="password"
    name="confirmPassword"
    value={formData.confirmPassword}
    onChange={handleChange}
    required
    minLength="6"
  />
</div>

<div className="form-group">
  <label>Роль:</label>
  <select
    name="role"
    value={formData.role}
    onChange={handleChange}
    className="form-control"
  >
    <option value="user">Пользователь</option>
    <option value="employee">Сотрудник</option>
    <option value="admin">Администратор</option>
  </select>
  <small className="text-muted">
    {formData.role === 'employee' && 'Будет создан профиль сотрудника'}
    {formData.role === 'admin' && 'Полный доступ ко всем функциям'}
  </small>
</div>

<div className="form-check mb-3">
  <input
    type="checkbox"
    id="terms"
    className="form-check-input"
    required
  />
  <label htmlFor="terms" className="form-check-label">
    Я согласен с условиями использования и политикой конфиденциальности
  </label>
</div>

<button 
  type="submit" 
  className="btn btn-primary w-100"
  disabled={loading}
>
  {loading ? (
    <>
      <span className="spinner-border spinner-border-sm me-2"></span>
      Регистрация...
    </>
  ) : 'Зарегистрироваться'}
</button>
</form>

<div className="divider my-4">
  <span className="px-2 bg-white text-muted">или</span>
</div>

<button 
  onClick={() => window.location.href = '/api/auth/google'}
  className="btn btn-outline-secondary w-100 mb-3"
  type="button"
>
  <svg className="me-2" width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
  Зарегистрироваться через Google
</button>

<div className="text-center mt-3">
  <p className="mb-0">
    Уже есть аккаунт?{' '}
    <a href="/login" className="text-decoration-none">
      Войти
    </a>
  </p>
</div>

<div className="alert alert-info mt-3" role="alert">
  <small>
    <strong>Примечание:</strong> При выборе роли "Сотрудник" будет автоматически создан профиль сотрудника.
    Администраторы могут управлять всеми данными системы.
  </small>
</div>
</div>
</div>
);
}

export default Register;