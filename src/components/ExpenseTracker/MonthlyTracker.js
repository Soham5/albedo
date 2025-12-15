import React, { useContext, useState } from 'react';
import { ExpenseContext } from '../../contexts/ExpenseContext';
import './MonthlyTracker.css';

const MonthlyTracker = () => {
  const { expenses, budget } = useContext(ExpenseContext);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedMonth(newDate);
  };

  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === selectedMonth.getMonth() &&
           expenseDate.getFullYear() === selectedMonth.getFullYear();
  });

  const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const percentageUsed = budget > 0 ? (totalSpent / budget) * 100 : 0;

  return (
    <div className="monthly-tracker">
      <div className="month-selector">
        <button onClick={handlePrevMonth} className="month-nav-button">‹</button>
        <h3>{monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}</h3>
        <button onClick={handleNextMonth} className="month-nav-button">›</button>
      </div>

      <div className="spending-progress">
        <div className="progress-info">
          <span>₹{totalSpent.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} / ₹{budget.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          <span className={percentageUsed > 90 ? 'warning' : ''}>
            {percentageUsed.toFixed(2)}%
          </span>
        </div>
        <div className="progress-bar">
          <div 
            className={`progress-fill ${percentageUsed > 90 ? 'warning' : ''}`}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyTracker;
