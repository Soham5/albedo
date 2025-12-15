import React, { useContext } from 'react';
import { ExpenseContext } from '../../contexts/ExpenseContext';
import { CATEGORY_COLORS } from '../../utils/expenseCategories';
import './ExpenseCategoryChart.css';

const ExpenseCategoryChart = ({ month }) => {
  const { expenses } = useContext(ExpenseContext);

  const filteredExpenses = month 
    ? expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === month.getMonth() &&
               expenseDate.getFullYear() === month.getFullYear();
      })
    : expenses;

  // Calculate category totals
  const categoryTotals = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

  const categoryColors = CATEGORY_COLORS;

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="expense-category-chart">
      <h3>Category Breakdown</h3>
      {total === 0 ? (
        <div className="chart-empty">
          <p>No expenses to display</p>
        </div>
      ) : (
        <>
          <div className="chart-legend">
            {sortedCategories.map(([category, amount]) => {
              const percentage = (amount / total) * 100;
              return (
                <div key={category} className="legend-item">
                  <div className="legend-header">
                    <div className="legend-info">
                      <div 
                        className="legend-color"
                        style={{ backgroundColor: categoryColors[category] }}
                      ></div>
                      <span className="legend-label">{category}</span>
                    </div>
                    <span className="legend-amount">₹{amount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="legend-bar">
                    <div 
                      className="legend-bar-fill"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: categoryColors[category]
                      }}
                    ></div>
                  </div>
                  <span className="legend-percentage">{percentage.toFixed(2)}%</span>
                </div>
              );
            })}
          </div>
          <div className="chart-total">
            <span>Total Spent:</span>
            <span className="total-amount">₹{total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
        </>
      )}
      <div className="chart-note">
        💡 Consider using Chart.js or ECharts for interactive pie/donut charts
      </div>
    </div>
  );
};

export default ExpenseCategoryChart;
