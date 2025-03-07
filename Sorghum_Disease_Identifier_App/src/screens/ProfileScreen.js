import React, { useState } from "react";

import { useTranslation } from "react-i18next";

import { useNavigation } from "@react-navigation/native";

import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Avatar } from "react-native-paper";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const ProfileScreen = () => {
  const navigation = useNavigation();

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
    <View style={styles.container}>
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

          <Text style={styles.menuText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="headset" size={24} color="#555" />

          <Text style={styles.menuText}>Help</Text>
        </TouchableOpacity>

        {/* Language Selection Section with Transition */}

        <View style={styles.languageSelection}>
          <Text style={styles.languageLabel}>Language:</Text>

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
              EN
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
              AMH
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="cog" size={24} color="#555" />

          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
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
    textAlign: "center",
    marginTop: 5,
  },
  menu: {
    marginHorizontal: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  menuText: {
    marginLeft: 15,
    fontSize: 16,
  },
  languageSelection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  languageLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#148F55",
    marginHorizontal: 5,
  },
  activeLanguage: {
    backgroundColor: "#148F55",
    color: "red",
    fontSize: 16,
  },
  logoutButton: {
    alignSelf: "center",
    marginTop: 20,
  },
  logoutText: {
    color: "red",
    fontSize: 16,
  },
});

export default ProfileScreen;
