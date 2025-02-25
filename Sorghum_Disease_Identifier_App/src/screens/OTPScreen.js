import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const OTPScreen = ({ route, navigation }) => {
  const { formData } = route.params;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const otpInputs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleResendOTP = () => {
    if (timer === 0) {
      // TODO: Implement resend OTP logic
      setTimer(30);
      Alert.alert("Success", "OTP has been resent");
    }
  };

  const handleVerifyOTP = () => {
    const enteredOTP = otp.join("");
    if (enteredOTP.length !== 6) {
      Alert.alert("Error", "Please enter complete OTP");
      return;
    }

    // TODO: Implement OTP verification logic
    console.log("Verifying OTP:", enteredOTP);
    console.log("Form Data:", formData);
    navigation.navigate("Signin");

    // For now, just show success and navigate to Home
    // Alert.alert("Success", "Account created successfully!", [
    //   {
    //     text: "OK",
    //     onPress: () => navigation.navigate("Signin"),
    //   },
    // ]);
};

  return (
    <View style={styles.container}>
      <MaterialIcons name="verified-user" size={50} color="#148F55" />
      <Text style={styles.title}>OTP Verification</Text>
      <Text style={styles.subtitle}>
        Enter the verification code we sent to{"\n"}
        {formData.phoneNumber}
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(input) => (otpInputs.current[index] = input)}
            style={styles.otpInput}
            maxLength={1}
            keyboardType="number-pad"
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.resendButton, timer > 0 && styles.resendButtonDisabled]}
        onPress={handleResendOTP}
        disabled={timer > 0}
      >
        <Text
          style={[
            styles.resendButtonText,
            timer > 0 && styles.resendButtonTextDisabled,
          ]}
        >
          Resend OTP {timer > 0 ? `(${timer}s)` : ""}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyOTP}>
        <Text style={styles.verifyButtonText}>Verify & Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  otpInput: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: "#148F55",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 20,
    backgroundColor: "#f9f9f9",
  },
  resendButton: {
    marginBottom: 20,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: "#148F55",
    fontSize: 16,
  },
  resendButtonTextDisabled: {
    color: "#666",
  },
  verifyButton: {
    backgroundColor: "#148F55",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default OTPScreen; 