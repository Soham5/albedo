import React from 'react';
import AccountSummary from '../components/Dashboard/AccountSummary';
import QuickActions from '../components/Dashboard/QuickActions';
import './Dashboard.css';

const Dashboard = ({ userMode }) => {
  return (
    <div className="dashboard-page">
      <AccountSummary userMode={userMode} />
      <QuickActions />
    </div>
  );
};

export default Dashboard;
