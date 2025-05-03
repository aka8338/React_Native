import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Create context
const OfflineContext = createContext();

// Storage keys
const STORAGE_KEYS = {
  IDENTIFICATION_HISTORY: 'identification_history',
  PENDING_REPORTS: 'pending_reports',
  CACHED_DISEASES: 'cached_diseases',
  LAST_SYNC: 'last_sync'
};

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [lastSynced, setLastSynced] = useState(null);
  const [pendingUploads, setPendingUploads] = useState([]);
  const [identificationHistory, setIdentificationHistory] = useState([]);
  const [cachedDiseases, setCachedDiseases] = useState([]);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected && state.isInternetReachable);
    });

    // Load data from storage on initial load
    loadStoredData();

    return () => {
      unsubscribe();
    };
  }, []);

  // Load all stored data on startup
  const loadStoredData = async () => {
    try {
      // Load identification history
      const historyString = await AsyncStorage.getItem(STORAGE_KEYS.IDENTIFICATION_HISTORY);
      if (historyString) {
        setIdentificationHistory(JSON.parse(historyString));
      }

      // Load pending reports
      const pendingReportsString = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_REPORTS);
      if (pendingReportsString) {
        setPendingUploads(JSON.parse(pendingReportsString));
      }

      // Load cached diseases
      const cachedDiseasesString = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_DISEASES);
      if (cachedDiseasesString) {
        setCachedDiseases(JSON.parse(cachedDiseasesString));
      }

      // Load last sync time
      const lastSyncString = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      if (lastSyncString) {
        setLastSynced(JSON.parse(lastSyncString));
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  };

  // Save identification result to local storage
  const saveIdentificationResult = async (result) => {
    try {
      const newIdentification = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...result
      };

      const updatedHistory = [newIdentification, ...identificationHistory];
      setIdentificationHistory(updatedHistory);
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.IDENTIFICATION_HISTORY,
        JSON.stringify(updatedHistory)
      );
      
      return newIdentification.id;
    } catch (error) {
      console.error('Error saving identification:', error);
      return null;
    }
  };

  // Queue a report for submission when online
  const queueDiseaseReport = async (report) => {
    try {
      const newReport = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        synced: false,
        ...report
      };

      const updatedReports = [...pendingUploads, newReport];
      setPendingUploads(updatedReports);
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.PENDING_REPORTS,
        JSON.stringify(updatedReports)
      );
      
      // Try to sync immediately if online
      if (isOnline) {
        syncPendingReports();
      }
      
      return newReport.id;
    } catch (error) {
      console.error('Error queuing report:', error);
      return null;
    }
  };

  // Sync pending reports with the server
  const syncPendingReports = async () => {
    if (!isOnline || pendingUploads.length === 0) return;
    
    // Filter only unsynced reports
    const unsynced = pendingUploads.filter(report => !report.synced);
    
    // For each unsynced report, try to upload
    const updatedReports = [...pendingUploads];
    
    for (let i = 0; i < unsynced.length; i++) {
      const report = unsynced[i];
      try {
        // This would be an API call in a real app
        // For now, we're just simulating success
        // await submitReportToServer(report);
        
        // Mark as synced on success
        const index = updatedReports.findIndex(r => r.id === report.id);
        if (index !== -1) {
          updatedReports[index] = { ...report, synced: true };
        }
      } catch (error) {
        console.error('Error syncing report:', error);
        // Leave as unsynced if there's an error
      }
    }
    
    // Update state and storage
    setPendingUploads(updatedReports);
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_REPORTS, JSON.stringify(updatedReports));
    
    // Update last synced time
    const now = new Date().toISOString();
    setLastSynced(now);
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, JSON.stringify(now));
  };

  // Get disease information, either from cache or server
  const getDiseaseInfo = async (diseaseId) => {
    // Check if the disease info is in the cache
    const cachedDisease = cachedDiseases.find(d => d.id === diseaseId);
    
    if (cachedDisease) {
      return cachedDisease;
    }
    
    // If online, fetch from server and cache
    if (isOnline) {
      try {
        // This would be an API call in a real app
        // For now, return a mock disease based on ID
        const diseaseMock = getMockDiseaseInfo(diseaseId);
        
        // Add to cache
        const updatedCache = [...cachedDiseases, diseaseMock];
        setCachedDiseases(updatedCache);
        await AsyncStorage.setItem(STORAGE_KEYS.CACHED_DISEASES, JSON.stringify(updatedCache));
        
        return diseaseMock;
      } catch (error) {
        console.error('Error fetching disease info:', error);
        return null;
      }
    }
    
    // If offline and not cached, return null
    return null;
  };

  // Mock function to provide disease data (would be replaced by API call)
  const getMockDiseaseInfo = (diseaseId) => {
    return {
      id: diseaseId,
      name: `Disease ${diseaseId}`,
      description: 'This is a mock disease description for offline testing.',
      symptoms: ['Symptom 1', 'Symptom 2', 'Symptom 3'],
      treatment: ['Treatment 1', 'Treatment 2', 'Treatment 3'],
      cached: true,
      lastUpdated: new Date().toISOString()
    };
  };

  // Clear all stored data
  const clearStoredData = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.IDENTIFICATION_HISTORY,
        STORAGE_KEYS.PENDING_REPORTS,
        STORAGE_KEYS.CACHED_DISEASES,
        STORAGE_KEYS.LAST_SYNC
      ]);
      
      setIdentificationHistory([]);
      setPendingUploads([]);
      setCachedDiseases([]);
      setLastSynced(null);
    } catch (error) {
      console.error('Error clearing stored data:', error);
    }
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        lastSynced,
        pendingUploads,
        identificationHistory,
        saveIdentificationResult,
        queueDiseaseReport,
        syncPendingReports,
        getDiseaseInfo,
        clearStoredData
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

// Custom hook for using the offline context
export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

export default OfflineContext; 