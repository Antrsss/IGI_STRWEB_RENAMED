const LoginForm = ({ onLogin, onGoogleLogin, switchToRegister, authError }) => (
  <div className="auth-container">
    <div className="auth-card">
      <h2>🔐 Login</h2>
      {authError && <div className="error-message">{authError}</div>}
      
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        onLogin(formData.get('email'), formData.get('password'));
      }}>
        <div className="form-group">
          <label>Email:</label>
          <input type="email" name="email" required className="form-control" />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input type="password" name="password" required className="form-control" />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>

      <div className="divider"><span>or</span></div>

      <button onClick={onGoogleLogin} className="btn btn-google">
        <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google" />
        Login with Google
      </button>

      <div className="auth-links">
        <button className="btn-link" onClick={switchToRegister}>No account? Register</button>
      </div>
    </div>
  </div>
);

export default LoginForm;