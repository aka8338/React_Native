import React, { createContext, useState, useContext, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { DiseaseReportService } from '../services/api';

// Create the context
const OfflineContext = createContext();

// Custom hook to use the offline context
export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingReports, setPendingReports] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Check network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
      if (state.isConnected) {
        syncWithServer();
      }
    });

    return () => unsubscribe();
  }, []);

  // Load pending reports on mount
  useEffect(() => {
    loadPendingReports();
  }, []);

  const loadPendingReports = async () => {
    try {
      const reports = await AsyncStorage.getItem('pendingReports');
      if (reports) {
        setPendingReports(JSON.parse(reports));
      }
    } catch (error) {
      console.error('Error loading pending reports:', error);
    }
  };

  const savePendingReports = async (reports) => {
    try {
      await AsyncStorage.setItem('pendingReports', JSON.stringify(reports));
      setPendingReports(reports);
    } catch (error) {
      console.error('Error saving pending reports:', error);
    }
  };

  const queueDiseaseReport = async (report) => {
    try {
      // Add timestamp and synced status
      const reportWithMetadata = {
        ...report,
        timestamp: new Date().toISOString(),
        synced: false
      };

      // Save locally first
      const updatedReports = [...pendingReports, reportWithMetadata];
      await savePendingReports(updatedReports);

      // Try to sync if online
      if (isOnline) {
        await syncWithServer();
      }

      return reportWithMetadata;
    } catch (error) {
      console.error('Error queueing report:', error);
      throw error;
    }
  };

  const syncWithServer = async () => {
    if (isSyncing || pendingReports.length === 0) return;

    try {
      setIsSyncing(true);
      console.log('Starting sync with server...');

      // Get unsynced reports
      const unsyncedReports = pendingReports.filter(report => !report.synced);
      if (unsyncedReports.length === 0) {
        console.log('No reports to sync');
        return;
      }

      // Sync with server
      const result = await DiseaseReportService.syncReports(unsyncedReports);
      console.log('Sync result:', result);

      // Update local storage
      const updatedReports = pendingReports.map(report => {
        const syncedReport = result.reports.find(r => r.originalId === report.id);
        if (syncedReport) {
          return { ...report, synced: true, serverId: syncedReport.id };
        }
        return report;
      });

      await savePendingReports(updatedReports);
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Error syncing with server:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  // Load last sync time
  const loadLastSyncTime = async () => {
    try {
      const syncTime = await AsyncStorage.getItem('lastSyncTime');
      if (syncTime) {
        setLastSyncTime(syncTime);
      }
    } catch (error) {
      console.error('Error loading last sync time:', error);
    }
  };

  // Save last sync time
  const saveLastSyncTime = async (time) => {
    try {
      await AsyncStorage.setItem('lastSyncTime', time);
      setLastSyncTime(time);
    } catch (error) {
      console.error('Error saving last sync time:', error);
    }
  };

  // Save identification result
  const saveIdentificationResult = async (result) => {
    try {
      const existingResults = await AsyncStorage.getItem('identificationResults');
      let results = [];
      
      if (existingResults) {
        results = JSON.parse(existingResults);
      }
      
      // Add unique ID and timestamp if not present
      const newResult = {
        ...result,
        id: result.id || Date.now().toString(),
        timestamp: result.timestamp || new Date().toISOString(),
      };
      
      results.push(newResult);
      await AsyncStorage.setItem('identificationResults', JSON.stringify(results));

      // Also add to user activity
      await addUserActivity({
        type: 'identification',
        description: `Identified ${result.disease} with ${Math.round(result.confidence * 100)}% confidence`,
        date: new Date().toISOString(),
        data: newResult
      });
      
      return newResult;
    } catch (error) {
      console.error('Error saving identification result:', error);
      throw error;
    }
  };

  // Add user activity
  const addUserActivity = async (activity) => {
    try {
      const existingActivity = await AsyncStorage.getItem('userActivity');
      let activities = [];
      
      if (existingActivity) {
        activities = JSON.parse(existingActivity);
      }
      
      activities.push(activity);
      await AsyncStorage.setItem('userActivity', JSON.stringify(activities));
      
      return activity;
    } catch (error) {
      console.error('Error adding user activity:', error);
    }
  };

  // Manually trigger sync
  const manualSync = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'You are currently offline. Please connect to the internet and try again.');
      return;
    }

    if (pendingReports.length === 0) {
      Alert.alert('No Data to Sync', 'There are no pending items to sync.');
      return;
    }

    await syncWithServer();
  };

  // Clear all stored data (for testing/debugging)
  const clearStoredData = async () => {
    try {
      await AsyncStorage.multiRemove([
        'pendingReports',
        'identificationResults',
        'lastSyncTime',
        'userActivity'
      ]);
      setPendingReports([]);
      setLastSyncTime(null);
      return true;
    } catch (error) {
      console.error('Error clearing stored data:', error);
      return false;
    }
  };

  // Get offline stats
  const getOfflineStats = async () => {
    try {
      const queue = pendingReports;
      const pendingReports = queue.filter(item => item.action === 'REPORT_DISEASE').length;
      
      return {
        pendingReports,
        totalPending: queue.length,
        lastSyncTime,
        isOnline,
        isSyncing
      };
    } catch (error) {
      console.error('Error getting offline stats:', error);
      return {
        pendingReports: 0,
        totalPending: 0,
        lastSyncTime: null,
        isOnline,
        isSyncing
      };
    }
  };

  // Context value
  const contextValue = {
    isOnline,
    isSyncing,
    lastSyncTime,
    pendingReports,
    saveIdentificationResult,
    queueDiseaseReport,
    manualSync,
    clearStoredData,
    getOfflineStats,
    addUserActivity,
    syncWithServer
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
}; 