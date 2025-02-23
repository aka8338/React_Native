import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Home"); // Navigate to Home after 3 seconds
    }, 3000);

    return () => clearTimeout(timer); // Cleanup the timer
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Welcome to the Sorghum Disease Identifier App!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // Set your desired background color
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default SplashScreen;
