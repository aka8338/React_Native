import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import Footer from "../components/Footer";

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Welcome to the Disease Identification App!
      </Text>

      <Button
        title="Start Identification"
        onPress={() => navigation.navigate("Identification")}
        style={styles.button}
      />

      <Footer navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center", // Vertically center the content
  },
  heading: {
    fontSize: 20,
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
});

export default HomeScreen;
