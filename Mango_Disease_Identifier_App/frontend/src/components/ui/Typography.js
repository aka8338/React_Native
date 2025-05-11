import React from 'react';
import { Text, StyleSheet } from 'react-native';

/**
 * Reusable Typography component with consistent text styling
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Text content
 * @param {string} props.variant - Text variant: 'h1', 'h2', 'h3', 'body1', 'body2', 'caption', 'button'
 * @param {string} props.color - Text color: 'primary', 'secondary', 'error', 'white', 'disabled'
 * @param {boolean} props.bold - Whether text should be bold
 * @param {Object} props.style - Additional style to apply
 */
const Typography = ({
  children,
  variant = 'body1',
  color = 'primary',
  bold = false,
  style,
  ...props
}) => {
  const textStyles = [
    styles.text,
    styles[variant],
    styles[`${color}Text`],
    bold && styles.bold,
    style,
  ];
  
  return (
    <Text style={textStyles} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    color: '#333333',
  },
  
  // Text variants
  h1: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: 16,
  },
  
  h2: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 12,
  },
  
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 8,
  },
  
  body1: {
    fontSize: 16,
    lineHeight: 24,
  },
  
  body2: {
    fontSize: 14,
    lineHeight: 20,
  },
  
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  
  button: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Text colors
  primaryText: {
    color: '#333333',
  },
  
  secondaryText: {
    color: '#666666',
  },
  
  errorText: {
    color: '#E74C3C',
  },
  
  whiteText: {
    color: '#FFFFFF',
  },
  
  disabledText: {
    color: '#999999',
  },
  
  // Font weights
  bold: {
    fontWeight: '700',
  },
});

export default Typography; 