import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { changeLanguage } from "../i18n";
import { NavigationService } from "../navigation";

const SplashScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [colorAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const languages = [
    { code: "en", name: "English", localName: "English" },
    { code: "am", name: "Amharic", localName: "አማርኛ" },
    { code: "or", name: "Oromo", localName: "Afaan Oromoo" },
    { code: "ti", name: "Tigrinya", localName: "ትግርኛ" },
  ];

  const pages = [
    {
      image: require("../assets/welcome1.png"),
      text: t("splash.welcome"),
      subText: t("splash.identifyText"),
      caption: t("splash.healthCheck"),
    },
    {
      image: require("../assets/welcome2.png"),
      text: t("splash.helpText"),
      subText: t("splash.careText"),
      caption: "",
    },
    {
      image: require("../assets/welcome3.png"),
      text: "",
      subText: t("splash.adviceText"),
      caption: t("splash.cultivationTips"),
    },
  ];

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
      setWordIndex(0);
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setShowLanguageModal(false);
  };

  useEffect(() => {
    setWordIndex(0);
    const interval = setInterval(() => {
      setWordIndex((prev) => {
        if (prev < pages[currentPage].text.split(" ").length) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 500);
    return () => clearInterval(interval);
  }, [currentPage]);

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false, // Set to false for opacity animations
    }).start();

    colorAnim.setValue(0);
    Animated.timing(colorAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false, // Set to false for color animations
    }).start();
  }, [currentPage]);

  useEffect(() => {
    return () => {
      // Ensure modal is closed when component unmounts
      setShowLanguageModal(false);
    };
  }, []);

  // Check for pending OTP verification
  useEffect(() => {
    const checkPendingOtp = async () => {
      try {
        // First check if user just logged out - this takes priority
        const fromLogout = await AsyncStorage.getItem("fromLogout");
        if (fromLogout === "true") {
          console.log("SplashScreen: User just logged out, immediately replacing with SignIn");
          // Clear the flag
          await AsyncStorage.removeItem("fromLogout");
          // Use immediate replacement to skip any animations
          navigation.replace("SignIn");
          return;
        }
        
        // Check if user just verified their account
        const justVerified = await AsyncStorage.getItem("justVerified");
        if (justVerified === "true") {
          console.log("SplashScreen: User just verified account, immediately replacing with SignIn");
          // Clear the flag
          await AsyncStorage.removeItem("justVerified");
          // Use immediate replacement for instant transition
          navigation.replace("SignIn");
          return;
        }
        
        // Otherwise check for pending OTP
        const pendingOtpEmail = await AsyncStorage.getItem("pendingOtpEmail");
        const pendingPasswordReset = await AsyncStorage.getItem("pendingPasswordReset");
        if (pendingOtpEmail) {
          console.log(
            "SplashScreen: Found pending OTP verification, immediately replacing with OTP screen"
          );
          // Set a navigation key to force fresh rendering
          const otpParams = pendingPasswordReset === "true" 
            ? { fromPasswordReset: true, email: pendingOtpEmail } 
            : undefined;
          
          // Use immediate replacement for instant transition
          navigation.replace("OTP", otpParams);
          return;
        }
      } catch (error) {
        console.error("SplashScreen: Error checking pending OTP:", error);
      }
    };
    
    // Run this check immediately on mount with minimal delay
    checkPendingOtp();
  }, [navigation]);

  const words = pages[currentPage].text.split(" ");

  const textColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FFD700", "#006400"],
  });

  const renderLanguageItem = ({ item }) => (
    <TouchableOpacity
      style={styles.languageItem}
      onPress={() => handleLanguageChange(item.code)}
    >
      <Text
        style={[
          styles.languageItemText,
          i18n.language === item.code && styles.selectedLanguageText,
        ]}
      >
        {item.localName}
      </Text>
      {i18n.language === item.code && (
        <MaterialIcons name="check" size={18} color="#148F55" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Language Switcher */}
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => setShowLanguageModal(true)}
      >
        <MaterialIcons name="language" size={24} color="#148F55" />
        <Text style={styles.languageButtonText}>
          {languages.find((lang) => lang.code === i18n.language)?.localName ||
            "Language"}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color="#148F55" />
      </TouchableOpacity>

      {/* Language Selection Modal - only show when modal is visible to avoid DOM issues */}
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

      <Animated.Text
        style={[styles.text, { opacity: fadeAnim, color: textColor }]}
      >
        {words.slice(0, wordIndex).join(" ")}
      </Animated.Text>

      <Image
        source={pages[currentPage].image}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Caption Below Image */}
      <Text style={styles.captionText}>{pages[currentPage].caption}</Text>

      <Text style={styles.subText}>{pages[currentPage].subText}</Text>

      {currentPage === 2 && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => navigation.navigate("SignUp")}
          >
            <Text style={styles.signUpText}>{t("auth.signUp")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("SignIn")}
          >
            <Text style={styles.loginText}>{t("auth.login")}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer}>
        {currentPage > 0 && (
          <TouchableOpacity onPress={handleBack}>
            <Text style={styles.navigationText}>{t("splash.back")}</Text>
          </TouchableOpacity>
        )}
        {currentPage === 0 && <View style={{ width: 28 }} />}

        <View style={styles.pageIndicatorContainer}>
          {pages.map((_, index) => (
            <Text
              key={index}
              style={[
                styles.pageDot,
                currentPage === index ? styles.activeDot : null,
              ]}
            >
              •
            </Text>
          ))}
        </View>

        {currentPage < pages.length - 1 && (
          <TouchableOpacity onPress={handleNext}>
            <Text style={styles.navigationText}>{t("splash.next")}</Text>
          </TouchableOpacity>
        )}
        {currentPage === pages.length - 1 && <View style={{ width: 28 }} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
  },
  languageButton: {
    position: "absolute",
    top: 40,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  languageButtonText: {
    color: "#148F55",
    marginLeft: 5,
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  languageModalContainer: {
    position: "absolute",
    top: 90,
    right: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 5,
    elevation: 5,
    boxShadow: "0px 2px 3.84px rgba(0, 0, 0, 0.25)",
  },
  languageItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    minWidth: 150,
  },
  languageItemText: {
    fontSize: 16,
    color: "#333",
    marginRight: 10,
  },
  selectedLanguageText: {
    color: "#148F55",
    fontWeight: "bold",
  },
  text: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#006400",
    lineHeight: 30,
  },
  subText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
    color: "#666",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  captionText: {
    textAlign: "center",
    fontSize: 20,
    color: "#006400",
    fontStyle: "bold",
    marginTop: 10,
  },
  image: {
    width: 300,
    height: 300,
  },
  buttonContainer: {
    marginTop: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 40,
  },
  signUpButton: {
    width: "80%",
    paddingVertical: 12,
    backgroundColor: "#148F55",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  signUpText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginButton: {
    width: "80%",
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#148F55",
    borderRadius: 8,
    alignItems: "center",
  },
  loginText: {
    color: "#148F55",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    position: "absolute",
    bottom: 20,
    paddingHorizontal: 20,
  },
  pageIndicatorContainer: {
    flexDirection: "row",
  },
  pageDot: {
    fontSize: 30,
    color: "#D3D3D3",
    marginHorizontal: 5,
  },
  activeDot: {
    color: "#148F55",
  },
  navigationText: {
    fontSize: 16,
    color: "#148F55",
    fontWeight: "bold",
  },
});

export default SplashScreen;
