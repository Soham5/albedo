import React, { useState, useEffect } from 'react';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { getAIApiKey, saveAIApiKey, removeAIApiKey, validateApiKey } from '../services/aiService';
import './SettingsPage.css';

const SettingsPage = ({ userMode, onLogout }) => {
  const [apiKey, setApiKey] = useState('');
  const [aiStatus, setAiStatus] = useState('enabled');
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasCustomKey, setHasCustomKey] = useState(false);

  useEffect(() => {
    const loadKey = async () => {
      // Check if a user-provided custom key exists in storage
      const customKey = loadFromStorage('geminiApiKey');
      if (customKey) {
        const decrypted = await getAIApiKey();
        if (decrypted) {
          setApiKey(decrypted);
          setHasCustomKey(true);
          setAiStatus('custom');
        }
      }
      // Default key is always available, so AI is always enabled
    };
    loadKey();
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return;
    setAiStatus('validating');
    const result = await validateApiKey(apiKey.trim());
    if (result.valid) {
      await saveAIApiKey(apiKey.trim());
      setAiStatus('custom');
      setHasCustomKey(true);
      alert('Custom API key saved and validated successfully!');
    } else {
      setAiStatus('error');
      alert('Invalid API key: ' + (result.error || 'Please check and try again.'));
    }
  };

  const handleRemoveApiKey = () => {
    removeAIApiKey();
    setApiKey('');
    setHasCustomKey(false);
    setAiStatus('enabled');
  };
  const handleExportData = () => {
    try {
      // Export all user data
      const allData = {
        expenses: loadFromStorage('expenses') || [],
        budget: loadFromStorage('budget') || 5000,
        categoryBudgets: loadFromStorage('categoryBudgets') || {},
        subcategoryBudgets: loadFromStorage('subcategoryBudgets') || {},
        stocks: loadFromStorage('stocks') || [],
        fixedDeposits: loadFromStorage('fixedDeposits') || [],
        recurringDeposits: loadFromStorage('recurringDeposits') || [],
        debts: loadFromStorage('debts') || [],
        bankAccounts: loadFromStorage('bankAccounts') || [],
        goals: loadFromStorage('goals') || [],
        mutualFunds: loadFromStorage('mutualFunds') || [],
        cryptoAssets: loadFromStorage('cryptoAssets') || [],
        exportDate: new Date().toISOString(),
        userMode: userMode
      };

      const dataStr = JSON.stringify(allData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `albedo-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('✅ Data exported successfully! Share this file to sync across devices.');
    } catch (error) {
      alert('❌ Error exporting data: ' + error.message);
    }
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        // Validate data structure
        if (!importedData.exportDate) {
          throw new Error('Invalid backup file format');
        }

        // Import all data to localStorage
        if (importedData.expenses) saveToStorage('expenses', importedData.expenses);
        if (importedData.budget) saveToStorage('budget', importedData.budget);
        if (importedData.categoryBudgets) saveToStorage('categoryBudgets', importedData.categoryBudgets);
        if (importedData.subcategoryBudgets) saveToStorage('subcategoryBudgets', importedData.subcategoryBudgets);
        if (importedData.stocks) saveToStorage('stocks', importedData.stocks);
        if (importedData.fixedDeposits) saveToStorage('fixedDeposits', importedData.fixedDeposits);
        if (importedData.recurringDeposits) saveToStorage('recurringDeposits', importedData.recurringDeposits);
        if (importedData.debts) saveToStorage('debts', importedData.debts);
        if (importedData.bankAccounts) saveToStorage('bankAccounts', importedData.bankAccounts);
        if (importedData.goals) saveToStorage('goals', importedData.goals);
        if (importedData.mutualFunds) saveToStorage('mutualFunds', importedData.mutualFunds);
        if (importedData.cryptoAssets) saveToStorage('cryptoAssets', importedData.cryptoAssets);

        alert('✅ Data imported successfully! Refreshing page...');
        window.location.reload();
      } catch (error) {
        alert('❌ Error importing data: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (window.confirm('⚠️ Are you sure you want to clear all data? This cannot be undone!')) {
      localStorage.clear();
      alert('✅ All data cleared! Refreshing page...');
      window.location.reload();
    }
  };

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
          <h3>AI Configuration</h3>
          <div className="settings-item">
            <span className="settings-label">AI Features</span>
            <span className={`settings-value ai-status ${aiStatus}`}>
              {aiStatus === 'custom' ? 'Enabled (Custom Key)' :
               aiStatus === 'enabled' ? 'Enabled (Default Key)' :
               aiStatus === 'validating' ? 'Validating...' :
               aiStatus === 'error' ? 'Invalid Key' : 'Enabled'}
            </span>
          </div>
          <div className="ai-key-input">
            <p className="settings-description" style={{ marginBottom: '0.75rem' }}>
              AI features are enabled by default. You can optionally provide your own Gemini API key below.
            </p>
            <div className="key-input-row">
              <input
                type={showApiKey ? 'text' : 'password'}
                placeholder="Enter a custom Gemini API key (optional)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="api-key-input"
              />
              <button
                className="toggle-visibility"
                onClick={() => setShowApiKey(!showApiKey)}
                type="button"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="ai-key-actions">
              <button
                className="settings-button primary"
                onClick={handleSaveApiKey}
                disabled={!apiKey.trim() || aiStatus === 'validating'}
              >
                {aiStatus === 'validating' ? 'Validating...' : 'Save Custom Key'}
              </button>
              {hasCustomKey && (
                <button className="settings-button danger" onClick={handleRemoveApiKey}>
                  Remove Custom Key
                </button>
              )}
            </div>
          </div>
          <p className="settings-info">
            AI is powered by Google Gemini. Optionally get your own free key from{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
              Google AI Studio
            </a>.
            Custom keys are encrypted and stored locally on this device only.
          </p>
        </div>

        {userMode === 'user' && (
          <div className="settings-section">
            <h3>Data Sync (Cross-Device)</h3>
            <p className="settings-description">
              Since data is stored locally on each device, use these tools to sync your data across multiple devices.
            </p>
            <div className="sync-actions">
              <button className="settings-button primary" onClick={handleExportData}>
                📥 Export Data
              </button>
              <label className="settings-button secondary">
                📤 Import Data
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <p className="settings-info">
              💡 <strong>How to sync:</strong><br/>
              1. Export data from your current device<br/>
              2. Transfer the file to your other device (email, cloud, etc.)<br/>
              3. Import the file on the other device
            </p>
          </div>
        )}

        <div className="settings-section">
          <h3>Data Management</h3>
          <button className="settings-button danger" onClick={handleClearData}>
            🗑️ Clear All Data
          </button>
          <p className="settings-warning">
            ⚠️ This action will delete all your expenses, budgets, and assets. This cannot be undone. Export your data first if you want to keep a backup.
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
