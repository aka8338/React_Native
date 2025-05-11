import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SplashScreen from "../components/SplashScreen";
import { useAuth } from "../contexts/AuthContext";
import DiseaseReportScreen from "../screens/DiseaseReportScreen";
import HomeScreen from "../screens/HomeScreen";
import IdentificationScreen from "../screens/IdentificationScreen";
import MangoDiseasesScreen from "../screens/MangoDiseasesScreen";
import OTPScreen from "../screens/OTPScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ReportsScreen from "../screens/ReportsScreen";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Separate stacks for authenticated and unauthenticated users
const AuthStack = () => {
  // Get pending OTP email to determine if we should show OTP screen
  const [initialRoute, setInitialRoute] = useState("Splash");

  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        const pendingOtpEmail = await AsyncStorage.getItem("pendingOtpEmail");
        console.log("AuthStack: Checking for pending OTP verification");

        if (pendingOtpEmail) {
          console.log(
            "AuthStack: Found pending OTP verification, setting initial route to OTP"
          );
          setInitialRoute("OTP");
        } else {
          console.log("AuthStack: No pending OTP, using default Splash screen");
        }
      } catch (error) {
        console.error("AuthStack: Error checking navigation state:", error);
      }
    };

    checkInitialRoute();
  }, []);

  // Force re-render when initialRoute changes
  const [key, setKey] = useState(0);
  useEffect(() => {
    setKey((prev) => prev + 1);
  }, [initialRoute]);

  return (
    <Stack.Navigator
      key={`auth-stack-${key}`}
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
    </Stack.Navigator>
  );
};

// Bottom Tab Navigation
const TabNavigator = () => {
  // Add translation hook
  const { t, i18n } = require("react-i18next").useTranslation();
  const { language } = require("../contexts/LanguageContext").useLanguage();
  const [currentLanguage, setCurrentLanguage] = useState(language);

  // Create a more direct link to language changes for better reactivity
  useEffect(() => {
    if (currentLanguage !== language) {
      setCurrentLanguage(language);
    }
  }, [language]);

  // Dynamically get labels directly from translations each time
  // This is more reliable across language changes
  const getLabel = (key) => {
    switch (key) {
      case "home":
        return t("general.home");
      case "identify":
        return t("identification.identify");
      case "diseases":
        return t("diseases.diseases");
      case "reports":
        return t("reports.diseaseReports");
      case "profile":
        return t("profile.myProfile");
      default:
        return key;
    }
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#148F55",
        tabBarInactiveTintColor: "#6D6D6D",
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: getLabel("home"),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
        }}
        key={`home-tab-${currentLanguage}`}
      />
      <Tab.Screen
        name="IdentificationTab"
        component={IdentificationScreen}
        options={{
          tabBarLabel: getLabel("identify"),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="search" color={color} size={size} />
          ),
        }}
        key={`identify-tab-${currentLanguage}`}
      />
      <Tab.Screen
        name="DiseasesTab"
        component={MangoDiseasesScreen}
        options={{
          tabBarLabel: getLabel("diseases"),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bug-report" color={color} size={size} />
          ),
        }}
        key={`diseases-tab-${currentLanguage}`}
      />
      <Tab.Screen
        name="ReportsTab"
        component={ReportsScreen}
        options={{
          tabBarLabel: getLabel("reports"),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bar-chart" color={color} size={size} />
          ),
        }}
        key={`reports-tab-${currentLanguage}`}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: getLabel("profile"),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={color} size={size} />
          ),
        }}
        key={`profile-tab-${currentLanguage}`}
      />
    </Tab.Navigator>
  );
};

const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="TabHome" component={TabNavigator} />
      <Stack.Screen name="Identification" component={IdentificationScreen} />
      <Stack.Screen name="Mango Disease" component={MangoDiseasesScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="DiseaseReport" component={DiseaseReportScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator = ({ initialRouteName = "Splash" }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigationRef = useRef(null);

  console.log(
    "AppNavigator initializing - isAuthenticated:",
    isAuthenticated,
    "initialRouteName:",
    initialRouteName
  );

  // Check for pending OTP - this is critical to avoid splash screen
  const [hasPendingOtp, setHasPendingOtp] = useState(false);

  useEffect(() => {
    const checkOtpStatus = async () => {
      try {
        const pendingOtpEmail = await AsyncStorage.getItem("pendingOtpEmail");
        setHasPendingOtp(!!pendingOtpEmail);
      } catch (error) {
        console.error("Error checking OTP status:", error);
      }
    };

    checkOtpStatus();
  }, []);

  // Initial determination of which stack to show
  let startStack = "Auth";

  if (isAuthenticated === true) {
    console.log("AppNavigator: User is authenticated, using Main stack");
    startStack = "Main";
  } else {
    console.log("AppNavigator: User is not authenticated, using Auth stack");
    startStack = "Auth";
  }

  if (isLoading) {
    // If still loading auth state, return empty container
    return (
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={navigationRef}
        documentTitle={{
          formatter: (options, route) =>
            options?.title ?? route?.name ?? "Sorghum Disease Identifier",
        }}
      >
        <Stack.Navigator
          initialRouteName={startStack}
          screenOptions={{
            headerShown: false,
            presentation: "card",
            animationEnabled: true,
          }}
        >
          <Stack.Screen name="Auth" component={AuthStack} />
          <Stack.Screen name="Main" component={MainStack} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;
