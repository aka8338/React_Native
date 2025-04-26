import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import SplashScreen from "../components/SplashScreen";
import HomeScreen from "../screens/HomeScreen";
import IdentificationScreen from "../screens/IdentificationScreen";
import OTPScreen from "../screens/OTPScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false // Hide header on all screens
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />
        <Stack.Screen name="Signin" component={SignInScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Identification" component={IdentificationScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
