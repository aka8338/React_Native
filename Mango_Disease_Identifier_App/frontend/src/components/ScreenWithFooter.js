import React from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import OfflineIndicator from './OfflineIndicator';

/**
 * A wrapper component that adds the offline indicator to any screen
 * @param {Object} props.children - The screen content to display
 * @param {Object} props.navigation - The navigation object from the screen
 */
const ScreenWithFooter = ({ children, navigation }) => {
  return (
    <View style={styles.container}>
      {/* Status bar space padding */}
      <View style={styles.statusBarSpace} />
      
      <View style={styles.content}>
        {children}
      </View>
      
      {/* Offline status indicator */}
      <OfflineIndicator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  statusBarSpace: {
    height: Platform.OS === 'ios' ? 50 : 30,
    backgroundColor: '#148F55',
  },
  content: {
    flex: 1,
    paddingBottom: 60, // Add padding at the bottom to account for the tab navigator
  },
});

export default ScreenWithFooter; 