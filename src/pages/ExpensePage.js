import React, { useState } from 'react';
import BudgetPlanner from '../components/ExpenseTracker/BudgetPlanner';
import BudgetManager from '../components/ExpenseTracker/BudgetManager';
import MonthlyTracker from '../components/ExpenseTracker/MonthlyTracker';
import ExpenseList from '../components/ExpenseTracker/ExpenseList';
import ExpenseCategoryChart from '../components/ExpenseTracker/ExpenseCategoryChart';
import AddExpenseModal from '../components/ExpenseTracker/AddExpenseModal';
import './ExpensePage.css';

const ExpensePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'budget'

  return (
    <div className="expense-page">
      <div className="expense-header">
        <h1>Expense Tracker</h1>
        <div className="header-actions">
          <button 
            className="add-expense-btn"
            onClick={() => setIsModalOpen(true)}
          >
            + Add Expense
          </button>
          <button 
            className="budget-planning-btn"
            onClick={() => setActiveTab('budget')}
          >
            Budget Planning
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <>
          <BudgetPlanner />
          <MonthlyTracker />
          <ExpenseList month={selectedMonth} />
          <ExpenseCategoryChart month={selectedMonth} />
        </>
      ) : (
        <>
          <BudgetManager />
          <button 
            className="back-to-overview-btn"
            onClick={() => setActiveTab('overview')}
          >
            ← Back to Overview
          </button>
        </>
      )}

      <AddExpenseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default ExpensePage;
