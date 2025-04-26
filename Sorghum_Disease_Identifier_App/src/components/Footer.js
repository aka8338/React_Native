import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

const Footer = ({ navigation }) => {
  const { t } = useTranslation();
  
  return (
    <View style={styles.footerContainer}>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate("Home")}
        >
          <MaterialIcons name="home" size={24} color="black" />
          <Text style={styles.iconText}>{t("general.home")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate("Identification")}
        >
          <MaterialIcons name="camera-alt" size={24} color="black" />
          <Text style={styles.iconText}>{t("general.identification")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate("Sorghum Disease")}
        >
          <MaterialIcons name="coronavirus" size={24} color="black" />
          <Text style={styles.iconText}>{t("general.sorghumDisease")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate("Profile")}
        >
          <MaterialIcons name="person" size={24} color="black" />
          <Text style={styles.iconText}>{t("general.profile")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 70,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    backgroundColor: "#fff",
  },
  iconContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  iconText: {
    fontSize: 12,
    marginTop: 4,
    color: "black",
  },
});

export default Footer;
