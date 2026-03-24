import { saveToStorage, loadFromStorage, removeFromStorage } from '../utils/storage';
import { encrypt, decrypt } from '../utils/encryption';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const API_KEY_STORAGE_KEY = 'geminiApiKey';
const AI_ENABLED_FLAG = 'aiEnabled';

// Hardcoded encrypted API key (AES-256-GCM, PBKDF2-derived key)
const ENCRYPTED_DEFAULT_KEY = 'VoPHxdHY1CiDc+BJdo3wVoxbSPfbBWknorOYzpsre6GfJuwAZ3y4MGhCoXPLF2e/ZHYuKfY9ErMyAbHdRds3bzCYYg==';
const KEY_PASSPHRASE = 'albedo-personal-finance-2024';
const KEY_SALT = 'albedo-salt-v1';

const SYSTEM_PROMPT = `You are Albedo AI, a personal financial advisor built into the Albedo personal finance app.
You help an Indian user manage their finances. All amounts are in Indian Rupees (INR).
The user follows the 50/30/20 budgeting rule: 50% Needs, 30% Savings/Investments, 20% Wants.

Your role:
- Analyze spending patterns and suggest optimizations
- Provide investment insights based on their portfolio
- Help with debt repayment strategies
- Track goal progress and suggest adjustments
- Give tax-saving tips relevant to India (PPF, ELSS, NPS, etc.)
- Be concise and actionable in your advice

Always format currency as INR with the ₹ symbol. Keep responses concise and practical.
Do not provide specific stock recommendations or guaranteed returns.`;

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_GAP = 4000; // 4 seconds (15 req/min limit)

// --- Decrypt hardcoded key using PBKDF2 + AES-256-GCM ---

const decryptDefaultKey = async () => {
  try {
    const combined = Uint8Array.from(atob(ENCRYPTED_DEFAULT_KEY), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertextWithTag = combined.slice(12);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(KEY_PASSPHRASE),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode(KEY_SALT),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertextWithTag
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
};

// --- API Key Management (encrypted) ---

export const saveAIApiKey = async (apiKey) => {
  const encrypted = await encrypt(apiKey);
  saveToStorage(API_KEY_STORAGE_KEY, encrypted);
  saveToStorage(AI_ENABLED_FLAG, true);
};

export const getAIApiKey = async () => {
  // Check for user-provided key first
  const userEncrypted = loadFromStorage(API_KEY_STORAGE_KEY);
  if (userEncrypted) {
    try {
      return await decrypt(userEncrypted);
    } catch {
      // Fall through to default key
    }
  }
  // Fall back to hardcoded encrypted key
  return decryptDefaultKey();
};

export const removeAIApiKey = () => {
  removeFromStorage(API_KEY_STORAGE_KEY);
  removeFromStorage(AI_ENABLED_FLAG);
};

// AI is enabled if user has set a custom key OR the hardcoded default exists
export const isAIEnabled = () => {
  return true; // Always enabled — hardcoded key is always available
};

// --- API Key Validation ---

export const validateApiKey = async (apiKey) => {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
        generationConfig: { maxOutputTokens: 10 }
      })
    });

    if (response.ok) {
      return { valid: true };
    }

    // 429 = rate limited but key is valid
    if (response.status === 429) {
      return { valid: true };
    }

    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData?.error?.message || `HTTP ${response.status}`;
    return { valid: false, error: errorMessage };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// --- Financial Context Builder ---

export const buildFinancialContext = (expenseData, assetData) => {
  const { expenses = [], budget = 0, categoryBudgets = {} } = expenseData;
  const {
    stocks = [], fixedDeposits = [], recurringDeposits = [],
    debts = [], bankAccounts = [], goals = [],
    mutualFunds = [], cryptoAssets = [], totalAssetValue = 0
  } = assetData;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Current month expenses
  const monthlyExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthlyTotal = monthlyExpenses.reduce((s, e) => s + e.amount, 0);

  // Spending by category type (Needs/Wants/Savings)
  const spendingByType = { NEEDS: 0, WANTS: 0, SAVINGS: 0 };
  const spendingByCategory = {};

  monthlyExpenses.forEach(e => {
    spendingByCategory[e.category] = (spendingByCategory[e.category] || 0) + e.amount;
  });

  // Map categories to types using the imported categories structure
  // We'll do a simple lookup based on common patterns
  const needsCategories = ['UTILITIES', 'RENT', 'GROCERIES', 'DEBTS', 'BABA HATKORCHA', 'BOTA HATKORCHA', 'MISCELLANEOUS', 'HIGHER EDUCATION', 'HOME TOUR', 'REFRESHMENTS'];
  const wantsCategories = ['VACATIONS', 'RESTRAUNTS/CAFES/OUTINGS', 'GIFTS/SHOPPING', 'ONLINE FOOD', "MAA'S HATKORCHA"];
  const savingsCategories = ['INVESTMENTS', 'Assets(MF)', 'SAVINGS', 'Emergency Fund', 'Retirement'];

  Object.entries(spendingByCategory).forEach(([cat, amount]) => {
    if (needsCategories.includes(cat)) spendingByType.NEEDS += amount;
    else if (wantsCategories.includes(cat)) spendingByType.WANTS += amount;
    else if (savingsCategories.includes(cat)) spendingByType.SAVINGS += amount;
  });

  // Top spending categories
  const topCategories = Object.entries(spendingByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amt]) => `${cat}: ₹${amt.toLocaleString('en-IN')}`)
    .join(', ');

  // Bank accounts
  const totalBankBalance = bankAccounts.reduce((s, a) => s + a.balance, 0);
  const bankDetails = bankAccounts
    .map(a => `${a.bankName} (${a.accountType}): ₹${a.balance.toLocaleString('en-IN')}`)
    .join('\n  - ');

  // Stocks
  const stocksValue = stocks.reduce((s, st) => s + (st.quantity * st.currentPrice), 0);
  // Mutual Funds
  const mfValue = mutualFunds.reduce((s, f) => s + (f.units * f.nav), 0);
  // Crypto
  const cryptoValue = cryptoAssets.reduce((s, c) => s + (c.quantity * c.currentPrice), 0);
  // FDs
  const fdValue = fixedDeposits.reduce((s, fd) => s + fd.principal, 0);
  // RDs
  const rdValue = recurringDeposits.reduce((s, rd) => s + (rd.currentAmount || 0), 0);
  // Debts
  const totalDebt = debts.reduce((s, d) => s + d.outstanding, 0);
  const debtDetails = debts
    .map(d => `${d.creditor || d.name || 'Debt'}: ₹${d.outstanding.toLocaleString('en-IN')} outstanding at ${d.interestRate || 0}%`)
    .join('\n  - ');

  // Goals
  const goalDetails = goals
    .map(g => {
      const pct = g.targetAmount > 0 ? ((g.currentAmount / g.targetAmount) * 100).toFixed(1) : 0;
      return `${g.name}: ₹${g.currentAmount.toLocaleString('en-IN')}/₹${g.targetAmount.toLocaleString('en-IN')} (${pct}% complete${g.targetDate ? `, due: ${g.targetDate}` : ''})`;
    })
    .join('\n  - ');

  // Category budgets
  const categoryBudgetDetails = Object.entries(categoryBudgets)
    .filter(([, amt]) => amt > 0)
    .map(([cat, amt]) => {
      const spent = spendingByCategory[cat] || 0;
      const pct = amt > 0 ? ((spent / amt) * 100).toFixed(1) : 0;
      return `${cat}: ₹${spent.toLocaleString('en-IN')} / ₹${amt.toLocaleString('en-IN')} (${pct}%)`;
    })
    .join('\n  - ');

  // Recent 3 months trend
  const recentMonths = [];
  for (let i = 2; i >= 0; i--) {
    const m = new Date(currentYear, currentMonth - i, 1);
    const monthExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
    });
    const total = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const monthName = m.toLocaleString('en-IN', { month: 'short', year: 'numeric' });
    recentMonths.push(`${monthName}: ₹${total.toLocaleString('en-IN')}`);
  }

  return `## User's Financial Data (as of ${now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })})

### Monthly Budget: ₹${budget.toLocaleString('en-IN')}
- Budget Rule: 50% Needs / 30% Savings / 20% Wants
- Needs allocation: ₹${(budget * 0.5).toLocaleString('en-IN')}
- Savings allocation: ₹${(budget * 0.3).toLocaleString('en-IN')}
- Wants allocation: ₹${(budget * 0.2).toLocaleString('en-IN')}

### This Month's Spending (Total: ₹${monthlyTotal.toLocaleString('en-IN')})
- Needs: ₹${spendingByType.NEEDS.toLocaleString('en-IN')} (${budget > 0 ? ((spendingByType.NEEDS / (budget * 0.5)) * 100).toFixed(1) : 0}% of allocation)
- Wants: ₹${spendingByType.WANTS.toLocaleString('en-IN')} (${budget > 0 ? ((spendingByType.WANTS / (budget * 0.2)) * 100).toFixed(1) : 0}% of allocation)
- Savings: ₹${spendingByType.SAVINGS.toLocaleString('en-IN')} (${budget > 0 ? ((spendingByType.SAVINGS / (budget * 0.3)) * 100).toFixed(1) : 0}% of allocation)
${topCategories ? `\nTop categories: ${topCategories}` : ''}
${categoryBudgetDetails ? `\nCategory budgets:\n  - ${categoryBudgetDetails}` : ''}

### 3-Month Spending Trend
${recentMonths.join(' | ')}

### Bank Accounts (Total: ₹${totalBankBalance.toLocaleString('en-IN')})
${bankDetails ? `  - ${bankDetails}` : '  No bank accounts'}

### Investments
- Stocks: ${stocks.length} holdings worth ₹${stocksValue.toLocaleString('en-IN')}
- Mutual Funds: ${mutualFunds.length} holdings worth ₹${mfValue.toLocaleString('en-IN')}
- Crypto: ${cryptoAssets.length} holdings worth ₹${cryptoValue.toLocaleString('en-IN')}
- Fixed Deposits: ${fixedDeposits.length} worth ₹${fdValue.toLocaleString('en-IN')}
- Recurring Deposits: ${recurringDeposits.length} worth ₹${rdValue.toLocaleString('en-IN')}

### Debts (Total Outstanding: ₹${totalDebt.toLocaleString('en-IN')})
${debtDetails ? `  - ${debtDetails}` : '  No debts'}

### Financial Goals
${goalDetails ? `  - ${goalDetails}` : '  No goals set'}

### Net Worth: ₹${totalAssetValue.toLocaleString('en-IN')}`;
};

// --- Gemini API Calls ---

const callGeminiAPI = async (contents, systemInstruction) => {
  const apiKey = await getAIApiKey();
  if (!apiKey) {
    return { success: false, error: 'AI not configured. Please add your Gemini API key in Settings.' };
  }

  // Rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_GAP) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_GAP - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || `API error: ${response.status}`;
      return { success: false, error: errorMessage };
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return { success: false, error: 'No response from AI. Please try again.' };
    }

    return { success: true, message: text };
  } catch (error) {
    return { success: false, error: `Connection error: ${error.message}` };
  }
};

// --- Chat with Advisor ---

export const chatWithAdvisor = async (userMessage, financialContext, chatHistory = []) => {
  const systemInstruction = `${SYSTEM_PROMPT}\n\nHere is the user's current financial data:\n\n${financialContext}`;

  const contents = [
    ...chatHistory.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    })),
    {
      role: 'user',
      parts: [{ text: userMessage }]
    }
  ];

  return callGeminiAPI(contents, systemInstruction);
};

// --- Generate Dashboard Insights ---

export const generateInsights = async (financialContext) => {
  const systemInstruction = `${SYSTEM_PROMPT}\n\nHere is the user's current financial data:\n\n${financialContext}`;

  const contents = [{
    role: 'user',
    parts: [{
      text: `Based on my financial data, give me exactly 3 brief, actionable financial insights or tips. Each should be 1-2 sentences max. Focus on the most important observations about my spending, savings, investments, or goals. Format as a JSON array of 3 strings, like: ["insight 1", "insight 2", "insight 3"]. Return ONLY the JSON array, nothing else.`
    }]
  }];

  const result = await callGeminiAPI(contents, systemInstruction);

  if (!result.success) {
    return { success: false, insights: [], error: result.error };
  }

  try {
    // Try to parse the JSON array from the response
    const text = result.message.trim();
    // Handle potential markdown code blocks
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const insights = JSON.parse(jsonMatch[0]);
      if (Array.isArray(insights) && insights.length > 0) {
        return { success: true, insights: insights.slice(0, 3) };
      }
    }
    // Fallback: split by newlines if JSON parsing fails
    const lines = text.split('\n').filter(l => l.trim().length > 0).slice(0, 3);
    return { success: true, insights: lines };
  } catch {
    // If all parsing fails, return the raw text as a single insight
    return { success: true, insights: [result.message.trim()] };
  }
};
