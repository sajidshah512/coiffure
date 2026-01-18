import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

const CameraScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("HomeScreen")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color="#744C80" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Virtual Try on</Text>
      </View>

      {/* Virtual Try-On Section */}
      <View style={styles.tryOnContainer}>
        <Image source={require("./assets/fuyuka.jpeg")} style={styles.image} />

        {/* NEW BUTTON 1 — DYE TRY ON */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("DyeTryOnScreen")}
        >
          <Ionicons name="play-circle" size={20} color="white" />
          <Text style={styles.buttonText}>Dye Try-On</Text>
        </TouchableOpacity>

        {/* NEW BUTTON 2 — HAIRSTYLE TRY ON */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("HairTryOnScreen")}
        >
          <Ionicons name="play-circle" size={20} color="white" />
          <Text style={styles.buttonText}>Hairstyle Try-On</Text>
        </TouchableOpacity>

        <Text style={styles.description}>
          See how the hairs will appear on faces like an actual mirror.
        </Text>
      </View>

      {/* Bottom Navigation */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          backgroundColor: "#744C80",
          paddingVertical: 16,
          position: "absolute",
          bottom: 0,
          width: "110%",
        }}
      >
        {[
          { name: "home", label: "Home", screen: "HomeScreen" },
          { name: "heart", label: "Favorite", screen: "FavoriteScreen" },
          { name: "camera", label: "Camera", screen: "CameraScreen" },
          { name: "calendar", label: "Bookings", screen: "MyBookingsScreen" },
          { name: "user", label: "Profile", screen: "ProfileScreen" },
        ].map((item, index) => (
          <TouchableOpacity key={index} onPress={() => navigation.navigate(item.screen)}>
            <View style={{ alignItems: "center" }}>
              <FontAwesome name={item.name} size={24} color="#fff" />
              <Text style={{ color: "#fff" }}>{item.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 50, paddingHorizontal: 15, },
    header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
      headerText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#744C80",
    flex: 1,
    marginRight:28, // balances the back button space
  },
  backButton: {
    padding: 8,
    zIndex: 10,
  },
  headerTitle: { color: "white", fontSize: 18, marginLeft: 10, fontWeight: "bold" },
  tryOnContainer: {
    backgroundColor: "white",
    margin: 40,
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },

  image: { width: 250, height: 240, marginBottom: 25, borderRadius: 10 },
  button: {
    flexDirection: "row",
    backgroundColor: "#744C80",
    padding: 10,
    borderRadius: 5,
    marginVertical: 6,
    alignItems: "center",
    width: "90%",
    justifyContent: "center",
  },
  buttonText: { color: "white", fontSize: 16, marginLeft: 10 },
  description: {
    marginTop: 20,
    fontSize: 14,
    textAlign: "center",
    color: "#744C80",
  },
});

export default CameraScreen;
