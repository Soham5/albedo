import React, { useState, useContext } from 'react';
import { AssetContext } from '../../contexts/AssetContext';
import './RDManager.css';

const RDManager = () => {
  const { recurringDeposits, addRecurringDeposit, deleteRecurringDeposit } = useContext(AssetContext);
  const [showForm, setShowForm] = useState(false);
  const [newRD, setNewRD] = useState({
    bankName: '',
    monthlyDeposit: '',
    interestRate: '',
    tenure: '',
    startDate: '',
    notes: ''
  });

  const calculateMaturityValue = (monthlyDeposit, rate, tenure) => {
    const R = parseFloat(monthlyDeposit); // Monthly installment
    const annualRate = parseFloat(rate) / 100; // Annual interest rate (e.g., 0.07 for 7%)
    const i = annualRate / 4; // Quarterly interest rate (e.g., 0.0175 for 7% annual)
    const n = parseFloat(tenure) / 3; // Number of quarters (e.g., 24 months / 3 = 8 quarters)
    
    // Groww's RD maturity formula: M = R * [(1+i)^n - 1] / [1 - (1+i)^(-1/3)]
    // Numerator: Total deposits with quarterly compounding
    const numerator = Math.pow(1 + i, n) - 1;
    // Denominator: Adjustment factor for monthly deposits with quarterly compounding
    const denominator = 1 - Math.pow(1 + i, -1/3);
    
    const maturity = R * (numerator / denominator);
    
    return maturity;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const rd = {
      id: Date.now(),
      ...newRD,
      monthlyDeposit: parseFloat(newRD.monthlyDeposit),
      interestRate: parseFloat(newRD.interestRate),
      tenure: parseInt(newRD.tenure),
      maturityValue: calculateMaturityValue(
        newRD.monthlyDeposit,
        newRD.interestRate,
        newRD.tenure
      ),
      createdAt: new Date().toISOString()
    };
    
    addRecurringDeposit(rd);
    setNewRD({ bankName: '', monthlyDeposit: '', interestRate: '', tenure: '', startDate: '', notes: '' });
    setShowForm(false);
  };

  const calculateProgress = (startDate, tenure) => {
    const start = new Date(startDate);
    const now = new Date();
    const monthsElapsed = Math.max(0, 
      (now.getFullYear() - start.getFullYear()) * 12 + 
      (now.getMonth() - start.getMonth())
    );
    return Math.min((monthsElapsed / tenure) * 100, 100);
  };

  return (
    <div className="rd-manager">
      <div className="rd-header">
        <h3>Recurring Deposits</h3>
        <button onClick={() => setShowForm(!showForm)} className="add-rd-button">
          {showForm ? 'Cancel' : '+ Add RD'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rd-form">
          <input
            type="text"
            placeholder="Bank Name"
            value={newRD.bankName}
            onChange={(e) => setNewRD({...newRD, bankName: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Monthly Deposit"
            value={newRD.monthlyDeposit}
            onChange={(e) => setNewRD({...newRD, monthlyDeposit: e.target.value})}
            required
            step="0.01"
          />
          <input
            type="number"
            placeholder="Interest Rate (%)"
            value={newRD.interestRate}
            onChange={(e) => setNewRD({...newRD, interestRate: e.target.value})}
            required
            step="0.01"
          />
          <input
            type="number"
            placeholder="Tenure (months)"
            value={newRD.tenure}
            onChange={(e) => setNewRD({...newRD, tenure: e.target.value})}
            required
          />
          <input
            type="date"
            placeholder="Start Date"
            value={newRD.startDate}
            onChange={(e) => setNewRD({...newRD, startDate: e.target.value})}
            required
          />
          <textarea
            placeholder="Notes (optional)"
            value={newRD.notes}
            onChange={(e) => setNewRD({...newRD, notes: e.target.value})}
            rows="2"
          />
          <button type="submit" className="submit-button">Save RD</button>
        </form>
      )}

      <div className="rd-list">
        {recurringDeposits.length === 0 ? (
          <div className="empty-state">No recurring deposits added</div>
        ) : (
          recurringDeposits.map(rd => {
            const progress = calculateProgress(rd.startDate, rd.tenure);
            return (
              <div key={rd.id} className="rd-item">
                <div className="rd-main">
                  <h4>{rd.bankName}</h4>
                  <span className="rd-rate">{rd.interestRate.toFixed(2)}% p.a.</span>
                </div>
                <div className="rd-details">
                  <div className="rd-amount">
                    <span className="label">Monthly:</span>
                    <span className="value">₹{rd.monthlyDeposit.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="rd-amount">
                    <span className="label">Tenure:</span>
                    <span className="value">{rd.tenure} months</span>
                  </div>
                  <div className="rd-detail">
                    <span className="label">Maturity Value</span>
                    <span className="value highlight">₹{rd.maturityValue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="rd-progress">
                  <div className="progress-label">Progress: {progress.toFixed(2)}%</div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                {rd.notes && <div className="rd-notes">{rd.notes}</div>}
                <button 
                  className="delete-rd"
                  onClick={() => deleteRecurringDeposit(rd.id)}
                >
                  🗑️
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RDManager;
