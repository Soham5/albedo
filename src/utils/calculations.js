/**
 * Financial Calculations Utility
 * 
 * This module provides common financial calculations used throughout the app.
 */

/**
 * Calculate simple interest
 * @param {number} principal - Principal amount
 * @param {number} rate - Annual interest rate (as percentage)
 * @param {number} time - Time period in years
 * @returns {number} Interest amount
 */
export const calculateSimpleInterest = (principal, rate, time) => {
  return (principal * rate * time) / 100;
};

/**
 * Calculate compound interest
 * @param {number} principal - Principal amount
 * @param {number} rate - Annual interest rate (as percentage)
 * @param {number} time - Time period in years
 * @param {number} frequency - Compounding frequency per year (default: 12 for monthly)
 * @returns {number} Final amount including interest
 */
export const calculateCompoundInterest = (principal, rate, time, frequency = 12) => {
  const rateDecimal = rate / 100;
  return principal * Math.pow(1 + rateDecimal / frequency, frequency * time);
};

/**
 * Calculate Fixed Deposit maturity value
 * @param {number} principal - Principal amount
 * @param {number} rate - Annual interest rate (as percentage)
 * @param {number} years - Time period in years
 * @returns {number} Maturity value
 */
export const calculateFDMaturity = (principal, rate, years) => {
  return calculateCompoundInterest(principal, rate, years, 4); // Quarterly compounding
};

/**
 * Calculate Recurring Deposit maturity value
 * @param {number} monthlyDeposit - Monthly deposit amount
 * @param {number} rate - Annual interest rate (as percentage)
 * @param {number} months - Total number of months
 * @returns {number} Maturity value
 */
export const calculateRDMaturity = (monthlyDeposit, rate, months) => {
  const r = rate / 100 / 12; // Monthly interest rate
  let maturityValue = 0;
  
  for (let i = 1; i <= months; i++) {
    maturityValue += monthlyDeposit * Math.pow(1 + r, months - i + 1);
  }
  
  return maturityValue;
};

/**
 * Calculate EMI (Equated Monthly Installment)
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (as percentage)
 * @param {number} months - Loan tenure in months
 * @returns {number} Monthly EMI amount
 */
export const calculateEMI = (principal, annualRate, months) => {
  const monthlyRate = annualRate / 100 / 12;
  
  if (monthlyRate === 0) {
    return principal / months;
  }
  
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
              (Math.pow(1 + monthlyRate, months) - 1);
  
  return emi;
};

/**
 * Calculate investment returns (ROI)
 * @param {number} initialInvestment - Initial investment amount
 * @param {number} currentValue - Current value
 * @returns {Object} Returns object with absolute and percentage values
 */
export const calculateROI = (initialInvestment, currentValue) => {
  const gain = currentValue - initialInvestment;
  const percentage = (gain / initialInvestment) * 100;
  
  return {
    absoluteGain: gain,
    percentageGain: percentage,
    isProfit: gain >= 0
  };
};

/**
 * Calculate monthly savings needed to reach a goal
 * @param {number} targetAmount - Goal amount
 * @param {number} currentAmount - Current savings
 * @param {number} months - Months to reach goal
 * @param {number} expectedReturn - Expected annual return rate (as percentage)
 * @returns {number} Monthly savings required
 */
export const calculateMonthlySavingsForGoal = (
  targetAmount, 
  currentAmount, 
  months, 
  expectedReturn = 0
) => {
  const remaining = targetAmount - currentAmount;
  
  if (expectedReturn === 0) {
    return remaining / months;
  }
  
  const monthlyRate = expectedReturn / 100 / 12;
  const futureValueOfCurrent = currentAmount * Math.pow(1 + monthlyRate, months);
  const adjustedTarget = targetAmount - futureValueOfCurrent;
  
  // Future value of annuity formula (solving for payment)
  const monthlySavings = adjustedTarget * monthlyRate / 
                        (Math.pow(1 + monthlyRate, months) - 1);
  
  return monthlySavings;
};

/**
 * Calculate portfolio allocation percentages
 * @param {Object[]} assets - Array of assets with amount property
 * @returns {Object[]} Assets with allocation percentages
 */
export const calculatePortfolioAllocation = (assets) => {
  const total = assets.reduce((sum, asset) => sum + asset.amount, 0);
  
  return assets.map(asset => ({
    ...asset,
    allocation: total > 0 ? (asset.amount / total) * 100 : 0
  }));
};

/**
 * Calculate tax on income (basic calculation)
 * @param {number} income - Annual income
 * @param {Object[]} taxSlabs - Array of tax slabs with min, max, and rate
 * @returns {number} Total tax amount
 */
export const calculateIncomeTax = (income, taxSlabs) => {
  let tax = 0;
  
  for (const slab of taxSlabs) {
    if (income > slab.min) {
      const taxableInThisSlab = Math.min(income, slab.max) - slab.min;
      tax += (taxableInThisSlab * slab.rate) / 100;
    }
  }
  
  return tax;
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Calculate net worth
 * @param {number} totalAssets - Total assets value
 * @param {number} totalLiabilities - Total liabilities/debts
 * @returns {number} Net worth
 */
export const calculateNetWorth = (totalAssets, totalLiabilities) => {
  return totalAssets - totalLiabilities;
};

export default {
  calculateSimpleInterest,
  calculateCompoundInterest,
  calculateFDMaturity,
  calculateRDMaturity,
  calculateEMI,
  calculateROI,
  calculateMonthlySavingsForGoal,
  calculatePortfolioAllocation,
  calculateIncomeTax,
  formatCurrency,
  calculateNetWorth
};
