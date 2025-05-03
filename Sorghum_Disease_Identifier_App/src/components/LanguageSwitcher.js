import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useLanguage, LANGUAGES } from '../contexts/LanguageContext';

const LanguageSwitcher = ({ style }) => {
  const { t, i18n } = useTranslation();
  const { language, changeLanguage, getLanguageLabel } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Add cleanup on component unmount to avoid DOM issues
  useEffect(() => {
    return () => {
      // Ensure modal is closed when component unmounts
      setShowLanguageModal(false);
    };
  }, []);

  const languages = [
    { code: LANGUAGES.ENGLISH, name: 'English', localName: 'English' },
    { code: LANGUAGES.AMHARIC, name: 'Amharic', localName: 'አማርኛ' },
    { code: LANGUAGES.OROMO, name: 'Oromo', localName: 'Afaan Oromoo' },
    { code: LANGUAGES.TIGRINYA, name: 'Tigrinya', localName: 'ትግርኛ' },
  ];

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setShowLanguageModal(false);
  };

  const renderLanguageItem = ({ item }) => (
    <TouchableOpacity
      style={styles.languageItem}
      onPress={() => handleLanguageChange(item.code)}
    >
      <Text
        style={[
          styles.languageItemText,
          language === item.code && styles.selectedLanguageText,
        ]}
      >
        {item.localName}
      </Text>
      {language === item.code && (
        <MaterialIcons name="check" size={18} color="#148F55" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => setShowLanguageModal(true)}
      >
        <MaterialIcons name="language" size={20} color="#148F55" />
        <Text style={styles.languageButtonText}>
          {languages.find((lang) => lang.code === language)?.localName ||
            t('profile.language')}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={20} color="#148F55" />
      </TouchableOpacity>

      {/* Only render Modal when it's visible */}
      {showLanguageModal && (
        <Modal
          transparent={true}
          visible={showLanguageModal}
          animationType="fade"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowLanguageModal(false)}
          >
            <View style={styles.languageModalContainer}>
              <FlatList
                data={languages}
                renderItem={renderLanguageItem}
                keyExtractor={(item) => item.code}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  languageButtonText: {
    color: '#148F55',
    marginLeft: 5,
    marginRight: 2,
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  languageModalContainer: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5,
    elevation: 5,
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
  },
  languageItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    minWidth: 150,
  },
  languageItemText: {
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  selectedLanguageText: {
    color: '#148F55',
    fontWeight: 'bold',
  },
});

export default LanguageSwitcher; 