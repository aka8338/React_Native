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

const SignInScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { login, resetPassword, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password");
      return;
    }
    
    const result = await login(email, password);
    
    if (!result.success) {
      Alert.alert("Login Failed", result.error || "Invalid email or password");
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    
    const result = await resetPassword(resetEmail);
    
    if (result.success) {
      setResetPasswordModalVisible(false);
      Alert.alert(
        "Password Reset Sent", 
        "We've sent a password reset link to your email. Please check your inbox."
      );
      setResetEmail("");
    } else {
      Alert.alert("Password Reset Failed", "Unable to send reset email. Please try again later.");
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
            editable={!isLoading}
          />

          <TextInput
            style={styles.input}
            placeholder={t("auth.password")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />

          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={() => setResetPasswordModalVisible(true)}
            disabled={isLoading}
          >
            <Text style={styles.forgotPasswordText}>
              {t("auth.forgotPassword")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signInButton, isLoading && styles.disabledButton]}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.signInButtonText}>{t("auth.signIn")}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>
              {t("auth.dontHaveAccount")}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("SignUp")} disabled={isLoading}>
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
                Enter your email address and we'll send you a link to reset your password.
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder={t("auth.email")}
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setResetPasswordModalVisible(false)}
                  disabled={isLoading}
                >
                  <Text style={styles.cancelButtonText}>{t("general.cancel")}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.modalButton, 
                    styles.submitButton,
                    isLoading && styles.disabledButton
                  ]}
                  onPress={handlePasswordReset}
                  disabled={isLoading}
                >
                  {isLoading ? (
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
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#148F55",
  },
  formContainer: {
    width: "100%",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
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
    width: "100%",
    height: 50,
    backgroundColor: "#148F55",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: "#a0d0ba",
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signUpText: {
    color: "#333",
    fontSize: 14,
    marginRight: 5,
  },
  signUpLink: {
    color: "#148F55",
    fontSize: 14,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
    elevation: 5
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#148F55',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  modalButton: {
    width: '48%',
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#148F55',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SignInScreen; 