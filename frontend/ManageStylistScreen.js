import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome } from "@expo/vector-icons";
import api from "./api";

const ManageStylistScreen = () => {
  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [rating, setRating] = useState("");
  const [description, setDescription] = useState("");

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editStylistId, setEditStylistId] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);

  const navigation = useNavigation();
  
     const fetchStylists = async () => {
    setLoading(true);
    try {
      const response = await api.get("/stylists");
      setStylists(response.data || []);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch stylists.");
      console.error("Fetch stylists error:", error.response?.data || error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStylists();
  }, []);

  const resetForm = () => {
    setName("");
    setImageUri(null);
    //setRating("");
    setDescription("");
    setEditMode(false);
    setEditStylistId(null);
    setExistingImageUrl(null);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Permission to access media library is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImageUri(result.assets[0].uri);
      setExistingImageUrl(null);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Permission to access camera is required!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImageUri(result.assets[0].uri);
      setExistingImageUrl(null);
    }
  };

  const removeImage = () => {
    setImageUri(null);
    setExistingImageUrl(null);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    // const ratingNum = parseFloat(rating);
    // if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
    //   Alert.alert("Validation Error", "Rating must be a number between 0 and 5.");
    //   return;
    // }

    if (!editMode && !imageUri) {
      Alert.alert("Validation Error", "Please pick an image for a new stylist.");
      return;
    }
    if (editMode && !imageUri && !existingImageUrl) {
      Alert.alert("Validation Error", "Please pick an image or ensure an existing image is present.");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("description", description.trim());

      if (imageUri) {
        const uriParts = imageUri.split(".");
        const fileType = uriParts[uriParts.length - 1].toLowerCase();
        const mimeType =
          fileType === "jpg" || fileType === "jpeg"
            ? "image/jpeg"
            : `image/${fileType}`;

        formData.append("image", {
          uri: imageUri,
          name: `photo.${fileType}`,
          type: mimeType,
        });
      }

      let response;
      if (editMode) {
        response = await api.put(`/stylists/${editStylistId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post("/stylists", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response.status === 201 || response.status === 200) {
        Alert.alert("Success", `Stylist ${editMode ? "updated" : "added"} successfully`);
        resetForm();
        setShowForm(false);
        fetchStylists();
      } else {
        Alert.alert("Error", response.data.message || `Failed to ${editMode ? "update" : "add"} stylist.`);
      }
    } catch (error) {
      console.error("Submit stylist error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || `Failed to ${editMode ? "update" : "add"} stylist.`);
    }
  };

  const handleDeleteStylist = (id) => {
    Alert.alert("Delete Stylist", "Are you sure you want to delete this stylist?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: async () => {
          try {
            const response = await api.delete(`/stylists/${id}`);
            if (response.status === 200 || response.data.success) {
              Alert.alert("Deleted", "Stylist deleted successfully");
              fetchStylists();
            } else {
              Alert.alert("Error", response.data.message || "Failed to delete stylist.");
            }
          } catch (error) {
            console.error("Delete stylist error:", error.response?.data || error.message);
            Alert.alert("Error", error.response?.data?.message || "Failed to delete stylist.");
          }
        },
      },
    ]);
  };

const handleViewStylist = (stylist) => {
  if (!stylist) {
    Alert.alert("Error", "Stylist data is missing.");
    return;
  }
  navigation.navigate("ViewStylist", { item: stylist });
};

  const handleEditStylist = (stylist) => {
    setName(stylist.name || "");
    setDescription(stylist.description || "");
    setExistingImageUrl(stylist.image || null);
    setImageUri(null);
    setEditStylistId(stylist._id);
    setEditMode(true);
    setShowForm(true);
  };

  const renderStylistItem = ({ item }) => (
    <View style={styles.stylistItem}>
      <Image source={{ uri: item.image }} style={styles.stylistImage} />
      <View style={{ flex: 1 }}>
        <Text style={styles.stylistName}>{item.name}</Text>
        <Text style={styles.stylistDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleViewStylist(item)} style={styles.viewButton}>
        <Text style={styles.viewButtonText}>View</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleEditStylist(item)} style={styles.editButton}>
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDeleteStylist(item._id)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#744C80" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#744C80" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Stylist</Text>
        <TouchableOpacity
          onPress={() => {
            setShowForm((prev) => !prev);
            if (showForm) resetForm();
            else resetForm();
          }}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>{showForm ? "Cancel" : "Add Stylist"}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <View style={styles.imagePickerContainer}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : existingImageUrl ? (
              <Image source={{ uri: existingImageUrl }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>No Image Selected</Text>
              </View>
            )}
            <View style={styles.imageActionButtons}>
              {(imageUri || existingImageUrl) && (
                <TouchableOpacity onPress={removeImage} style={styles.imageActionButton}>
                  <FontAwesome name="times" size={24} color="#fff" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={pickImage} style={styles.imageActionButton}>
                <FontAwesome name="image" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={takePhoto} style={styles.imageActionButton}>
                <FontAwesome name="camera" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>


          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>{editMode ? "Update Stylist" : "Add Stylist"}</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={stylists}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderStylistItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

export default ManageStylistScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 10, paddingTop: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 20,
    color: "#744C80",
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#744C80",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  formContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#fafafa",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  imagePickerContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
  },
  imagePlaceholderText: {
    color: "#888",
    fontSize: 14,
  },
  imageActionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  imageActionButton: {
    backgroundColor: "#744C80",
    padding: 12,
    borderRadius: 30,
    marginHorizontal: 5,
  },
  submitButton: {
    backgroundColor: "#744C80",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  stylistItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
  },
  stylistImage: {
    width: 50,
    height: 70,
    borderRadius: 5,
    marginRight: 10,
  },
  stylistName: {
    fontSize: 18,
  },
  stylistDescription: {
    fontSize: 12,
    color: "#555",
  },
  viewButton: {
    marginRight: 10,
  },
  viewButtonText: {
    backgroundColor: "#744C80",
    color: "#fff",
    padding: 8,
    borderRadius: 5,
  },
  editButton: {
    marginRight: 10,
    backgroundColor: "#744C80",
    padding: 8,
    borderRadius: 5,
  },
  editButtonText: {
    color: "#fff",
  },
  deleteButton: {
    backgroundColor: "#744C80",
    padding: 8,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
