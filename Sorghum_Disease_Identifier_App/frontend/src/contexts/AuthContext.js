import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/api';

// Create Authentication Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on initial load
  useEffect(() => {
    const checkUserAuthentication = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          setCurrentUser(userData);
          
          // Optionally refresh user data from API
          try {
            const response = await AuthService.getCurrentUser();
            if (response.success) {
              // Update with latest data but keep auth state
              const updatedUser = {
                ...response.user,
                isAuthenticated: true
              };
              setCurrentUser(updatedUser);
              await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
            }
          } catch (error) {
            console.error('Failed to refresh user data:', error);
          }
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAuthentication();
  }, []);

  // Register function
  const register = async (name, email, password) => {
    setIsLoading(true);
    console.log('AuthContext: Starting registration process', { name, email });
    try {
      console.log('AuthContext: Calling AuthService.signUp');
      const response = await AuthService.signUp(email, password, name);
      console.log('AuthContext: Registration response', response);
      
      // Store the email temporarily for the OTP screen
      await AsyncStorage.setItem('pendingOtpEmail', email);
      console.log('AuthContext: Stored email for OTP verification');
      
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Registration failed:', error);
      return { success: false, error: error.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Verify OTP function
  const verifyOTP = async (email, otp) => {
    setIsLoading(true);
    console.log('AuthContext: Starting OTP verification', { email, otp });
    try {
      console.log('AuthContext: Calling verifyOTP API');
      const response = await AuthService.verifyOTP(email, otp);
      console.log('AuthContext: OTP verification response', response);
      
      if (response.success) {
        console.log('AuthContext: OTP verification successful');
        
        // We no longer automatically set the user as authenticated
        // User must log in explicitly after verification
        
        // Clear any pending OTP email since verification is complete
        await AsyncStorage.removeItem('pendingOtpEmail');
        await AsyncStorage.removeItem('pendingOtpTimestamp');
      }
      
      return { 
        success: response.success, 
        message: response.message,
        user: response.user
      };
    } catch (error) {
      console.error('AuthContext: OTP verification failed:', error);
      return { success: false, error: error.message || 'Verification failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await AuthService.login(email, password);
      
      if (response.success) {
        // Update user state
        setCurrentUser({
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          isAuthenticated: true
        });
        
        return { success: true };
      } else if (response.requires_verification) {
        return { 
          success: false, 
          error: 'Account not verified', 
          requires_verification: true 
        };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message || 'Invalid credentials' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setCurrentUser(null);
      return { success: true };
    } catch (error) {
      console.error('Logout failed:', error);
      return { success: false, error: error.message || 'Logout failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    setIsLoading(true);
    try {
      const response = await AuthService.forgotPassword(email);
      return { success: true };
    } catch (error) {
      console.error('Password reset failed:', error);
      return { success: false, error: error.message || 'Password reset failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setIsLoading(true);
    try {
      const response = await AuthService.updateProfile(userData);
      
      if (response.success) {
        // Update local user data
        const updatedUser = { ...currentUser, ...userData };
        setCurrentUser(updatedUser);
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      }
      
      return { success: response.success };
    } catch (error) {
      console.error('Profile update failed:', error);
      return { success: false, error: error.message || 'Profile update failed' };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Resend OTP function
  const resendOTP = async (email) => {
    try {
      const response = await AuthService.resendOTP(email);
      return { success: response.success, message: response.message };
    } catch (error) {
      console.error('Resend OTP failed:', error);
      return { success: false, error: error.message || 'Failed to resend code' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        register,
        verifyOTP,
        login,
        logout,
        resetPassword,
        updateProfile,
        resendOTP
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 