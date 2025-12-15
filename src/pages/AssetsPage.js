import React, { useState } from 'react';
import StockTracker from '../components/AssetManager/StockTracker';
import FDManager from '../components/AssetManager/FDManager';
import RDManager from '../components/AssetManager/RDManager';
import DebtManager from '../components/AssetManager/DebtManager';
import BankManager from '../components/AssetManager/BankManager';
import GoalSettings from '../components/AssetManager/GoalSettings';
import MutualFundManager from '../components/AssetManager/MutualFundManager';
import CryptoManager from '../components/AssetManager/CryptoManager';
import './AssetsPage.css';

const AssetsPage = () => {
  const [activeTab, setActiveTab] = useState('stocks');

  const tabs = [
    { id: 'stocks', label: 'Stocks', icon: '📈' },
    { id: 'mf', label: 'Mutual Funds', icon: '📊' },
    { id: 'crypto', label: 'Crypto', icon: '₿' },
    { id: 'fd', label: 'Fixed Deposits', icon: '🏦' },
    { id: 'rd', label: 'Recurring Deposits', icon: '💰' },
    { id: 'debt', label: 'Debts', icon: '💳' },
    { id: 'bank', label: 'Bank Accounts', icon: '🏧' },
    { id: 'goals', label: 'Goals', icon: '🎯' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'stocks':
        return <StockTracker />;
      case 'mf':
        return <MutualFundManager />;
      case 'crypto':
        return <CryptoManager />;
      case 'fd':
        return <FDManager />;
      case 'rd':
        return <RDManager />;
      case 'debt':
        return <DebtManager />;
      case 'bank':
        return <BankManager />;
      case 'goals':
        return <GoalSettings />;
      default:
        return <StockTracker />;
    }
  };

  return (
    <div className="assets-page">
      <h1>Asset Management</h1>
      
      <div className="asset-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="asset-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AssetsPage;
