// src/App.js - полная версия со всеми маршрутами
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import GoogleCallback from './components/auth/GoogleCallback';
import Dashboard from './components/layout/Dashboard';
import HomePage from './components/layout/HomePage';

// Импортируем все компоненты для 4 сущностей
import AnimalList from './components/animals/AnimalList.jsx';
import AnimalForm from './components/animals/AnimalForm.jsx';
import AnimalDetail from './components/animals/AnimalDetail.jsx';

import EmployeeList from './components/employees/EmployeeList.jsx';
import EnclosureList from './components/enclosures/EnclosureList.jsx';
import FeedingList from './components/feedings/FeedingList.jsx';

import './App.css';

function App() {
  console.log("Navbar:", Navbar);
  console.log("Footer:", Footer);
  console.log("Dashboard:", Dashboard);
  console.log("HomePage:", HomePage);
  console.log("LoginPage:", LoginPage);
  console.log("RegisterPage:", RegisterPage);
  console.log("GoogleCallback:", GoogleCallback);
  console.log("AnimalList:", AnimalList);
  console.log("AnimalForm:", AnimalForm);
  console.log("AnimalDetail:", AnimalDetail);
  console.log("EmployeeList:", EmployeeList);
  console.log("EnclosureList:", EnclosureList);
  console.log("FeedingList:", FeedingList);

  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          
          <main className="main-content">
            <Routes>
              {/* Публичные маршруты */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/auth/callback" element={<GoogleCallback />} />
              
              {/* Защищенные маршруты */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Животные - публичный просмотр */}
              <Route path="/animals" element={<AnimalList />} />
              <Route path="/animals/:id" element={<AnimalDetail />} />
              
              {/* Животные - защищенные действия */}
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
              
              {/* Сотрудники - публичный просмотр */}
              <Route path="/employees" element={<EmployeeList />} />
              
              {/* Вольеры - публичный просмотр */}
              <Route path="/enclosures" element={<EnclosureList />} />
              
              {/* Кормление - публичный просмотр */}
              <Route path="/feedings" element={<FeedingList />} />
              
              {/* 404 страница */}
              <Route path="*" element={
                <div className="error-page">
                  <h1>404 - Страница не найдена</h1>
                  <p>Запрашиваемая страница не существует.</p>
                  <a href="/" className="btn-primary">На главную</a>
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