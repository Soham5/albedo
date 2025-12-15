// Expense Categories Configuration (50/30/20 Budget Rule)

export const EXPENSE_CATEGORIES = {
  // SAVINGS & INVESTMENTS (30%)
  INVESTMENTS: {
    name: 'INVESTMENTS',
    type: 'SAVINGS',
    subcategories: ['IND Stocks', 'US Stocks', 'SIPs']
  },
  ASSETS_MF: {
    name: 'Assets(MF)',
    type: 'SAVINGS',
    subcategories: []
  },
  SAVINGS: {
    name: 'SAVINGS',
    type: 'SAVINGS',
    subcategories: ['RD(Axis)', 'RD(SBI)', 'RD(PO)']
  },
  EMERGENCY_FUND: {
    name: 'Emergency Fund',
    type: 'SAVINGS',
    subcategories: []
  },
  RETIREMENT: {
    name: 'Retirement',
    type: 'SAVINGS',
    subcategories: ['PPF', 'LIC(15 yrs)', 'LIC(X yrs)']
  },

  // NEEDS (50%)
  UTILITIES: {
    name: 'UTILITIES',
    type: 'NEEDS',
    subcategories: ['Electric Bill', 'Broadband Recharge', 'Gym Membership', 'Fuel', 'Mobile Recharge', 'Water Bill', 'Subscriptions']
  },
  RENT: {
    name: 'RENT',
    type: 'NEEDS',
    subcategories: []
  },
  GROCERIES: {
    name: 'GROCERIES',
    type: 'NEEDS',
    subcategories: []
  },
  DEBTS: {
    name: 'DEBTS',
    type: 'NEEDS',
    subcategories: ['Axis Loan', 'HDFC Loan']
  },
  BABA_HATKORCHA: {
    name: 'BABA HATKORCHA',
    type: 'NEEDS',
    subcategories: []
  },
  BOTA_HATKORCHA: {
    name: 'BOTA HATKORCHA',
    type: 'NEEDS',
    subcategories: []
  },
  MISCELLANEOUS: {
    name: 'MISCELLANEOUS',
    type: 'NEEDS',
    subcategories: []
  },
  HIGHER_EDUCATION: {
    name: 'HIGHER EDUCATION',
    type: 'NEEDS',
    subcategories: []
  },
  HOME_TOUR: {
    name: 'HOME TOUR',
    type: 'NEEDS',
    subcategories: []
  },
  REFRESHMENTS: {
    name: 'REFRESHMENTS',
    type: 'NEEDS',
    subcategories: []
  },

  // WANTS (20%)
  VACATIONS: {
    name: 'VACATIONS',
    type: 'WANTS',
    subcategories: []
  },
  RESTAURANTS: {
    name: 'RESTRAUNTS/CAFES/OUTINGS',
    type: 'WANTS',
    subcategories: []
  },
  GIFTS_SHOPPING: {
    name: 'GIFTS/SHOPPING',
    type: 'WANTS',
    subcategories: []
  },
  ONLINE_FOOD: {
    name: 'ONLINE FOOD',
    type: 'WANTS',
    subcategories: []
  },
  MAA_HATKORCHA: {
    name: "MAA'S HATKORCHA",
    type: 'WANTS',
    subcategories: []
  }
};

// Budget allocation percentages (50/30/20 rule)
export const BUDGET_ALLOCATION = {
  SAVINGS: 30, // 30%
  NEEDS: 50,   // 50%
  WANTS: 20    // 20%
};

// Bank account mapping for categories/subcategories
// Based on color coding: Orange=Axis, Blue=SBI, Green=HDFC, Yellow=HSBC
export const BANK_ACCOUNT_MAPPING = {
  // SAVINGS & INVESTMENTS
  'IND Stocks': 'HDFC',
  'US Stocks': 'HDFC',
  'SIPs': 'Axis',
  'Assets(MF)': 'HDFC',
  'RD(Axis)': 'Axis',
  'RD(SBI)': 'SBI',
  'RD(PO)': 'Axis',
  'Emergency Fund': 'Axis',
  'PPF': 'Axis',
  'LIC(15 yrs)': 'SBI',
  'LIC(X yrs)': 'SBI',
  
  // NEEDS - Utilities subcategories
  'Electric Bill': 'Axis',
  'Broadband Recharge': 'Axis',
  'Gym Membership': 'Axis',
  'Fuel': 'Axis',
  'Mobile Recharge': 'Axis',
  'Water Bill': 'Axis',
  'Subscriptions': 'Axis',
  
  // NEEDS - Debts subcategories
  'Axis Loan': 'Axis',
  'HDFC Loan': 'HDFC',
  
  // NEEDS - Full categories
  'RENT': 'Axis',
  'GROCERIES': 'HDFC',
  'BABA HATKORCHA': 'SBI',
  'BOTA HATKORCHA': 'SBI',
  'MISCELLANEOUS': 'HSBC',
  'HIGHER EDUCATION': 'SBI',
  'HOME TOUR': 'HDFC',
  'REFRESHMENTS': 'Axis',
  
  // WANTS
  'VACATIONS': 'HDFC',
  'RESTRAUNTS/CAFES/OUTINGS': 'HDFC',
  'GIFTS/SHOPPING': 'HDFC',
  'ONLINE FOOD': 'HDFC',
  "MAA'S HATKORCHA": 'SBI'
};

// Get bank account for a category/subcategory
export const getBankAccount = (category, subcategory = null) => {
  // First check if subcategory has a specific bank mapping
  if (subcategory && BANK_ACCOUNT_MAPPING[subcategory]) {
    return BANK_ACCOUNT_MAPPING[subcategory];
  }
  // Then check if category has a bank mapping
  if (BANK_ACCOUNT_MAPPING.hasOwnProperty(category)) {
    return BANK_ACCOUNT_MAPPING[category] || ''; // Return empty string for null (generic)
  }
  // Default to empty for unmapped categories (let user choose)
  return '';
};

// Get all categories as flat array
export const getAllCategories = () => {
  return Object.values(EXPENSE_CATEGORIES).map(cat => cat.name);
};

// Get categories by type
export const getCategoriesByType = (type) => {
  return Object.values(EXPENSE_CATEGORIES)
    .filter(cat => cat.type === type)
    .map(cat => cat.name);
};

// Get subcategories for a category
export const getSubcategories = (categoryName) => {
  const category = Object.values(EXPENSE_CATEGORIES).find(cat => cat.name === categoryName);
  return category ? category.subcategories : [];
};

// Get budget for a category
export const getCategoryBudget = (categoryName) => {
  const category = Object.values(EXPENSE_CATEGORIES).find(cat => cat.name === categoryName);
  return category ? category.budget : 0;
};

// Calculate budget allocation based on total budget and percentages
export const calculateBudgetAllocation = (totalBudget) => {
  return {
    SAVINGS: (totalBudget * BUDGET_ALLOCATION.SAVINGS) / 100,
    NEEDS: (totalBudget * BUDGET_ALLOCATION.NEEDS) / 100,
    WANTS: (totalBudget * BUDGET_ALLOCATION.WANTS) / 100
  };
};

// Calculate total budgets by type
export const BUDGET_SUMMARY = {
  NEEDS: Object.values(EXPENSE_CATEGORIES)
    .filter(cat => cat.type === 'NEEDS')
    .reduce((sum, cat) => sum + cat.budget, 0),
  WANTS: Object.values(EXPENSE_CATEGORIES)
    .filter(cat => cat.type === 'WANTS')
    .reduce((sum, cat) => sum + cat.budget, 0),
  TOTAL: Object.values(EXPENSE_CATEGORIES)
    .reduce((sum, cat) => sum + cat.budget, 0)
};

// Category colors for visualization
export const CATEGORY_COLORS = {
  // SAVINGS & INVESTMENTS - Green shades
  'INVESTMENTS': '#27ae60',
  'Assets(MF)': '#2ecc71',
  'SAVINGS': '#58d68d',
  'Emergency Fund': '#52be80',
  'Retirement': '#229954',
  
  // NEEDS - Blue shades
  'UTILITIES': '#3498db',
  'RENT': '#2980b9',
  'GROCERIES': '#5dade2',
  'DEBTS': '#1f618d',
  'BABA HATKORCHA': '#2e86c1',
  'BOTA HATKORCHA': '#3498db',
  'MISCELLANEOUS': '#5499c7',
  'HIGHER EDUCATION': '#2874a6',
  'HOME TOUR': '#5dade2',
  'REFRESHMENTS': '#85c1e9',
  
  // WANTS - Pink/Purple shades
  'VACATIONS': '#e74c3c',
  'RESTRAUNTS/CAFES/OUTINGS': '#ec7063',
  'GIFTS/SHOPPING': '#f1948a',
  'ONLINE FOOD': '#f5b7b1',
  "MAA'S HATKORCHA": '#fadbd8'
};
