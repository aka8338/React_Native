import React, { useState, useEffect } from "react";
import AppNavigator from "./src/navigation/index";
import { OfflineProvider } from "./src/contexts/OfflineContext";
import { AuthProvider } from "./src/contexts/AuthContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { LanguageProvider } from "./src/contexts/LanguageContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, Platform } from 'react-native';
import "./src/i18n"; // Import i18n configuration

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
    console.log('Error caught by boundary:', error, errorInfo);
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
  const [initialRouteName, setInitialRouteName] = useState('Splash');

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make API calls, etc.
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if there's a pending OTP verification - this takes priority
        const pendingOtpEmail = await AsyncStorage.getItem('pendingOtpEmail');
        const pendingOtpTimestamp = await AsyncStorage.getItem('pendingOtpTimestamp');
        console.log('App initialization - Pending OTP email:', pendingOtpEmail);
        
        if (pendingOtpEmail) {
          // Check if OTP request is stale (older than 30 minutes)
          const now = Date.now();
          const otpTime = parseInt(pendingOtpTimestamp || '0', 10);
          const isStale = now - otpTime > 30 * 60 * 1000; // 30 minutes
          
          if (isStale) {
            // Clean up stale OTP request
            console.log('App initialization - Found stale OTP request, cleaning up');
            await AsyncStorage.removeItem('pendingOtpEmail');
            await AsyncStorage.removeItem('pendingOtpTimestamp');
          } else {
            // Valid OTP verification pending, go directly to Auth stack
            console.log('App initialization - Pending OTP verification detected, setting initial route to Auth');
            setInitialRouteName('Auth');
            
            // Reset stored language to English for OTP flow
            try {
              await AsyncStorage.setItem('appLanguage', 'en');
              console.log('App initialization - Reset language to English for OTP flow');
            } catch (langError) {
              console.error('App initialization - Failed to reset language:', langError);
            }
            
            // Skip checking other states since we're going to OTP screen
            setAppIsReady(true);
            return;
          }
        }
        
        // No pending OTP, check if user is already logged in
        const userData = await AsyncStorage.getItem('userData');
        console.log('App initialization - User data:', userData);
        
        if (userData) {
          try {
            const parsedData = JSON.parse(userData);
            // If user data exists and has authenticated session, go to Home
            if (parsedData.isAuthenticated) {
              console.log('App initialization - Authenticated user found, setting initial route to Main');
              setInitialRouteName('Main');
            } else {
              // User data exists but not authenticated
              console.log('App initialization - User data found but not authenticated, setting initial route to Auth');
              setInitialRouteName('Auth');
            }
          } catch (parseError) {
            console.error('App initialization - Error parsing user data:', parseError);
            setInitialRouteName('Auth');
          }
        } else {
          // No user data, go to default splash screen
          console.log('App initialization - No user data found, keeping default Splash screen');
        }
      } catch (e) {
        console.warn('Error in App initialization:', e);
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});

export default App;
