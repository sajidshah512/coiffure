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
import { Picker } from "@react-native-picker/picker";
import api from "./api";
import ViewHairstyle from "./ViewHairtyle";

const ManageHairstylesScreen = () => {
  const [hairstyles, setHairstyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [serviceType, setServiceType] = useState("Hairstyle");

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editServiceId, setEditServiceId] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);

  const navigation = useNavigation();

  const serviceTypes = [
    { label: "Hairstyle", value: "Hairstyle" },
    { label: "Dye", value: "Dye" },
    { label: "Cutting", value: "Cutting" },
    { label: "Blowdry", value: "Blowdry" },
  ];

  const fetchHairstyles = async () => {
    setLoading(true);
    try {
      const response = await api.get("/services");
      setHairstyles(response.data || []);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch hairstyles.");
      console.error("Fetch hairstyles error:", error.response?.data || error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHairstyles();
  }, []);

  const resetForm = () => {
    setName("");
    setImageUri(null);
    setDescription("");
    setPrice("");
    setServiceType("Hairstyle");
    setEditMode(false);
    setEditServiceId(null);
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
      // aspect: [1, 1],
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
      // aspect: [1, 1],
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

  const handleAddOrUpdateHairstyle = async () => {
    if (!name.trim() || !description.trim() || !price.trim() || !serviceType) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      Alert.alert("Validation Error", "Price must be a positive number.");
      return;
    }

    if (!editMode && !imageUri) {
      Alert.alert("Validation Error", "Please pick an image for a new hairstyle.");
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
      formData.append("price", priceNum);
      formData.append("type", serviceType);

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
        response = await api.put(`/services/${editServiceId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post("/services", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response.status === 201 || response.status === 200) {
        Alert.alert("Success", `Hairstyle ${editMode ? "updated" : "added"} successfully`);
        resetForm();
        setShowForm(false);
        fetchHairstyles();
      } else {
        Alert.alert("Error", response.data.message || `Failed to ${editMode ? "update" : "add"} hairstyle.`);
      }
    } catch (error) {
      console.error("Submit hairstyle error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || `Failed to ${editMode ? "update" : "add"} hairstyle.`);
    }
  };
  const handleViewDetails = (service) => {
  if (!service) {
    Alert.alert("Error", "Hairstyle data is missing.");
    return;
  }
  navigation.navigate("ViewHairstyle", { item: service });
};
  const handleDeleteHairstyle = (id) => {
    Alert.alert("Delete Hairstyle", "Are you sure you want to delete this hairstyle?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: async () => {
          try {
            const response = await api.delete(`/services/${id}`);
            if (response.status === 200) {
              Alert.alert("Deleted", "Hairstyle deleted successfully");
              fetchHairstyles();
            } else {
              Alert.alert("Error", response.data.message || "Failed to delete hairstyle.");
            }
          } catch (error) {
            Alert.alert("Error", error.response?.data?.message || "Failed to delete hairstyle.");
          }
        },
      },
    ]);
  };

  const handleEditHairstyle = (item) => {
    setName(item.name || "");
    setDescription(item.description || "");
    setPrice(item.price?.toString() || "");
    setServiceType(item.type || "Hairstyle");
    setExistingImageUrl(item.image || null);
    setImageUri(null);
    setEditServiceId(item._id);
    setEditMode(true);
    setShowForm(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.hairstyleItem}>
      <Image source={{ uri: item.image }} style={styles.hairstyleImage} />
      <View style={{ flex: 1 }}>
        <Text style={styles.hairstyleName}>{item.name}</Text>
        <Text numberOfLines={2} style={styles.hairstyleDescription}>
          {item.description}
        </Text>
        <Text style={styles.hairstylePrice}>Rs.{item.price}</Text>

      </View>
        <TouchableOpacity
        onPress={() => handleViewDetails(item)}
        style={styles.viewButton}
      >
        <Text style={styles.viewButtonText}>View</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleEditHairstyle(item)}
        style={styles.editButton}
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleDeleteHairstyle(item._id)}
        style={styles.deleteButton}
      >
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
        <Text style={styles.headerTitle}>Manage Hairstyles</Text>
        <TouchableOpacity
          onPress={() => {
            setShowForm((prev) => !prev);
            if (showForm) resetForm();
            else resetForm();
          }}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>{showForm ? "Cancel" : "Add Hairstyle"}</Text>
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

          <View style={{ marginBottom: 12 }}>
            <Text style={{ marginBottom: 6, fontWeight: "bold", color: "#744C80" }}>
              Select Service Type
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 6,
                backgroundColor: "#fff",
              }}
            >
              <Picker
                selectedValue={serviceType}
                onValueChange={(itemValue) => setServiceType(itemValue)}
                style={{ height: 55, color: "#744C80" }}
              >
                {serviceTypes.map((type) => (
                  <Picker.Item key={type.value} label={type.label} value={type.value} />
                ))}
              </Picker>
            </View>
          </View>

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
            style={styles.input}
            placeholder="Price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TouchableOpacity onPress={handleAddOrUpdateHairstyle} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>{editMode ? "Update Hairstyle" : "Add Hairstyle"}</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={hairstyles}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

export default ManageHairstylesScreen;

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
  hairstyleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
  },
  hairstyleImage: {
    width: 60,
    height: 90,
    borderRadius: 10,
    marginRight: 10,
  },
  hairstyleName: {
    fontSize: 16,
    color: "#744C80",
    fontWeight: "bold",
  },
  hairstyleDescription: {
    fontSize: 12,
    color: "#555",
  },
  hairstylePrice: {
    fontSize: 14,
    color: "#333",
    marginTop: 4,
  },
  hairstyleType: {
    fontSize: 12,
    color: "#744C80",
    marginTop: 2,
    fontStyle: "italic",
  },
  editButton: {
    backgroundColor: "#744C80",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    // fontWeight: "bold",
  },
    viewButton: {
    backgroundColor: "#744C80",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  viewButtonText: {
    color: "#fff",
  },
  deleteButton: {
    backgroundColor: "#744C80",
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    // fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
