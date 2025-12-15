import React, { useState, useContext } from 'react';
import { AssetContext } from '../../contexts/AssetContext';
import './DebtManager.css';

const DebtManager = () => {
  const { debts, addDebt, repayDebt, deleteDebt } = useContext(AssetContext);
  const [showForm, setShowForm] = useState(false);
  const [newDebt, setNewDebt] = useState({
    creditor: '',
    principal: '',
    interestRate: '',
    startDate: '',
    dueDate: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const debt = {
      id: Date.now(),
      ...newDebt,
      principal: parseFloat(newDebt.principal),
      interestRate: parseFloat(newDebt.interestRate),
      outstanding: parseFloat(newDebt.principal),
      payments: [],
      createdAt: new Date().toISOString()
    };
    
    addDebt(debt);
    setNewDebt({ creditor: '', principal: '', interestRate: '', startDate: '', dueDate: '', notes: '' });
    setShowForm(false);
  };

  const handleRepayment = (debtId, amount) => {
    const repayment = {
      amount: parseFloat(amount),
      date: new Date().toISOString()
    };
    repayDebt(debtId, repayment);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalDebt = debts.reduce((sum, debt) => sum + debt.outstanding, 0);

  return (
    <div className="debt-manager">
      <div className="debt-header">
        <div>
          <h3>Debt Management</h3>
          <div className="total-debt">Total Outstanding: ${totalDebt.toLocaleString()}</div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="add-debt-button">
          {showForm ? 'Cancel' : '+ Add Debt'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="debt-form">
          <input
            type="text"
            placeholder="Creditor/Lender Name"
            value={newDebt.creditor}
            onChange={(e) => setNewDebt({...newDebt, creditor: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Principal Amount"
            value={newDebt.principal}
            onChange={(e) => setNewDebt({...newDebt, principal: e.target.value})}
            required
            step="0.01"
          />
          <input
            type="number"
            placeholder="Interest Rate (%)"
            value={newDebt.interestRate}
            onChange={(e) => setNewDebt({...newDebt, interestRate: e.target.value})}
            required
            step="0.01"
          />
          <input
            type="date"
            placeholder="Start Date"
            value={newDebt.startDate}
            onChange={(e) => setNewDebt({...newDebt, startDate: e.target.value})}
            required
          />
          <input
            type="date"
            placeholder="Due Date"
            value={newDebt.dueDate}
            onChange={(e) => setNewDebt({...newDebt, dueDate: e.target.value})}
            required
          />
          <textarea
            placeholder="Notes (optional)"
            value={newDebt.notes}
            onChange={(e) => setNewDebt({...newDebt, notes: e.target.value})}
            rows="2"
          />
          <button type="submit" className="submit-button">Save Debt</button>
        </form>
      )}

      <div className="debt-list">
        {debts.length === 0 ? (
          <div className="empty-state">No debts tracked</div>
        ) : (
          debts.map(debt => {
            const percentagePaid = ((debt.principal - debt.outstanding) / debt.principal) * 100;
            const isPastDue = new Date(debt.dueDate) < new Date() && debt.outstanding > 0;
            
            return (
              <div key={debt.id} className={`debt-item ${isPastDue ? 'overdue' : ''}`}>
                <div className="debt-main">
                  <h4>{debt.creditor}</h4>
                  {isPastDue && <span className="overdue-badge">⚠️ Overdue</span>}
                  <span className="debt-rate">{debt.interestRate.toFixed(2)}% p.a.</span>
                </div>
                <div className="debt-details">
                  <div className="debt-amount">
                    <span className="label">Original:</span>
                    <span className="value">₹{debt.principal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="debt-detail">
                    <span className="label">Outstanding</span>
                    <span className="value warning">₹{debt.outstanding.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="debt-amount">
                    <span className="label">Due Date:</span>
                    <span className="value">{formatDate(debt.dueDate)}</span>
                  </div>
                </div>
                <div className="debt-progress">
                  <div className="progress-label">Paid: {percentagePaid.toFixed(2)}%</div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${percentagePaid}%` }}
                    ></div>
                  </div>
                </div>
                <div className="debt-actions">
                  <input
                    type="number"
                    placeholder="Repayment amount"
                    step="0.01"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleRepayment(debt.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <span className="hint">Press Enter to record payment</span>
                </div>
                {debt.notes && <div className="debt-notes">{debt.notes}</div>}
                <button 
                  className="delete-debt"
                  onClick={() => deleteDebt(debt.id)}
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

export default DebtManager;
