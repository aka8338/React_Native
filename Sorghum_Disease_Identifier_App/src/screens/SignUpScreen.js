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

const SignUpScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
  });
  const [isChecked, setIsChecked] = useState(false);

  const handleSignUp = () => {
    if (!formData.email || !formData.phoneNumber) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (!isChecked) {
      Alert.alert("Error", "Please accept the Terms and Policies");
      return;
    }
    navigation.navigate("OTP", { formData });
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
            source={require('../assets/signapp1.jpg')} 
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Sign up</Text>
        <Text style={styles.subtitle}>Create a new account to continue</Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Enter your email Id</Text>
          <TextInput
            style={styles.input}
            placeholder="mailtoexample@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
          />

          <Text style={styles.label}>Enter your phone number</Text>
          <View style={styles.phoneInputContainer}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="986520021"
              keyboardType="phone-pad"
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
              maxLength={10}
            />
          </View>

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
            style={[styles.signUpButton, !isChecked && styles.signUpButtonDisabled]} 
            onPress={handleSignUp}
            disabled={!isChecked}
          >
            <Text style={styles.signUpButtonText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.loginText}>Already have an Account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginLink}>Log in</Text>
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
    marginTop: 20,
    marginLeft: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  formContainer: {
    marginTop: 20,
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
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 20,
  },
  countryCode: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    color: "#000",
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
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
  },
  signUpButton: {
    backgroundColor: "#148F55",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  signUpButtonDisabled: {
    backgroundColor: "#ccc",
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  loginText: {
    color: "#666",
    fontSize: 16,
  },
  loginLink: {
    color: "#148F55",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default SignUpScreen; 