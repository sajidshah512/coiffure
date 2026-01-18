import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminHomeScreen = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userRole'); // --- ADDED: Remove userRole on logout ---
    Alert.alert("Logged Out", "You have been successfully logged out.");
    navigation.navigate("Main"); // Navigate back to Main screen to choose login type
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>ADMIN</Text>
      </View>

      {/* Management Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("ManageStylistScreen")}
          style={styles.manageButton}
        >
          <FontAwesome name="scissors" size={18} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Manage Stylist</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("ManageHairstylesScreen")}
          style={styles.manageButton}
        >
          <FontAwesome name="paint-brush" size={18} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Manage Hairstyle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("ManageBookingsScreen")}
          style={styles.manageButton}
        >
          <FontAwesome name="calendar" size={18} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Manage Bookings</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button at Bottom */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={[styles.logoutText, { marginBottom: 30 }]}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topBar: {
    backgroundColor: "#744C80",
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginTop: 0,
    
  },
  topBarTitle: {    
    marginTop: 8,
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  buttonContainer: {
    padding: 20,
    gap: 15,
  },
  manageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#744C80",
    padding: 15,
    borderRadius: 10,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  logoutButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#744C80",
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
    fontWeight: "600",
    marginTop: 20,
  },
});

export default AdminHomeScreen;
