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
        
        // Check if user is already logged in
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedData = JSON.parse(userData);
          // If user data exists and has unexpired session, skip splash/login
          if (parsedData.isAuthenticated) {
            // Check if it's the first launch after login
            const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
            if (hasSeenOnboarding) {
              setInitialRouteName('Home');
            }
          }
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
