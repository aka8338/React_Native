import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";

/**
 * Reusable Button component with consistent styling
 * 
 * @param {Object} props
 * @param {string} props.title - Button text
 * @param {Function} props.onPress - Button press handler
 * @param {string} props.type - Button type: 'primary', 'secondary', 'danger', 'outline', 'text'
 * @param {string} props.size - Button size: 'small', 'medium', 'large'
 * @param {boolean} props.loading - Whether to show loading state
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.icon - MaterialIcons icon name (if needed)
 * @param {Object} props.style - Additional style to apply
 */
const Button = ({
  title,
  onPress,
  type = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  style,
}) => {
  const getButtonStyle = () => {
    const buttonStyles = [styles.button, styles[`${type}Button`], styles[`${size}Button`]];
    
    if (disabled) {
      buttonStyles.push(styles.disabledButton);
    }
    
    if (style) {
      buttonStyles.push(style);
    }
    
    return buttonStyles;
  };
  
  const getTextStyle = () => {
    const textStyles = [styles.text, styles[`${type}Text`], styles[`${size}Text`]];
    
    if (disabled) {
      textStyles.push(styles.disabledText);
    }
    
    return textStyles;
  };
  
  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="small" color={type === 'primary' ? '#FFFFFF' : '#148F55'} />;
    }
    
    if (icon) {
      return (
        <View style={styles.contentContainer}>
          <MaterialIcons 
            name={icon} 
            size={size === 'small' ? 16 : size === 'medium' ? 20 : 24} 
            color={type === 'primary' ? '#FFFFFF' : 
                   type === 'secondary' ? '#148F55' : 
                   type === 'danger' ? '#FFFFFF' : '#148F55'} 
            style={styles.icon}
          />
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      );
    }
    
    return <Text style={getTextStyle()}>{title}</Text>;
  };
  
  return (
    <TouchableOpacity 
      style={getButtonStyle()} 
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontWeight: '600',
  },
  
  // Button types
  primaryButton: {
    backgroundColor: '#148F55',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  
  secondaryButton: {
    backgroundColor: '#E8F5F0',
  },
  secondaryText: {
    color: '#148F55',
  },
  
  dangerButton: {
    backgroundColor: '#E74C3C',
  },
  dangerText: {
    color: '#FFFFFF',
  },
  
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#148F55',
  },
  outlineText: {
    color: '#148F55',
  },
  
  textButton: {
    backgroundColor: 'transparent',
  },
  textText: {
    color: '#148F55',
  },
  
  // Button sizes
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  smallText: {
    fontSize: 12,
  },
  
  mediumButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  mediumText: {
    fontSize: 14,
  },
  
  largeButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  largeText: {
    fontSize: 16,
  },
  
  // Disabled state
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.8,
  },
});

export default Button; 