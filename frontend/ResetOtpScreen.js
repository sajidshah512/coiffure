import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import api from "./api";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';

const ResetOtpScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params;

  const [otp, setOtp] = useState("");

  const handleVerifyOtp = async () => {
    if (otp.length !== 5) {
      return Alert.alert("Invalid OTP", "OTP must be 5 digits.");
    }

    try {
      await api.post("/otpauth/verify-reset-otp", { email, otp });
      Alert.alert("Success", "OTP verified.");
      navigation.navigate("ResetPasswordScreen", { email });
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <View style={styles.container}>
                   <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={30} color="#744C80" />
            </TouchableOpacity>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>A verification code was sent to {email}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter 5-digit OTP"
        placeholderTextColor="#999"
        keyboardType="numeric"
        maxLength={5}
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
        <Text style={styles.buttonText}>Verify OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResetOtpScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#fff", marginTop:20, },
    backButton: {
    position: 'absolute',
    top: 48, // Adjust based on your header/status bar
    left: 20,
    zIndex: 10,
    padding: 5,
  },  title: { fontSize: 26, fontWeight: "700", textAlign: "center", color: "#744C80" },
  subtitle: { fontSize: 14, textAlign: "center", color: "#555", marginBottom: 20 },
  input: {
    backgroundColor: "#f7f7f7",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 3,
  },
  button: {
    backgroundColor: "#744C80",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
