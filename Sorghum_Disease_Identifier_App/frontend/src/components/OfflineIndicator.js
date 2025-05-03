import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity 
} from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { useOffline } from '../contexts/OfflineContext';
import { useTranslation } from "react-i18next";

const OfflineIndicator = () => {
  const { t } = useTranslation();
  const { isOnline, lastSyncTime, pendingQueue, manualSync } = useOffline();
  const [showDetails, setShowDetails] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  // Format the last synced time
  const formatLastSynced = () => {
    if (!lastSyncTime) return t('offline.neverSynced');
    
    const date = new Date(lastSyncTime);
    return date.toLocaleString();
  };

  // Handle animation when online status changes
  useEffect(() => {
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.delay(2000),
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start();
  }, [isOnline]);

  // Calculate number of pending uploads
  const pendingCount = pendingQueue ? pendingQueue.length : 0;

  // If online and no pending uploads, don't show anything
  if (isOnline && pendingCount === 0 && !showDetails) {
    return null;
  }

  const backgroundColor = isOnline ? '#148F55' : '#dd3333';
  const statusText = isOnline 
    ? t('offline.online') 
    : t('offline.offlineMode');

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.banner,
          { 
            backgroundColor,
            height: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 40],
            }),
            opacity: animation
          }
        ]}
      >
        <Text style={styles.statusText}>{statusText}</Text>
      </Animated.View>

      <TouchableOpacity 
        style={[styles.indicator, { backgroundColor }]}
        onPress={() => setShowDetails(!showDetails)}
      >
        <MaterialIcons 
          name={isOnline ? "wifi" : "wifi-off"} 
          size={16} 
          color="#fff" 
        />
        <Text style={styles.indicatorText}>{statusText}</Text>
      </TouchableOpacity>

      {showDetails && (
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('offline.lastSynced')}:</Text>
            <Text style={styles.detailValue}>{formatLastSynced()}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('offline.pendingUploads')}:</Text>
            <Text style={styles.detailValue}>{pendingCount}</Text>
          </View>

          {isOnline && pendingCount > 0 && (
            <TouchableOpacity 
              style={styles.syncButton} 
              onPress={manualSync}
            >
              <MaterialIcons name="sync" size={16} color="#fff" />
              <Text style={styles.syncButtonText}>{t('offline.syncNow')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80, // Above the footer
    right: 10,
    zIndex: 1000,
  },
  banner: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.3)',
    elevation: 5,
  },
  indicatorText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    width: 220,
    boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.3)',
    elevation: 5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  syncButton: {
    backgroundColor: '#148F55',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
  },
});

export default OfflineIndicator; 