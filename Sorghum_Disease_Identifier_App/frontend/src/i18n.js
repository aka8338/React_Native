import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import am from "./locales/am.json";
import or from "./locales/or.json";
import ti from "./locales/ti.json";
import { I18nManager } from "react-native";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en
    },
    am: {
      translation: am
    },
    or: {
      translation: or
    },
    ti: {
      translation: ti
    }
  },
  lng: "am", // Changed default language to Amharic
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
});

// Function to change language
export const changeLanguage = (lng) => {
  i18n.changeLanguage(lng);
  
  // Handle RTL for Amharic if needed
  if (lng === 'am') {
    if (!I18nManager.isRTL) {
      // Amharic is not RTL, but if you need to add RTL support for another language
      // you could set I18nManager.forceRTL(true) here
    }
  } else {
    if (I18nManager.isRTL) {
      // Reset to LTR for English and other LTR languages
      // I18nManager.forceRTL(false);
    }
  }
};

export default i18n;
