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

const OTPScreen = ({ route, navigation }) => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const { verifyOTP, resendOTP } = useAuth();

  // Override hardware back button to prevent going back to signup
  useEffect(() => {
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

                  // Go to Sign In instead of back to Sign Up - prevents splash screen
                  navigation.replace("Signin");
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
  }, [email, navigation]);

  // Get email either from route params or AsyncStorage
  useEffect(() => {
    const getEmail = async () => {
      console.log("OTP Screen - Initializing, checking for email");

      let userEmail = "";

      try {
        // First check route params
        if (route?.params?.formData?.email) {
          userEmail = route.params.formData.email;
          console.log("OTP Screen - Email from route params:", userEmail);
        } else {
          // Check AsyncStorage as fallback
          const storedEmail = await AsyncStorage.getItem("pendingOtpEmail");
          console.log("OTP Screen - Email from AsyncStorage:", storedEmail);

          if (storedEmail) {
            userEmail = storedEmail;
          }
        }

        if (userEmail) {
          console.log("OTP Screen - Setting email state to:", userEmail);
          setEmail(userEmail);
          Alert.alert(
            "OTP Sent",
            `A verification code has been sent to ${userEmail}`
          );
        } else {
          console.error("OTP Screen - Could not determine email address");
          Alert.alert("Error", "Could not determine your email address", [
            {
              text: "Go Back",
              onPress: () => navigation.replace("Signin"), // Go to SignIn rather than back to ensure no splash screen
            },
          ]);
        }
      } catch (error) {
        console.error("OTP Screen - Error getting email:", error);
        Alert.alert(
          "Error",
          "Failed to set up verification. Please try again.",
          [{ text: "OK", onPress: () => navigation.replace("Signin") }]
        );
      }
    };

    getEmail();

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

    // Clean up timer
    return () => clearInterval(timer);
  }, [route?.params, navigation]);

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
    console.log("Verifying OTP:", otp, "for email:", email);

    try {
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

          // Set verified flag
          await AsyncStorage.setItem("justVerified", "true");

          // Show success message and navigate
          Alert.alert(
            "Success",
            "Account verified successfully! Please sign in with your email and password.",
            [
              {
                text: "Continue",
                onPress: () => {
                  // Force navigation to Signin and clear stack
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Signin" }],
                  });
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
    } catch (error) {
      console.error("Error during OTP verification:", error);
      Alert.alert("Error", "Failed to verify OTP. Please try again.");
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
            navigation.replace("Signin");
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color="#148F55" />
        </TouchableOpacity>

        <View style={styles.content}>
          <MaterialIcons name="verified-user" size={64} color="#148F55" />

          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit verification code to{"\n"}
            <Text style={styles.emailText}>{email}</Text>
          </Text>

          <TextInput
            style={styles.otpInput}
            placeholder="Enter 6-digit code"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />

          <TouchableOpacity
            style={styles.verifyButton}
            onPress={handleVerifyOTP}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.resendButton,
              countdown > 0 && styles.resendButtonDisabled,
            ]}
            onPress={handleResendOTP}
            disabled={countdown > 0}
          >
            <Text style={styles.resendButtonText}>
              Resend Code {countdown > 0 ? `(${countdown}s)` : ""}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  backButton: {
    marginTop: 10,
    marginLeft: 15,
    padding: 10,
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
  emailText: {
    fontWeight: "bold",
    color: "#333",
  },
  otpInput: {
    width: "100%",
    height: 60,
    borderWidth: 1,
    borderColor: "#148F55",
    borderRadius: 10,
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
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
  resendButton: {
    padding: 10,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: "#148F55",
    fontSize: 16,
  },
});

export default OTPScreen;
