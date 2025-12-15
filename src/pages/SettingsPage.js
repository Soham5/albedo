import React from 'react';
import './SettingsPage.css';

const SettingsPage = ({ userMode, onLogout }) => {
  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h3>User Information</h3>
          <div className="settings-item">
            <span className="settings-label">Login Status</span>
            <span className="settings-value">
              {userMode === 'guest' ? '👤 Guest Mode' : '👨 Logged in as Soham'}
            </span>
          </div>
          <div className="settings-item">
            <span className="settings-label">Data Storage</span>
            <span className="settings-value">
              {userMode === 'guest' ? 'Temporary (Guest Data)' : 'Persistent (User Data)'}
            </span>
          </div>
        </div>

        <div className="settings-section">
          <h3>App Information</h3>
          <div className="settings-item">
            <span className="settings-label">App Name</span>
            <span className="settings-value">Albedo</span>
          </div>
          <div className="settings-item">
            <span className="settings-label">Version</span>
            <span className="settings-value">0.1.0</span>
          </div>
        </div>

        <div className="settings-section">
          <h3>About</h3>
          <p className="settings-description">
            Albedo is a comprehensive personal finance management application designed to help you track expenses, manage assets, and achieve your financial goals.
          </p>
        </div>

        <div className="settings-section">
          <h3>Account Actions</h3>
          <button className="settings-button logout" onClick={onLogout}>
            🚪 Logout
          </button>
          <p className="settings-info">
            💡 Logging out will return you to the login screen. Your data will be saved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
