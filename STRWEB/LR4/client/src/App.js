// src/App.js - full version with all routes
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import GoogleCallback from './components/auth/GoogleCallback';
import HomePage from './components/layout/HomePage';

// Import all components for 4 entities
import AnimalList from './components/animals/AnimalList.jsx';
import AnimalForm from './components/animals/AnimalForm.jsx';
import AnimalDetail from './components/animals/AnimalDetail.jsx';

import EmployeeList from './components/employees/EmployeeList.jsx';

import EnclosureList from './components/enclosures/EnclosureList.jsx';
import EnclosureForm from './components/enclosures/EnclosureForm.jsx'; // Добавьте этот импорт

import FeedingList from './components/feedings/FeedingList.jsx';
import FeedingForm from './components/feedings/FeedingForm.jsx';

import './App.css';

function App() {

  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          
          <main className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/auth/callback" element={<GoogleCallback />} />
              
              {/* Animals - public view */}
              <Route path="/animals" element={<AnimalList />} />
              <Route path="/animals/:id" element={<AnimalDetail />} />
              
              {/* Animals - protected actions */}
              <Route path="/animals/new" element={
                <ProtectedRoute>
                  <AnimalForm />
                </ProtectedRoute>
              } />
              <Route path="/animals/edit/:id" element={
                <ProtectedRoute>
                  <AnimalForm />
                </ProtectedRoute>
              } />
              
              {/* Employees - public view */}
              <Route path="/employees" element={<EmployeeList />} />

              {/* Enclosures - public view */}
              <Route path="/enclosures" element={<EnclosureList />} />
              <Route path="/enclosures/new" element={
                <ProtectedRoute>
                  <EnclosureForm />
                </ProtectedRoute>
              } />
              
              {/* Feedings - public view */}
              <Route path="/feedings" element={<FeedingList />} />
              <Route path="/feedings/new" element={
                <ProtectedRoute>
                  <FeedingForm />
                </ProtectedRoute>
              } />
              
              {/* 404 page */}
              <Route path="*" element={
                <div className="error-page">
                  <h1>404 - Page Not Found</h1>
                  <p>The requested page does not exist.</p>
                  <a href="/" className="btn-primary">Go to Home</a>
                </div>
              } />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;