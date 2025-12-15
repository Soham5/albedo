import React, { createContext, useState, useEffect, useCallback } from 'react';
import { loadFromStorage, saveToStorage } from '../utils/storage';

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children, userMode }) => {
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(5000);
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [subcategoryBudgets, setSubcategoryBudgets] = useState({});

  // Determine storage key based on user mode
  const getStorageKey = useCallback((key) => {
    return userMode === 'guest' ? `guest_${key}` : key;
  }, [userMode]);

  // Load data from storage on mount
  useEffect(() => {
    const loadedExpenses = loadFromStorage(getStorageKey('expenses')) || [];
    const loadedBudget = loadFromStorage(getStorageKey('budget')) || 5000;
    const loadedCategoryBudgets = loadFromStorage(getStorageKey('categoryBudgets')) || {};
    const loadedSubcategoryBudgets = loadFromStorage(getStorageKey('subcategoryBudgets')) || {};
    
    setExpenses(loadedExpenses);
    setBudget(loadedBudget);
    setCategoryBudgets(loadedCategoryBudgets);
    setSubcategoryBudgets(loadedSubcategoryBudgets);
  }, [userMode, getStorageKey]);

  // Save expenses to storage whenever they change (skip initial mount)
  const [isExpensesLoaded, setIsExpensesLoaded] = useState(false);
  useEffect(() => {
    if (!isExpensesLoaded) {
      setIsExpensesLoaded(true);
      return;
    }
    saveToStorage(getStorageKey('expenses'), expenses);
  }, [expenses, isExpensesLoaded, userMode, getStorageKey]);

  // Save budget to storage whenever it changes (skip initial mount)
  const [isBudgetLoaded, setIsBudgetLoaded] = useState(false);
  useEffect(() => {
    if (!isBudgetLoaded) {
      setIsBudgetLoaded(true);
      return;
    }
    saveToStorage(getStorageKey('budget'), budget);
  }, [budget, isBudgetLoaded, userMode, getStorageKey]);

  // Save category budgets to storage whenever they change (skip initial mount)
  const [isCategoryBudgetsLoaded, setIsCategoryBudgetsLoaded] = useState(false);
  useEffect(() => {
    if (!isCategoryBudgetsLoaded) {
      setIsCategoryBudgetsLoaded(true);
      return;
    }
    saveToStorage(getStorageKey('categoryBudgets'), categoryBudgets);
  }, [categoryBudgets, isCategoryBudgetsLoaded, userMode, getStorageKey]);

  // Save subcategory budgets to storage whenever they change (skip initial mount)
  const [isSubcategoryBudgetsLoaded, setIsSubcategoryBudgetsLoaded] = useState(false);
  useEffect(() => {
    if (!isSubcategoryBudgetsLoaded) {
      setIsSubcategoryBudgetsLoaded(true);
      return;
    }
    saveToStorage(getStorageKey('subcategoryBudgets'), subcategoryBudgets);
  }, [subcategoryBudgets, isSubcategoryBudgetsLoaded, userMode, getStorageKey]);

  // Cross-tab sync: Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Only respond to changes from other tabs (e.newValue will be present)
      if (!e.newValue) return;
      
      try {
        if (e.key === 'albedo_expenses') {
          const updatedExpenses = JSON.parse(e.newValue);
          setExpenses(updatedExpenses);
        } else if (e.key === 'albedo_budget') {
          const updatedBudget = JSON.parse(e.newValue);
          setBudget(updatedBudget);
        } else if (e.key === 'albedo_categoryBudgets') {
          const updatedCategoryBudgets = JSON.parse(e.newValue);
          setCategoryBudgets(updatedCategoryBudgets);
        } else if (e.key === 'albedo_subcategoryBudgets') {
          const updatedSubcategoryBudgets = JSON.parse(e.newValue);
          setSubcategoryBudgets(updatedSubcategoryBudgets);
        }
      } catch (error) {
        console.error('Error syncing storage changes:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addExpense = (expense) => {
    setExpenses(prev => [...prev, expense]);
  };

  const updateExpense = (id, updatedExpense) => {
    setExpenses(prev => 
      prev.map(expense => expense.id === id ? { ...expense, ...updatedExpense } : expense)
    );
  };

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const getExpensesByCategory = (category) => {
    return expenses.filter(expense => expense.category === category);
  };

  const getExpensesByDateRange = (startDate, endDate) => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
    });
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getCategorySpending = (category) => {
    return expenses
      .filter(expense => expense.category === category)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getSubcategorySpending = (category, subcategory) => {
    return expenses
      .filter(expense => expense.category === category && expense.subcategory === subcategory)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const updateCategoryBudget = (category, amount) => {
    setCategoryBudgets(prev => ({ ...prev, [category]: amount }));
  };

  const updateSubcategoryBudget = (category, subcategory, amount) => {
    const key = `${category}|${subcategory}`;
    setSubcategoryBudgets(prev => ({ ...prev, [key]: amount }));
  };

  const value = {
    expenses,
    budget,
    categoryBudgets,
    subcategoryBudgets,
    setBudget,
    setCategoryBudgets,
    setSubcategoryBudgets,
    updateCategoryBudget,
    updateSubcategoryBudget,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpensesByCategory,
    getExpensesByDateRange,
    getTotalExpenses,
    getCategorySpending,
    getSubcategorySpending
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};
