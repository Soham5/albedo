import React from 'react';
import { useNavigate } from 'react-router-dom';
import './QuickActions.css';

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="quick-actions">
      <button 
        className="action-button primary"
        onClick={() => navigate('/expenses/add')}
      >
        <span className="button-icon">💳</span>
        <span className="button-text">Add Transaction</span>
      </button>
      
      <button 
        className="action-button secondary"
        onClick={() => navigate('/assets/add')}
      >
        <span className="button-icon">📈</span>
        <span className="button-text">Add Asset</span>
      </button>
      
      <button 
        className="action-button tertiary"
        onClick={() => navigate('/reports')}
      >
        <span className="button-icon">📊</span>
        <span className="button-text">View Reports</span>
      </button>
    </div>
  );
};

export default QuickActions;
