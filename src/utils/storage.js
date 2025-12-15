/**
 * Storage Utility
 * 
 * This module handles data persistence using localStorage and IndexedDB.
 * Currently uses localStorage for simplicity, but can be extended to use IndexedDB for larger datasets.
 */

const STORAGE_PREFIX = 'albedo_';

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to store (will be JSON stringified)
 * @returns {boolean} Success status
 */
export const saveToStorage = (key, data) => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(STORAGE_PREFIX + key, serializedData);
    return true;
  } catch (error) {
    console.error('Error saving to storage:', error);
    return false;
  }
};

/**
 * Load data from localStorage
 * @param {string} key - Storage key
 * @returns {any} Parsed data or null if not found
 */
export const loadFromStorage = (key) => {
  try {
    const serializedData = localStorage.getItem(STORAGE_PREFIX + key);
    if (serializedData === null) {
      return null;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error('Error loading from storage:', error);
    return null;
  }
};

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
    return true;
  } catch (error) {
    console.error('Error removing from storage:', error);
    return false;
  }
};

/**
 * Clear all app data from localStorage
 * @returns {boolean} Success status
 */
export const clearAllStorage = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};

/**
 * Get storage size in bytes
 * @returns {number} Total size of app data in localStorage
 */
export const getStorageSize = () => {
  let total = 0;
  const keys = Object.keys(localStorage);
  
  keys.forEach(key => {
    if (key.startsWith(STORAGE_PREFIX)) {
      const value = localStorage.getItem(key);
      total += key.length + (value ? value.length : 0);
    }
  });
  
  return total;
};

/**
 * Export all data as JSON
 * @returns {Object} All app data
 */
export const exportData = () => {
  const data = {};
  const keys = Object.keys(localStorage);
  
  keys.forEach(key => {
    if (key.startsWith(STORAGE_PREFIX)) {
      const cleanKey = key.replace(STORAGE_PREFIX, '');
      data[cleanKey] = loadFromStorage(cleanKey);
    }
  });
  
  return data;
};

/**
 * Import data from JSON object
 * @param {Object} data - Data to import
 * @returns {boolean} Success status
 */
export const importData = (data) => {
  try {
    Object.keys(data).forEach(key => {
      saveToStorage(key, data[key]);
    });
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

/**
 * Download data as JSON file
 */
export const downloadDataAsJSON = () => {
  const data = exportData();
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `albedo-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Upload and import data from JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise<boolean>} Success status
 */
export const uploadDataFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const success = importData(data);
        resolve(success);
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      reject(error);
    };
    
    reader.readAsText(file);
  });
};

// IndexedDB implementation (for future enhancement)
/**
 * Initialize IndexedDB (placeholder for future implementation)
 * @returns {Promise<IDBDatabase>}
 */
export const initIndexedDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AlbedoDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores
      if (!db.objectStoreNames.contains('expenses')) {
        db.createObjectStore('expenses', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('assets')) {
        db.createObjectStore('assets', { keyPath: 'id' });
      }
    };
  });
};

export default {
  saveToStorage,
  loadFromStorage,
  removeFromStorage,
  clearAllStorage,
  getStorageSize,
  exportData,
  importData,
  downloadDataAsJSON,
  uploadDataFromJSON,
  initIndexedDB
};
