import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AuthProvider } from "./src/contexts/AuthContext";
import { LanguageProvider } from "./src/contexts/LanguageContext";
import { OfflineProvider } from "./src/contexts/OfflineContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import "./src/i18n"; // Import i18n configuration
import AppNavigator from "./src/navigation/index";

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong.</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  const [appIsReady, setAppIsReady] = useState(false);
  const [initialRouteName, setInitialRouteName] = useState("Splash");

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make API calls, etc.
        await new Promise((resolve) => setTimeout(resolve, 500));

        // First check for password reset flow - this should take absolute priority
        const pendingPasswordReset = await AsyncStorage.getItem("pendingPasswordReset");
        const pendingOtpEmail = await AsyncStorage.getItem("pendingOtpEmail");
        
        if (pendingPasswordReset === "true" && pendingOtpEmail) {
          console.log("App initialization - Password reset in progress, going directly to OTP screen");
          setInitialRouteName("OTP");
          setAppIsReady(true);
          return; // Exit early to prevent any other navigation
        }
        
        // Check if user just verified their account - this takes priority
        const justVerified = await AsyncStorage.getItem("justVerified");
        if (justVerified === "true") {
          console.log("App initialization - Account just verified, going directly to SignIn");
          setInitialRouteName("SignIn");
          // We'll keep the flag for the SplashScreen to handle the final navigation
          return;
        }
        
        // Check if user just logged out - also takes priority
        const fromLogout = await AsyncStorage.getItem("fromLogout");
        if (fromLogout === "true") {
          console.log("App initialization - User just logged out, going directly to SignIn");
          // Clear the flag now that we've used it
          await AsyncStorage.removeItem("fromLogout");
          // Don't just set initialRouteName, instead set state to be passed to stack
          setInitialRouteName("SignIn");
          // Immediately set app ready to prevent any further delay
          setAppIsReady(true);
          return;
        }

        // Check if there's a pending OTP verification - this takes priority
        // We already checked for password reset above, so this is for account verification
        console.log("App initialization - Pending OTP email:", pendingOtpEmail);
        console.log("App initialization - Pending password reset:", pendingPasswordReset);

        if (pendingOtpEmail && pendingPasswordReset !== "true") {
          // Check if OTP request is stale (older than 30 minutes)
          const pendingOtpTimestamp = await AsyncStorage.getItem("pendingOtpTimestamp");
          const now = Date.now();
          const otpTime = parseInt(pendingOtpTimestamp || "0", 10);
          const isStale = now - otpTime > 30 * 60 * 1000; // 30 minutes

          if (isStale) {
            // Clean up stale OTP request
            console.log(
              "App initialization - Found stale OTP request, cleaning up"
            );
            await AsyncStorage.multiRemove([
              "pendingOtpEmail", 
              "pendingOtpTimestamp",
              "pendingPasswordReset"
            ]);
          } else {
            // Valid OTP verification pending, go directly to OTP screen
            console.log(
              "App initialization - Pending OTP verification detected, setting initial route to OTP"
            );
            setInitialRouteName("OTP");

            // Reset stored language to English for OTP flow
            try {
              await AsyncStorage.setItem("appLanguage", "en");
              console.log(
                "App initialization - Reset language to English for OTP flow"
              );
            } catch (langError) {
              console.error(
                "App initialization - Failed to reset language:",
                langError
              );
            }

            // Skip checking other states since we're going to OTP screen
            setAppIsReady(true);
            return;
          }
        }

        // No pending OTP, check if user is already logged in
        const userData = await AsyncStorage.getItem("userData");
        console.log("App initialization - User data:", userData);

        if (userData) {
          try {
            const parsedData = JSON.parse(userData);
            // If user data exists and has authenticated session, go to Home
            if (parsedData.isAuthenticated) {
              console.log(
                "App initialization - Authenticated user found, setting initial route to Main"
              );
              setInitialRouteName("Main");
              
              // Reset any lingering OTP state to prevent navigation issues
              await AsyncStorage.removeItem("pendingOtpEmail");
              await AsyncStorage.removeItem("pendingOtpTimestamp");
              await AsyncStorage.removeItem("pendingPasswordReset");
            } else {
              // User data exists but not authenticated
              console.log(
                "App initialization - User data found but not authenticated, setting initial route to SignIn"
              );
              setInitialRouteName("SignIn");
            }
          } catch (parseError) {
            console.error(
              "App initialization - Error parsing user data:",
              parseError
            );
            setInitialRouteName("SignIn");
          }
        } else {
          // No user data, go to default splash screen
          console.log(
            "App initialization - No user data found, keeping default Splash screen"
          );
        }
      } catch (e) {
        console.warn("Error in App initialization:", e);
      } finally {
        // Tell the app to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Loading state component - separated to avoid Fragment issues
  const LoadingComponent = () => (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );

  // Main app component - wrapped in error boundary
  const MainApp = () => (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <OfflineProvider>
            <ThemeProvider>
              <AppNavigator initialRouteName={initialRouteName} />
            </ThemeProvider>
          </OfflineProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );

  // Return either loading component or main app
  return appIsReady ? <MainApp /> : <LoadingComponent />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    fontSize: 16,
    color: "#333",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
});

export default App;
