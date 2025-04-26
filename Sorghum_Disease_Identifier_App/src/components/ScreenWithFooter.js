import React from 'react';
import { View, StyleSheet } from 'react-native';
import Footer from './Footer';

/**
 * A wrapper component that adds the footer navigation to any screen
 * @param {Object} props.children - The screen content to display
 * @param {Object} props.navigation - The navigation object from the screen
 */
const ScreenWithFooter = ({ children, navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
      
      {/* Footer navigation that appears on all screens */}
      <Footer navigation={navigation} />
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
    paddingBottom: 70, // Add padding at the bottom to account for the footer
  },
});

export default ScreenWithFooter; 