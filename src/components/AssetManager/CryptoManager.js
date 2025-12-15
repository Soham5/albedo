import React, { useState, useContext } from 'react';
import { AssetContext } from '../../contexts/AssetContext';
import './CryptoManager.css';

const CryptoManager = () => {
  const { cryptoAssets, addCrypto, deleteCrypto } = useContext(AssetContext);
  const [newCrypto, setNewCrypto] = useState({
    symbol: '',
    name: '',
    quantity: '',
    purchasePrice: '',
    currentPrice: ''
  });

  const handleAddCrypto = (e) => {
    e.preventDefault();
    const crypto = {
      id: Date.now(),
      symbol: newCrypto.symbol.toUpperCase(),
      name: newCrypto.name,
      quantity: parseFloat(newCrypto.quantity),
      purchasePrice: parseFloat(newCrypto.purchasePrice),
      currentPrice: parseFloat(newCrypto.currentPrice),
      createdAt: new Date().toISOString()
    };
    
    addCrypto(crypto);
    setNewCrypto({ symbol: '', name: '', quantity: '', purchasePrice: '', currentPrice: '' });
  };

  const calculateReturns = (crypto) => {
    const invested = crypto.quantity * crypto.purchasePrice;
    const currentValue = crypto.quantity * crypto.currentPrice;
    const returns = currentValue - invested;
    const percentage = (returns / invested) * 100;
    return { returns, percentage, invested, currentValue };
  };

  const totalInvested = cryptoAssets.reduce((sum, crypto) => 
    sum + (crypto.quantity * crypto.purchasePrice), 0
  );
  const totalCurrentValue = cryptoAssets.reduce((sum, crypto) => 
    sum + (crypto.quantity * crypto.currentPrice), 0
  );
  const totalReturns = totalCurrentValue - totalInvested;
  const totalReturnsPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

  return (
    <div className="crypto-manager">
      <div className="crypto-header">
        <div className="crypto-summary">
          <h3>Cryptocurrency Portfolio</h3>
          <div className="crypto-totals">
            <div className="total-item">
              <span className="label">Invested:</span>
              <span className="value">₹{totalInvested.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div className="total-item">
              <span className="label">Current:</span>
              <span className="value">₹{totalCurrentValue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div className="total-item">
              <span className="label">Returns:</span>
              <span className={`value ${totalReturns >= 0 ? 'positive' : 'negative'}`}>
                {totalReturns >= 0 ? '+' : ''}₹{totalReturns.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ({totalReturnsPercentage.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleAddCrypto} className="add-crypto-form">
        <input
          type="text"
          placeholder="Symbol (e.g., BTC)"
          value={newCrypto.symbol}
          onChange={(e) => setNewCrypto({...newCrypto, symbol: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Name (e.g., Bitcoin)"
          value={newCrypto.name}
          onChange={(e) => setNewCrypto({...newCrypto, name: e.target.value})}
          required
        />
        <input
          type="number"
          placeholder="Quantity"
          value={newCrypto.quantity}
          onChange={(e) => setNewCrypto({...newCrypto, quantity: e.target.value})}
          required
          step="0.00000001"
        />
        <input
          type="number"
          placeholder="Purchase Price (₹)"
          value={newCrypto.purchasePrice}
          onChange={(e) => setNewCrypto({...newCrypto, purchasePrice: e.target.value})}
          required
          step="0.01"
        />
        <input
          type="number"
          placeholder="Current Price (₹)"
          value={newCrypto.currentPrice}
          onChange={(e) => setNewCrypto({...newCrypto, currentPrice: e.target.value})}
          required
          step="0.01"
        />
        <button type="submit">Add Crypto</button>
      </form>

      <div className="crypto-list">
        {cryptoAssets.length === 0 ? (
          <div className="empty-state">No cryptocurrency holdings</div>
        ) : (
          cryptoAssets.map(crypto => {
            const { returns, percentage, invested, currentValue } = calculateReturns(crypto);
            const isPositive = returns >= 0;
            
            return (
              <div key={crypto.id} className="crypto-item">
                <div className="crypto-main">
                  <div className="crypto-symbol">{crypto.symbol}</div>
                  <div className="crypto-name">{crypto.name}</div>
                  <div className="crypto-quantity">{crypto.quantity} {crypto.symbol}</div>
                </div>
                <div className="crypto-prices">
                  <div className="price-detail">
                    <span className="label">Purchase:</span>
                    <span className="value">₹{crypto.purchasePrice.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="price-detail">
                    <span className="label">Current:</span>
                    <span className="value">₹{crypto.currentPrice.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="price-detail">
                    <span className="label">Invested:</span>
                    <span className="value">₹{invested.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="price-detail">
                    <span className="label">Value:</span>
                    <span className="value highlight">₹{currentValue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                </div>
                <div className={`crypto-returns ${isPositive ? 'positive' : 'negative'}`}>
                  <div className="returns-amount">
                    {isPositive ? '+' : ''}₹{returns.toFixed(2)}
                  </div>
                  <div className="returns-percentage">
                    {isPositive ? '+' : ''}{percentage.toFixed(2)}%
                  </div>
                </div>
                <button 
                  className="delete-crypto"
                  onClick={() => deleteCrypto(crypto.id)}
                >
                  🗑️
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="crypto-note">
        ⚠️ Cryptocurrency investments are highly volatile. Update prices regularly and invest responsibly.
      </div>
    </div>
  );
};

export default CryptoManager;
