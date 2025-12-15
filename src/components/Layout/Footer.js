import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <footer className="footer">
      <div className="footer-nav">
        <button 
          className={`footer-nav-item ${isActive('/') ? 'active' : ''}`}
          onClick={() => navigate('/')}
        >
          <span className="icon">🏠</span>
          <span className="label">Home</span>
        </button>
        <button 
          className={`footer-nav-item ${isActive('/expenses') ? 'active' : ''}`}
          onClick={() => navigate('/expenses')}
        >
          <span className="icon">💰</span>
          <span className="label">Expenses</span>
        </button>
        <button 
          className={`footer-nav-item ${isActive('/assets') ? 'active' : ''}`}
          onClick={() => navigate('/assets')}
        >
          <span className="icon">📊</span>
          <span className="label">Assets</span>
        </button>
        <button 
          className={`footer-nav-item ${isActive('/settings') ? 'active' : ''}`}
          onClick={() => navigate('/settings')}
        >
          <span className="icon">⚙️</span>
          <span className="label">Settings</span>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
