// src/components/employees/EmployeeList.jsx
import { useState, useEffect, useCallback } from 'react'; 
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

    // Search
    if (searchTerm) {
      result = result.filter(employee =>
        employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sorting
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
      console.error('Error loading employees:', error);
      setError('Failed to load employee list');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
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
      console.error('Delete error:', error);
      alert('Failed to delete employee');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="employee-list-container">
      <div className="employee-list-header">
        <h1>Zoo Employees</h1>
        
        {user && (
          <Link to="/employees/new" className="btn btn-primary">
            ➕ Add Employee
          </Link>
        )}
      </div>

      <div className="search-sort-panel">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, last name, or position..."
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
            <option value="firstName">By first name</option>
            <option value="lastName">By last name</option>
            <option value="position">By position</option>
            <option value="hireDate">By hire date</option>
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
              <th>Full Name</th>
              <th>Position</th>
              <th>Specialization</th>
              <th>Hire Date</th>
              <th>Status</th>
              {user && <th>Actions</th>}
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
                <td>{new Date(employee.hireDate).toLocaleDateString('en-US')}</td>
                
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
            <p>No employees found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;