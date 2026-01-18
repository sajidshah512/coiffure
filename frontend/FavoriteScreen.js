import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import { useFavorites } from "./FavoritesContext";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

const FavoriteScreen = ({ navigation }) => {
  const { favoriteLooks, removeFavorite } = useFavorites();

  const handleRemove = (index) => {
    Alert.alert(
      "Remove Favorite",
      "Are you sure you want to remove this item?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", onPress: () => removeFavorite(index) },
      ]
    );
  };

  // Re-Try Hairstyle
  const handleTryAgainHair = (look) => {
    navigation.navigate("HairTryOnScreen", {
      faceImage: look.faceImage,
      selectedHair: look.hair,
    });
  };

  // Re-Apply Color
  const handleTryAgainColor = (look) => {
    navigation.navigate("DyeTryOnScreen", {
      faceImage: look.faceImage,
      previousColor: look.hairColor,
    });
  };

  // RENDER HAIRSTYLE FAVORITE
  const renderHairItem = (item, index) => (
    <View style={styles.card}>
      <Image source={item.faceImage} style={styles.faceImage} />

<Image source={{ uri: item.hair.image }} style={styles.hairImage} />


      <Text style={styles.hairName}>{item.hair.name}</Text>

      <View style={styles.actions}>
        {/* <TouchableOpacity
          onPress={() => handleTryAgainHair(item)}
          style={styles.refreshBtn}
        >
          <FontAwesome name="refresh" size={20} color="#fff" />
        </TouchableOpacity> */}

        <TouchableOpacity
          onPress={() => handleRemove(index)}
          style={styles.trashBtn}
        >
          <FontAwesome name="trash" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // RENDER HAIR DYE FAVORITE
  const renderDyeItem = (item, index) => (
    <View style={styles.card}>
      <Image source={item.faceImage} style={styles.faceImage} />

      {/* Color Box */}
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 10,
          marginTop: 15,
          backgroundColor: item.hairColor,
          borderWidth: 2,
          borderColor: "#744C80",
        }}
      />

      <Text style={styles.dyeText}>
        Color: {item.hairColor}
      </Text>

      <View style={styles.actions}>
        {/* <TouchableOpacity
          onPress={() => handleTryAgainColor(item)}
          style={styles.refreshBtn}
        >
          <FontAwesome name="refresh" size={20} color="#fff" />
        </TouchableOpacity> */}

        <TouchableOpacity
          onPress={() => handleRemove(index)}
          style={styles.trashBtn}
        >
          <FontAwesome name="trash" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // SINGLE RENDER FUNCTION
  const renderItem = ({ item, index }) => {
    if (item.type === "dye") return renderDyeItem(item, index);
    return renderHairItem(item, index);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("HomeScreen")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={30} color="#744C80" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Favorite Looks</Text>
      </View>

      {/* EMPTY */}
      {favoriteLooks.length === 0 ? (
        <Text style={styles.emptyText}>No favorites yet.</Text>
      ) : (
        <FlatList
          data={favoriteLooks}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* BOTTOM NAV */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          backgroundColor: "#744C80",
          paddingVertical: 16,
          position: "absolute",
          bottom: 0,
          width: "108%",
        }}
      >
        {[
          { name: "home", label: "Home", screen: "HomeScreen" },
          { name: "heart", label: "Favorite", screen: "FavoriteScreen" },
          { name: "camera", label: "Camera", screen: "CameraScreen" },
          { name: "calendar", label: "Bookings", screen: "MyBookingsScreen" },
          { name: "user", label: "Profile", screen: "ProfileScreen" },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate(item.screen)}
          >
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

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 15,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  backButton: {
    padding: 8,
    zIndex: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#744C80",
    flex: 1,
    marginRight: 28,
  },
  emptyText: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 16,
    marginTop: 40,
  },
  card: {
    backgroundColor: "#fff",
    marginVertical: 10,
    borderRadius: 15,
    elevation: 5,
    padding: 15,
    alignItems: "center",
  },
  faceImage: {
    width: 250,
    height: 300,
    borderRadius: 15,
  },
  hairImage: {
    width: 100,
    height: 120,
    borderRadius: 10,
    marginTop: 12,
  },
  hairName: {
    fontWeight: "bold",
    color: "#744C80",
    marginTop: 10,
    fontSize: 16,
  },
  dyeText: {
    marginTop: 10,
    fontWeight: "bold",
    color: "#744C80",
    fontSize: 16,
  },
  actions: {
    flexDirection: "row",
    marginTop: 15,
  },
  refreshBtn: {
    backgroundColor: "#744C80",
    padding: 10,
    borderRadius: 30,
    marginRight: 10,
  },
  trashBtn: {
    backgroundColor: "crimson",
    padding: 10,
    borderRadius: 30,
  },
});

export default FavoriteScreen;
