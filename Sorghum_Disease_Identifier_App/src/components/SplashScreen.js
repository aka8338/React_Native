import React, { useEffect, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SplashScreen = ({ navigation }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [colorAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  const pages = [
    {
      image: require("../assets/welcome1.png"),
      text: "Welcome to the Sorghum Disease Identifier App!",
      subText:
        "Capture or upload an image of your sorghum crop to detect diseases and receive treatment advice.",
      caption: "Health Check",
    },
    {
      image: require("../assets/welcome2.png"),
      text: "This app helps you identify diseases in sorghum plants.",
      subText: "Learn how to take proper care of your crops.",
      caption: "",
    },
    {
      image: require("../assets/welcome3.png"),
      text: "",
      subText: "Receive farming advice about how to improve your yield",
      caption: " Cultivation Tips",
    },
  ];

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
      setWordIndex(0);
    } else {
      navigation.navigate("Home");
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
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

  const words = pages[currentPage].text.split(" ");

  const textColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FFD700", "#006400"],
  });

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[styles.text, { opacity: fadeAnim, color: textColor }]}
      >
        {words.slice(0, wordIndex).join(" ")}
      </Animated.Text>

      <Image source={pages[currentPage].image} style={styles.image} />

      {/* Caption Below Image */}
      <Text style={styles.captionText}>{pages[currentPage].caption}</Text>

      <Text style={styles.subText}>{pages[currentPage].subText}</Text>

      {currentPage === 2 && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => navigation.navigate("SignUp")}
          >
            <Text style={styles.signUpText}>Sign up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginText}>Log in</Text>
          </TouchableOpacity>
        </View>
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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
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
    resizeMode: "cover",
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
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  signUpText: {
    color: "#ffffff",
    fontSize: 18,
  },
  loginButton: {
    width: "80%",
    paddingVertical: 12,
    borderColor: "#148F55",
    borderWidth: 2,
    borderRadius: 10,
    alignItems: "center",
  },
  loginText: {
    color: "#148F55",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  navigationText: {
    fontSize: 28,
    color: "#000",
    marginHorizontal: 20,
  },
  pageDot: {
    fontSize: 30,
    marginHorizontal: 5,
    color: "#d3d3d3",
  },
  activeDot: {
    color: "#000",
  },
  pageIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default SplashScreen;
