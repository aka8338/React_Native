import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { NavigationService } from "../navigation";

const OTPScreen = ({ route, navigation }) => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { verifyOTP, resendOTP, confirmPasswordReset } = useAuth();

  // Override hardware back button to prevent going back to signup
  useEffect(() => {
    console.log("OTP Screen - Route params:", JSON.stringify(route?.params));
    
    // Check for logout flag first - if present, navigate to SignIn immediately
    // But don't do this check if we're in a password reset flow
    const checkForLogout = async () => {
      try {
        // First check if this is a password reset flow - if so, we should not redirect on logout
        const isPwdReset = await AsyncStorage.getItem("pendingPasswordReset");
        if (isPwdReset === "true") {
          console.log("OTP Screen - Password reset flow detected, ignoring logout flag");
          return false; // Don't redirect for logout during password reset
        }
        
        // Now check for logout flag
        const fromLogout = await AsyncStorage.getItem("fromLogout");
        if (fromLogout === "true") {
          console.log("OTP Screen - Logout detected, immediately navigating to SignIn");
          // Navigate to SignIn and return to prevent any further processing
          NavigationService.resetToSignIn();
          return true; // Return true to indicate we're handling logout
        }
        return false; // Continue with normal flow
      } catch (error) {
        console.error("OTP Screen - Error checking logout status:", error);
        return false;
      }
    };
    
    // Check password reset flow and email setup
    const setupScreen = async () => {
      // First check if we're in a logout state
      const isLoggingOut = await checkForLogout();
      if (isLoggingOut) {
        return; // Skip further processing
      }
      
      // Check for password reset first
      let resetDetected = false;
      
      // Check route params
      if (route?.params?.fromPasswordReset) {
        console.log("OTP Screen - Password reset flow detected from route params!");
        setIsPasswordReset(true);
        resetDetected = true;
        
        // If email is provided in route params, set it directly
        if (route?.params?.email) {
          console.log("OTP Screen - Using email from route params:", route.params.email);
          setEmail(route.params.email);
          
          // Show alert only if email is valid
          Alert.alert(
            "Password Reset Code",
            `A verification code has been sent to ${route.params.email}`
          );
          
          return; // Email set, no need to continue
        }
      }
      
      // Check AsyncStorage
      try {
        // Check for password reset flag in AsyncStorage
        const isPwdReset = await AsyncStorage.getItem("pendingPasswordReset");
        if (isPwdReset === "true") {
          console.log("OTP Screen - Password reset flow detected from AsyncStorage flag");
          setIsPasswordReset(true);
          resetDetected = true;
        }
        
        // Check for email in AsyncStorage - for both normal OTP and password reset
        const storedEmail = await AsyncStorage.getItem("pendingOtpEmail");
        console.log("OTP Screen - Email from AsyncStorage:", storedEmail);
        
        if (storedEmail) {
          console.log("OTP Screen - Setting email state to:", storedEmail);
          setEmail(storedEmail);
          
          // Show appropriate alert based on flow type
          Alert.alert(
            resetDetected ? "Password Reset Code" : "OTP Sent",
            `A verification code has been sent to ${storedEmail}`
          );
        } else if (!route?.params?.email) {
          // No email found and not already set via route params
          console.error("OTP Screen - Could not determine email address");
          
          // Double-check for logout flag again (race condition protection)
          const fromLogout = await AsyncStorage.getItem("fromLogout");
          if (fromLogout === "true") {
            console.log("OTP Screen - Logout detected, redirecting to SignIn");
            NavigationService.resetToSignIn();
            return;
          }
          
          // Show error and navigate to SignIn
          Alert.alert("Error", "Could not determine your email address", [
            {
              text: "OK",
              onPress: () => {
                NavigationService.resetToSignIn();
              },
            },
          ]);
        }
      } catch (error) {
        console.error("OTP Screen - Error setting up screen:", error);
        Alert.alert(
          "Error",
          "Failed to set up verification. Please try again.",
          [
            {
              text: "OK",
              onPress: () => {
                NavigationService.resetToSignIn();
              },
            },
          ]
        );
      }
    };
    
    // Run setup
    setupScreen();

    // Setup back button handler
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (email) {
          // Show confirmation dialog
          Alert.alert(
            "Cancel Verification?",
            "Are you sure you want to cancel the verification process?",
            [
              { text: "No", style: "cancel" },
              {
                text: "Yes",
                onPress: () => {
                  // Clear pending verification data
                  AsyncStorage.removeItem("pendingOtpEmail");
                  AsyncStorage.removeItem("pendingOtpTimestamp");
                  AsyncStorage.removeItem("pendingPasswordReset");
                  
                  // Use NavigationService to reset to SignIn
                  NavigationService.resetToSignIn();
                },
              },
            ]
          );
          return true; // Prevents default back behavior
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [navigation, route?.params]);

  // Start countdown timer and handle timer cleanup
  useEffect(() => {
    // Skip setup if no email is set yet
    if (!email) return;
    
    // Start countdown for resend button
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Clean up timer on component unmount
    return () => clearInterval(timer);
  }, [email]);

  const handleVerifyOTP = async () => {
    if (!email) {
      Alert.alert("Error", "Email address not found");
      return;
    }

    if (!otp || otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    console.log("Verifying OTP:", otp, "for email:", email, "isPasswordReset:", isPasswordReset);

    try {
      if (isPasswordReset) {
        // For password reset, we don't need to call the verify endpoint
        // Instead just show the password reset fields directly
        console.log("Password reset flow detected, showing password fields");
        
        // Set flag to show password fields
        setShowPasswordFields(true);
        
        // Show confirmation alert
        Alert.alert(
          "Code Accepted",
          "Please enter your new password"
        );
        
        setIsLoading(false);
        return;
      } else {
        // Regular account verification flow
        const result = await verifyOTP(email, otp);
        console.log("OTP verification result:", result);

        if (result.success) {
          try {
            // First clear all auth and verification data
            await AsyncStorage.multiRemove([
              "pendingOtpEmail",
              "pendingOtpTimestamp",
              "auth_token",
              "userData",
            ]);
            
            // Set justVerified flag to indicate successful verification
            await AsyncStorage.setItem("justVerified", "true");
            // Set fromLogout flag to navigate to SignIn directly
            await AsyncStorage.setItem("fromLogout", "true");
            console.log("OTP verification successful - set justVerified flag");

            // Show success message and navigate
            Alert.alert(
              "Success",
              "Account verified successfully! Please sign in with your email and password.",
              [
                {
                  text: "Continue",
                  onPress: () => {
                    // Navigation is now handled by AuthContext
                  },
                },
              ],
              { cancelable: false }
            );
          } catch (error) {
            console.error("Error during cleanup:", error);
          }
        } else {
          Alert.alert(
            "Error",
            result.error ||
              "Verification failed. Please check the code and try again."
          );
        }
      }
    } catch (error) {
      console.error("Error during OTP verification:", error);
      Alert.alert("Error", "Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please enter and confirm your new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      // We still need the OTP for the confirmation process
      if (!otp || otp.length !== 6) {
        Alert.alert("Error", "Invalid verification code. Please restart the process.");
        setIsLoading(false);
        return;
      }
      
      const result = await confirmPasswordReset(email, otp, newPassword);
      
      if (result.success) {
        // Clear stored data
        await AsyncStorage.multiRemove([
          "pendingOtpEmail",
          "pendingOtpTimestamp",
          "pendingPasswordReset"
        ]);
        
        // Set justVerified flag to indicate successful reset
        await AsyncStorage.setItem("justVerified", "true");
        // Set fromLogout flag to navigate to SignIn directly
        await AsyncStorage.setItem("fromLogout", "true");
        console.log("Password reset successful - set justVerified flag");

        Alert.alert(
          "Success",
          "Your password has been reset successfully. Please log in with your new password.",
          [
            {
              text: "Continue",
              onPress: () => {
                NavigationService.resetToSignIn();
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          "Error",
          result.error || "Failed to reset password. Please try again."
        );
      }
    } catch (error) {
      console.error("Error during password reset:", error);
      Alert.alert("Error", "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // For the onPress of the back button in the UI (not hardware back)
  const handleBackPress = () => {
    Alert.alert(
      "Cancel Verification?",
      "Are you sure you want to cancel the verification process?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            AsyncStorage.removeItem("pendingOtpEmail");
            AsyncStorage.removeItem("pendingOtpTimestamp");
            AsyncStorage.removeItem("pendingPasswordReset");
            
            // Use NavigationService to reset to SignIn
            NavigationService.resetToSignIn();
          },
        },
      ]
    );
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || !email) return;

    setCountdown(30);
    console.log("Resending OTP to:", email);

    try {
      const result = await resendOTP(email);

      if (result.success) {
        Alert.alert("Success", `A new OTP has been sent to ${email}`);
      } else {
        Alert.alert("Error", result.error || "Failed to resend OTP");
        setCountdown(0);
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      Alert.alert("Error", "Failed to resend OTP. Please try again.");
      setCountdown(0);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isPasswordReset ? "Reset Password" : "Verification"}
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>
            {isPasswordReset ? "Reset Your Password" : "Verify Your Account"}
          </Text>

          {email ? (
            <Text style={styles.subtitle}>
              {isPasswordReset
                ? `Enter the code sent to ${email} to reset your password`
                : `We've sent a verification code to ${email}`}
            </Text>
          ) : (
            <Text style={styles.subtitle}>
              Loading your verification details...
            </Text>
          )}

          {/* Always show OTP input if we're not in password reset with fields showing */}
          {!showPasswordFields && (
            <>
              <View style={styles.otpContainer}>
                <TextInput
                  style={styles.otpInput}
                  placeholder="6-digit code"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                />
              </View>

              <TouchableOpacity
                style={[styles.verifyButton, { opacity: isLoading ? 0.7 : 1 }]}
                onPress={handleVerifyOTP}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.verifyButtonText}>
                    {isPasswordReset ? "Verify Code" : "Verify Account"}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Password reset fields - show when in password reset mode and password fields should be shown 
              Note: We keep the OTP in state even though we hide the input field, as we'll need it for the reset API call */}
          {isPasswordReset && showPasswordFields ? (
            <>
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={24} color="#7D7D7D" />
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  placeholderTextColor="#7D7D7D"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={24} color="#7D7D7D" />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm New Password"
                  placeholderTextColor="#7D7D7D"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              <TouchableOpacity
                style={[styles.verifyButton, { opacity: isLoading ? 0.7 : 1 }]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.verifyButtonText}>Reset Password</Text>
                )}
              </TouchableOpacity>
            </>
          ) : null}

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            {countdown > 0 ? (
              <Text style={styles.countdownText}>
                Resend in {countdown}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendOTP}>
                <Text style={styles.resendButton}>Resend</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#148F55",
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  otpContainer: {
    width: "100%",
    height: 60,
    borderWidth: 1,
    borderColor: "#148F55",
    borderRadius: 10,
    marginBottom: 20,
  },
  otpInput: {
    width: "100%",
    height: "100%",
    fontSize: 20,
    textAlign: "center",
  },
  verifyButton: {
    backgroundColor: "#148F55",
    width: "100%",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 10,
    marginBottom: 15,
    marginTop: 10,
    width: "100%",
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    color: "#333",
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  resendText: {
    color: "#666",
    marginRight: 10,
  },
  resendButton: {
    color: "#148F55",
    fontSize: 16,
  },
  countdownText: {
    color: "#148F55",
    fontWeight: "bold",
  },
});

export default OTPScreen;
