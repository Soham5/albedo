# Albedo - Complete Setup & Development Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Component Architecture](#component-architecture)
3. [State Management](#state-management)
4. [API Integration Guide](#api-integration-guide)
5. [Customization](#customization)
6. [Development Tips](#development-tips)

## 🚀 Quick Start

### Installation & Running

```bash
# Navigate to project
cd c:\Projects\albedo

# Install dependencies (if not done)
npm install

# Start development server
npm start
```

App will run on: http://localhost:3000

### Build for Production
```bash
npm run build
```

## 🏗️ Component Architecture

### Layout Components
Located in `src/components/Layout/`

- **Navbar.js**: Top navigation with logo and menu
- **Footer.js**: Bottom persistent navigation bar (mobile-friendly)

### Dashboard Components
Located in `src/components/Dashboard/`

- **AccountSummary.js**: Displays current balance, expense overview, and asset summary
- **QuickActions.js**: Action buttons for adding transactions, assets, and viewing reports

### Expense Tracker Components
Located in `src/components/ExpenseTracker/`

- **BudgetPlanner.js**: Set and edit monthly budget
- **MonthlyTracker.js**: Track expenses for selected month with progress bar
- **AddExpenseModal.js**: Modal form to add new expenses
- **ExpenseList.js**: List of transactions with category icons and colors
- **ExpenseCategoryChart.js**: Visual breakdown of expenses by category

### Asset Manager Components
Located in `src/components/AssetManager/`

- **StockTracker.js**: Portfolio of stocks with gain/loss calculations
- **FDManager.js**: Fixed deposit management with maturity calculations
- **RDManager.js**: Recurring deposit tracking with progress
- **DebtManager.js**: Debt monitoring with repayment tracking
- **BankManager.js**: Bank account management with balance updates
- **GoalSettings.js**: Financial goal setting and progress tracking

### Shared Components
Located in `src/components/Shared/`

- **Modal.js**: Reusable modal dialog
- **DatePicker.js**: Date input component
- **InputField.js**: Form input with label and validation

## 🔄 State Management

### ExpenseContext
Located in `src/contexts/ExpenseContext.js`

**State:**
- `expenses`: Array of expense objects
- `budget`: Monthly budget amount
- `categoryBudgets`: Budget by category

**Methods:**
```javascript
addExpense(expense)          // Add new expense
updateExpense(id, data)      // Update existing expense
deleteExpense(id)            // Remove expense
getExpensesByCategory(cat)   // Filter by category
getExpensesByDateRange()     // Filter by date
getTotalExpenses()           // Sum all expenses
```

**Usage Example:**
```javascript
import { useContext } from 'react';
import { ExpenseContext } from './contexts/ExpenseContext';

function MyComponent() {
  const { expenses, addExpense, budget } = useContext(ExpenseContext);
  
  const handleAdd = () => {
    addExpense({
      id: Date.now(),
      amount: 50,
      category: 'Food & Dining',
      date: new Date().toISOString(),
      notes: 'Lunch'
    });
  };
}
```

### AssetContext
Located in `src/contexts/AssetContext.js`

**State:**
- `stocks`: Array of stock holdings
- `fixedDeposits`: Array of FDs
- `recurringDeposits`: Array of RDs
- `debts`: Array of debts
- `bankAccounts`: Array of bank accounts
- `goals`: Array of financial goals
- `totalAssetValue`: Calculated total assets

**Methods:**
```javascript
// Stock methods
addStock(stock)
updateStock(id, updates)
deleteStock(id)

// FD methods
addFixedDeposit(fd)
updateFixedDeposit(id, updates)
deleteFixedDeposit(id)

// RD methods
addRecurringDeposit(rd)
updateRecurringDeposit(id, updates)
deleteRecurringDeposit(id)

// Debt methods
addDebt(debt)
repayDebt(id, payment)
deleteDebt(id)

// Bank methods
addBankAccount(account)
updateBankAccount(id, updates)
deleteBankAccount(id)

// Goal methods
addGoal(goal)
updateGoalProgress(id, newAmount)
deleteGoal(id)
```

## 🔌 API Integration Guide

### Stock Price API

Currently using mock data. To integrate real API:

#### Option 1: Alpha Vantage (Recommended)

1. Get free API key from https://www.alphavantage.co/
2. Update `src/services/stockApi.js`:

```javascript
const ALPHA_VANTAGE_API_KEY = 'YOUR_API_KEY';

export const getStockPrice = async (symbol) => {
  const response = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
  );
  const data = await response.json();
  return parseFloat(data['Global Quote']['05. price']);
};
```

#### Option 2: Yahoo Finance (via RapidAPI)

```javascript
export const getStockPrice = async (symbol) => {
  const response = await fetch(
    `https://yahoo-finance15.p.rapidapi.com/api/yahoo/qu/quote/${symbol}`,
    {
      headers: {
        'X-RapidAPI-Key': 'YOUR_API_KEY',
        'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
      }
    }
  );
  const data = await response.json();
  return data.price;
};
```

### Auto-refresh Stock Prices

Add to StockTracker.js:

```javascript
useEffect(() => {
  const interval = setInterval(() => {
    // Refresh stock prices
    stocks.forEach(async (stock) => {
      const newPrice = await getStockPrice(stock.symbol);
      updateStock(stock.id, { currentPrice: newPrice });
    });
  }, 60000); // Every 60 seconds

  return () => clearInterval(interval);
}, [stocks]);
```

## 📊 Adding Charts

### Install Chart Library

```bash
npm install recharts
# or
npm install chart.js react-chartjs-2
```

### Example: Pie Chart for Expenses

```javascript
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const ExpensePieChart = ({ expenses }) => {
  const data = expenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.name === expense.category);
    if (existing) {
      existing.value += expense.amount;
    } else {
      acc.push({ name: expense.category, value: expense.amount });
    }
    return acc;
  }, []);

  const COLORS = ['#e74c3c', '#3498db', '#9b59b6', '#e67e22'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};
```

## 🎨 Customization

### Theme Colors

Edit color variables in component CSS files:

```css
/* Primary color */
.button-primary {
  background-color: #3498db; /* Change to your brand color */
}

/* Success color */
.status-success {
  color: #2ecc71;
}
```

### Adding New Expense Categories

In `src/components/ExpenseTracker/AddExpenseModal.js`:

```javascript
const categories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Your New Category', // Add here
  'Other'
];
```

Update icons in `src/components/ExpenseTracker/ExpenseList.js`:

```javascript
const categoryIcons = {
  'Your New Category': '🎯', // Add icon
  // ... other categories
};
```

### Custom Calculations

Add to `src/utils/calculations.js`:

```javascript
export const myCustomCalculation = (param1, param2) => {
  // Your calculation logic
  return result;
};
```

## 💾 Data Management

### Export Data

```javascript
import { downloadDataAsJSON } from './utils/storage';

// In your component
<button onClick={downloadDataAsJSON}>Export Data</button>
```

### Import Data

```javascript
import { uploadDataFromJSON } from './utils/storage';

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  uploadDataFromJSON(file)
    .then(() => alert('Data imported successfully!'))
    .catch(() => alert('Error importing data'));
};

<input type="file" accept=".json" onChange={handleFileUpload} />
```

### Clear All Data

```javascript
import { clearAllStorage } from './utils/storage';

<button onClick={() => {
  if (confirm('Clear all data?')) {
    clearAllStorage();
    window.location.reload();
  }
}}>Reset App</button>
```

## 🔐 Security Enhancements

### Encrypt localStorage Data

Install crypto library:
```bash
npm install crypto-js
```

Update `src/utils/storage.js`:

```javascript
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'your-secret-key'; // Should be from env variable

export const saveToStorage = (key, data) => {
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(data), 
    SECRET_KEY
  ).toString();
  localStorage.setItem(STORAGE_PREFIX + key, encrypted);
};

export const loadFromStorage = (key) => {
  const encrypted = localStorage.getItem(STORAGE_PREFIX + key);
  if (!encrypted) return null;
  
  const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
};
```

## 🚀 Deployment

### Deploy to Netlify

```bash
npm run build
# Upload 'build' folder to Netlify
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to GitHub Pages

```bash
npm install gh-pages
```

Add to package.json:
```json
{
  "homepage": "https://yourusername.github.io/albedo",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

Then run:
```bash
npm run deploy
```

## 📱 Progressive Web App (PWA)

The app is already PWA-ready with Create React App. To customize:

1. Edit `public/manifest.json` for app name, icons, colors
2. Customize service worker in `src/service-worker.js`
3. Add install prompt in your app

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

Example test for ExpenseContext:

```javascript
import { renderHook, act } from '@testing-library/react-hooks';
import { ExpenseProvider, ExpenseContext } from './ExpenseContext';

test('should add expense', () => {
  const wrapper = ({ children }) => <ExpenseProvider>{children}</ExpenseProvider>;
  const { result } = renderHook(() => useContext(ExpenseContext), { wrapper });

  act(() => {
    result.current.addExpense({
      id: 1,
      amount: 100,
      category: 'Food',
      date: new Date().toISOString()
    });
  });

  expect(result.current.expenses).toHaveLength(1);
});
```

## 🐛 Troubleshooting

### Router not working
- Ensure `react-router-dom` is installed
- Check that `BrowserRouter` wraps the app in App.js

### Context not available
- Verify providers wrap components in App.js
- Check useContext is called inside provider

### Styles not applying
- Import CSS files in components
- Check CSS class names match

### Data not persisting
- Check localStorage is enabled in browser
- Verify storage.js functions are called correctly

## 📚 Additional Resources

- React Docs: https://react.dev
- React Router: https://reactrouter.com
- Chart.js: https://www.chartjs.org
- Recharts: https://recharts.org
- Alpha Vantage API: https://www.alphavantage.co/documentation

## 🎯 Next Steps

1. ✅ Install and run the app
2. ✅ Explore all components and features
3. 🔲 Integrate real stock API
4. 🔲 Add chart library for visualizations
5. 🔲 Implement data encryption
6. 🔲 Add user authentication
7. 🔲 Deploy to production

---

**Happy coding! 🚀**
