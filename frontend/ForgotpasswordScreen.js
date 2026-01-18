import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import api from "./api"; // Auto IP axios
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");

  const handleSendOtp = async () => {
    if (!email.endsWith("@gmail.com")) {
      return Alert.alert("Invalid Email", "Please enter a valid Gmail address.");
    }

    try {
      await api.post("/otpauth/forgot-password", { email });
      Alert.alert("OTP Sent", "Check your email for the reset code.");
      navigation.navigate("ResetOtpScreen", { email });
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
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>Enter your email to receive a reset code</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Gmail address"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
        <Text style={styles.buttonText}>Send OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#fff", marginTop:20, },
    backButton: {
    position: 'absolute',
    top: 48, // Adjust based on your header/status bar
    left: 20,
    zIndex: 10,
    padding: 5,
  },
  title: { fontSize: 26, fontWeight: "700", textAlign: "center", color: "#744C80", marginBottom: 10 },
  subtitle: { fontSize: 14, textAlign: "center", color: "#555", marginBottom: 25 },
  input: {
    backgroundColor: "#f7f7f7",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#744C80",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
