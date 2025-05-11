import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme definitions
export const themes = {
  light: {
    id: 'light',
    backgroundColor: '#FFFFFF',
    backgroundColorSecondary: '#F5F5F5',
    textColor: '#333333',
    textColorSecondary: '#666666',
    primaryColor: '#148F55',
    primaryColorLight: '#E8F5F0',
    accentColor: '#F9A826',
    dangerColor: '#E74C3C',
    cardColor: '#FFFFFF',
    dividerColor: '#EEEEEE',
    statusBarStyle: 'dark-content',
  },
  dark: {
    id: 'dark',
    backgroundColor: '#121212',
    backgroundColorSecondary: '#1E1E1E',
    textColor: '#F5F5F5',
    textColorSecondary: '#AAAAAA',
    primaryColor: '#2AAB70',
    primaryColorLight: '#1E3B2E',
    accentColor: '#F9A826',
    dangerColor: '#E74C3C',
    cardColor: '#2A2A2A',
    dividerColor: '#333333',
    statusBarStyle: 'light-content',
  },
};

// Create the context
const ThemeContext = createContext();

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [currentThemeMode, setCurrentThemeMode] = useState('light');
  const [theme, setTheme] = useState(themes.light);
  const [isLoading, setIsLoading] = useState(true);

  // Load the saved theme mode on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem('themeMode');
        if (savedThemeMode && (savedThemeMode === 'dark' || savedThemeMode === 'light')) {
          setCurrentThemeMode(savedThemeMode);
          setTheme(themes[savedThemeMode]);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Toggle between light and dark theme
  const toggleTheme = async () => {
    const newThemeMode = currentThemeMode === 'light' ? 'dark' : 'light';
    setCurrentThemeMode(newThemeMode);
    setTheme(themes[newThemeMode]);
    
    try {
      await AsyncStorage.setItem('themeMode', newThemeMode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Set a specific theme
  const changeThemeMode = async (mode) => {
    if (mode !== 'light' && mode !== 'dark') return;
    
    setCurrentThemeMode(mode);
    setTheme(themes[mode]);
    
    try {
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const contextValue = {
    theme,
    themeMode: currentThemeMode,
    toggleTheme,
    changeThemeMode,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 