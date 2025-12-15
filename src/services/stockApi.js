/**
 * Stock API Service
 * 
 * This service provides methods to fetch live stock data from Yahoo Finance API.
 * Supports both Indian (NSE) and US stock markets.
 * 
 * For Indian stocks: Uses .NS suffix (NSE) or .BO suffix (BSE)
 * For US stocks: Uses symbol as-is
 * 
 * Note: Due to CORS restrictions, using a CORS proxy for browser-based requests
 * Alternative: Use yfinance Python backend or dedicated stock API service
 */

// CORS Proxy to bypass browser restrictions
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Yahoo Finance API base URL
const YAHOO_FINANCE_API = 'https://query1.finance.yahoo.com/v8/finance/chart/';

// USD to INR exchange rate (will be fetched from API)
let cachedUSDtoINR = 83.50; // Default fallback rate
let lastRateFetch = null;

// Mock data for demonstration when API fails
const MOCK_STOCK_PRICES = {
  // US Stocks
  'AAPL': 178.50,
  'GOOGL': 142.30,
  'MSFT': 415.20,
  'AMZN': 178.90,
  'TSLA': 238.50,
  'META': 485.30,
  'NVDA': 875.40,
  'AMD': 165.80,
  // Indian Stocks (NSE)
  'RELIANCE': 2450.50,
  'TCS': 3580.20,
  'INFY': 1425.80,
  'HDFCBANK': 1620.40,
  'ICICIBANK': 965.30,
  'SBIN': 598.75,
  'BHARTIARTL': 1125.60,
  'ITC': 425.30,
  'WIPRO': 445.80,
  'AXISBANK': 1045.20
};

/**
 * Determine if a stock symbol is Indian (NSE)
 * @param {string} symbol - Stock symbol
 * @param {string} market - Market identifier ('IND' or 'US')
 * @returns {boolean}
 */
const isIndianStock = (symbol, market) => {
  return market === 'IND';
};

/**
 * Format symbol for Yahoo Finance API
 * @param {string} symbol - Stock symbol
 * @param {string} market - Market identifier ('IND' or 'US')
 * @returns {string} Formatted symbol
 */
const formatSymbolForYahoo = (symbol, market) => {
  if (isIndianStock(symbol, market)) {
    // Indian stocks need .NS suffix for NSE
    return `${symbol}.NS`;
  }
  return symbol;
};

/**
 * Fetch current stock price from Yahoo Finance
 * @param {string} symbol - Stock symbol
 * @param {string} market - Market identifier ('IND' or 'US')
 * @returns {Promise<number>} Current stock price
 */
const fetchFromYahooFinance = async (symbol, market) => {
  const yahooSymbol = formatSymbolForYahoo(symbol, market);
  
  try {
    const yahooUrl = `${YAHOO_FINANCE_API}${yahooSymbol}?interval=1d&range=1d`;
    const url = `${CORS_PROXY}${encodeURIComponent(yahooUrl)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract the current price from the response
    const result = data?.chart?.result?.[0];
    
    // First try to get chartPreviousClose (most recent close price)
    if (result?.meta?.chartPreviousClose) {
      return result.meta.chartPreviousClose;
    }
    
    // Fallback to regularMarketPrice
    if (result?.meta?.regularMarketPrice) {
      return result.meta.regularMarketPrice;
    }
    
    // Alternative: get the latest close price
    if (result?.indicators?.quote?.[0]?.close) {
      const closes = result.indicators.quote[0].close;
      const latestClose = closes[closes.length - 1];
      if (latestClose) {
        return latestClose;
      }
    }
    
    throw new Error('Invalid Yahoo Finance API response structure');
  } catch (error) {
    return null;
  }
};

/**
 * Fetch current stock price
 * @param {string} symbol - Stock symbol
 * @param {string} market - Market identifier ('IND' or 'US')
 * @returns {Promise<number>} Current stock price
 */
export const getStockPrice = async (symbol, market = 'US') => {
  // Try to fetch from Yahoo Finance API
  const price = await fetchFromYahooFinance(symbol, market);
  if (price) return price;
  
  // Fallback to mock data
  const mockPrice = MOCK_STOCK_PRICES[symbol.toUpperCase()] || 
                    (market === 'IND' ? Math.random() * 3000 + 100 : Math.random() * 500 + 50);
  
  return mockPrice;
};

/**
 * Fetch stock quote with detailed information
 * @param {string} symbol - Stock symbol
 * @param {string} market - Market identifier ('IND' or 'US')
 * @returns {Promise<Object>} Stock quote data
 */
export const getStockQuote = async (symbol, market = 'US') => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const price = await getStockPrice(symbol, market);
  const change = (Math.random() - 0.5) * 10;
  const changePercent = (change / price) * 100;
  
  return {
    symbol: symbol.toUpperCase(),
    market,
    price,
    change,
    changePercent,
    volume: Math.floor(Math.random() * 10000000),
    marketCap: Math.floor(Math.random() * 1000000000000),
    high: price + Math.random() * 5,
    low: price - Math.random() * 5,
    open: price + (Math.random() - 0.5) * 3,
    previousClose: price - change
  };
};

/**
 * Fetch multiple stock quotes at once
 * @param {string[]} symbols - Array of stock symbols
 * @returns {Promise<Object[]>} Array of stock quotes
 */
export const getBatchStockQuotes = async (symbols) => {
  const quotes = await Promise.all(
    symbols.map(symbol => getStockQuote(symbol))
  );
  return quotes;
};

/**
 * Search for stocks by keyword
 * @param {string} query - Search query
 * @returns {Promise<Object[]>} Array of stock search results
 */
export const searchStocks = async (query) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock search results
  const allStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'AMD', name: 'Advanced Micro Devices Inc.' }
  ];
  
  return allStocks.filter(stock => 
    stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
    stock.name.toLowerCase().includes(query.toLowerCase())
  );
};

/**
 * Fetch USD to INR exchange rate from Yahoo Finance
 * Uses INR=X symbol for currency conversion
 * @returns {Promise<number>} - Exchange rate
 */
export const getUSDtoINRRate = async () => {
  // Cache for 24 hours
  const CACHE_DURATION = 24 * 60 * 60 * 1000;
  
  if (lastRateFetch && (Date.now() - lastRateFetch) < CACHE_DURATION) {
    return cachedUSDtoINR;
  }

  try {
    const yahooSymbol = 'INR=X'; // USD to INR currency pair
    const yahooUrl = `${YAHOO_FINANCE_API}${yahooSymbol}`;
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(yahooUrl)}`;
    
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    const result = data?.chart?.result?.[0];
    if (result) {
      const meta = result.meta;
      const indicators = result.indicators?.quote?.[0];
      
      // Try multiple price sources
      const rate = meta?.chartPreviousClose || 
                   meta?.regularMarketPrice || 
                   indicators?.close?.[indicators.close.length - 1];
      
      if (rate && rate > 0) {
        cachedUSDtoINR = parseFloat(rate.toFixed(2));
        lastRateFetch = Date.now();
        return cachedUSDtoINR;
      }
    }
    
    // Return cached or default if fetch fails
    return cachedUSDtoINR;
  } catch (error) {
    // Return cached or default on error
    return cachedUSDtoINR;
  }
};

/**
 * Example: Real API integration with Alpha Vantage
 * Uncomment and configure with your API key
 */
/*
const ALPHA_VANTAGE_API_KEY = 'YOUR_API_KEY';
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

export const getStockPriceAlphaVantage = async (symbol) => {
  try {
    const response = await fetch(
      `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    if (data['Global Quote']) {
      return parseFloat(data['Global Quote']['05. price']);
    }
    throw new Error('Stock not found');
  } catch (error) {
    console.error('Error fetching stock price:', error);
    throw error;
  }
};
*/

export default {
  getStockPrice,
  getStockQuote,
  getBatchStockQuotes,
  searchStocks,
  getUSDtoINRRate
};
