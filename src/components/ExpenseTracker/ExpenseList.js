import React, { useContext } from 'react';
import { ExpenseContext } from '../../contexts/ExpenseContext';
import './ExpenseList.css';

const ExpenseList = ({ month }) => {
  const { expenses, deleteExpense } = useContext(ExpenseContext);

  const categoryIcons = {
    'Food & Dining': '🍔',
    'Transportation': '🚗',
    'Shopping': '🛍️',
    'Entertainment': '🎬',
    'Bills & Utilities': '💡',
    'Healthcare': '⚕️',
    'Education': '📚',
    'Travel': '✈️',
    'Other': '📌'
  };

  const categoryColors = {
    'Food & Dining': '#e74c3c',
    'Transportation': '#3498db',
    'Shopping': '#9b59b6',
    'Entertainment': '#e67e22',
    'Bills & Utilities': '#f39c12',
    'Healthcare': '#1abc9c',
    'Education': '#34495e',
    'Travel': '#16a085',
    'Other': '#95a5a6'
  };

  const filteredExpenses = month 
    ? expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === month.getMonth() &&
               expenseDate.getFullYear() === month.getFullYear();
      })
    : expenses;

  const sortedExpenses = [...filteredExpenses].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="expense-list">
      <h3>Recent Transactions</h3>
      {sortedExpenses.length === 0 ? (
        <div className="empty-state">
          <p>No transactions yet</p>
          <span>Add your first expense to get started</span>
        </div>
      ) : (
        <div className="transactions">
          {sortedExpenses.map(expense => (
            <div 
              key={expense.id} 
              className="transaction-item"
              style={{ borderLeftColor: categoryColors[expense.category] }}
            >
              <div className="transaction-icon">
                {categoryIcons[expense.category] || '📌'}
              </div>
              <div className="transaction-details">
                <div className="transaction-category">
                  {expense.category}
                  {expense.subcategory && <span className="subcategory"> • {expense.subcategory}</span>}
                </div>
                <div className="transaction-date">{formatDate(expense.date)}</div>
                {expense.bankAccount && (
                  <div className="transaction-bank">
                    <span className="bank-badge">{expense.bankAccount}</span>
                  </div>
                )}
                {expense.notes && (
                  <div className="transaction-notes">{expense.notes}</div>
                )}
              </div>
              <div className="transaction-amount">
                ₹{expense.amount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
              <button 
                className="delete-button"
                onClick={() => deleteExpense(expense.id)}
                title="Delete transaction"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
