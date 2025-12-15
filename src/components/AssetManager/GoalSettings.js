import React, { useState, useContext } from 'react';
import { AssetContext } from '../../contexts/AssetContext';
import './GoalSettings.css';

const GoalSettings = () => {
  const { goals, addGoal, updateGoalProgress, deleteGoal } = useContext(AssetContext);
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    category: '',
    notes: ''
  });

  const goalCategories = [
    'Emergency Fund',
    'Retirement',
    'Vacation',
    'Home Purchase',
    'Education',
    'Car',
    'Debt Freedom',
    'Other'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const goal = {
      id: Date.now(),
      ...newGoal,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount) || 0,
      createdAt: new Date().toISOString()
    };
    
    addGoal(goal);
    setNewGoal({ name: '', targetAmount: '', currentAmount: '', targetDate: '', category: '', notes: '' });
    setShowForm(false);
  };

  const handleProgressUpdate = (goalId, amount) => {
    updateGoalProgress(goalId, parseFloat(amount));
  };

  const calculateProgress = (goal) => {
    return (goal.currentAmount / goal.targetAmount) * 100;
  };

  const calculateDaysRemaining = (targetDate) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="goal-settings">
      <div className="goal-header">
        <h3>Financial Goals</h3>
        <button onClick={() => setShowForm(!showForm)} className="add-goal-button">
          {showForm ? 'Cancel' : '+ Add Goal'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="goal-form">
          <input
            type="text"
            placeholder="Goal Name"
            value={newGoal.name}
            onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
            required
          />
          <select
            value={newGoal.category}
            onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
            required
          >
            <option value="">Select Category</option>
            {goalCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Target Amount"
            value={newGoal.targetAmount}
            onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
            required
            step="0.01"
          />
          <input
            type="number"
            placeholder="Current Amount (optional)"
            value={newGoal.currentAmount}
            onChange={(e) => setNewGoal({...newGoal, currentAmount: e.target.value})}
            step="0.01"
          />
          <input
            type="date"
            placeholder="Target Date"
            value={newGoal.targetDate}
            onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
            required
          />
          <textarea
            placeholder="Notes (optional)"
            value={newGoal.notes}
            onChange={(e) => setNewGoal({...newGoal, notes: e.target.value})}
            rows="2"
          />
          <button type="submit" className="submit-button">Save Goal</button>
        </form>
      )}

      <div className="goal-list">
        {goals.length === 0 ? (
          <div className="empty-state">
            <p>No goals set yet</p>
            <span>Start by setting your first financial goal!</span>
          </div>
        ) : (
          goals.map(goal => {
            const progress = calculateProgress(goal);
            const daysRemaining = calculateDaysRemaining(goal.targetDate);
            const isOverdue = daysRemaining < 0;
            const isComplete = progress >= 100;
            
            return (
              <div 
                key={goal.id} 
                className={`goal-item ${isComplete ? 'complete' : ''} ${isOverdue && !isComplete ? 'overdue' : ''}`}
              >
                <div className="goal-main">
                  <div className="goal-info">
                    <h4>{goal.name}</h4>
                    <span className="goal-category">{goal.category}</span>
                  </div>
                  {isComplete && <span className="complete-badge">🎉 Complete!</span>}
                  {isOverdue && !isComplete && <span className="overdue-badge">⚠️ Overdue</span>}
                </div>
                
                <div className="goal-amounts">
                  <div className="amount-row">
                    <span className="label">Current:</span>
                    <span className="value">₹{goal.currentAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="amount-row">
                    <span className="label">Target:</span>
                    <span className="value target">₹{goal.targetAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="amount-row">
                    <span className="label">Remaining:</span>
                    <span className="value remaining">
                      ₹{Math.max(0, goal.targetAmount - goal.currentAmount).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                  </div>
                </div>

                <div className="goal-progress">
                  <div className="progress-header">
                    <span className="progress-percentage">{progress.toFixed(1)}%</span>
                    <span className="days-remaining">
                      {isOverdue ? 
                        `${Math.abs(daysRemaining)} days overdue` : 
                        `${daysRemaining} days remaining`
                      }
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${isComplete ? 'complete' : ''}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="target-date">
                    Target Date: {formatDate(goal.targetDate)}
                  </div>
                </div>

                <div className="goal-actions">
                  <input
                    type="number"
                    placeholder="Add to goal amount"
                    step="0.01"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const newTotal = goal.currentAmount + parseFloat(e.target.value);
                        handleProgressUpdate(goal.id, newTotal);
                        e.target.value = '';
                      }
                    }}
                  />
                  <span className="hint">Press Enter to add amount</span>
                </div>

                {goal.notes && <div className="goal-notes">{goal.notes}</div>}
                
                <button 
                  className="delete-goal"
                  onClick={() => deleteGoal(goal.id)}
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

export default GoalSettings;
