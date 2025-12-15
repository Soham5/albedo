# Real-Time Features Documentation

## Overview

Albedo implements "real-time-ish" updates for a pure static hosting environment (GitHub Pages) without any backend server. This is achieved through:

1. **Client-side polling** for external data (stock prices)
2. **Cross-tab synchronization** for local data (expenses, assets)
3. **Visual feedback** for updates

## Real-Time Features

### 1. Stock Price Auto-Refresh ✅

**Location**: `src/components/AssetManager/StockTracker.js`

The stock tracker automatically fetches updated prices at configurable intervals.

#### Features:
- **Auto-refresh toggle**: Enable/disable automatic updates
- **Configurable intervals**: 30s, 1m, 5m, or 10m
- **Manual refresh**: Force immediate update
- **Last updated indicator**: Shows time since last update
- **Loading state**: Visual feedback during refresh

#### How it works:

```javascript
useEffect(() => {
  if (!autoRefresh || stocks.length === 0) return;

  const fetchStockPrices = async () => {
    for (const stock of stocks) {
      const newPrice = await getStockPrice(stock.symbol);
      updateStock(stock.id, { 
        currentPrice: newPrice,
        lastUpdated: new Date().toISOString()
      });
    }
    setLastUpdated(new Date());
  };

  fetchStockPrices(); // Initial fetch
  const interval = setInterval(fetchStockPrices, refreshInterval * 1000);

  return () => clearInterval(interval); // Cleanup
}, [stocks.length, autoRefresh, refreshInterval]);
```

#### Best Practices:
- Default interval: 60 seconds
- Respects API rate limits
- Cleans up intervals on unmount
- Only fetches when stocks exist

### 2. Cross-Tab Synchronization ✅

**Locations**: 
- `src/contexts/ExpenseContext.js`
- `src/contexts/AssetContext.js`

Data updates in one tab instantly sync to all other open tabs of the same app.

#### How it works:

The browser's `storage` event fires when localStorage is modified by another tab:

```javascript
useEffect(() => {
  const handleStorageChange = (e) => {
    if (!e.newValue || !e.key?.startsWith('albedo_')) return;
    
    // Parse and update state based on which key changed
    const parsedValue = JSON.parse(e.newValue);
    
    switch (e.key) {
      case 'albedo_expenses':
        setExpenses(parsedValue);
        break;
      case 'albedo_stocks':
        setStocks(parsedValue);
        break;
      // ... other cases
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

#### What syncs:
- ✅ Expenses
- ✅ Budget changes
- ✅ Stocks, FDs, RDs
- ✅ Debts and repayments
- ✅ Bank accounts
- ✅ Financial goals

#### Limitations:
- Only works across tabs on the **same device**
- Does **not** sync across different devices
- Requires **same browser** (different browsers don't share localStorage)

### 3. Sync Indicator ✅

**Location**: `src/components/Shared/SyncIndicator.js`

Visual toast notification when data syncs from another tab.

#### Features:
- Auto-dismisses after 3 seconds
- Shows which data type was synced
- Animated slide-in and rotating icon
- Responsive positioning

## Update Mechanisms Summary

| Data Type | Update Method | Frequency | Multi-Tab | Multi-Device |
|-----------|--------------|-----------|-----------|--------------|
| Expenses | Immediate | Instant | ✅ Yes | ❌ No |
| Assets (FD/RD/Debt) | Immediate | Instant | ✅ Yes | ❌ No |
| Stock Prices | Polling | 30s-10m | ✅ Yes | ❌ No |
| Bank Balances | Manual | On demand | ✅ Yes | ❌ No |
| Goals | Immediate | Instant | ✅ Yes | ❌ No |

## Usage Examples

### Customize Auto-Refresh Interval

Default intervals are defined in `StockTracker.js`:

```javascript
<select value={refreshInterval} onChange={...}>
  <option value={30}>30s</option>
  <option value={60}>1m</option>
  <option value={300}>5m</option>
  <option value={600}>10m</option>
  <option value={1800}>30m</option> {/* Add custom interval */}
</select>
```

### Disable Auto-Refresh

Users can toggle auto-refresh on/off in the Stock Tracker UI. This is useful for:
- Conserving API calls
- Reducing battery usage on mobile
- Preventing rate limiting

### Test Cross-Tab Sync

1. Open app in two browser tabs
2. In Tab 1: Add an expense
3. In Tab 2: See the expense appear with sync indicator
4. Works for any data modification

## API Integration Notes

### Current Implementation (Mock Data)

`src/services/stockApi.js` uses mock data:

```javascript
const MOCK_STOCK_PRICES = {
  'AAPL': 178.50,
  'GOOGL': 142.30,
  // ...
};
```

### Switching to Real API

#### Option 1: Alpha Vantage (Free Tier)

```javascript
const ALPHA_VANTAGE_API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_KEY;

export const getStockPrice = async (symbol) => {
  const response = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
  );
  const data = await response.json();
  return parseFloat(data['Global Quote']['05. price']);
};
```

**Rate Limits**: 5 API calls/minute, 500 calls/day (free tier)

**Recommended Interval**: 
- Minimum 60 seconds
- Calculate: (number of stocks × 60s) for safe polling

#### Option 2: Yahoo Finance (via RapidAPI)

```javascript
export const getStockPrice = async (symbol) => {
  const response = await fetch(
    `https://yahoo-finance15.p.rapidapi.com/api/yahoo/qu/quote/${symbol}`,
    {
      headers: {
        'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
      }
    }
  );
  const data = await response.json();
  return data.price;
};
```

### Rate Limit Handling

Add rate limit protection:

```javascript
const RATE_LIMIT_DELAY = 12000; // 12s between calls (5/min = 12s apart)

const fetchStockPrices = async () => {
  setIsRefreshing(true);
  
  for (let i = 0; i < stocks.length; i++) {
    const stock = stocks[i];
    
    try {
      const newPrice = await getStockPrice(stock.symbol);
      updateStock(stock.id, { currentPrice: newPrice });
      
      // Wait between API calls to respect rate limits
      if (i < stocks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
      }
    } catch (error) {
      console.error(`Error fetching ${stock.symbol}:`, error);
    }
  }
  
  setIsRefreshing(false);
};
```

## Future Enhancements

### Server-Based Real-Time (If You Add Backend)

If you later add a backend (Firebase, Supabase, etc.), you can implement true push-based updates:

#### Firebase Firestore (Real-time subscriptions)

```javascript
import { onSnapshot, collection } from 'firebase/firestore';

useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, 'expenses'), 
    (snapshot) => {
      const expenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExpenses(expenses);
    }
  );
  
  return () => unsubscribe();
}, []);
```

#### Supabase Real-time

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

useEffect(() => {
  const subscription = supabase
    .from('expenses')
    .on('*', payload => {
      console.log('Change received!', payload);
      // Update state
    })
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

### WebSocket Support

For custom backend:

```javascript
useEffect(() => {
  const ws = new WebSocket('wss://your-server.com/updates');
  
  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    // Handle real-time update
  };
  
  return () => ws.close();
}, []);
```

## Performance Considerations

### Memory Management
- All intervals are cleaned up on component unmount
- Storage event listeners are removed properly
- `isActive` flag prevents state updates after unmount

### Battery Optimization
- Users can disable auto-refresh
- Longer intervals available (up to 10m)
- Only polls when stocks exist

### Network Optimization
- Batches are processed sequentially to avoid overwhelming API
- Failed requests are logged but don't break the update loop
- Manual refresh skips if already refreshing

## Troubleshooting

### Stock prices not updating
1. Check if auto-refresh is enabled
2. Verify API key is set (if using real API)
3. Check browser console for errors
4. Ensure refresh interval isn't too short (rate limiting)

### Cross-tab sync not working
1. Verify both tabs are in the same browser
2. Check localStorage is enabled
3. Try in incognito mode to rule out extensions
4. Ensure context providers wrap all components

### Sync indicator not appearing
1. Open browser DevTools → Application → Local Storage
2. Manually change a value to trigger storage event
3. Check console for JavaScript errors

## Testing

### Test Auto-Refresh

```javascript
// In browser console
console.log('Stocks:', JSON.parse(localStorage.getItem('albedo_stocks')));

// Watch updates in real-time
setInterval(() => {
  const stocks = JSON.parse(localStorage.getItem('albedo_stocks'));
  console.log('Current prices:', stocks.map(s => s.currentPrice));
}, 1000);
```

### Test Cross-Tab Sync

```javascript
// In Tab 1 console
localStorage.setItem('albedo_expenses', JSON.stringify([
  { id: 1, amount: 100, category: 'Test' }
]));

// Tab 2 should update automatically
```

## Best Practices

1. **Always clean up intervals**: Use cleanup function in useEffect
2. **Respect rate limits**: Add delays between API calls
3. **Provide user control**: Allow disabling auto-refresh
4. **Show loading states**: Visual feedback during updates
5. **Handle errors gracefully**: Don't break UI on API failures
6. **Test across tabs**: Verify sync works as expected

## Environment Variables

Create `.env` file in project root:

```bash
REACT_APP_ALPHA_VANTAGE_KEY=your_api_key_here
REACT_APP_RAPIDAPI_KEY=your_rapidapi_key_here
```

Access in code:
```javascript
const API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_KEY;
```

---

**Updated**: December 15, 2025  
**Version**: 1.1.0 - Real-Time Features
