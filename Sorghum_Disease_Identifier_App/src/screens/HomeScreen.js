import React from "react";
import { Button, Text, View } from "react-native";

const HomeScreen = ({ navigation }) => {
  return (
    <View>
      <Text>Welcome to the Disease Identification App!</Text>
      <Button
        title="Start Identification"
        onPress={() => navigation.navigate("Identification")}
      />
    </View>
  );
};

export default HomeScreen;
