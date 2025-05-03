import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';

// Available languages
export const LANGUAGES = {
  ENGLISH: 'en',
  AMHARIC: 'am',
  OROMO: 'or',
  TIGRINYA: 'ti'
};

// Create the context
const LanguageContext = createContext();

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(LANGUAGES.ENGLISH);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language on mount
  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('appLanguage');
        if (savedLanguage && Object.values(LANGUAGES).includes(savedLanguage)) {
          setCurrentLanguage(savedLanguage);
          await changeLanguage(savedLanguage, false); // Don't save again
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedLanguage();
  }, []);

  // Change the app language
  const changeLanguage = async (languageCode, shouldSave = true) => {
    if (!Object.values(LANGUAGES).includes(languageCode)) {
      return;
    }
    
    try {
      // Change i18n instance language
      await i18n.changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      
      // Save to AsyncStorage if needed
      if (shouldSave) {
        await AsyncStorage.setItem('appLanguage', languageCode);
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // Get language display name
  const getLanguageLabel = (code) => {
    switch (code) {
      case LANGUAGES.ENGLISH:
        return 'English';
      case LANGUAGES.AMHARIC:
        return 'አማርኛ';
      case LANGUAGES.OROMO:
        return 'Afaan Oromoo';
      case LANGUAGES.TIGRINYA:
        return 'ትግርኛ';
      default:
        return 'English';
    }
  };

  const contextValue = {
    language: currentLanguage,
    changeLanguage,
    isLoading,
    getLanguageLabel,
    LANGUAGES
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext; 