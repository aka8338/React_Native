import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Footer from "../components/Footer";
import WeatherReport from "../components/TemperatureDisplay";

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Weather report is now at the top */}
      <WeatherReport />

      {/* Heading below the weather report */}
      <Text style={styles.heading}>
        Welcome to the Disease Identification App!
      </Text>

      {/* Footer at the bottom */}
      <Footer navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start", // Start content from the top
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
