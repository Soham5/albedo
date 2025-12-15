import React, { useState, useContext } from 'react';
import { AssetContext } from '../../contexts/AssetContext';
import './BankManager.css';

const BankManager = () => {
  const { bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount } = useContext(AssetContext);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newAccount, setNewAccount] = useState({
    bankName: '',
    accountType: '',
    balance: '',
    accountNumber: '',
    notes: ''
  });

  const accountTypes = ['Savings', 'Checking', 'Money Market', 'Other'];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingId) {
      // Update existing account
      updateBankAccount(editingId, {
        ...newAccount,
        balance: parseFloat(newAccount.balance)
      });
      setEditingId(null);
    } else {
      // Add new account
      const account = {
        id: Date.now(),
        ...newAccount,
        balance: parseFloat(newAccount.balance),
        createdAt: new Date().toISOString()
      };
      addBankAccount(account);
    }
    
    setNewAccount({ bankName: '', accountType: '', balance: '', accountNumber: '', notes: '' });
    setShowForm(false);
  };

  const handleEdit = (account) => {
    setNewAccount({
      bankName: account.bankName,
      accountType: account.accountType,
      balance: account.balance.toString(),
      accountNumber: account.accountNumber || '',
      notes: account.notes || ''
    });
    setEditingId(account.id);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewAccount({ bankName: '', accountType: '', balance: '', accountNumber: '', notes: '' });
    setShowForm(false);
  };

  const handleBalanceUpdate = (accountId, newBalance) => {
    updateBankAccount(accountId, { balance: parseFloat(newBalance) });
  };

  const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="bank-manager">
      <div className="bank-header">
        <div>
          <h3>Bank Accounts</h3>
          <div className="total-balance">Total Balance: ${totalBalance.toLocaleString()}</div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="add-bank-button">
          {showForm ? 'Cancel' : editingId ? 'Cancel Edit' : '+ Add Account'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bank-form">
          <h4 className="form-title">{editingId ? 'Edit Account' : 'Add New Account'}</h4>
          <input
            type="text"
            placeholder="Bank Name"
            value={newAccount.bankName}
            onChange={(e) => setNewAccount({...newAccount, bankName: e.target.value})}
            required
          />
          <select
            value={newAccount.accountType}
            onChange={(e) => setNewAccount({...newAccount, accountType: e.target.value})}
            required
          >
            <option value="">Select Account Type</option>
            {accountTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Current Balance"
            value={newAccount.balance}
            onChange={(e) => setNewAccount({...newAccount, balance: e.target.value})}
            required
            step="0.01"
          />
          <input
            type="text"
            placeholder="Account Number (last 4 digits)"
            value={newAccount.accountNumber}
            onChange={(e) => setNewAccount({...newAccount, accountNumber: e.target.value})}
            maxLength="4"
          />
          <textarea
            placeholder="Notes (optional)"
            value={newAccount.notes}
            onChange={(e) => setNewAccount({...newAccount, notes: e.target.value})}
            rows="2"
          />
          <div className="form-buttons">
            <button type="submit" className="submit-button">
              {editingId ? 'Update Account' : 'Save Account'}
            </button>
            {editingId && (
              <button type="button" className="cancel-edit-button" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="bank-list">
        {bankAccounts.length === 0 ? (
          <div className="empty-state">No bank accounts added</div>
        ) : (
          bankAccounts.map(account => (
            <div key={account.id} className="bank-item">
              <div className="bank-main">
                <div className="bank-info">
                  <h4>{account.bankName}</h4>
                  <span className="account-type">{account.accountType}</span>
                  {account.accountNumber && (
                    <span className="account-number">****{account.accountNumber}</span>
                  )}
                </div>
                <div className="account-balance">
                  <span className="balance-label">Balance</span>
                  <span className="balance-amount">₹{account.balance.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </div>
              <div className="bank-actions">
                <button 
                  className="edit-bank-button"
                  onClick={() => handleEdit(account)}
                >
                  ✏️ Edit
                </button>
                <button 
                  className="delete-bank"
                  onClick={() => deleteBankAccount(account.id)}
                >
                  🗑️ Delete
                </button>
              </div>
              {account.notes && <div className="bank-notes">{account.notes}</div>}
            </div>
          ))
        )}
      </div>
      
      <div className="bank-note">
        💡 Future enhancement: Link to banking APIs for automatic balance sync
      </div>
    </div>
  );
};

export default BankManager;
