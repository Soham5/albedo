import React, { useContext, useState } from 'react';
import { ExpenseContext } from '../../contexts/ExpenseContext';
import { BUDGET_ALLOCATION, calculateBudgetAllocation, getCategoriesByType, getSubcategories } from '../../utils/expenseCategories';
import './BudgetManager.css';

const BudgetManager = () => {
  const { 
    budget, 
    setBudget,
    categoryBudgets,
    subcategoryBudgets,
    updateCategoryBudget,
    updateSubcategoryBudget
  } = useContext(ExpenseContext);
  
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget);
  const [expandedTypes, setExpandedTypes] = useState({});
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [tempAmount, setTempAmount] = useState('');

  const handleSaveBudget = () => {
    setBudget(parseFloat(tempBudget) || 0);
    setIsEditingBudget(false);
  };

  const handleCancelBudget = () => {
    setTempBudget(budget);
    setIsEditingBudget(false);
  };

  const toggleType = (type) => {
    setExpandedTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const startEditingCategory = (category) => {
    setEditingCategory(category);
    setTempAmount(categoryBudgets[category] || 0);
  };

  const startEditingSubcategory = (category, subcategory) => {
    setEditingSubcategory({ category, subcategory });
    const key = `${category}|${subcategory}`;
    setTempAmount(subcategoryBudgets[key] || 0);
  };

  const saveEditing = () => {
    const amount = parseFloat(tempAmount) || 0;
    if (editingCategory) {
      updateCategoryBudget(editingCategory, amount);
      setEditingCategory(null);
    } else if (editingSubcategory) {
      updateSubcategoryBudget(editingSubcategory.category, editingSubcategory.subcategory, amount);
      setEditingSubcategory(null);
    }
    setTempAmount('');
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditingSubcategory(null);
    setTempAmount('');
  };

  // Calculate 50/30/20 allocation
  const allocation = calculateBudgetAllocation(budget);
  
  // Get categories by type
  const savingsCategories = getCategoriesByType('SAVINGS');
  const needsCategories = getCategoriesByType('NEEDS');
  const wantsCategories = getCategoriesByType('WANTS');

  // Calculate actual totals
  const calculateTypeTotal = (categories) => {
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

  const savingsTotal = calculateTypeTotal(savingsCategories);
  const needsTotal = calculateTypeTotal(needsCategories);
  const wantsTotal = calculateTypeTotal(wantsCategories);

  const renderCategoryList = (categories) => {
    return categories.map(category => {
      const subcategories = getSubcategories(category);
      const categoryBudget = categoryBudgets[category] || 0;
      const hasSubcategories = subcategories.length > 0;
      
      // Calculate total from subcategories
      const subcategoryTotal = subcategories.reduce((sum, subcategory) => {
        const key = `${category}|${subcategory}`;
        return sum + (subcategoryBudgets[key] || 0);
      }, 0);

      // Use subcategory total if it exists and is greater than category budget
      const displayTotal = hasSubcategories && subcategoryTotal > 0 ? subcategoryTotal : categoryBudget;

      return (
        <div key={category} className="category-item">
          <div className="category-row">
            <div className="category-name-section">
              <span className="category-name">{category}</span>
              {hasSubcategories && subcategoryTotal > 0 && (
                <span className="subcategory-total-hint">
                  (Sum of subcategories)
                </span>
              )}
            </div>
            <div className="category-budget-section">
              {editingCategory === category ? (
                <div className="inline-edit">
                  <input
                    type="number"
                    value={tempAmount}
                    onChange={(e) => setTempAmount(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && saveEditing()}
                    autoFocus
                    className="budget-input-inline"
                  />
                  <button onClick={saveEditing} className="save-btn-inline">✓</button>
                  <button onClick={cancelEditing} className="cancel-btn-inline">✕</button>
                </div>
              ) : (
                <div className="budget-display-inline" onClick={() => startEditingCategory(category)}>
                  ₹{displayTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              )}
            </div>
          </div>

          {hasSubcategories && (
            <div className="subcategories-container">
              {subcategories.map(subcategory => {
                const key = `${category}|${subcategory}`;
                const subcategoryBudget = subcategoryBudgets[key] || 0;
                const isEditing = editingSubcategory?.category === category && editingSubcategory?.subcategory === subcategory;

                return (
                  <div key={subcategory} className="subcategory-row">
                    <span className="subcategory-name">→ {subcategory}</span>
                    {isEditing ? (
                      <div className="inline-edit">
                        <input
                          type="number"
                          value={tempAmount}
                          onChange={(e) => setTempAmount(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveEditing()}
                          autoFocus
                          className="budget-input-inline"
                        />
                        <button onClick={saveEditing} className="save-btn-inline">✓</button>
                        <button onClick={cancelEditing} className="cancel-btn-inline">✕</button>
                      </div>
                    ) : (
                      <div className="budget-display-inline" onClick={() => startEditingSubcategory(category, subcategory)}>
                        ₹{subcategoryBudget.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    )}
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
    <div className="budget-manager">
      <div className="budget-header">
        <h3>Monthly Budget Planning</h3>
        <p className="budget-description">Set your monthly budget and allocate to categories</p>
      </div>

      <div className="monthly-budget-section">
        <div className="budget-amount-card">
          <h4>Monthly Budget Amount</h4>
          {isEditingBudget ? (
            <div className="budget-edit-container">
              <input
                type="number"
                value={tempBudget}
                onChange={(e) => setTempBudget(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveBudget()}
                autoFocus
                className="budget-input-large"
                placeholder="Enter monthly budget"
              />
              <div className="edit-actions">
                <button onClick={handleSaveBudget} className="save-btn">Save</button>
                <button onClick={handleCancelBudget} className="cancel-btn">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="budget-display-large" onClick={() => setIsEditingBudget(true)}>
              <span className="currency">₹</span>
              <span className="amount">{budget.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <button className="edit-icon-btn">✎</button>
            </div>
          )}
        </div>

        <div className="master-categories">
          {/* SAVINGS & INVESTMENTS */}
          <div className="master-category savings-category">
            <div 
              className="master-category-header" 
              onClick={() => toggleType('SAVINGS')}
            >
              <div className="master-category-info">
                <span className="expand-icon">{expandedTypes['SAVINGS'] ? '▼' : '▶'}</span>
                <div>
                  <h4>SAVINGS & INVESTMENTS</h4>
                  <span className="recommended-label">Recommended: ₹{allocation.SAVINGS.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({BUDGET_ALLOCATION.SAVINGS}%)</span>
                </div>
              </div>
              <div className="master-category-total">
                <div className="actual-total">
                  <span className="total-label">Allocated:</span>
                  <span className="total-amount">₹{savingsTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {savingsTotal !== allocation.SAVINGS && (
                  <span className={`difference ${savingsTotal > allocation.SAVINGS ? 'over' : 'under'}`}>
                    {savingsTotal > allocation.SAVINGS ? '+' : ''}
                    ₹{Math.abs(savingsTotal - allocation.SAVINGS).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            </div>
            {expandedTypes['SAVINGS'] && (
              <div className="categories-list">
                {renderCategoryList(savingsCategories)}
              </div>
            )}
          </div>

          {/* NEEDS */}
          <div className="master-category needs-category">
            <div 
              className="master-category-header" 
              onClick={() => toggleType('NEEDS')}
            >
              <div className="master-category-info">
                <span className="expand-icon">{expandedTypes['NEEDS'] ? '▼' : '▶'}</span>
                <div>
                  <h4>NEEDS</h4>
                  <span className="recommended-label">Recommended: ₹{allocation.NEEDS.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({BUDGET_ALLOCATION.NEEDS}%)</span>
                </div>
              </div>
              <div className="master-category-total">
                <div className="actual-total">
                  <span className="total-label">Allocated:</span>
                  <span className="total-amount">₹{needsTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {needsTotal !== allocation.NEEDS && (
                  <span className={`difference ${needsTotal > allocation.NEEDS ? 'over' : 'under'}`}>
                    {needsTotal > allocation.NEEDS ? '+' : ''}
                    ₹{Math.abs(needsTotal - allocation.NEEDS).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            </div>
            {expandedTypes['NEEDS'] && (
              <div className="categories-list">
                {renderCategoryList(needsCategories)}
              </div>
            )}
          </div>

          {/* WANTS */}
          <div className="master-category wants-category">
            <div 
              className="master-category-header" 
              onClick={() => toggleType('WANTS')}
            >
              <div className="master-category-info">
                <span className="expand-icon">{expandedTypes['WANTS'] ? '▼' : '▶'}</span>
                <div>
                  <h4>WANTS</h4>
                  <span className="recommended-label">Recommended: ₹{allocation.WANTS.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({BUDGET_ALLOCATION.WANTS}%)</span>
                </div>
              </div>
              <div className="master-category-total">
                <div className="actual-total">
                  <span className="total-label">Allocated:</span>
                  <span className="total-amount">₹{wantsTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {wantsTotal !== allocation.WANTS && (
                  <span className={`difference ${wantsTotal > allocation.WANTS ? 'over' : 'under'}`}>
                    {wantsTotal > allocation.WANTS ? '+' : ''}
                    ₹{Math.abs(wantsTotal - allocation.WANTS).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            </div>
            {expandedTypes['WANTS'] && (
              <div className="categories-list">
                {renderCategoryList(wantsCategories)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetManager;
