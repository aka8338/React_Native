import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../i18n";
import { MaterialIcons } from "@expo/vector-icons";

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  useEffect(() => {
    setSelectedLanguage(i18n.language);
  }, [i18n.language]);

  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "am", name: "Amharic", nativeName: "አማርኛ" },
    { code: "or", name: "Oromo", nativeName: "Afaan Oromoo" },
    { code: "ti", name: "Tigrinya", nativeName: "ትግርኛ" }
  ];

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    setSelectedLanguage(languageCode);
    setModalVisible(false);
  };

  const getLanguageDisplay = (code) => {
    switch(code) {
      case 'en': return 'English';
      case 'am': return 'አማርኛ';
      case 'or': return 'Oromoo';
      case 'ti': return 'ትግርኛ';
      default: return code.toUpperCase();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="language" size={20} color="#fff" />
        <Text style={styles.buttonText}>
          {getLanguageDisplay(selectedLanguage)}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={20} color="#fff" />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.languageSelector}>
                <Text style={styles.modalTitle}>{t("profile.language")}</Text>
                {languages.map((language) => (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      styles.languageOption,
                      selectedLanguage === language.code &&
                        styles.selectedLanguage,
                    ]}
                    onPress={() => handleLanguageChange(language.code)}
                  >
                    <Text
                      style={[
                        styles.languageText,
                        selectedLanguage === language.code &&
                          styles.selectedLanguageText,
                      ]}
                    >
                      {language.nativeName}
                    </Text>
                    {selectedLanguage === language.code && (
                      <MaterialIcons
                        name="check"
                        size={20}
                        color="#148F55"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#148F55",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  buttonText: {
    color: "#fff",
    marginHorizontal: 5,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  languageSelector: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  selectedLanguage: {
    backgroundColor: "#F0FFF4",
  },
  languageText: {
    fontSize: 16,
  },
  selectedLanguageText: {
    color: "#148F55",
    fontWeight: "bold",
  },
});

export default LanguageSwitcher; 