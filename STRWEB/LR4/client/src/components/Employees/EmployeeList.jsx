// src/components/employees/EmployeeList.jsx
import React, { useState, useEffect, useCallback } from 'react'; 
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './EmployeeList.css';

const EmployeeList = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('firstName');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filterAndSortEmployees = useCallback(() => {
    let result = [...employees];

    // Поиск
    if (searchTerm) {
      result = result.filter(employee =>
        employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Сортировка
    result.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'hireDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredEmployees(result);
  }, [employees, searchTerm, sortField, sortDirection]);

  useEffect(() => {
    filterAndSortEmployees();
  }, [filterAndSortEmployees]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/employees');
      setEmployees(response.data);
      setError(null);
    } catch (error) {
      console.error('Ошибка загрузки сотрудников:', error);
      setError('Не удалось загрузить список сотрудников');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/employees/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchEmployees();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Не удалось удалить сотрудника');
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="employee-list-container">
      <div className="employee-list-header">
        <h1>👨‍⚕️ Сотрудники зоопарка</h1>
        
        {user && (
          <Link to="/employees/new" className="btn btn-primary">
            ➕ Добавить сотрудника
          </Link>
        )}
      </div>

      <div className="search-sort-panel">
        <div className="search-box">
          <input
            type="text"
            placeholder="Поиск по имени, фамилии или должности..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="sort-controls">
          <select 
            value={sortField} 
            onChange={(e) => setSortField(e.target.value)}
            className="sort-select"
          >
            <option value="firstName">По имени</option>
            <option value="lastName">По фамилии</option>
            <option value="position">По должности</option>
            <option value="hireDate">По дате найма</option>
          </select>

          <button 
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="sort-direction-btn"
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className="employees-table-container">
        <table className="employees-table">
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Должность</th>
              <th>Специализация</th>
              <th>Дата найма</th>
              <th>Статус</th>
              {user && <th>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(employee => (
              <tr key={employee._id}>
                <td>
                  <Link to={`/employees/${employee._id}`} className="employee-name">
                    {employee.firstName} {employee.lastName}
                  </Link>
                </td>
                <td>{employee.position}</td>
                <td>{employee.specialization || '-'}</td>
                <td>{new Date(employee.hireDate).toLocaleDateString('ru-RU')}</td>
                <td>
                  <span className={`status-badge ${employee.isActive ? 'active' : 'inactive'}`}>
                    {employee.isActive ? '🟢 Активен' : '🔴 Неактивен'}
                  </span>
                </td>
                
                {user && (
                  <td className="actions-cell">
                    <Link to={`/employees/edit/${employee._id}`} className="btn-edit">
                      ✏️
                    </Link>
                    <button 
                      onClick={() => handleDelete(employee._id)}
                      className="btn-delete"
                    >
                      🗑️
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEmployees.length === 0 && (
          <div className="no-results">
            <p>Сотрудники не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;