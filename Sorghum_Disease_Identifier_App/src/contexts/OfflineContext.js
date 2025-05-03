import React, { createContext, useState, useContext, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Create the context
const OfflineContext = createContext();

// Custom hook to use the offline context
export const useOffline = () => useContext(OfflineContext);

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingQueue, setPendingQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Initialize and setup network status listener
  useEffect(() => {
    // Load initial pending queue from storage
    loadPendingQueue();
    loadLastSyncTime();

    // Subscribe to network info
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      const wasOffline = !isOnline;
      setIsOnline(online);
      
      // If we just came back online, try to sync
      if (online && wasOffline && pendingQueue.length > 0) {
        syncWithServer();
      }
    });

    // Initial check
    NetInfo.fetch().then(state => {
      setIsOnline(state.isConnected && state.isInternetReachable);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [pendingQueue, isOnline]);

  // Load pending queue from AsyncStorage
  const loadPendingQueue = async () => {
    try {
      const queueData = await AsyncStorage.getItem('pendingQueue');
      if (queueData) {
        setPendingQueue(JSON.parse(queueData));
      }
    } catch (error) {
      console.error('Error loading pending queue:', error);
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

  // Save pending queue to AsyncStorage
  const savePendingQueue = async (queue) => {
    try {
      await AsyncStorage.setItem('pendingQueue', JSON.stringify(queue));
      setPendingQueue(queue);
    } catch (error) {
      console.error('Error saving pending queue:', error);
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

  // Add an item to the queue
  const addToQueue = async (action, data) => {
    const queueItem = {
      id: Date.now().toString(),
      action,
      data,
      timestamp: new Date().toISOString(),
    };

    const newQueue = [...pendingQueue, queueItem];
    await savePendingQueue(newQueue);

    // If online, try to sync immediately
    if (isOnline) {
      syncWithServer();
    }

    return queueItem;
  };

  // Remove an item from the queue
  const removeFromQueue = async (id) => {
    const newQueue = pendingQueue.filter(item => item.id !== id);
    await savePendingQueue(newQueue);
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

  // Queue disease report to be sent when online
  const queueDiseaseReport = async (report) => {
    try {
      // Always save locally first
      const existingReports = await AsyncStorage.getItem('diseaseReports');
      let reports = [];
      
      if (existingReports) {
        reports = JSON.parse(existingReports);
      }
      
      // Add unique ID and timestamp if not present
      const newReport = {
        ...report,
        id: report.id || Date.now().toString(),
        timestamp: report.timestamp || new Date().toISOString(),
        synced: isOnline, // Mark as synced if online
      };
      
      reports.push(newReport);
      await AsyncStorage.setItem('diseaseReports', JSON.stringify(reports));

      // Also add to user activity
      await addUserActivity({
        type: 'report',
        description: `Reported ${report.diseaseName} disease with ${report.severity} severity`,
        date: new Date().toISOString(),
        data: newReport
      });
      
      // If offline, add to queue for later sync
      if (!isOnline) {
        await addToQueue('REPORT_DISEASE', newReport);
        return { ...newReport, queued: true };
      }
      
      // If online, try to send immediately (this would be an API call in a real app)
      // For this demo, we'll just mark it as synced
      return { ...newReport, synced: true };
    } catch (error) {
      console.error('Error queueing disease report:', error);
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

  // Sync with server (simulated for this demo)
  const syncWithServer = async () => {
    if (!isOnline || pendingQueue.length === 0 || isSyncing) {
      return;
    }

    setIsSyncing(true);

    try {
      // Process each item in the queue
      const successfulIds = [];
      const failedItems = [];

      for (const item of pendingQueue) {
        try {
          // Simulate API call based on action type
          switch (item.action) {
            case 'REPORT_DISEASE':
              // In a real app, this would be an API call
              // For demo, we'll simulate a successful sync
              await new Promise(resolve => setTimeout(resolve, 500));
              
              // Mark the report as synced in local storage
              await updateReportSyncStatus(item.data.id, true);
              
              successfulIds.push(item.id);
              break;
              
            default:
              console.warn(`Unknown action type: ${item.action}`);
              failedItems.push(item);
          }
        } catch (error) {
          console.error(`Error processing queue item ${item.id}:`, error);
          failedItems.push(item);
        }
      }

      // Remove successful items from the queue
      const newQueue = pendingQueue.filter(item => !successfulIds.includes(item.id));
      await savePendingQueue(newQueue);

      // Update last sync time
      const now = new Date().toISOString();
      await saveLastSyncTime(now);

      // Notify user of sync results if there were any
      if (successfulIds.length > 0) {
        console.log(`Successfully synced ${successfulIds.length} items`);
      }

      if (failedItems.length > 0) {
        console.warn(`Failed to sync ${failedItems.length} items`);
      }
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Update a report's sync status
  const updateReportSyncStatus = async (reportId, synced) => {
    try {
      const reportsData = await AsyncStorage.getItem('diseaseReports');
      if (reportsData) {
        const reports = JSON.parse(reportsData);
        const updatedReports = reports.map(report => 
          report.id === reportId ? { ...report, synced } : report
        );
        await AsyncStorage.setItem('diseaseReports', JSON.stringify(updatedReports));
      }
    } catch (error) {
      console.error('Error updating report sync status:', error);
    }
  };

  // Manually trigger sync
  const manualSync = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'You are currently offline. Please connect to the internet and try again.');
      return;
    }

    if (pendingQueue.length === 0) {
      Alert.alert('No Data to Sync', 'There are no pending items to sync.');
      return;
    }

    await syncWithServer();
  };

  // Clear all stored data (for testing/debugging)
  const clearStoredData = async () => {
    try {
      await AsyncStorage.multiRemove([
        'pendingQueue',
        'identificationResults',
        'diseaseReports',
        'lastSyncTime',
        'userActivity'
      ]);
      setPendingQueue([]);
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
      const queue = pendingQueue;
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
    pendingQueue,
    saveIdentificationResult,
    queueDiseaseReport,
    manualSync,
    clearStoredData,
    getOfflineStats,
    addUserActivity,
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
}; 