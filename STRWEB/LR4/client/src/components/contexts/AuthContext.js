// src/components/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const response = await axios.get('http://localhost:5000/api/auth/profile');
        setUser(response.data.user);
      }
    } catch (error) {
      console.log('No valid session found');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      return { success: true, user };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const loginWithGoogle = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  // Новая функция для обработки Google callback
  const handleGoogleCallback = async (token) => {
    try {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await axios.get('http://localhost:5000/api/auth/profile');
      const user = response.data.user;
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('Google callback error:', error);
      return { success: false, error: 'Google authentication failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    loginWithGoogle,
    handleGoogleCallback,
    logout,
    isAuthenticated: !!user,
    isEmployee: user?.role === 'employee' || user?.role === 'admin',
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};