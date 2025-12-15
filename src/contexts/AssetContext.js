import React, { createContext, useState, useEffect } from 'react';
import { loadFromStorage, saveToStorage } from '../utils/storage';

export const AssetContext = createContext();

export const AssetProvider = ({ children, userMode }) => {
  const [stocks, setStocks] = useState([]);
  const [fixedDeposits, setFixedDeposits] = useState([]);
  const [recurringDeposits, setRecurringDeposits] = useState([]);
  const [debts, setDebts] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [mutualFunds, setMutualFunds] = useState([]);
  const [cryptoAssets, setCryptoAssets] = useState([]);

  // Determine storage key based on user mode
  const getStorageKey = (key) => {
    return userMode === 'guest' ? `guest_${key}` : key;
  };

  // Load data from storage on mount
  useEffect(() => {
    setStocks(loadFromStorage(getStorageKey('stocks')) || []);
    setFixedDeposits(loadFromStorage(getStorageKey('fixedDeposits')) || []);
    setRecurringDeposits(loadFromStorage(getStorageKey('recurringDeposits')) || []);
    setDebts(loadFromStorage(getStorageKey('debts')) || []);
    
    // Initialize with default bank accounts if none exist
    const savedBankAccounts = loadFromStorage(getStorageKey('bankAccounts'));
    if (!savedBankAccounts || savedBankAccounts.length === 0) {
      const defaultBankAccounts = [
        { id: 1, bankName: 'Axis', balance: 39159, accountType: 'Savings', accountNumber: '7531' },
        { id: 2, bankName: 'SBI', balance: 1500, accountType: 'Savings', accountNumber: '0001' },
        { id: 3, bankName: 'HDFC', balance: 52601, accountType: 'Savings', accountNumber: '0002' },
        { id: 4, bankName: 'HSBC', balance: 13281, accountType: 'Savings', accountNumber: '0003' }
      ];
      setBankAccounts(defaultBankAccounts);
      saveToStorage(getStorageKey('bankAccounts'), defaultBankAccounts);
      setIsBanksLoaded(true); // Mark as loaded immediately after setting defaults
    } else {
      setBankAccounts(savedBankAccounts);
    }
    
    setGoals(loadFromStorage(getStorageKey('goals')) || []);
    setMutualFunds(loadFromStorage(getStorageKey('mutualFunds')) || []);
    setCryptoAssets(loadFromStorage(getStorageKey('cryptoAssets')) || []);
  }, [userMode]);

  // Save to storage whenever data changes (skip initial mount)
  const [isStocksLoaded, setIsStocksLoaded] = useState(false);
  useEffect(() => {
    if (!isStocksLoaded) {
      setIsStocksLoaded(true);
      return;
    }
    saveToStorage(getStorageKey('stocks'), stocks);
  }, [stocks, isStocksLoaded, userMode]);

  const [isFDsLoaded, setIsFDsLoaded] = useState(false);
  useEffect(() => {
    if (!isFDsLoaded) {
      setIsFDsLoaded(true);
      return;
    }
    saveToStorage(getStorageKey('fixedDeposits'), fixedDeposits);
  }, [fixedDeposits, isFDsLoaded, userMode]);

  const [isRDsLoaded, setIsRDsLoaded] = useState(false);
  useEffect(() => {
    if (!isRDsLoaded) {
      setIsRDsLoaded(true);
      return;
    }
    saveToStorage(getStorageKey('recurringDeposits'), recurringDeposits);
  }, [recurringDeposits, isRDsLoaded, userMode]);

  const [isDebtsLoaded, setIsDebtsLoaded] = useState(false);
  useEffect(() => {
    if (!isDebtsLoaded) {
      setIsDebtsLoaded(true);
      return;
    }
    saveToStorage(getStorageKey('debts'), debts);
  }, [debts, isDebtsLoaded, userMode]);

  const [isBanksLoaded, setIsBanksLoaded] = useState(false);
  useEffect(() => {
    if (!isBanksLoaded) {
      setIsBanksLoaded(true);
      return;
    }
    saveToStorage(getStorageKey('bankAccounts'), bankAccounts);
  }, [bankAccounts, isBanksLoaded, userMode]);

  const [isGoalsLoaded, setIsGoalsLoaded] = useState(false);
  useEffect(() => {
    if (!isGoalsLoaded) {
      setIsGoalsLoaded(true);
      return;
    }
    saveToStorage(getStorageKey('goals'), goals);
  }, [goals, isGoalsLoaded, userMode]);

  const [isMFsLoaded, setIsMFsLoaded] = useState(false);
  useEffect(() => {
    if (!isMFsLoaded) {
      setIsMFsLoaded(true);
      return;
    }
    saveToStorage(getStorageKey('mutualFunds'), mutualFunds);
  }, [mutualFunds, isMFsLoaded, userMode]);

  const [isCryptoLoaded, setIsCryptoLoaded] = useState(false);
  useEffect(() => {
    if (!isCryptoLoaded) {
      setIsCryptoLoaded(true);
      return;
    }
    saveToStorage(getStorageKey('cryptoAssets'), cryptoAssets);
  }, [cryptoAssets, isCryptoLoaded, userMode]);

  // Cross-tab sync: Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (!e.newValue) return;
      
      try {
        const parsedValue = JSON.parse(e.newValue);
        
        switch (e.key) {
          case 'albedo_stocks':
            setStocks(parsedValue);
            break;
          case 'albedo_fixedDeposits':
            setFixedDeposits(parsedValue);
            break;
          case 'albedo_recurringDeposits':
            setRecurringDeposits(parsedValue);
            break;
          case 'albedo_debts':
            setDebts(parsedValue);
            break;
          case 'albedo_bankAccounts':
            setBankAccounts(parsedValue);
            break;
          case 'albedo_goals':
            setGoals(parsedValue);
            break;
          case 'albedo_mutualFunds':
            setMutualFunds(parsedValue);
            break;
          case 'albedo_cryptoAssets':
            setCryptoAssets(parsedValue);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Error syncing asset storage changes:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Stock methods
  const addStock = (stock) => setStocks(prev => [...prev, stock]);
  const updateStock = (id, updates) => setStocks(prev => 
    prev.map(stock => stock.id === id ? { ...stock, ...updates } : stock)
  );
  const deleteStock = (id) => setStocks(prev => prev.filter(stock => stock.id !== id));

  // Fixed Deposit methods
  const addFixedDeposit = (fd) => setFixedDeposits(prev => [...prev, fd]);
  const updateFixedDeposit = (id, updates) => setFixedDeposits(prev =>
    prev.map(fd => fd.id === id ? { ...fd, ...updates } : fd)
  );
  const deleteFixedDeposit = (id) => setFixedDeposits(prev => prev.filter(fd => fd.id !== id));

  // Recurring Deposit methods
  const addRecurringDeposit = (rd) => setRecurringDeposits(prev => [...prev, rd]);
  const updateRecurringDeposit = (id, updates) => setRecurringDeposits(prev =>
    prev.map(rd => rd.id === id ? { ...rd, ...updates } : rd)
  );
  const deleteRecurringDeposit = (id) => setRecurringDeposits(prev => prev.filter(rd => rd.id !== id));

  // Debt methods
  const addDebt = (debt) => setDebts(prev => [...prev, debt]);
  const repayDebt = (id, payment) => {
    setDebts(prev => prev.map(debt => {
      if (debt.id === id) {
        const newOutstanding = Math.max(0, debt.outstanding - payment.amount);
        return {
          ...debt,
          outstanding: newOutstanding,
          payments: [...(debt.payments || []), payment]
        };
      }
      return debt;
    }));
  };
  const deleteDebt = (id) => setDebts(prev => prev.filter(debt => debt.id !== id));

  // Bank Account methods
  const addBankAccount = (account) => setBankAccounts(prev => [...prev, account]);
  const updateBankAccount = (id, updates) => setBankAccounts(prev =>
    prev.map(account => account.id === id ? { ...account, ...updates } : account)
  );
  const deleteBankAccount = (id) => setBankAccounts(prev => prev.filter(account => account.id !== id));

  // Goal methods
  const addGoal = (goal) => setGoals(prev => [...prev, goal]);
  const updateGoalProgress = (id, newAmount) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, currentAmount: newAmount } : goal
    ));
  };
  const deleteGoal = (id) => setGoals(prev => prev.filter(goal => goal.id !== id));

  // Mutual Fund methods
  const addMutualFund = (fund) => setMutualFunds(prev => [...prev, fund]);
  const updateMutualFund = (id, updates) => setMutualFunds(prev =>
    prev.map(fund => fund.id === id ? { ...fund, ...updates } : fund)
  );
  const deleteMutualFund = (id) => setMutualFunds(prev => prev.filter(fund => fund.id !== id));

  // Crypto methods
  const addCrypto = (crypto) => setCryptoAssets(prev => [...prev, crypto]);
  const updateCrypto = (id, updates) => setCryptoAssets(prev =>
    prev.map(crypto => crypto.id === id ? { ...crypto, ...updates } : crypto)
  );
  const deleteCrypto = (id) => setCryptoAssets(prev => prev.filter(crypto => crypto.id !== id));

  // Calculate total asset value
  const totalAssetValue = 
    stocks.reduce((sum, stock) => sum + (stock.quantity * stock.currentPrice), 0) +
    fixedDeposits.reduce((sum, fd) => sum + fd.principal, 0) +
    recurringDeposits.reduce((sum, rd) => sum + rd.currentAmount || 0, 0) +
    bankAccounts.reduce((sum, account) => sum + account.balance, 0) +
    mutualFunds.reduce((sum, fund) => sum + (fund.units * fund.nav), 0) +
    cryptoAssets.reduce((sum, crypto) => sum + (crypto.quantity * crypto.currentPrice), 0) -
    debts.reduce((sum, debt) => sum + debt.outstanding, 0);

  const value = {
    // State
    stocks,
    fixedDeposits,
    recurringDeposits,
    debts,
    bankAccounts,
    goals,
    mutualFunds,
    cryptoAssets,
    totalAssetValue,
    
    // Stock methods
    addStock,
    updateStock,
    deleteStock,
    
    // FD methods
    addFixedDeposit,
    updateFixedDeposit,
    deleteFixedDeposit,
    
    // RD methods
    addRecurringDeposit,
    updateRecurringDeposit,
    deleteRecurringDeposit,
    
    // Debt methods
    addDebt,
    repayDebt,
    deleteDebt,
    
    // Bank methods
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    
    // Goal methods
    addGoal,
    updateGoalProgress,
    deleteGoal,
    
    // Mutual Fund methods
    addMutualFund,
    updateMutualFund,
    deleteMutualFund,
    
    // Crypto methods
    addCrypto,
    updateCrypto,
    deleteCrypto
  };

  return (
    <AssetContext.Provider value={value}>
      {children}
    </AssetContext.Provider>
  );
};
