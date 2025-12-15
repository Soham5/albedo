import React, { useState, useContext, useEffect } from 'react';
import { AssetContext } from '../../contexts/AssetContext';
import { getStockPrice, getUSDtoINRRate } from '../../services/stockApi';
import './StockTracker.css';

const StockTracker = () => {
  const { stocks, addStock, updateStock, deleteStock } = useContext(AssetContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMarket, setActiveMarket] = useState('IND'); // 'IND' or 'US'
  const [newStock, setNewStock] = useState({
    symbol: '',
    quantity: '',
    purchasePrice: '',
    market: 'IND'
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [usdToInrRate, setUsdToInrRate] = useState(83.50); // Default rate

  // Auto-refresh stock prices
  useEffect(() => {
    if (stocks.length === 0) return;

    let isActive = true;

    const fetchStockPrices = async () => {
      setIsRefreshing(true);
      try {
        // Fetch USD to INR rate first
        const rate = await getUSDtoINRRate();
        if (isActive) {
          setUsdToInrRate(rate);
        }

        for (const stock of stocks) {
          if (!isActive) break;
          
          const newPrice = await getStockPrice(stock.symbol, stock.market || 'US');
          if (isActive) {
            updateStock(stock.id, { 
              currentPrice: newPrice,
              lastUpdated: new Date().toISOString()
            });
          }
        }
        if (isActive) {
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error('Error fetching stock prices:', error);
      } finally {
        if (isActive) {
          setIsRefreshing(false);
        }
      }
    };

    // Initial fetch
    fetchStockPrices();

    // Set up interval for daily auto-refresh (24 hours = 86400000 ms)
    const interval = setInterval(fetchStockPrices, 86400000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [stocks.length]); // Intentionally minimal deps

  // Format time ago
  const getTimeAgo = (date) => {
    if (!date) return 'Never';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const handleAddStock = (e) => {
    e.preventDefault();
    const stock = {
      id: Date.now(),
      symbol: newStock.symbol.toUpperCase(),
      quantity: parseFloat(newStock.quantity),
      purchasePrice: parseFloat(newStock.purchasePrice),
      currentPrice: parseFloat(newStock.purchasePrice), // Will be updated by API
      market: newStock.market,
      lastUpdated: new Date().toISOString()
    };
    
    addStock(stock);
    setNewStock({ symbol: '', quantity: '', purchasePrice: '', market: activeMarket });
  };

  const calculateGainLoss = (stock) => {
    const totalCost = stock.quantity * stock.purchasePrice;
    const currentValue = stock.quantity * stock.currentPrice;
    const gainLoss = currentValue - totalCost;
    const percentage = (gainLoss / totalCost) * 100;
    return { gainLoss, percentage };
  };

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMarket = stock.market === activeMarket || (!stock.market && activeMarket === 'US');
    return matchesSearch && matchesMarket;
  });

  const indStockCount = stocks.filter(s => s.market === 'IND').length;
  const usStockCount = stocks.filter(s => !s.market || s.market === 'US').length;

  // Calculate total portfolio value in INR
  const calculatePortfolioValue = () => {
    let totalINR = 0;
    
    stocks.forEach(stock => {
      const currentValue = stock.quantity * stock.currentPrice;
      
      if (stock.market === 'IND') {
        // Indian stocks are already in INR
        totalINR += currentValue;
      } else {
        // US stocks need to be converted to INR
        totalINR += currentValue * usdToInrRate;
      }
    });
    
    return totalINR;
  };

  const portfolioValueINR = calculatePortfolioValue();

  return (
    <div className="stock-tracker">
      <div className="stock-header">
        <h3>Stock Portfolio</h3>
        
        {/* Portfolio Value Display */}
        {stocks.length > 0 && (
          <div className="portfolio-value">
            <div className="portfolio-label">Total Portfolio Value</div>
            <div className="portfolio-amount">₹{portfolioValueINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="exchange-rate-info">USD to INR: ₹{usdToInrRate.toFixed(2)}</div>
          </div>
        )}

        <div className="market-tabs">
          <button 
            className={`market-tab ${activeMarket === 'IND' ? 'active' : ''}`}
            onClick={() => { setActiveMarket('IND'); setNewStock({...newStock, market: 'IND'}); }}
          >
            🇮🇳 IND Stocks ({indStockCount})
          </button>
          <button 
            className={`market-tab ${activeMarket === 'US' ? 'active' : ''}`}
            onClick={() => { setActiveMarket('US'); setNewStock({...newStock, market: 'US'}); }}
          >
            🇺🇸 US Stocks ({usStockCount})
          </button>
        </div>
        <div className="stock-controls">
          <input
            type="text"
            placeholder="Search stocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="stock-search"
          />
        </div>
        {lastUpdated && (
          <div className="last-updated">
            Last updated: {getTimeAgo(lastUpdated)}
            {isRefreshing && <span className="refreshing-indicator"> • Updating...</span>}
          </div>
        )}
      </div>

      <form onSubmit={handleAddStock} className="add-stock-form">
        <div className="form-row">
          <input
            type="text"
            placeholder={activeMarket === 'IND' ? "Symbol (e.g., RELIANCE)" : "Symbol (e.g., AAPL)"}
            value={newStock.symbol}
            onChange={(e) => setNewStock({...newStock, symbol: e.target.value})}
            required
          />
          <span className="market-indicator">{activeMarket === 'IND' ? 'NSE' : 'US'}</span>
        </div>
        <input
          type="number"
          placeholder="Quantity"
          value={newStock.quantity}
          onChange={(e) => setNewStock({...newStock, quantity: e.target.value})}
          required
          step="0.01"
        />
        <input
          type="number"
          placeholder="Purchase Price"
          value={newStock.purchasePrice}
          onChange={(e) => setNewStock({...newStock, purchasePrice: e.target.value})}
          required
          step="0.01"
        />
        <button type="submit">Add {activeMarket} Stock</button>
      </form>

      <div className="stock-list">
        {filteredStocks.length === 0 ? (
          <div className="empty-state">
            No {activeMarket === 'IND' ? 'Indian (NSE)' : 'US'} stocks in portfolio
          </div>
        ) : (
          filteredStocks.map(stock => {
            const { gainLoss, percentage } = calculateGainLoss(stock);
            const isPositive = gainLoss >= 0;
            const currency = stock.market === 'IND' ? '₹' : '$';
            const currentValue = stock.quantity * stock.currentPrice;
            
            return (
              <div key={stock.id} className="stock-item">
                <div className="stock-main">
                  <div className="stock-info">
                    <div className="stock-symbol">
                      {stock.symbol}
                      <span className="stock-exchange">{stock.market === 'IND' ? 'NSE' : 'US'}</span>
                    </div>
                    <div className="stock-quantity">{stock.quantity} shares</div>
                  </div>
                </div>
                <div className="stock-prices">
                  <div className="price-row">
                    <span className="price-label">Purchase:</span>
                    <span>{currency}{stock.purchasePrice.toFixed(2)}</span>
                  </div>
                  <div className="price-row">
                    <span className="price-label">Current:</span>
                    <span>{currency}{stock.currentPrice.toFixed(2)}</span>
                  </div>
                </div>
                <div className={`stock-performance ${isPositive ? 'positive' : 'negative'}`}>
                  <div className="gain-loss">
                    {currency}{currentValue.toFixed(2)}
                  </div>
                  <div className="percentage">
                    {isPositive ? '+' : ''}{currency}{gainLoss.toFixed(2)}
                  </div>
                </div>
                <button 
                  className="delete-stock"
                  onClick={() => deleteStock(stock.id)}
                >
                  🗑️
                </button>
              </div>
            );
          })
        )}
      </div>
      
      <div className="stock-note">
        💡 Auto-updating daily • Using Yahoo Finance API for live stock data
      </div>
    </div>
  );
};

export default StockTracker;
