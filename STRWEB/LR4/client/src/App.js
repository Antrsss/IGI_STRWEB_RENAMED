// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import GoogleCallback from './components/auth/GoogleCallback';
import Dashboard from './components/layout/Dashboard';
import AnimalList from './components/animals/AnimalList';
import EmployeeList from './components/employees/EmployeeList';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Публичные маршруты */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/callback" element={<GoogleCallback />} />
            
            {/* Защищенные маршруты */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/animals" element={
              <ProtectedRoute>
                <AnimalList />
              </ProtectedRoute>
            } />
            
            <Route path="/employees" element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeList />
              </ProtectedRoute>
            } />
            
            {/* Дополнительные маршруты */}
            <Route path="/enclosures" element={
              <ProtectedRoute requiredRole="employee">
                <div className="page-container">
                  <h1>🏠 Enclosures Management</h1>
                  <p>This page is under construction.</p>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/feedings" element={
              <ProtectedRoute requiredRole="employee">
                <div className="page-container">
                  <h1>🥕 Feedings Management</h1>
                  <p>This page is under construction.</p>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <div className="page-container">
                  <h1>👤 User Profile</h1>
                  <p>Profile page will be implemented soon.</p>
                </div>
              </ProtectedRoute>
            } />
            
            {/* 404 страница */}
            <Route path="*" element={
              <div className="error-page">
                <h1>404 - Page Not Found</h1>
                <p>The page you are looking for does not exist.</p>
                <a href="/dashboard" className="btn-primary">Go to Dashboard</a>
              </div>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;