import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const VALID_USERNAME = 'Soham';
  const VALID_PASSWORD = 'SmSr@1999';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      onLogin('user');
    } else {
      setError('Invalid username or password');
    }
  };

  const handleGuestLogin = () => {
    onLogin('guest');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Albedo</h1>
          <p>Personal Finance Manager</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button onClick={handleGuestLogin} className="guest-button">
          Continue as Guest
        </button>

        <div className="login-info">
          <p>💡 Guest mode uses default demo data</p>
          <p>🔒 Login to access your saved data</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
