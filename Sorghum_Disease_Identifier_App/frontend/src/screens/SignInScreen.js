import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { AuthService } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SignInScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { login, resetPassword, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password");
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log("SignInScreen: Attempting login with email:", email);
      const result = await login(email, password);
      console.log("SignInScreen: Login result:", result);
      
      if (result.success) {
        console.log("SignInScreen: Login successful, proceeding to main app");
        // Successful login - handled by AuthContext navigation
      } else if (result.requires_verification) {
        console.log("SignInScreen: Account requires verification");
        Alert.alert(
          "Verification Required", 
          "Your account is not verified. Please verify your email to continue.",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            {
              text: "Verify Now",
              onPress: () => {
                // Store email for OTP screen
                AsyncStorage.setItem('pendingOtpEmail', email);
                AsyncStorage.setItem('pendingOtpTimestamp', Date.now().toString());
                navigation.navigate("OTP", { formData: { email } });
              }
            }
          ]
        );
      } else {
        console.log("SignInScreen: Login failed:", result.error);
        Alert.alert(
          "Login Failed", 
          result.error || "Invalid email or password. Please check your credentials and try again."
        );
      }
    } catch (error) {
      console.error("SignInScreen: Login error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    
    setIsResetting(true);
    try {
      const result = await resetPassword(resetEmail);
      
      if (result.success) {
        setResetPasswordModalVisible(false);
        Alert.alert(
          "Password Reset Sent", 
          "We've sent a password reset code to your email. Please check your inbox."
        );
        setResetEmail("");
      } else {
        Alert.alert("Password Reset Failed", result.error || "Unable to send reset email. Please try again later.");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  // Cleanup modal on unmount
  useEffect(() => {
    return () => {
      setResetPasswordModalVisible(false);
    };
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <Image
            source={require("../assets/splashscreen_logo.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>{t("auth.signIn")}</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder={t("auth.email")}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading && !isSubmitting}
          />

          <TextInput
            style={styles.input}
            placeholder={t("auth.password")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading && !isSubmitting}
          />

          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={() => setResetPasswordModalVisible(true)}
            disabled={isLoading || isSubmitting}
          >
            <Text style={styles.forgotPasswordText}>
              {t("auth.forgotPassword")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signInButton, (isLoading || isSubmitting) && styles.disabledButton]}
            onPress={handleSignIn}
            disabled={isLoading || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.signInButtonText}>{t("auth.signIn")}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>
              {t("auth.dontHaveAccount")}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("SignUp")} disabled={isLoading || isSubmitting}>
              <Text style={styles.signUpLink}>{t("auth.signUp")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Password Reset Modal - Only render when visible */}
      {resetPasswordModalVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={resetPasswordModalVisible}
          onRequestClose={() => setResetPasswordModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t("auth.forgotPassword")}</Text>
              
              <Text style={styles.modalText}>
                Enter your email address and we'll send you a code to reset your password.
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder={t("auth.email")}
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isResetting}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setResetPasswordModalVisible(false)}
                  disabled={isResetting}
                >
                  <Text style={styles.cancelButtonText}>{t("general.cancel")}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.modalButton, 
                    styles.submitButton,
                    isResetting && styles.disabledButton
                  ]}
                  onPress={handlePasswordReset}
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>{t("general.submit")}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#148F55",
  },
  formContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#148F55",
    fontSize: 14,
  },
  signInButton: {
    backgroundColor: "#148F55",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: "#8BC34A",
    opacity: 0.7,
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  signUpText: {
    color: "#666",
    marginRight: 5,
    fontSize: 14,
  },
  signUpLink: {
    color: "#148F55",
    fontWeight: "bold",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#148F55",
  },
  modalText: {
    marginBottom: 20,
    fontSize: 14,
    color: "#666",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    borderRadius: 8,
    padding: 12,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  cancelButtonText: {
    color: "#666",
  },
  submitButton: {
    backgroundColor: "#148F55",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default SignInScreen; 