import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  ActivityIndicator
} from "react-native";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignUpScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: ""
  });
  const [isChecked, setIsChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (!isChecked) {
      Alert.alert("Error", "Please accept the Terms and Policies");
      return;
    }
    
    console.log("SignUpScreen: Starting signup process", formData);
    setIsSubmitting(true);
    try {
      console.log("SignUpScreen: Calling register function");
      const result = await register(formData.name, formData.email, formData.password);
      console.log("SignUpScreen: Register API Response:", result);
      
      if (result.success) {
        console.log("SignUpScreen: Registration successful, preparing to navigate to OTP screen");
        
        // Store minimal information - just the email for OTP verification
        await AsyncStorage.setItem('pendingOtpEmail', formData.email);
        await AsyncStorage.setItem('pendingOtpTimestamp', Date.now().toString());
        
        // IMPORTANT: Using replace instead of navigate to prevent going back to splash
        navigation.replace("OTP", { 
          formData: {
            email: formData.email,
            timestamp: Date.now() // Add timestamp to ensure params are fresh
          } 
        });
        
        console.log("SignUpScreen: Navigation to OTP complete");
      } else {
        console.log("SignUpScreen: Registration failed:", result.error);
        Alert.alert("Error", result.error || "Sign up failed. Please try again.");
      }
    } catch (error) {
      console.error("SignUpScreen: Sign up error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialIcons name="arrow-back" size={24} color="#148F55" />
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>{t("auth.signUp")}</Text>
        <Text style={styles.subtitle}>{t("auth.createAccount")}</Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>{t("auth.name")} (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder={t("auth.name")}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
          
          <Text style={styles.label}>{t("auth.email")}</Text>
          <TextInput
            style={styles.input}
            placeholder="mailtoexample@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
          />

          <Text style={styles.label}>{t("auth.password")}</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder={t("auth.password")}
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
            />
            <TouchableOpacity 
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialIcons 
                name={showPassword ? "visibility-off" : "visibility"} 
                size={24} 
                color="#148F55" 
              />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.emailVerificationNote}>
            <MaterialIcons name="info-outline" size={14} color="#148F55" /> A verification code will be sent to your email
          </Text>

          <View style={styles.termsContainer}>
            <TouchableOpacity 
              style={styles.checkbox}
              onPress={() => setIsChecked(!isChecked)}
            >
              {isChecked && <MaterialIcons name="check" size={16} color="#148F55" />}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              By ticking you agree to our{" "}
              <Text style={styles.termsLink}>Terms and Policies</Text>
            </Text>
          </View>

          <TouchableOpacity 
            style={[
              styles.signUpButton, 
              (!isChecked || isSubmitting) && styles.signUpButtonDisabled
            ]} 
            onPress={handleSignUp}
            disabled={!isChecked || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.signUpButtonText}>{t("auth.signUp")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.loginText}>{t("auth.alreadyHaveAccount")} </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Signin")}>
          <Text style={styles.loginLink}>{t("auth.login")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    marginTop: 20,
    marginLeft: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  formContainer: {
    marginTop: 30,
  },
  label: {
    fontSize: 14,
    color: "#000",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
  },
  passwordToggle: {
    padding: 10,
  },
  emailVerificationNote: {
    fontSize: 12,
    color: "#666",
    marginBottom: 20,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#148F55",
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  termsLink: {
    color: "#148F55",
    fontWeight: "bold",
  },
  signUpButton: {
    backgroundColor: "#148F55",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  signUpButtonDisabled: {
    backgroundColor: "#88cbb0",
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 30,
  },
  loginText: {
    color: "#666",
  },
  loginLink: {
    color: "#148F55",
    fontWeight: "bold",
  },
});

export default SignUpScreen; 