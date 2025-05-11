import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";

const SignUpScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [validations, setValidations] = useState({
    name: {
      isValid: false,
      message: "Name must be at least 3 letters and contain only letters",
    },
    email: {
      isValid: false,
      message: "Please enter a valid email address",
    },
    password: {
      minLength: false,
      hasUpper: false,
      hasLower: false,
      hasNumber: false,
      isValid: false,
    },
  });
  const [isChecked, setIsChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate name
  const validateName = (name) => {
    // Only letters and spaces, minimum 3 characters, and at least 3 letters
    const nameRegex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
    const hasMinLength = name.length >= 3;
    const letterCount = (name.match(/[A-Za-z]/g) || []).length;
    return nameRegex.test(name) && hasMinLength && letterCount >= 3;
  };

  // Validate email
  const validateEmail = (email) => {
    // More comprehensive email regex that checks for:
    // - Proper local part (before @)
    // - Valid domain with at least 2 characters in TLD
    // - No consecutive dots
    // - Proper characters in both local and domain parts
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email || typeof email !== "string") {
      return false;
    }

    // Basic format check
    if (!emailRegex.test(email)) {
      return false;
    }

    // Additional checks
    const [localPart, domain] = email.split("@");

    // Check local part
    if (localPart.length === 0 || localPart.length > 64) {
      return false;
    }

    // Check domain
    if (domain.length === 0 || domain.length > 255) {
      return false;
    }

    // Check for consecutive dots
    if (email.includes("..")) {
      return false;
    }

    // Check if TLD is valid (at least 2 characters)
    const tld = domain.split(".").pop();
    if (tld.length < 2) {
      return false;
    }

    return true;
  };

  // Validate password
  const validatePassword = (password) => {
    const validations = {
      minLength: password.length >= 6,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };
    validations.isValid = Object.values(validations).every((v) => v);
    return validations;
  };

  // Update validations when form data changes
  useEffect(() => {
    const nameIsValid = validateName(formData.name);
    const emailIsValid = validateEmail(formData.email);
    const passwordValidations = validatePassword(formData.password);

    setValidations({
      name: {
        isValid: nameIsValid,
        message: nameIsValid
          ? ""
          : "Name must be at least 3 letters and contain only letters (no numbers or special characters)",
      },
      email: {
        isValid: emailIsValid,
        message: emailIsValid ? "" : "Please enter a valid email address",
      },
      password: passwordValidations,
    });
  }, [formData.name, formData.email, formData.password]);

  // Handle name input with immediate validation
  const handleNameChange = (text) => {
    // Remove any numbers or special characters immediately
    const sanitizedText = text.replace(/[^A-Za-z\s]/g, "");
    setFormData({ ...formData, name: sanitizedText });
  };

  const handleSignUp = async () => {
    if (!formData.email || !formData.password || !formData.name) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!validations.name.isValid) {
      Alert.alert("Error", validations.name.message);
      return;
    }

    if (!validations.email.isValid) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (!validations.password.isValid) {
      Alert.alert(
        "Error",
        "Please ensure your password meets all requirements"
      );
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
      const result = await register(
        formData.name,
        formData.email,
        formData.password
      );
      console.log("SignUpScreen: Register API Response:", result);

      if (result.success) {
        console.log(
          "SignUpScreen: Registration successful, preparing to navigate to OTP screen"
        );

        // Navigate to OTP screen immediately for smoother transition
        navigation.replace("OTP", {
          formData: {
            email: formData.email,
            timestamp: Date.now(),
          },
        });

        // Store data in AsyncStorage in the background
        AsyncStorage.setItem("pendingOtpEmail", formData.email);
        AsyncStorage.setItem("pendingOtpTimestamp", Date.now().toString());

        console.log("SignUpScreen: Navigation to OTP complete");
      } else {
        console.log("SignUpScreen: Registration failed:", result.error);
        Alert.alert(
          "Error",
          result.error || "Sign up failed. Please try again."
        );
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
          <Text style={styles.label}>{t("auth.name")}</Text>
          <TextInput
            style={[
              styles.input,
              !validations.name.isValid && formData.name && styles.inputError,
            ]}
            placeholder="Enter your name (letters only)"
            value={formData.name}
            onChangeText={handleNameChange}
            autoCapitalize="words"
          />
          {formData.name && (
            <View style={styles.requirementItem}>
              <MaterialIcons
                name={validations.name.isValid ? "check-circle" : "cancel"}
                size={16}
                color={validations.name.isValid ? "#148F55" : "#FF6B6B"}
              />
              <Text
                style={[
                  styles.requirementText,
                  !validations.name.isValid && styles.errorText,
                ]}
              >
                {validations.name.isValid
                  ? "Valid name"
                  : validations.name.message}
              </Text>
            </View>
          )}

          <Text style={styles.label}>{t("auth.email")}</Text>
          <TextInput
            style={[
              styles.input,
              !validations.email.isValid && formData.email && styles.inputError,
            ]}
            placeholder="mailtoexample@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
          />
          {formData.email && (
            <View style={styles.requirementItem}>
              <MaterialIcons
                name={validations.email.isValid ? "check-circle" : "cancel"}
                size={16}
                color={validations.email.isValid ? "#148F55" : "#FF6B6B"}
              />
              <Text
                style={[
                  styles.requirementText,
                  !validations.email.isValid && styles.errorText,
                ]}
              >
                {validations.email.isValid
                  ? "Valid email"
                  : validations.email.message}
              </Text>
            </View>
          )}

          <Text style={styles.label}>{t("auth.password")}</Text>
          <View
            style={[
              styles.passwordContainer,
              !validations.password.isValid &&
                formData.password &&
                styles.inputError,
            ]}
          >
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
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

          {/* Password requirements */}
          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementTitle}>Password must have:</Text>
            <View style={styles.requirementItem}>
              <MaterialIcons
                name={
                  validations.password.minLength ? "check-circle" : "cancel"
                }
                size={16}
                color={validations.password.minLength ? "#148F55" : "#FF6B6B"}
              />
              <Text style={styles.requirementText}>At least 6 characters</Text>
            </View>
            <View style={styles.requirementItem}>
              <MaterialIcons
                name={validations.password.hasUpper ? "check-circle" : "cancel"}
                size={16}
                color={validations.password.hasUpper ? "#148F55" : "#FF6B6B"}
              />
              <Text style={styles.requirementText}>One uppercase letter</Text>
            </View>
            <View style={styles.requirementItem}>
              <MaterialIcons
                name={validations.password.hasLower ? "check-circle" : "cancel"}
                size={16}
                color={validations.password.hasLower ? "#148F55" : "#FF6B6B"}
              />
              <Text style={styles.requirementText}>One lowercase letter</Text>
            </View>
            <View style={styles.requirementItem}>
              <MaterialIcons
                name={
                  validations.password.hasNumber ? "check-circle" : "cancel"
                }
                size={16}
                color={validations.password.hasNumber ? "#148F55" : "#FF6B6B"}
              />
              <Text style={styles.requirementText}>One number</Text>
            </View>
          </View>

          <Text style={styles.emailVerificationNote}>
            <MaterialIcons name="info-outline" size={14} color="#148F55" /> A
            verification code will be sent to your email
          </Text>

          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setIsChecked(!isChecked)}
            >
              {isChecked && (
                <MaterialIcons name="check" size={16} color="#148F55" />
              )}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              By ticking you agree to our{" "}
              <Text style={styles.termsLink}>Terms and Policies</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.signUpButton,
              (!isChecked ||
                isSubmitting ||
                !validations.name.isValid ||
                !validations.email.isValid ||
                !validations.password.isValid) &&
                styles.signUpButtonDisabled,
            ]}
            onPress={handleSignUp}
            disabled={
              !isChecked ||
              isSubmitting ||
              !validations.name.isValid ||
              !validations.email.isValid ||
              !validations.password.isValid
            }
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
        <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
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
  inputError: {
    borderColor: "#FF6B6B",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginLeft: 8,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  passwordRequirements: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
  },
  requirementTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -15,
    marginBottom: 15,
  },
  requirementText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#148F55",
  },
  emailVerificationNote: {
    fontSize: 12,
    color: "#666",
    marginBottom: 20,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#148F55",
    borderRadius: 4,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  termsText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  termsLink: {
    color: "#148F55",
  },
  signUpButton: {
    backgroundColor: "#148F55",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
  },
  signUpButtonDisabled: {
    backgroundColor: "#A8A8A8",
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
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
