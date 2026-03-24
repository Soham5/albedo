import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExpenseContext } from '../../contexts/ExpenseContext';
import { AssetContext } from '../../contexts/AssetContext';
import { isAIEnabled, generateInsights, buildFinancialContext } from '../../services/aiService';
import './AIInsights.css';

const AIInsights = () => {
  const navigate = useNavigate();
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { expenses, budget, categoryBudgets, subcategoryBudgets } = useContext(ExpenseContext);
  const {
    stocks, fixedDeposits, recurringDeposits, debts,
    bankAccounts, goals, mutualFunds, cryptoAssets, totalAssetValue
  } = useContext(AssetContext);

  const fetchInsights = useCallback(async () => {
    if (!isAIEnabled()) return;
    setIsLoading(true);
    setError(null);

    const financialContext = buildFinancialContext(
      { expenses, budget, categoryBudgets, subcategoryBudgets },
      { stocks, fixedDeposits, recurringDeposits, debts, bankAccounts, goals, mutualFunds, cryptoAssets, totalAssetValue }
    );

    const result = await generateInsights(financialContext);

    if (result.success) {
      setInsights(result.insights);
      sessionStorage.setItem('albedo_ai_insights', JSON.stringify({
        insights: result.insights,
        timestamp: Date.now()
      }));
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }, [expenses, budget, categoryBudgets, subcategoryBudgets, stocks, fixedDeposits, recurringDeposits, debts, bankAccounts, goals, mutualFunds, cryptoAssets, totalAssetValue]);

  useEffect(() => {
    if (!isAIEnabled()) return;

    const cached = sessionStorage.getItem('albedo_ai_insights');
    if (cached) {
      try {
        const { insights: cachedInsights, timestamp } = JSON.parse(cached);
        const thirtyMinutes = 30 * 60 * 1000;
        if (Date.now() - timestamp < thirtyMinutes) {
          setInsights(cachedInsights);
          return;
        }
      } catch {
        // Invalid cache, proceed to fetch
      }
    }
    fetchInsights();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isAIEnabled()) {
    return (
      <div className="ai-insights-card not-configured">
        <h3>AI Insights</h3>
        <p>Enable AI in Settings to get personalized financial insights and advice.</p>
        <button onClick={() => navigate('/settings')}>Set Up AI</button>
      </div>
    );
  }

  return (
    <div className="ai-insights-card">
      <div className="insights-header">
        <h3>AI Insights</h3>
        <button className="refresh-button" onClick={fetchInsights} disabled={isLoading} title="Refresh insights">
          {isLoading ? '...' : 'Refresh'}
        </button>
      </div>
      {isLoading ? (
        <div className="insights-loading">Analyzing your finances...</div>
      ) : error ? (
        <div className="insights-error">{error}</div>
      ) : (
        <ul className="insights-list">
          {insights.map((insight, i) => (
            <li key={i}>{insight}</li>
          ))}
        </ul>
      )}
      <button className="ask-ai-button" onClick={() => navigate('/ai-advisor')}>
        Ask AI Advisor
      </button>
    </div>
  );
};

export default AIInsights;
