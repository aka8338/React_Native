import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * Reusable Card component with consistent styling
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {Function} props.onPress - Optional press handler for the card
 * @param {string} props.variant - Card variant: 'default', 'elevated', 'outlined'
 * @param {Object} props.style - Additional style to apply
 */
const Card = ({
  children,
  onPress,
  variant = 'default',
  style,
}) => {
  const cardStyles = [
    styles.card,
    styles[`${variant}Card`],
    style,
  ];
  
  const CardComponent = onPress ? TouchableOpacity : View;
  const cardProps = onPress ? { onPress, activeOpacity: 0.7 } : {};
  
  return (
    <CardComponent style={cardStyles} {...cardProps}>
      {children}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  
  // Card variants
  defaultCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  elevatedCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  
  outlinedCard: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: 'transparent',
    elevation: 0,
  },
});

export default Card; 