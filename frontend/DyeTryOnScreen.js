
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useFavorites } from "./FavoritesContext";
import axios from "axios";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { dyeTryOn } from "./api";

const DyeTryOnScreen = ({ navigation }) => {
  const [photo, setPhoto] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#FF69B4");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const { addFavorite } = useFavorites();
  const [maskUrl, setMaskUrl] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0]);
      setResultUrl(null);
      setMaskUrl(null);
    }
  };


  const removeImage = () => {
    setPhoto(null);
    setResultUrl(null);
  };

  const uploadForTryOn = async () => {
    if (!photo) return alert("Please choose an image first!");
    setLoading(true);

    try {
      const form = new FormData();

      form.append("photo", {
        uri: photo.uri,
        type: "image/jpeg",
        name: "photo.jpg",
      });

      form.append("hairColor", selectedColor);

      const response = await dyeTryOn(form);

      setResultUrl(response.data.resultUrl);
      setMaskUrl(response.data.maskUrl);
    } catch (error) {
      console.log(error);
      alert("Error processing image");
    }

    setLoading(false);
  };

  // -------------------------------
  // SHARE RESULT IMAGE ON WHATSAPP
  // -------------------------------
  const shareImage = async () => {
    if (!resultUrl) return alert("Process an image first!");

    try {
      const fileUri = FileSystem.cacheDirectory + "share.jpg";

      await FileSystem.downloadAsync(resultUrl, fileUri);

      await Sharing.shareAsync(fileUri, {
        mimeType: "image/jpeg",
        dialogTitle: "Share Try-On Result",
      });
    } catch (error) {
      console.log(error);
      alert("Error sharing image.");
    }
  };
  const saveFavorite = () => {
    if (!resultUrl) {
      Alert.alert("Error", "Please process a hairstyle before saving to favorites.");
      return;
    }

    const favoriteItem = {
      type: "dye",               // helps differentiate in favorites screen
      faceImage: { uri: resultUrl },
      hairColor: selectedColor,
    };

    addFavorite(favoriteItem);

    Alert.alert("Success", "Color Try-On saved to favorites!");
  };


  const colorOptions = [
    "#FF69B4", "#FF0000", "#FFA500", "#FFFF00",
    "#00FF00", "#00FFFF", "#0000FF", "#800080",
    "#A52A2A", "#000000", "#444245ff"
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff", marginTop: 50 }}>

      {/* HEADER (same as old tryon) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("CameraScreen")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color="#744C80" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Dye TryOn</Text>
      </View>

      {/* IMAGE PREVIEW (same UI as old screen) */}
      <View style={{ alignItems: "center", paddingVertical: 10 }}>
        {resultUrl ? (
          <Image source={{ uri: resultUrl }} style={{ width: 350, height: 400, borderRadius: 20 }} />
        ) : photo ? (
          <Image source={{ uri: photo.uri }} style={{ width: 350, height: 450, borderRadius: 20 }} />
        ) : (
          <View style={{ alignItems: "center", paddingHorizontal: 20, paddingVertical: 190 }}>
            <Text style={{ fontSize: 18, color: "#744C80", textAlign: "center" }}>
              Please upload or take a picture
            </Text>
          </View>
        )}

        {loading && (
          <ActivityIndicator size="large" color="#744C80" style={{ marginTop: 10 }} />
        )}
      </View>

      {/* ACTION BUTTONS (same layout as old tryon) */}
      <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 10 }}>

        {photo && (
          <TouchableOpacity
            onPress={removeImage}
            style={{ backgroundColor: "#744C80", padding: 12, borderRadius: 40, marginHorizontal: 10 }}
          >
            <FontAwesome name="times" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={pickImage}
          style={{ backgroundColor: "#744C80", padding: 12, borderRadius: 30, marginHorizontal: 10 }}
        >
          <FontAwesome name="image" size={24} color="#fff" />
        </TouchableOpacity>


        <TouchableOpacity
          onPress={uploadForTryOn}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#ccc" : "#744C80",
            padding: 12,
            borderRadius: 40,
            marginHorizontal: 10,
          }}
        >
          <FontAwesome name="magic" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={saveFavorite}
          style={{
            backgroundColor: "#744C80",
            padding: 12,
            borderRadius: 40,
            marginHorizontal: 10,
          }}
        >
          <FontAwesome name="star" size={24} color="#fff" />
        </TouchableOpacity>

        {/* SHARE BUTTON (placed OUTSIDE the action row) */}
        {resultUrl && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <TouchableOpacity
              onPress={shareImage}
              style={{
                backgroundColor: "#744C80",
                padding: 12,
                borderRadius: 30,
                marginHorizontal: 10,
              }}
            >
              <FontAwesome name="share" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

        )}

      </View>  {/* <-- properly closed action button container */}


      {/* COLOR SELECTION LIST (replaces hairstyles list) */}
      <Text style={{
        fontSize: 18,
        fontWeight: "bold",
        color: "#744C80",
        paddingHorizontal: 25,
        marginTop: 10
      }}>
        Colors
      </Text>

      <FlatList
        horizontal
        data={colorOptions}
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        style={{ marginVertical: 15, paddingHorizontal: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedColor(item)}
            style={{
              alignItems: "center",
              marginHorizontal: 8,
              borderWidth: selectedColor === item ? 2 : 0,
              borderColor: selectedColor === item ? "#744C80" : "transparent",
              padding: 5,
              borderRadius: 10,
            }}
          >
            <View
              style={{
                width: 120,
                height: 160,
                borderRadius: 10,
                backgroundColor: item,
              }}
            />
            <Text style={{ color: "#744C80", marginTop: 5 }}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

    </ScrollView>
  );
};

const styles = StyleSheet.create({


  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  backButton: {
    padding: 8,
    zIndex: 10,
    marginLeft: 5,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#744C80",
    flex: 1,
    marginRight: 28, // balances the back button space
  },
});

export default DyeTryOnScreen;
