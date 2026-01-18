
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useFavorites } from "./FavoritesContext";
import api, { hairTryOn, BASE_URL } from "./api";

const HairtryonScreen = ({ navigation, route }) => {
  const [faceImage, setFaceImage] = useState(null);
  const [selectedHair, setSelectedHair] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addFavorite } = useFavorites();

  const [hairs, setHairs] = useState([]);

  useEffect(() => {
    fetchHairs();
  }, []);

  const fetchHairs = async () => {
    try {
      const res = await api.get("/services");
      setHairs(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (route.params?.faceImage && route.params?.selectedHair) {
      setFaceImage(route.params.faceImage);
      setSelectedHair(route.params.selectedHair);
    }
  }, [route.params]);

  /* -----------------------------------------------------------
     PROCESS AI IMAGE
  ------------------------------------------------------------*/
  const processWithAI = async () => {
    if (!faceImage || !selectedHair) {
      Alert.alert("Error", "Please select a hairstyle and upload an image.");
      return;
    }

    setIsProcessing(true);
    setProcessedImage(null); // reset old result

    try {
      const formData = new FormData();
      formData.append("target", {
        uri: faceImage.uri,
        type: "image/jpeg",
        name: "target.jpg",
      });
      formData.append("source", {
        uri: selectedHair.image,
        type: "image/jpeg",
        name: "source.jpg",
      });

      const response = await hairTryOn(formData);

      const data = response.data;
      console.log("AI RESPONSE:", data);

      if (data.success) {
        // FIX: use outputUrl (NOT resultUrl)
        const fullImageUrl = `${BASE_URL}${data.outputUrl}?t=${Date.now()}`;

        console.log("FINAL IMAGE URL:", fullImageUrl);

        setProcessedImage({ uri: fullImageUrl });
      } else {
        Alert.alert("Error", data.detail || "AI processing failed.");
      }
    } catch (error) {
      console.error("AI ERROR:", error);
      Alert.alert("Error", "Failed to connect to backend.");
    } finally {
      setIsProcessing(false);
    }
  };

  /* -----------------------------------------------------------
     IMAGE PICKER
  ------------------------------------------------------------*/
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      // aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled)
      setFaceImage({ uri: result.assets[0].uri });
  };

  const removeImage = () => {
    setFaceImage(null);
    setProcessedImage(null);
  };

  const saveFavorite = () => {
    if (!processedImage) {
      Alert.alert("Error", "Please process the hairstyle first.");
      return;
    }

    if (!selectedHair) {
      Alert.alert("Error", "Please select a hairstyle.");
      return;
    }

    addFavorite({
      id: Date.now(),               // unique id
      type: "hair",                 // IMPORTANT
      faceImage: processedImage.uri,  // final processed image URL
      hairstyleImage: selectedHair.image, // the hairstyle PNG/JPG
      name: selectedHair.name,
    });

    Alert.alert("Success", "Saved to favorites!");
  };



  const shareResultImage = async () => {
    if (!processedImage) {
      Alert.alert("Error", "Please process an image first!");
      return;
    }

    try {
      const fileUri = FileSystem.cacheDirectory + "hair_tryon_share.jpg";

      await FileSystem.downloadAsync(processedImage.uri, fileUri);

      await Sharing.shareAsync(fileUri, {
        mimeType: "image/jpeg",
        dialogTitle: "Share Hair TryOn Result",
      });
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Unable to share image.");
    }
  };


  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("CameraScreen")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color="#744C80" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Hairs TryOn</Text>
      </View>

      {/* Image Preview */}
      <View style={styles.imageContainer}>
        {processedImage ? (
          <Image source={processedImage} style={styles.previewImage} />
        ) : faceImage ? (
          <Image source={faceImage} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>
              Please upload or take a picture
            </Text>
          </View>
        )}

        {isProcessing && <ActivityIndicator size="large" color="#744C80" />}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        {faceImage && (
          <TouchableOpacity onPress={removeImage} style={styles.iconButton}>
            <FontAwesome name="times" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
          <FontAwesome name="image" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={processWithAI}
          disabled={isProcessing}
          style={[styles.iconButton, isProcessing && styles.disabled]}
        >
          <FontAwesome name="magic" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={saveFavorite} style={styles.iconButton}>
          <FontAwesome name="star" size={24} color="#fff" />
        </TouchableOpacity>
        {processedImage && (
          <TouchableOpacity onPress={shareResultImage} style={styles.iconButton}>
            <FontAwesome name="share" size={24} color="#fff" />
          </TouchableOpacity>
        )}

      </View>

      {/* Hair List */}
      <Text style={styles.sectionTitle}>Hairs</Text>

      <FlatList
        horizontal
        data={hairs}
        keyExtractor={(item) => item._id}
        showsHorizontalScrollIndicator={false}
        style={{ marginVertical: 1, paddingHorizontal: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedHair(item)}
            style={[
              styles.hairCard,
              selectedHair?._id === item._id && styles.hairCardSelected,
            ]}
          >
            <Image source={{ uri: item.image }} style={styles.hairImage} />
            <Text style={styles.hairName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />


    </View>
  );
};

export default HairtryonScreen;

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#fff", marginTop: 50 },
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
  imageContainer: { alignItems: "center", paddingVertical: 10 },
  previewImage: { width: 350, height: 400, borderRadius: 20 },
  placeholderBox: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 190,
  },
  placeholderText: {
    fontSize: 18,
    color: "#744C80",
    textAlign: "center",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  iconButton: {
    backgroundColor: "#744C80",
    padding: 12,
    borderRadius: 30,
    marginHorizontal: 10,
  },
  disabled: { backgroundColor: "#ccc" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#744C80",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  hairCard: {
    alignItems: "center",
    marginHorizontal: 5,
    padding: 5,
    borderRadius: 10,
  },
  hairCardSelected: {
    borderWidth: 2,
    borderColor: "#744C80",
  },
  hairImage: { width: 120, height: 190, borderRadius: 10 },
  hairName: {
    color: "#744C80",
    textAlign: "center",
    marginVertical: 5,
  },

});


//  HairTryOnScreen.js
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";

// const API_URL = "http://192.168.1.47:8080/api/ai/hairtryon";

// export default function HairTryOnScreen() {
//   const [targetImage, setTargetImage] = useState(null);
//   const [sourceImage, setSourceImage] = useState(null);
//   const [resultImage, setResultImage] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // Pick Image Function
//   const pickImage = async (type) => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: false,
//       quality: 1,
//     });

//     if (!result.canceled) {
//       if (type === "target") setTargetImage(result.assets[0]);
//       else setSourceImage(result.assets[0]);
//     }
//   };

//   // Upload Both Images To Backend
//   const runTryOn = async () => {
//     if (!targetImage || !sourceImage) {
//       Alert.alert("Error", "Please select BOTH images.");
//       return;
//     }

//     try {
//       setLoading(true);
//       setResultImage(null);

//       let formData = new FormData();
//       formData.append("target", {
//         uri: targetImage.uri,
//         type: "image/jpeg",
//         name: "target.jpg",
//       });
//       formData.append("source", {
//         uri: sourceImage.uri,
//         type: "image/jpeg",
//         name: "source.jpg",
//       });

//       const response = await fetch(API_URL, {
//         method: "POST",
//         body: formData,
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       const data = await response.json();
//       console.log("AI RESPONSE:", data);

//       if (!data.success) {
//         Alert.alert("Error", data.error || "AI processing failed.");
//         return;
//       }

//       const finalUrl = `http://192.168.1.47:8080${data.outputUrl}`;
//       setResultImage(finalUrl);
//     } catch (error) {
//       console.log("Upload error:", error);
//       Alert.alert("Error", "Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//         {/* Header */}
//         <Text style={{
//           fontSize: 24,
//           fontWeight: "bold",
//           color: "#744C80",
//           textAlign: "center",
//           marginBottom: 20,
//           marginTop: 25,
//         }}>
//           Dye Try-On
//         </Text>

//       {/* Target Image */}
//       <TouchableOpacity
//         style={styles.pickButton}
//         onPress={() => pickImage("target")}
//       >
//         <Text style={styles.pickText}>Pick TARGET Image (Your Face)</Text>
//       </TouchableOpacity>
//       {targetImage && (
//         <Image source={{ uri: targetImage.uri }} style={styles.imagePreview} />
//       )}

//       {/* Source Image */}
//       <TouchableOpacity
//         style={styles.pickButton}
//         onPress={() => pickImage("source")}
//       >
//         <Text style={styles.pickText}>Pick SOURCE Image (Desired Hair)</Text>
//       </TouchableOpacity>
//       {sourceImage && (
//         <Image source={{ uri: sourceImage.uri }} style={styles.imagePreview} />
//       )}

//       {/* Run Button */}
//       <TouchableOpacity style={styles.runButton} onPress={runTryOn}>
//         <Text style={styles.runText}>RUN AI MODEL</Text>
//       </TouchableOpacity>

//       {/* Loader */}
//       {loading && <ActivityIndicator size="large" color="purple" />}

//       {/* Result Image */}
//       {resultImage && (
//         <>
//           <Text style={styles.resultLabel}>Final Output (Filled Image)</Text>
//           <Image source={{ uri: resultImage }} style={styles.resultImage} />
//         </>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     alignItems: "center",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "700",
//     marginBottom: 20,
//   },
//   pickButton: {
//     backgroundColor: "#744C80",
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 10,
//     width: "80%",
//   },
//   pickText: {
//     textAlign: "center",
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#fff",
//   },
//   imagePreview: {
//     width: 300,
//     height: 350,
//     borderRadius: 10,
//     marginBottom: 20,
//   },
//   runButton: {
//     backgroundColor: "#6C63FF",
//     padding: 15,
//     borderRadius: 10,
//     width: "100%",
//     marginTop: 10,
//   },
//   runText: {
//     color: "white",
//     textAlign: "center",
//     fontSize: 18,
//   },
//   resultLabel: {
//     marginTop: 20,
//     fontSize: 18,
//     fontWeight: "600",
//   },
//   resultImage: {
//     width: 300,
//     height: 300,
//     borderRadius: 0,
//     marginTop: 10,
//     marginBottom: 20,
//   },
// });

