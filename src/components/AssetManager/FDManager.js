import React, { useState, useContext } from 'react';
import { AssetContext } from '../../contexts/AssetContext';
import './FDManager.css';

const FDManager = () => {
  const { fixedDeposits, addFixedDeposit, deleteFixedDeposit } = useContext(AssetContext);
  const [showForm, setShowForm] = useState(false);
  const [newFD, setNewFD] = useState({
    bankName: '',
    principal: '',
    interestRate: '',
    startDate: '',
    maturityDate: '',
    notes: ''
  });

  const calculateMaturityValue = (principal, rate, startDate, maturityDate) => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const start = new Date(startDate);
    const end = new Date(maturityDate);
    const years = (end - start) / (1000 * 60 * 60 * 24 * 365);
    
    // Simple interest calculation
    const interest = p * r * years;
    return p + interest;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = {
      id: Date.now(),
      ...newFD,
      principal: parseFloat(newFD.principal),
      interestRate: parseFloat(newFD.interestRate),
      maturityValue: calculateMaturityValue(
        newFD.principal,
        newFD.interestRate,
        newFD.startDate,
        newFD.maturityDate
      ),
      createdAt: new Date().toISOString()
    };
    
    addFixedDeposit(fd);
    setNewFD({ bankName: '', principal: '', interestRate: '', startDate: '', maturityDate: '', notes: '' });
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fd-manager">
      <div className="fd-header">
        <h3>Fixed Deposits</h3>
        <button onClick={() => setShowForm(!showForm)} className="add-fd-button">
          {showForm ? 'Cancel' : '+ Add FD'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="fd-form">
          <input
            type="text"
            placeholder="Bank Name"
            value={newFD.bankName}
            onChange={(e) => setNewFD({...newFD, bankName: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Principal Amount"
            value={newFD.principal}
            onChange={(e) => setNewFD({...newFD, principal: e.target.value})}
            required
            step="0.01"
          />
          <input
            type="number"
            placeholder="Interest Rate (%)"
            value={newFD.interestRate}
            onChange={(e) => setNewFD({...newFD, interestRate: e.target.value})}
            required
            step="0.01"
          />
          <input
            type="date"
            placeholder="Start Date"
            value={newFD.startDate}
            onChange={(e) => setNewFD({...newFD, startDate: e.target.value})}
            required
          />
          <input
            type="date"
            placeholder="Maturity Date"
            value={newFD.maturityDate}
            onChange={(e) => setNewFD({...newFD, maturityDate: e.target.value})}
            required
          />
          <textarea
            placeholder="Notes (optional)"
            value={newFD.notes}
            onChange={(e) => setNewFD({...newFD, notes: e.target.value})}
            rows="2"
          />
          <button type="submit" className="submit-button">Save FD</button>
        </form>
      )}

      <div className="fd-list">
        {fixedDeposits.length === 0 ? (
          <div className="empty-state">No fixed deposits added</div>
        ) : (
          fixedDeposits.map(fd => (
            <div key={fd.id} className="fd-item">
              <div className="fd-main">
                <h4>{fd.bankName}</h4>
                <span className="fd-rate">{fd.interestRate}% p.a.</span>
              </div>
              <div className="fd-details">
                <div className="fd-detail">
                  <span className="label">Principal</span>
                  <span className="value">₹{fd.principal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="fd-detail">
                  <span className="label">Maturity Value</span>
                  <span className="value highlight">₹{fd.maturityValue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </div>
              <div className="fd-dates">
                <span>{formatDate(fd.startDate)} → {formatDate(fd.maturityDate)}</span>
              </div>
              {fd.notes && <div className="fd-notes">{fd.notes}</div>}
              <button 
                className="delete-fd"
                onClick={() => deleteFixedDeposit(fd.id)}
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FDManager;
