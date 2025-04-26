import React from "react";
import { StyleSheet, View } from "react-native";
import WeatherReport from "../components/TemperatureDisplay";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import ScreenWithFooter from "../components/ScreenWithFooter";

const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  
  return (
    <ScreenWithFooter navigation={navigation}>
      <View style={styles.container}>
        {/* Language switcher in the top right corner */}
        <View style={styles.languageSwitcherContainer}>
          <LanguageSwitcher />
        </View>
        
        {/* Weather report */}
        <WeatherReport />
      </View>
    </ScreenWithFooter>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start", // Start content from the top
  },
  languageSwitcherContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10, // Ensure it's above other elements
  },
  heading: {
    fontSize: 20,
    marginTop: 20, // Optional margin between weather report and heading
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
});

export default HomeScreen;
