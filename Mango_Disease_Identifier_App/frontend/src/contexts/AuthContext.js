import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthService } from "../services/api";
import { NavigationService } from "../navigation";

// Create Authentication Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on initial load
  useEffect(() => {
    const checkUserAuthentication = async () => {
      try {
        // First check if we just verified
        const justVerified = await AsyncStorage.getItem("justVerified");
        if (justVerified === "true") {
          // Ensure we're not authenticated
          setCurrentUser(null);
          await AsyncStorage.multiRemove([
            "userData",
            "auth_token",
            "justVerified",
          ]);
          setIsLoading(false);
          return;
        }

        const storedUserData = await AsyncStorage.getItem("userData");
        const authToken = await AsyncStorage.getItem("auth_token");

        if (storedUserData && authToken) {
          const userData = JSON.parse(storedUserData);
          setCurrentUser(userData);

          // Optionally refresh user data from API
          try {
            const response = await AuthService.getCurrentUser();
            if (response.success) {
              // Update with latest data but keep auth state
              const updatedUser = {
                ...response.user,
                isAuthenticated: true,
              };
              setCurrentUser(updatedUser);
              await AsyncStorage.setItem(
                "userData",
                JSON.stringify(updatedUser)
              );
            }
          } catch (error) {
            // If there's an error, clear the authentication
            setCurrentUser(null);
            await AsyncStorage.removeItem("userData");
            await AsyncStorage.removeItem("auth_token");
            console.error("Failed to refresh user data:", error);
          }
        } else {
          // Clear authentication if either token or user data is missing
          setCurrentUser(null);
          await AsyncStorage.removeItem("userData");
          await AsyncStorage.removeItem("auth_token");
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
        // Clear authentication on error
        setCurrentUser(null);
        await AsyncStorage.removeItem("userData");
        await AsyncStorage.removeItem("auth_token");
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAuthentication();
  }, []);

  // Register function
  const register = async (name, email, password) => {
    setIsLoading(true);
    console.log("AuthContext: Starting registration process", { name, email });
    try {
      console.log("AuthContext: Calling AuthService.signUp");
      const response = await AuthService.signUp(email, password, name);
      console.log("AuthContext: Registration response", response);

      // Store the email temporarily for the OTP screen
      await AsyncStorage.setItem("pendingOtpEmail", email);
      console.log("AuthContext: Stored email for OTP verification");

      return { success: true };
    } catch (error) {
      console.error("AuthContext: Registration failed:", error);
      return { success: false, error: error.message || "Registration failed" };
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP function
  const verifyOTP = async (email, otp, isPasswordReset = false) => {
    setIsLoading(true);
    console.log("AuthContext: Starting OTP verification", { email, otp, isPasswordReset });
    try {
      console.log("AuthContext: Calling verifyOTP API");
      
      // For password reset, we may handle this differently
      // Depending on your API structure
      const response = await AuthService.verifyOTP(email, otp);
      console.log("AuthContext: OTP verification response", response);

      if (response.success) {
        console.log("AuthContext: OTP verification successful");

        if (!isPasswordReset) {
          // For account verification, clear auth data
          setCurrentUser(null);
          await AsyncStorage.multiRemove([
            "userData",
            "auth_token",
            "pendingOtpEmail",
            "pendingOtpTimestamp",
          ]);

          // Set flag to indicate just verified - this will be used by the SplashScreen
          // to navigate directly to SignIn
          await AsyncStorage.setItem("justVerified", "true");
          console.log("AuthContext: Set justVerified flag to redirect to SignIn");
          
          // Direct navigation to SignIn (after a slight delay to allow state to update)
          setTimeout(() => {
            NavigationService.resetToSignIn();
          }, 100);
        }
        // For password reset, we keep pendingOtpEmail for the reset phase
      }

      return {
        success: response.success,
        message: response.message,
        user: response.user,
      };
    } catch (error) {
      console.error("AuthContext: OTP verification failed:", error);
      return { success: false, error: error.message || "Verification failed" };
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
        // Clear any pending OTP or reset flags to prevent navigation issues
        await AsyncStorage.multiRemove([
          "pendingOtpEmail",
          "pendingOtpTimestamp",
          "pendingPasswordReset",
          "justVerified",
          "fromLogout"
        ]);
        console.log("AuthContext: Cleared all pending verification flags on login");
        
        // Update user state
        setCurrentUser({
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          isAuthenticated: true,
        });
        
        console.log("AuthContext: User authenticated, navigating to Main");

        // Direct navigation to Main screen
        setTimeout(() => {
          NavigationService.resetToMain();
        }, 100);

        return { success: true };
      } else if (response.requires_verification) {
        return {
          success: false,
          error: "Account not verified",
          requires_verification: true,
        };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: error.message || "Invalid credentials" };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      console.log("AuthContext: Starting logout process");
      
      // First - mark that we're logging out by setting the flag
      // This will help other components know to redirect properly
      await AsyncStorage.setItem("fromLogout", "true");
      console.log("AuthContext: Set fromLogout flag");
      
      // Second - clean up all auth and OTP related data in storage
      await AsyncStorage.multiRemove([
        "auth_token",
        "userData",
        "pendingOtpEmail",
        "pendingOtpTimestamp",
        "pendingPasswordReset",
        "justVerified"
      ]);
      console.log("AuthContext: Cleared all auth data");
      
      // Then set user to null to trigger auth state change
      setCurrentUser(null);
      console.log("AuthContext: Set currentUser to null");
      
      // Add a delay before navigation to ensure auth state is fully updated
      // A longer delay here helps ensure state changes have propagated
      setTimeout(() => {
        console.log("AuthContext: Timeout completed, navigating to SignIn");
        NavigationService.resetToSignIn();
      }, 300);
      
      return { success: true };
    } catch (error) {
      console.error("Logout failed:", error);
      
      // Even if we hit an error, try to set the fromLogout flag as a safety
      try {
        await AsyncStorage.setItem("fromLogout", "true");
        setCurrentUser(null); // Still try to clear current user
      } catch (e) {
        console.error("Critical error setting fromLogout flag:", e);
      }
      
      return { success: false, error: error.message || "Logout failed" };
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    setIsLoading(true);
    try {
      const response = await AuthService.forgotPassword(email);
      return { 
        success: response.success,
        message: response.message || "Password reset instructions sent to your email"
      };
    } catch (error) {
      console.error("Password reset failed:", error);
      return {
        success: false,
        error: error.message || "Password reset failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm password reset with OTP and new password
  const confirmPasswordReset = async (email, otp, newPassword) => {
    setIsLoading(true);
    try {
      const response = await AuthService.resetPassword(email, otp, newPassword);
      
      if (response.success) {
        console.log("AuthContext: Password reset successful");
        
        // Clear all verification-related data first
        await AsyncStorage.multiRemove([
          "pendingOtpEmail",
          "pendingOtpTimestamp",
          "pendingPasswordReset",
        ]);
        
        // Set justVerified flag for navigation
        await AsyncStorage.setItem("justVerified", "true");
        
        // This flag will be checked in SignInScreen to show a success message
        await AsyncStorage.setItem("passwordResetSuccess", "true");
        
        console.log("AuthContext: Password reset flags cleared, justVerified flag set");
        
        // Add a delay before navigation to ensure state changes have propagated
        setTimeout(() => {
          console.log("AuthContext: Navigating to SignIn after password reset");
          NavigationService.resetToSignIn();
        }, 300);
      }
      
      return { 
        success: response.success,
        message: response.message || "Password has been reset successfully"
      };
    } catch (error) {
      console.error("Password reset confirmation failed:", error);
      return {
        success: false,
        error: error.message || "Failed to reset password",
      };
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
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
      }

      return { success: response.success };
    } catch (error) {
      console.error("Profile update failed:", error);
      return {
        success: false,
        error: error.message || "Profile update failed",
      };
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
      console.error("Resend OTP failed:", error);
      return {
        success: false,
        error: error.message || "Failed to resend code",
      };
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
        confirmPasswordReset,
        updateProfile,
        resendOTP,
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
