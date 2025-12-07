import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, isEmployee, isAdmin } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Проверка ролей
  if (requiredRole === 'employee' && !isEmployee && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;