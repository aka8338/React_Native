import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { Avatar } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ScreenWithFooter from "../components/ScreenWithFooter";

const ProfileScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(
    i18n.language || "en"
  );
  const opacity = new Animated.Value(1); // Set initial opacity to 1

  // ✅ Define user details
  const [user, setUser] = useState({
    name: "Aklilu Beyero", // Replace with dynamic data if needed
    email: "aklilubeyero@gmail.com",
    avatar: "https://robohash.org/mail@ashallendesign.co.uk",
  });

  const changeLanguage = (lng) => {
    Animated.timing(opacity, {
      toValue: 0, // Fade out old content
      duration: 300,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start(() => {
      i18n.changeLanguage(lng);
      setSelectedLanguage(lng);
      Animated.timing(opacity, {
        toValue: 1, // Fade in new content
        duration: 300,
        useNativeDriver: true,
        easing: Easing.ease,
      }).start();
    });
  };

  return (
    <ScreenWithFooter navigation={navigation}>
      <ScrollView style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Icon name="bell-outline" size={24} color="white" />
        </View>

        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Avatar.Image size={100} source={{ uri: user.avatar }} />
          {/* ✅ Display User's Name */}
          <Animated.Text style={[styles.name, { opacity }]}>
            {user.name}
          </Animated.Text>
          {/* ✅ Display User's Email */}
          <Animated.Text style={[styles.email, { opacity }]}>
            {user.email}
          </Animated.Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              navigation.navigate("EditProfile", {
                user,
              })
            }
          >
            <Icon name="account-edit" size={24} color="#555" />
            <Text style={styles.menuText}>{t("profile.editProfile")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Icon name="headset" size={24} color="#555" />
            <Text style={styles.menuText}>{t("profile.help")}</Text>
          </TouchableOpacity>

          {/* Language Selection Section with Transition */}
          <View style={styles.languageSelection}>
            <Text style={styles.languageLabel}>{t("profile.languageLabel")}</Text>
            <View style={styles.languageButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  selectedLanguage === "en" && styles.activeLanguage,
                ]}
                onPress={() => changeLanguage("en")}
              >
                <Text
                  style={[
                    styles.languageText,
                    selectedLanguage === "en" && styles.boldText,
                  ]}
                >
                  {t("profile.english")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.languageButton,
                  selectedLanguage === "am" && styles.activeLanguage,
                ]}
                onPress={() => changeLanguage("am")}
              >
                <Text
                  style={[
                    styles.languageText,
                    selectedLanguage === "am" && styles.boldText,
                  ]}
                >
                  {t("profile.amharic")}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  selectedLanguage === "or" && styles.activeLanguage,
                ]}
                onPress={() => changeLanguage("or")}
              >
                <Text
                  style={[
                    styles.languageText,
                    selectedLanguage === "or" && styles.boldText,
                  ]}
                >
                  {t("profile.oromo")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.menuItem}>
            <Icon name="cog" size={24} color="#555" />
            <Text style={styles.menuText}>{t("profile.settings")}</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>{t("profile.logout")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWithFooter>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    height: 80,
    backgroundColor: "#148F55",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  profileContainer: {
    alignItems: "center",
    marginVertical: 20,
    justifyContent: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
  email: {
    fontSize: 14,
    color: "gray",
    marginTop: 5,
  },
  menu: {
    backgroundColor: "white",
    borderRadius: 10,
    marginHorizontal: 20,
    paddingVertical: 10,
    marginTop: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: "#333",
  },
  languageSelection: {
    flexDirection: "column",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  languageLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  languageButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  languageButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 8,
    borderRadius: 20,
  },
  activeLanguage: {
    backgroundColor: "#e8f4f0",
  },
  languageText: {
    fontSize: 14,
    color: "#555",
  },
  boldText: {
    fontWeight: "bold",
    color: "#148F55",
  },
  logoutButton: {
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: "#FF6B6B",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 30,
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
