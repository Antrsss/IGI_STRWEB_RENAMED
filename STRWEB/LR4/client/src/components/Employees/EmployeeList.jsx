import { useState, useEffect, useCallback } from 'react'; 
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { formatLocalDateTime, formatUTCDateTime, DateTimeDisplay, getUserTimeZone } from '../../utils/dateUtils';
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

  const userTimeZone = getUserTimeZone();
  
  const [currentDateTime, setCurrentDateTime] = useState({
    local: new Date().toLocaleString('en-US', { timeZone: userTimeZone }),
    utc: new Date().toUTCString()
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime({
        local: new Date().toLocaleString('en-US', { timeZone: userTimeZone }),
        utc: new Date().toUTCString()
      });
    }, 60000);
    
    return () => clearInterval(timer);
  }, [userTimeZone]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filterAndSortEmployees = useCallback(() => {
    let result = [...employees];

    if (searchTerm) {
      result = result.filter(employee =>
        employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    result.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'hireDate' || sortField === 'createdAt' || sortField === 'updatedAt') {
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

  const handleDelete = async (event, id, employeeName) => {
    console.log('handleDelete called with:', { id, employeeName });
    console.log('Event:', event);
    
    // Остановим всплытие события
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (!id) {
      console.error('No ID provided for deletion');
      alert('Error: No employee ID provided');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${employeeName || 'this employee'}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('No authentication token found. Please login again.');
        window.location.href = '/login';
        return;
      }

      const cleanToken = token.replace(/\n/g, '').trim();
      
      const response = await axios.delete(`http://localhost:5000/api/employees/${id}`, {
        headers: {
          'Authorization': `Bearer ${cleanToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Delete successful:', response.data);
      alert('Employee deleted successfully!');
      fetchEmployees();
      
    } catch (error) {
      console.error('Delete failed:', error);
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="employee-list-container">
      <div className="employee-list-header">
        <h1>Zoo Employees</h1>
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
            <option value="createdAt">By creation date</option>
            <option value="updatedAt">By update date</option>
            <option value="isActive">By status</option>
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
              <th>Created At</th>
              <th>Updated At</th>
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
                <td>
                  <DateTimeDisplay 
                    date={employee.hireDate} 
                    showRelative={false}
                    showLocal={true}
                    showUTC={false}
                  />
                </td>
                <td>
                  <DateTimeDisplay 
                    date={employee.createdAt} 
                    showRelative={true}
                    showLocal={false}
                    showUTC={false}
                  />
                </td>
                <td>
                  <DateTimeDisplay 
                    date={employee.updatedAt} 
                    showRelative={true}
                    showLocal={false}
                    showUTC={false}
                  />
                </td>
                <td>
                  <span className={`status-badge ${employee.isActive ? 'status-active' : 'status-inactive'}`}>
                    {employee.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                
                {user && (
                  <td className="actions-cell">
                    <button 
                      onClick={(e) => handleDelete(e, employee._id, `${employee.firstName} ${employee.lastName}`)}
                      className="btn-delete"
                      title="Delete employee"
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