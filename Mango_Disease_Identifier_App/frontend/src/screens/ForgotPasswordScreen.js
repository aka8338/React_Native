import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";

const ForgotPasswordScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", t("auth.emailRequired"));
      return;
    }

    // Simple email validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", t("auth.invalidEmail"));
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPassword(email);
      console.log("Password reset response:", response);

      if (response.success) {
        // Store the email to use it in OTP screen
        await AsyncStorage.setItem("pendingOtpEmail", email);
        await AsyncStorage.setItem("pendingOtpTimestamp", Date.now().toString());
        
        // Add a flag to indicate this is a password reset flow
        await AsyncStorage.setItem("pendingPasswordReset", "true");
        
        // Clear any fromLogout flag to prevent redirection to login
        await AsyncStorage.removeItem("fromLogout");
        await AsyncStorage.removeItem("justVerified");
        
        console.log("Password reset initiated, navigating to OTP screen");
        
        // Use a more direct navigation approach
        navigation.replace("OTP", {
          fromPasswordReset: true,
          email: email
        });
      } else {
        Alert.alert(
          "Error",
          response.error || t("auth.resetPasswordFailed")
        );
      }
    } catch (error) {
      console.error("Password reset error:", error);
      Alert.alert(
        "Error",
        error.message || t("auth.resetPasswordFailed")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/background-image.png")}
        style={styles.background}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/splashscreen_logo.png")}
              style={styles.logo}
            />
            <Text style={styles.title}>{t("auth.forgotPassword")}</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.instructions}>
              {t("auth.forgotPasswordInstructions")}
            </Text>

            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={24} color="#7D7D7D" />
              <TextInput
                style={styles.input}
                placeholder={t("auth.email")}
                placeholderTextColor="#7D7D7D"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.resetButtonText}>
                  {t("auth.sendResetLink")}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate("SignIn")}
            >
              <Text style={styles.backButtonText}>
                {t("auth.backToLogin")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#148F55",
    marginTop: 10,
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 10,
  },
  instructions: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
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
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    color: "#333",
  },
  resetButton: {
    backgroundColor: "#148F55",
    borderRadius: 5,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  resetButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  backButton: {
    alignItems: "center",
  },
  backButtonText: {
    color: "#148F55",
    fontSize: 16,
  },
});

export default ForgotPasswordScreen; 