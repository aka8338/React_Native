import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SplashScreen = ({ navigation }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    "Welcome to the Sorghum Disease Identifier App!",
    "This app helps you identify diseases in sorghum plants.",
    "Let's get started with the identification process.",
  ];

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      navigation.replace("Home"); // Navigate to Home after the last page
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{pages[currentPage]}</Text>

      {currentPage === pages.length - 1 && (
        <Image
          source={require("../assets/splashscreen_logo.png")}
          style={styles.nextImage}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleBack} disabled={currentPage === 0}>
          <Text style={styles.navigationText}>{"<"}</Text>
        </TouchableOpacity>

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

        <TouchableOpacity onPress={handleNext}>
          <Text style={styles.navigationText}>{">"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  nextImage: {
    width: 100, // Adjust the size as needed
    height: 100, // Adjust height to maintain aspect ratio
    marginTop: 20,
  },
  footer: {
    position: "absolute",
    bottom: 30, // Adjust the distance from the bottom of the screen
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Center the icons and text horizontally
  },
  navigationText: {
    fontSize: 24,
    marginHorizontal: 20,
  },
  pageDot: {
    fontSize: 30,
    marginHorizontal: 5,
    color: "#d3d3d3", // Light color for inactive dots
  },
  activeDot: {
    color: "#000", // Dark color for the active (current) dot
  },
  pageIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // Set your desired background color
  },
  text: {
    textAlign: "center", // Center the text
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default SplashScreen;
