import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import api from "./api";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const ResetPasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Eye toggle states
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      return Alert.alert("Weak Password", "Password must be at least 8 characters.");
    }

    if (newPassword !== confirmPassword) {
      return Alert.alert("Mismatch", "Passwords do not match.");
    }

    try {
      await api.post("/otpauth/reset-password", {
        email,
        newPassword,
        confirmPassword,
      });

      Alert.alert("Success", "Password updated! Please login.");
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>

      {/* NEW PASSWORD FIELD */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          secureTextEntry={!showNewPassword}
          placeholder="Enter new password"
          placeholderTextColor="#999"
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowNewPassword(!showNewPassword)}
        >
          <Ionicons
            name={showNewPassword ? "eye-off-outline" : "eye-outline"}
            size={24}
            color="#744C80"
          />
        </TouchableOpacity>
      </View>

      {/* CONFIRM PASSWORD FIELD */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          secureTextEntry={!showConfirmPassword}
          placeholder="Confirm new password"
          placeholderTextColor="#999"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Ionicons
            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
            size={24}
            color="#744C80"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    color: "#744C80",
    marginBottom: 20,
  },

  inputWrapper: {
    position: "relative",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#f7f7f7",
    padding: 12,
    paddingRight: 45,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: 16,
  },

  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 12,
  },

  button: {
    backgroundColor: "#744C80",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
