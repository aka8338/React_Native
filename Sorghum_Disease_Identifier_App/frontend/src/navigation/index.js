import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useEffect, useRef, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from "../components/SplashScreen";
import HomeScreen from "../screens/HomeScreen";
import IdentificationScreen from "../screens/IdentificationScreen";
import MangoDiseasesScreen from "../screens/MangoDiseasesScreen";
import OTPScreen from "../screens/OTPScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import DiseaseReportScreen from "../screens/DiseaseReportScreen";
import ReportsScreen from "../screens/ReportsScreen";
import { useAuth } from "../contexts/AuthContext";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Separate stacks for authenticated and unauthenticated users
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="Signin" component={SignInScreen} />
    </Stack.Navigator>
  );
};

// Bottom Tab Navigation
const TabNavigator = () => {
  // Add translation hook
  const { t, i18n } = require('react-i18next').useTranslation();
  const { language } = require('../contexts/LanguageContext').useLanguage();
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
    switch(key) {
      case 'home':
        return t("general.home");
      case 'identify':
        return t("identification.identify");
      case 'diseases':
        return t("diseases.diseases");
      case 'reports':
        return t("reports.diseaseReports");
      case 'profile':
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
        }
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{
          tabBarLabel: getLabel('home'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          )
        }}
        key={`home-tab-${currentLanguage}`}
      />
      <Tab.Screen 
        name="IdentificationTab" 
        component={IdentificationScreen} 
        options={{
          tabBarLabel: getLabel('identify'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="search" color={color} size={size} />
          )
        }}
        key={`identify-tab-${currentLanguage}`}
      />
      <Tab.Screen 
        name="DiseasesTab" 
        component={MangoDiseasesScreen}
        options={{
          tabBarLabel: getLabel('diseases'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bug-report" color={color} size={size} />
          )
        }}
        key={`diseases-tab-${currentLanguage}`}
      />
      <Tab.Screen 
        name="ReportsTab" 
        component={ReportsScreen}
        options={{
          tabBarLabel: getLabel('reports'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bar-chart" color={color} size={size} />
          )
        }}
        key={`reports-tab-${currentLanguage}`}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{
          tabBarLabel: getLabel('profile'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={color} size={size} />
          )
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

  // Initial determination of which stack to show
  const initialStack = isAuthenticated ? "Main" : "Auth";

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
            options?.title ?? route?.name ?? "Mango Disease Identifier"
        }}
      >
        <Stack.Navigator 
          initialRouteName={initialStack}
          screenOptions={{
            headerShown: false,
            presentation: 'card', // More compatible with web
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
