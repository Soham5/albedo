import React, { useContext, useState } from 'react';
import { ExpenseContext } from '../../contexts/ExpenseContext';
import { getCategoriesByType, getSubcategories } from '../../utils/expenseCategories';
import './BudgetPlanner.css';

const BudgetPlanner = () => {
  const { budget, categoryBudgets, subcategoryBudgets, getCategorySpending, getSubcategorySpending } = useContext(ExpenseContext);
  const [expandedTypes, setExpandedTypes] = useState({});

  // Calculate category-wise totals
  const savingsCategories = getCategoriesByType('SAVINGS');
  const needsCategories = getCategoriesByType('NEEDS');
  const wantsCategories = getCategoriesByType('WANTS');
  
  const savingsTotal = savingsCategories.reduce((sum, category) => {
    return sum + (getCategorySpending(category) || 0);
  }, 0);
  
  const needsTotal = needsCategories.reduce((sum, category) => {
    return sum + (getCategorySpending(category) || 0);
  }, 0);
  
  const wantsTotal = wantsCategories.reduce((sum, category) => {
    return sum + (getCategorySpending(category) || 0);
  }, 0);

  const totalExpenses = savingsTotal + needsTotal + wantsTotal;
  const remaining = budget - totalExpenses;

  // Calculate total budgets set for each type (including subcategories)
  const calculateTypeBudget = (categories) => {
    return categories.reduce((sum, category) => {
      const categoryBudget = categoryBudgets[category] || 0;
      const subcategories = getSubcategories(category);
      const subcategoryTotal = subcategories.reduce((subSum, subcategory) => {
        const key = `${category}|${subcategory}`;
        return subSum + (subcategoryBudgets[key] || 0);
      }, 0);
      return sum + Math.max(categoryBudget, subcategoryTotal);
    }, 0);
  };

  const savingsBudget = calculateTypeBudget(savingsCategories);
  const needsBudget = calculateTypeBudget(needsCategories);
  const wantsBudget = calculateTypeBudget(wantsCategories);

  // Calculate percentages of actual spending
  const savingsPercentage = savingsBudget > 0 ? ((savingsTotal / savingsBudget) * 100).toFixed(2) : '0.00';
  const needsPercentage = needsBudget > 0 ? ((needsTotal / needsBudget) * 100).toFixed(2) : '0.00';
  const wantsPercentage = wantsBudget > 0 ? ((wantsTotal / wantsBudget) * 100).toFixed(2) : '0.00';

  const toggleType = (type) => {
    setExpandedTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const renderCategoryBreakdown = (categories) => {
    return categories.map(category => {
      const subcategories = getSubcategories(category);
      const categorySpent = getCategorySpending(category);
      const categoryBudget = categoryBudgets[category] || 0;
      const hasSubcategories = subcategories.length > 0;

      // Calculate total subcategory budgets
      const subcategoryTotalBudget = subcategories.reduce((sum, subcategory) => {
        const subcategoryKey = `${category}|${subcategory}`;
        return sum + (subcategoryBudgets[subcategoryKey] || 0);
      }, 0);

      // Use subcategory total if it's greater than category budget
      const displayBudget = hasSubcategories && subcategoryTotalBudget > 0 
        ? subcategoryTotalBudget 
        : categoryBudget;

      return (
        <div key={category} className="category-spending-item">
          <div className="category-spending-row">
            <span className="category-spending-name">{category}</span>
            <div className="category-spending-amounts">
              <span className="category-actual">₹{categorySpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="amount-separator">/</span>
              <span className="category-planned">₹{displayBudget.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
          {hasSubcategories && (
            <div className="subcategories-spending">
              {subcategories.map(subcategory => {
                const subcategorySpent = getSubcategorySpending(category, subcategory);
                const subcategoryKey = `${category}|${subcategory}`;
                const subcategoryBudget = subcategoryBudgets[subcategoryKey] || 0;
                
                return (
                  <div key={subcategory} className="subcategory-spending-row">
                    <span className="subcategory-spending-name">→ {subcategory}</span>
                    <div className="subcategory-spending-amounts">
                      <span className="subcategory-actual">₹{subcategorySpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      <span className="amount-separator">/</span>
                      <span className="subcategory-planned">₹{subcategoryBudget.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="budget-planner">
      <div className="budget-display">
        <span className="budget-label">Monthly Budget</span>
        <span className="budget-amount">₹{budget.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
      </div>

      <div className="budget-summary">
        <div className="summary-item">
          <span>Total Spent:</span>
          <span className="spent-amount">₹{totalExpenses.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
        </div>
        <div className="summary-item">
          <span>Remaining:</span>
          <span className={`remaining-amount ${remaining < 0 ? 'negative' : ''}`}>
            ₹{remaining.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </span>
        </div>
      </div>
      
      <div className="budget-breakdown-section">
        <h4 className="spending-overview-title">Spending Overview</h4>
        
        <div className="budget-breakdown">
          {/* SAVINGS & INVESTMENTS */}
          <div className="breakdown-section savings">
            <div 
              className="breakdown-item savings clickable" 
              onClick={() => toggleType('SAVINGS')}
              onKeyPress={(e) => e.key === 'Enter' && toggleType('SAVINGS')}
              role="button"
              tabIndex={0}
              aria-expanded={expandedTypes['SAVINGS']}
            >
              <div className="breakdown-header">
                <span className="breakdown-label">SAVINGS & INVESTMENTS</span>
                <div className="breakdown-amounts">
                  <span className="breakdown-actual">₹{savingsTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  <span className="amount-separator">/</span>
                  <span className="breakdown-planned">₹{savingsBudget.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </div>
              <span className="breakdown-percentage">
                {savingsPercentage}% used
              </span>
              <div className="breakdown-bar">
                <div className="breakdown-fill savings" style={{ width: `${Math.min((savingsTotal / (savingsBudget || 1)) * 100, 100)}%` }}></div>
              </div>
            </div>
            {expandedTypes['SAVINGS'] && (
              <div className="category-breakdown-list">
                {renderCategoryBreakdown(savingsCategories)}
              </div>
            )}
          </div>
          
          {/* NEEDS */}
          <div className="breakdown-section needs">
            <div 
              className="breakdown-item needs clickable" 
              onClick={() => toggleType('NEEDS')}
              onKeyPress={(e) => e.key === 'Enter' && toggleType('NEEDS')}
              role="button"
              tabIndex={0}
              aria-expanded={expandedTypes['NEEDS']}
            >
              <div className="breakdown-header">
                <span className="breakdown-label">NEEDS</span>
                <div className="breakdown-amounts">
                  <span className="breakdown-actual">₹{needsTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  <span className="amount-separator">/</span>
                  <span className="breakdown-planned">₹{needsBudget.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </div>
              <span className="breakdown-percentage">
                {needsPercentage}% used
              </span>
              <div className="breakdown-bar">
                <div className="breakdown-fill needs" style={{ width: `${Math.min((needsTotal / (needsBudget || 1)) * 100, 100)}%` }}></div>
              </div>
            </div>
            {expandedTypes['NEEDS'] && (
              <div className="category-breakdown-list">
                {renderCategoryBreakdown(needsCategories)}
              </div>
            )}
          </div>
          
          {/* WANTS */}
          <div className="breakdown-section wants">
            <div 
              className="breakdown-item wants clickable" 
              onClick={() => toggleType('WANTS')}
              onKeyPress={(e) => e.key === 'Enter' && toggleType('WANTS')}
              role="button"
              tabIndex={0}
              aria-expanded={expandedTypes['WANTS']}
            >
              <div className="breakdown-header">
                <span className="breakdown-label">WANTS</span>
                <div className="breakdown-amounts">
                  <span className="breakdown-actual">₹{wantsTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  <span className="amount-separator">/</span>
                  <span className="breakdown-planned">₹{wantsBudget.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </div>
              <span className="breakdown-percentage">
                {wantsPercentage}% used
              </span>
              <div className="breakdown-bar">
                <div className="breakdown-fill wants" style={{ width: `${Math.min((wantsTotal / (wantsBudget || 1)) * 100, 100)}%` }}></div>
              </div>
            </div>
            {expandedTypes['WANTS'] && (
              <div className="category-breakdown-list">
                {renderCategoryBreakdown(wantsCategories)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanner;
