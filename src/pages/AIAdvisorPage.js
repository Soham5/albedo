import React, { useState, useContext, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExpenseContext } from '../contexts/ExpenseContext';
import { AssetContext } from '../contexts/AssetContext';
import { isAIEnabled, chatWithAdvisor, buildFinancialContext } from '../services/aiService';
import './AIAdvisorPage.css';

const WELCOME_MESSAGE = `Hello! I'm Albedo AI, your personal financial advisor. I have access to your financial data and can help with:

- Spending analysis and budget optimization
- Investment insights and portfolio review
- Debt repayment strategies
- Goal tracking and planning
- Tax-saving tips for India

What would you like to know?`;

const SUGGESTIONS = [
  'Analyze my spending',
  'Check budget status',
  'Review my goals',
  'Debt repayment strategy'
];

const AIAdvisorPage = () => {
  const navigate = useNavigate();

  const { expenses, budget, categoryBudgets, subcategoryBudgets } = useContext(ExpenseContext);
  const {
    stocks, fixedDeposits, recurringDeposits, debts,
    bankAccounts, goals, mutualFunds, cryptoAssets, totalAssetValue
  } = useContext(AssetContext);

  const [messages, setMessages] = useState([
    { role: 'model', text: WELCOME_MESSAGE }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const financialContext = useMemo(() =>
    buildFinancialContext(
      { expenses, budget, categoryBudgets, subcategoryBudgets },
      { stocks, fixedDeposits, recurringDeposits, debts, bankAccounts, goals, mutualFunds, cryptoAssets, totalAssetValue }
    ),
    [expenses, budget, categoryBudgets, subcategoryBudgets, stocks, fixedDeposits, recurringDeposits, debts, bankAccounts, goals, mutualFunds, cryptoAssets, totalAssetValue]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (text) => {
    const messageText = text || inputValue.trim();
    if (!messageText || isLoading) return;

    setInputValue('');
    const userMessage = { role: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Build chat history (exclude welcome message)
    const chatHistory = messages.slice(1).map(m => ({
      role: m.role,
      text: m.text
    }));

    const result = await chatWithAdvisor(messageText, financialContext, chatHistory);

    if (result.success) {
      setMessages(prev => [...prev, { role: 'model', text: result.message }]);
    } else {
      setMessages(prev => [...prev, { role: 'model', text: `Sorry, I encountered an error: ${result.error}` }]);
    }

    setIsLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isAIEnabled()) {
    return (
      <div className="ai-advisor-page">
        <div className="ai-setup-prompt">
          <div className="setup-icon">AI</div>
          <h2>AI Financial Advisor</h2>
          <p>
            To use the AI Financial Advisor, you need to configure your Google Gemini API key in Settings.
            The free tier provides 15 requests/min and 1500 requests/day.
          </p>
          <button className="setup-button" onClick={() => navigate('/settings')}>
            Go to Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-advisor-page">
      <div className="chat-header">
        <h1>AI Financial Advisor</h1>
      </div>

      <div className="quick-suggestions">
        {SUGGESTIONS.map((suggestion, i) => (
          <button
            key={i}
            className="suggestion-chip"
            onClick={() => handleSend(suggestion)}
            disabled={isLoading}
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role}`}>
            {msg.role === 'model' && <span className="avatar">AI</span>}
            <div className="bubble-content">{msg.text}</div>
            {msg.role === 'user' && <span className="avatar">You</span>}
          </div>
        ))}
        {isLoading && (
          <div className="chat-bubble model">
            <span className="avatar">AI</span>
            <div className="bubble-content typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your finances..."
          disabled={isLoading}
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !inputValue.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AIAdvisorPage;
