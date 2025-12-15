import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ExpenseProvider } from './contexts/ExpenseContext';
import { AssetProvider } from './contexts/AssetContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import SyncIndicator from './components/Shared/SyncIndicator';
import Login from './components/Auth/Login';
import Dashboard from './pages/Dashboard';
import ExpensePage from './pages/ExpensePage';
import AssetsPage from './pages/AssetsPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userMode, setUserMode] = useState(null); // 'user' or 'guest'

  // Check if user was previously authenticated
  useEffect(() => {
    const authStatus = sessionStorage.getItem('isAuthenticated');
    const mode = sessionStorage.getItem('userMode');
    if (authStatus === 'true' && mode) {
      setIsAuthenticated(true);
      setUserMode(mode);
    }
  }, []);

  const handleLogin = (mode) => {
    setIsAuthenticated(true);
    setUserMode(mode);
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('userMode', mode);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserMode(null);
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userMode');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <ExpenseProvider userMode={userMode}>
        <AssetProvider userMode={userMode}>
          <div className="App">
            <Navbar onLogout={handleLogout} userMode={userMode} />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard userMode={userMode} />} />
                <Route path="/expenses" element={<ExpensePage />} />
                <Route path="/assets" element={<AssetsPage />} />
                <Route path="/settings" element={<SettingsPage userMode={userMode} onLogout={handleLogout} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <SyncIndicator />
          </div>
        </AssetProvider>
      </ExpenseProvider>
    </Router>
  );
}

export default App;
