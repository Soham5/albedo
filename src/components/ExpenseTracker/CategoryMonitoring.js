import React, { useContext, useState } from 'react';
import { ExpenseContext } from '../../contexts/ExpenseContext';
import { getAllCategories, getSubcategories, getCategoriesByType } from '../../utils/expenseCategories';
import './CategoryMonitoring.css';

const CategoryMonitoring = () => {
  const { 
    categoryBudgets, 
    subcategoryBudgets,
    updateCategoryBudget,
    updateSubcategoryBudget,
    getCategorySpending,
    getSubcategorySpending
  } = useContext(ExpenseContext);

  const [expandedCategories, setExpandedCategories] = useState({});
  const [editingBudget, setEditingBudget] = useState(null);
  const [tempBudget, setTempBudget] = useState('');

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const startEditing = (type, category, subcategory = null) => {
    setEditingBudget({ type, category, subcategory });
    if (type === 'category') {
      setTempBudget(categoryBudgets[category] || 0);
    } else {
      const key = `${category}|${subcategory}`;
      setTempBudget(subcategoryBudgets[key] || 0);
    }
  };

  const saveEditing = () => {
    const amount = parseFloat(tempBudget) || 0;
    if (editingBudget.type === 'category') {
      updateCategoryBudget(editingBudget.category, amount);
    } else {
      updateSubcategoryBudget(editingBudget.category, editingBudget.subcategory, amount);
    }
    setEditingBudget(null);
    setTempBudget('');
  };

  const cancelEditing = () => {
    setEditingBudget(null);
    setTempBudget('');
  };

  const getPercentage = (spent, budget) => {
    if (budget === 0) return 0;
    return Math.min((spent / budget) * 100, 100);
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 100) return '#e74c3c';
    if (percentage >= 80) return '#f39c12';
    return '#27ae60';
  };

  // Group categories by type
  const savingsCategories = getCategoriesByType('SAVINGS');
  const needsCategories = getCategoriesByType('NEEDS');
  const wantsCategories = getCategoriesByType('WANTS');

  const renderCategoryGroup = (title, categoryList) => (
    <div className="category-group">
      <h4 className="group-title">{title}</h4>
      {categoryList.map(category => {
        const subcategories = getSubcategories(category);
        const categoryBudget = categoryBudgets[category] || 0;
        const categorySpent = getCategorySpending(category);
        const percentage = getPercentage(categorySpent, categoryBudget);
        const isExpanded = expandedCategories[category];
        const hasSubcategories = subcategories.length > 0;

        return (
          <div key={category} className="category-budget-item">
            <div className="category-header" onClick={() => hasSubcategories && toggleCategory(category)}>
              <div className="category-info">
                {hasSubcategories && (
                  <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                )}
                <span className="category-name">{category}</span>
                {categoryBudget > 0 && (
                  <span className="spending-status" style={{ color: getStatusColor(percentage) }}>
                    {percentage.toFixed(0)}% used
                  </span>
                )}
              </div>
              
              <div className="category-amounts">
                <div className="budget-input-container">
                  {editingBudget?.category === category && !editingBudget?.subcategory ? (
                    <div className="inline-edit">
                      <input
                        type="number"
                        value={tempBudget}
                        onChange={(e) => setTempBudget(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && saveEditing()}
                        autoFocus
                        className="budget-input-small"
                      />
                      <button onClick={saveEditing} className="save-btn-small">✓</button>
                      <button onClick={cancelEditing} className="cancel-btn-small">✕</button>
                    </div>
                  ) : (
                    <div className="budget-display" onClick={(e) => { e.stopPropagation(); startEditing('category', category); }}>
                      <span className="budget-label">Budget:</span>
                      <span className="budget-value">₹{categoryBudget.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>
                
                <div className="spent-amount">
                  <span className="spent-label">Spent:</span>
                  <span className="spent-value" style={{ color: categorySpent > categoryBudget ? '#e74c3c' : '#2c3e50' }}>
                    ₹{categorySpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {categoryBudget > 0 && (
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: getStatusColor(percentage)
                  }}
                ></div>
              </div>
            )}

            {isExpanded && hasSubcategories && (
              <div className="subcategories-list">
                {subcategories.map(subcategory => {
                  const subcategoryKey = `${category}|${subcategory}`;
                  const subcategoryBudget = subcategoryBudgets[subcategoryKey] || 0;
                  const subcategorySpent = getSubcategorySpending(category, subcategory);
                  const subPercentage = getPercentage(subcategorySpent, subcategoryBudget);

                  return (
                    <div key={subcategory} className="subcategory-budget-item">
                      <div className="subcategory-info">
                        <span className="subcategory-name">{subcategory}</span>
                        {subcategoryBudget > 0 && (
                          <span className="spending-status" style={{ color: getStatusColor(subPercentage) }}>
                            {subPercentage.toFixed(0)}% used
                          </span>
                        )}
                      </div>

                      <div className="subcategory-amounts">
                        <div className="budget-input-container">
                          {editingBudget?.category === category && editingBudget?.subcategory === subcategory ? (
                            <div className="inline-edit">
                              <input
                                type="number"
                                value={tempBudget}
                                onChange={(e) => setTempBudget(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && saveEditing()}
                                autoFocus
                                className="budget-input-small"
                              />
                              <button onClick={saveEditing} className="save-btn-small">✓</button>
                              <button onClick={cancelEditing} className="cancel-btn-small">✕</button>
                            </div>
                          ) : (
                            <div className="budget-display" onClick={() => startEditing('subcategory', category, subcategory)}>
                              <span className="budget-label">Budget:</span>
                              <span className="budget-value">₹{subcategoryBudget.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          )}
                        </div>

                        <div className="spent-amount">
                          <span className="spent-label">Spent:</span>
                          <span className="spent-value" style={{ color: subcategorySpent > subcategoryBudget ? '#e74c3c' : '#2c3e50' }}>
                            ₹{subcategorySpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {subcategoryBudget > 0 && (
                        <div className="progress-bar subcategory-progress">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${subPercentage}%`,
                              backgroundColor: getStatusColor(subPercentage)
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="category-monitoring">
      <div className="monitoring-header">
        <h3>Category Budget Monitoring</h3>
        <p className="monitoring-description">Track spending vs budget for each category and subcategory</p>
      </div>

      <div className="categories-list">
        {renderCategoryGroup('SAVINGS & INVESTMENTS', savingsCategories)}
        {renderCategoryGroup('NEEDS', needsCategories)}
        {renderCategoryGroup('WANTS', wantsCategories)}
      </div>
    </div>
  );
};

export default CategoryMonitoring;
