import React, { useState, useContext } from 'react';
import { AssetContext } from '../../contexts/AssetContext';
import './MutualFundManager.css';

const MutualFundManager = () => {
  const { mutualFunds, addMutualFund, deleteMutualFund } = useContext(AssetContext);
  const [newFund, setNewFund] = useState({
    name: '',
    scheme: '',
    units: '',
    nav: '',
    investedAmount: ''
  });

  const handleAddFund = (e) => {
    e.preventDefault();
    const fund = {
      id: Date.now(),
      name: newFund.name,
      scheme: newFund.scheme,
      units: parseFloat(newFund.units),
      nav: parseFloat(newFund.nav),
      investedAmount: parseFloat(newFund.investedAmount),
      currentValue: parseFloat(newFund.units) * parseFloat(newFund.nav),
      createdAt: new Date().toISOString()
    };
    
    addMutualFund(fund);
    setNewFund({ name: '', scheme: '', units: '', nav: '', investedAmount: '' });
  };

  const calculateReturns = (fund) => {
    const currentValue = fund.units * fund.nav;
    const returns = currentValue - fund.investedAmount;
    const percentage = (returns / fund.investedAmount) * 100;
    return { returns, percentage, currentValue };
  };

  const totalInvested = mutualFunds.reduce((sum, fund) => sum + fund.investedAmount, 0);
  const totalCurrentValue = mutualFunds.reduce((sum, fund) => sum + (fund.units * fund.nav), 0);
  const totalReturns = totalCurrentValue - totalInvested;
  const totalReturnsPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

  return (
    <div className="mutual-fund-manager">
      <div className="mf-header">
        <div className="mf-summary">
          <h3>Mutual Funds</h3>
          <div className="mf-totals">
            <div className="total-item">
              <span className="label">Invested:</span>
              <span className="value">₹{totalInvested.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div className="total-item">
              <span className="label">Current:</span>
              <span className="value">₹{totalCurrentValue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div className="total-item">
              <span className="label">Returns:</span>
              <span className={`value ${totalReturns >= 0 ? 'positive' : 'negative'}`}>
                {totalReturns >= 0 ? '+' : ''}₹{totalReturns.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ({totalReturnsPercentage.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleAddFund} className="add-mf-form">
        <input
          type="text"
          placeholder="Fund Name"
          value={newFund.name}
          onChange={(e) => setNewFund({...newFund, name: e.target.value})}
          required
        />
        <select
          value={newFund.scheme}
          onChange={(e) => setNewFund({...newFund, scheme: e.target.value})}
          required
        >
          <option value="">Select Scheme</option>
          <option value="Equity">Equity</option>
          <option value="Debt">Debt</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Index">Index Fund</option>
          <option value="ELSS">ELSS</option>
        </select>
        <input
          type="number"
          placeholder="Units"
          value={newFund.units}
          onChange={(e) => setNewFund({...newFund, units: e.target.value})}
          required
          step="0.001"
        />
        <input
          type="number"
          placeholder="Current NAV"
          value={newFund.nav}
          onChange={(e) => setNewFund({...newFund, nav: e.target.value})}
          required
          step="0.01"
        />
        <input
          type="number"
          placeholder="Invested Amount"
          value={newFund.investedAmount}
          onChange={(e) => setNewFund({...newFund, investedAmount: e.target.value})}
          required
          step="0.01"
        />
        <button type="submit">Add Fund</button>
      </form>

      <div className="mf-list">
        {mutualFunds.length === 0 ? (
          <div className="empty-state">No mutual funds added</div>
        ) : (
          mutualFunds.map(fund => {
            const { returns, percentage, currentValue } = calculateReturns(fund);
            const isPositive = returns >= 0;
            
            return (
              <div key={fund.id} className="mf-item">
                <div className="mf-main">
                  <div className="mf-name">{fund.name}</div>
                  <div className="mf-scheme-badge">{fund.scheme}</div>
                </div>
                <div className="mf-details">
                  <div className="mf-detail">
                    <span className="label">Units:</span>
                    <span className="value">{fund.units.toFixed(3)}</span>
                  </div>
                  <div className="mf-detail">
                    <span className="label">NAV:</span>
                    <span className="value">₹{fund.nav.toFixed(2)}</span>
                  </div>
                  <div className="mf-detail">
                    <span className="label">Invested:</span>
                    <span className="value">₹{fund.investedAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="mf-detail">
                    <span className="label">Current Value:</span>
                    <span className="value highlight">₹{currentValue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                </div>
                <div className={`mf-returns ${isPositive ? 'positive' : 'negative'}`}>
                  <div className="returns-amount">
                    {isPositive ? '+' : ''}₹{returns.toFixed(2)}
                  </div>
                  <div className="returns-percentage">
                    {isPositive ? '+' : ''}{percentage.toFixed(2)}%
                  </div>
                </div>
                <button 
                  className="delete-mf"
                  onClick={() => deleteMutualFund(fund.id)}
                >
                  🗑️
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="mf-note">
        💡 Update NAV regularly for accurate portfolio tracking
      </div>
    </div>
  );
};

export default MutualFundManager;
