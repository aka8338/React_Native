import React from 'react';
import { View, StyleSheet } from 'react-native';
import OfflineIndicator from './OfflineIndicator';

/**
 * A wrapper component that adds the offline indicator to any screen
 * @param {Object} props.children - The screen content to display
 * @param {Object} props.navigation - The navigation object from the screen
 */
const ScreenWithFooter = ({ children, navigation }) => {
  return (
    <View style={styles.container}>
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
  content: {
    flex: 1,
    paddingBottom: 60, // Add padding at the bottom to account for the tab navigator
  },
});

export default ScreenWithFooter; 