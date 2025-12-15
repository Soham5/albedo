import React, { useContext } from 'react';
import { ExpenseContext } from '../../contexts/ExpenseContext';
import { AssetContext } from '../../contexts/AssetContext';
import './AccountSummary.css';

const AccountSummary = ({ userMode }) => {
  const { expenses, budget } = useContext(ExpenseContext);
  const { totalAssetValue, bankAccounts } = useContext(AssetContext);

  // Calculate monthly spend
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlySpend = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  const spendPercentage = budget > 0 ? (monthlySpend / budget) * 100 : 0;
  
  // Current balance is sum of all bank account balances
  const currentBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="account-summary">
      <div className="summary-header">
        <h2>Welcome, {userMode === 'guest' ? 'Guest' : 'Soham'}</h2>
        <span className="user-mode-badge">
          {userMode === 'guest' ? '👤 Guest Mode' : '👨 User Mode'}
        </span>
      </div>
      <div className="balance-card">
        <div className="balance-label">Current Balance</div>
        <div className="balance-amount">₹{currentBalance.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
      </div>
      
      <div className="summary-grid">
        <div className="summary-card expense-overview">
          <h3>Expense Overview</h3>
          <div className="monthly-spend">
            <span className="label">Monthly Spend</span>
            <span className="amount">₹{monthlySpend.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(spendPercentage, 100)}%` }}
              ></div>
            </div>
            <span className="progress-label">
              {spendPercentage.toFixed(2)}% of ₹{budget.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </span>
          </div>
        </div>

        <div className="summary-card asset-overview">
          <h3>Asset Overview</h3>
          <div className="total-assets">
            <span className="label">Total Assets Value</span>
            <span className="amount">₹{totalAssetValue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
          <div className="asset-chart-placeholder">
            📊 Chart Coming Soon
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSummary;
