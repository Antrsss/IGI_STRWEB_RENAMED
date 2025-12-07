const RegisterForm = ({ onRegister, switchToLogin, authError }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    onRegister(formData);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>📝 Registration</h2>

        {authError && <div className="error-message">{authError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength="3"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Role:</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-control"
            >
              <option value="user">User</option>
              <option value="employee">Employee</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary">
            Register
          </button>
        </form>

        <div className="auth-links">
          <button
            className="btn-link"
            onClick={switchToLogin}
          >
            Already have an account? Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;