import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { CommonActions, NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SplashScreen from "../components/SplashScreen";
import { useAuth } from "../contexts/AuthContext";
import DiseaseReportScreen from "../screens/DiseaseReportScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import HomeScreen from "../screens/HomeScreen";
import IdentificationScreen from "../screens/IdentificationScreen";
import MangoDiseasesScreen from "../screens/MangoDiseasesScreen";
import OTPScreen from "../screens/OTPScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ReportsScreen from "../screens/ReportsScreen";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";

// Create a navigation reference we can use outside of components
export const navigationRef = React.createRef();

// Create a global navigation service
export const NavigationService = {
  navigate(name, params) {
    if (navigationRef.current) {
      navigationRef.current.navigate(name, params);
    } else {
      console.error('NavigationService: Cannot navigate, navigationRef is not set');
    }
  },
  
  reset(routeName = 'Auth', nestedRoute = null) {
    if (navigationRef.current) {
      let routes;
      
      // Validate routeName to avoid invalid navigation
      if (routeName !== 'Auth' && routeName !== 'Main') {
        console.log(`NavigationService: Invalid routeName '${routeName}', defaulting to 'Auth'`);
        routeName = 'Auth';
        nestedRoute = 'SignIn'; // Force SignIn as the safe default
      }
      
      // Validate nestedRoute for Auth stack
      if (routeName === 'Auth' && nestedRoute) {
        const validAuthScreens = ['SignIn', 'SignUp', 'OTP', 'ForgotPassword', 'Splash'];
        if (!validAuthScreens.includes(nestedRoute)) {
          console.log(`NavigationService: Invalid Auth screen '${nestedRoute}', defaulting to 'SignIn'`);
          nestedRoute = 'SignIn';
        }
      }
      
      if (nestedRoute) {
        // Special handling for Auth stack screens
        routes = [
          {
            name: routeName,
            state: {
              routes: [{ name: nestedRoute }],
              index: 0,
            },
          },
        ];
      } else {
        routes = [{ name: routeName }];
      }
      
      navigationRef.current.dispatch(
        CommonActions.reset({
          index: 0,
          routes,
        })
      );
    } else {
      console.error('NavigationService: Cannot reset, navigationRef is not set');
    }
  },
  
  resetToSignIn() {
    try {
      console.log('NavigationService: Attempting to reset to SignIn');
      
      // Use the safer reset method we've improved
      this.reset('Auth', 'SignIn');
      console.log('NavigationService: Successfully reset to SignIn using improved reset method');
      
      // We'll still set the fallback flag as an extra precaution
      try {
        AsyncStorage.setItem("fromLogout", "true")
          .then(() => console.log('NavigationService: Set fromLogout flag as backup'));
      } catch (e) {
        console.error('NavigationService: Error setting fromLogout flag', e);
      }
    } catch (error) {
      console.error('NavigationService: Unexpected error in resetToSignIn', error);
      // Fallback
      try {
        AsyncStorage.setItem("fromLogout", "true")
          .then(() => console.log('NavigationService: Set fromLogout flag as fallback'));
      } catch (e) {
        console.error('NavigationService: Critical error - could not set fromLogout flag', e);
      }
    }
  },
  
  resetToMain() {
    this.reset('Main');
  },
  
  goBack() {
    if (navigationRef.current) {
      navigationRef.current.goBack();
    }
  },
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Separate stacks for authenticated and unauthenticated users
const AuthStack = ({ route }) => {
  // Check for forced initial screen from route params
  const forcedInitialScreen = route?.params?.initialScreen;
  
  // Get pending OTP email to determine if we should show OTP screen
  const [initialRoute, setInitialRoute] = useState(
    forcedInitialScreen === "SignIn" ? "SignIn" : 
    // Make sure we never try to use 'Main' as an initial route in Auth stack
    forcedInitialScreen === "Main" ? "SignIn" : "Splash"
  );

  useEffect(() => {
    // Only check for other conditions if no forced screen
    if (forcedInitialScreen) {
      // Make sure Main is never used in Auth stack
      if (forcedInitialScreen === "Main") {
        console.log("AuthStack: 'Main' is not a valid screen in Auth stack, using SignIn instead");
        setInitialRoute("SignIn");
      } else {
        console.log("AuthStack: Using forced initial screen:", forcedInitialScreen);
        setInitialRoute(forcedInitialScreen);
      }
      return;
    }
    
    const checkInitialRoute = async () => {
      try {
        // Check if user just verified their account
        const justVerified = await AsyncStorage.getItem("justVerified");
        if (justVerified === "true") {
          console.log("AuthStack: User just verified account, setting initial route to SignIn");
          setInitialRoute("SignIn");
          return;
        }
        
        // Check if user just logged out
        const fromLogout = await AsyncStorage.getItem("fromLogout");
        if (fromLogout === "true") {
          console.log("AuthStack: User just logged out, setting initial route to SignIn");
          // Clear the flag
          await AsyncStorage.removeItem("fromLogout");
          setInitialRoute("SignIn");
          return;
        }
        
        // Check for pending OTP (including password reset)
        const pendingOtpEmail = await AsyncStorage.getItem("pendingOtpEmail");
        const pendingPasswordReset = await AsyncStorage.getItem("pendingPasswordReset");
        
        console.log("AuthStack: Checking for pending OTP verification");
        console.log("AuthStack: pendingOtpEmail:", pendingOtpEmail);
        console.log("AuthStack: pendingPasswordReset:", pendingPasswordReset);

        if (pendingOtpEmail) {
          console.log(
            "AuthStack: Found pending OTP verification, setting initial route to OTP"
          );
          
          // For password reset flows, make sure we have the right params
          if (pendingPasswordReset === "true") {
            console.log("AuthStack: This is a password reset flow");
          }
          
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
        animationEnabled: true,
        cardStyle: { opacity: 1 },
        presentation: "card",
        animationTypeForReplace: "push",
      }}
    >
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Splash" component={SplashScreen} />
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

  console.log(
    "AppNavigator initializing - isAuthenticated:",
    isAuthenticated,
    "initialRouteName:",
    initialRouteName
  );

  // Check for pending OTP - this is critical to avoid splash screen
  const [hasPendingOtp, setHasPendingOtp] = useState(false);
  
  // Track navigation ready state
  const [isNavigationReady, setNavigationReady] = useState(false);

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
  
  // If initialRouteName is "Auth", change it to "SignIn" to avoid navigation issues
  let actualInitialScreen = initialRouteName;
  if (initialRouteName === "Auth") {
    console.log("AppNavigator: 'Auth' is a navigator, not a screen. Using 'SignIn' instead.");
    actualInitialScreen = "SignIn";
  }

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
        onReady={() => {
          console.log("Navigation container ready");
          setNavigationReady(true);
        }}
        documentTitle={{
          formatter: (options, route) =>
            options?.title ?? route?.name ?? "Mango Disease Identifier",
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
          <Stack.Screen 
            name="Auth" 
            component={AuthStack} 
            initialParams={{ initialScreen: startStack === "Auth" ? actualInitialScreen : undefined }}
          />
          <Stack.Screen name="Main" component={MainStack} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;
