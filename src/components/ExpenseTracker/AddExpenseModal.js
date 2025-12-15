import React, { useState, useContext, useEffect } from 'react';
import { ExpenseContext } from '../../contexts/ExpenseContext';
import { AssetContext } from '../../contexts/AssetContext';
import Modal from '../Shared/Modal';
import InputField from '../Shared/InputField';
import DatePicker from '../Shared/DatePicker';
import { getAllCategories, getSubcategories, getBankAccount } from '../../utils/expenseCategories';
import './AddExpenseModal.css';

const AddExpenseModal = ({ isOpen, onClose }) => {
  const { addExpense } = useContext(ExpenseContext);
  const { bankAccounts, updateBankAccount } = useContext(AssetContext);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    subcategory: '',
    bankAccount: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    notes: ''
  });

  const categories = getAllCategories();
  const subcategories = formData.category ? getSubcategories(formData.category) : [];
  
  // Use bankAccounts from context, with fallback
  const availableBanks = bankAccounts && bankAccounts.length > 0 ? bankAccounts : [
    { id: 1, bankName: 'Axis' },
    { id: 2, bankName: 'SBI' },
    { id: 3, bankName: 'HDFC' },
    { id: 4, bankName: 'HSBC' }
  ];

  // Auto-select bank account based on category/subcategory
  useEffect(() => {
    if (formData.category && !formData.bankAccount) {
      const suggestedBank = getBankAccount(formData.category, formData.subcategory);
      // Only auto-select if there's a suggestion and no bank is selected yet
      if (suggestedBank) {
        setFormData(prev => ({ ...prev, bankAccount: suggestedBank }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.category, formData.subcategory]);

  const handleChange = (field, value) => {
    setFormData(prev => {
      // Reset subcategory and bank account when category changes
      if (field === 'category') {
        return { ...prev, [field]: value, subcategory: '', bankAccount: '' };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const expenseAmount = parseFloat(formData.amount);
    
    const expense = {
      id: Date.now(),
      amount: expenseAmount,
      category: formData.category,
      subcategory: formData.subcategory || null,
      bankAccount: formData.bankAccount,
      date: `${formData.date}T${formData.time}`,
      notes: formData.notes,
      createdAt: new Date().toISOString()
    };

    // Add the expense
    addExpense(expense);
    
    // Update bank account balance
    const bank = availableBanks.find(b => b.bankName === formData.bankAccount);
    if (bank && bank.balance !== undefined && updateBankAccount) {
      updateBankAccount(bank.id, {
        balance: bank.balance - expenseAmount
      });
    }
    
    // Reset form
    setFormData({
      amount: '',
      category: '',
      subcategory: '',
      bankAccount: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      notes: ''
    });
    
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Expense">
      <form onSubmit={handleSubmit} className="expense-form">
        <InputField
          label="Amount"
          type="number"
          value={formData.amount}
          onChange={(value) => handleChange('amount', value)}
          placeholder="0.00"
          required
        />

        <div className="form-group">
          <label>Category *</label>
          <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            required
            className="category-select"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {subcategories.length > 0 && (
          <div className="form-group">
            <label>Subcategory</label>
            <select
              value={formData.subcategory}
              onChange={(e) => handleChange('subcategory', e.target.value)}
              className="category-select"
            >
              <option value="">Select Subcategory (Optional)</option>
              {subcategories.map(subcat => (
                <option key={subcat} value={subcat}>{subcat}</option>
              ))}
            </select>
          </div>
        )}
        <div className="form-group">
          <label>Bank Account *</label>
          <select
            value={formData.bankAccount}
            onChange={(e) => handleChange('bankAccount', e.target.value)}
            required
            className="category-select"
          >
            <option value="">Select Bank Account</option>
            {availableBanks.map((bank) => (
              <option key={bank.id} value={bank.bankName}>
                {bank.bankName} {bank.accountNumber ? `(${bank.accountNumber})` : ''}
              </option>
            ))}
          </select>
          {formData.category && getBankAccount(formData.category, formData.subcategory) && (
            <small style={{ color: '#666', fontSize: '0.85rem' }}>
              Suggested: {getBankAccount(formData.category, formData.subcategory)}
            </small>
          )}
        </div>

        <DatePicker
          label="Date"
          value={formData.date}
          onChange={(value) => handleChange('date', value)}
        />

        <InputField
          label="Time"
          type="time"
          value={formData.time}
          onChange={(value) => handleChange('time', value)}
        />

        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Add notes (optional)"
            rows="3"
            className="notes-textarea"
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} className="cancel-button">
            Cancel
          </button>
          <button type="submit" className="save-button">
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddExpenseModal;
