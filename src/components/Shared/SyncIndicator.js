import React, { useState, useEffect } from 'react';
import './SyncIndicator.css';

const SyncIndicator = () => {
  const [syncEvent, setSyncEvent] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (!e.newValue || !e.key?.startsWith('albedo_')) return;
      
      const dataType = e.key.replace('albedo_', '');
      setSyncEvent(dataType);
      setIsVisible(true);

      // Hide after 3 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="sync-indicator">
      <span className="sync-icon">🔄</span>
      <span className="sync-message">
        Synced {syncEvent} from another tab
      </span>
    </div>
  );
};

export default SyncIndicator;
