import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";
import { useTranslation } from "react-i18next";

const SignInScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    // TODO: Implement sign in logic
    navigation.navigate("Home");
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
        <View style={styles.imageContainer}>
          <Image 
            source={require('../assets/signin1.jpg')} 
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>{t("auth.signIn")}</Text>
        <Text style={styles.subtitle}>{t("auth.signIn")} {t("general.continue").toLowerCase()}</Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>{t("auth.email")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("auth.email")}
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
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>{t("auth.forgotPassword")}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.signInButton} 
            onPress={handleSignIn}
          >
            <Text style={styles.signInButtonText}>{t("auth.signIn")}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.signUpText}>{t("auth.dontHaveAccount")} </Text>
        <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.signUpLink}>{t("auth.signUp")}</Text>
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
  },
  backButton: {
    marginTop: 10,
    marginLeft: 15,
    padding: 5,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  image: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    marginBottom: 15,
  },
  formContainer: {
    flex: 1,
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    color: "#000",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 15,
    height: 45,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
    height: 45,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#148F55",
    fontSize: 14,
  },
  signInButton: {
    backgroundColor: "#148F55",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },
  signUpText: {
    color: "#666",
    fontSize: 14,
  },
  signUpLink: {
    color: "#148F55",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default SignInScreen; 