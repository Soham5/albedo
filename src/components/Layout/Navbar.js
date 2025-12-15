import React from 'react';
import './Navbar.css';

const Navbar = ({ userMode, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <h1>Albedo</h1>
        </div>
        <div className="navbar-menu">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/expenses">Expenses</a></li>
            <li><a href="/assets">Assets</a></li>
            <li><a href="/settings">Settings</a></li>
            <li>
              <button className="logout-button" onClick={onLogout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
