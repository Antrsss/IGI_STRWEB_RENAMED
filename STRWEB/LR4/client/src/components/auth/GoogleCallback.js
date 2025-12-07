// src/components/auth/GoogleCallback.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Получаем токен из URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
          // Сохраняем токен
          localStorage.setItem('token', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Получаем данные пользователя
          const response = await axios.get('/api/auth/profile');
          const user = response.data.user;
          
          // Здесь можно обновить контекст аутентификации
          // (нужно добавить метод в AuthContext)
          
          // Перенаправляем на дашборд
          navigate('/dashboard');
        } else {
          console.error('No token in URL');
          navigate('/login', { state: { error: 'Authentication failed' } });
        }
      } catch (error) {
        console.error('Google callback error:', error);
        navigate('/login', { state: { error: 'Authentication failed' } });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column'
    }}>
      <div className="spinner"></div>
      <p>Completing Google authentication...</p>
      <style>{`
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default GoogleCallback;