import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { useTheme } from './ThemeContext';
import api from './api';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { theme, themeName, setThemeName, user } = useTheme();
  const [locationText, setLocationText] = useState("Fetching location...");
  const [loadingLocation, setLoadingLocation] = useState(true);

  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingStylists, setLoadingStylists] = useState(true);

  useEffect(() => {
    fetchLocation();
    fetchServices();
    fetchStylists();
  }, []);

  const fetchLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationText("Permission denied");
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode.length > 0) {
        const city = geocode[0].city || geocode[0].region || "Unknown";
        setLocationText(`📍 ${city}`);
      } else {
        setLocationText("📍 Location not found");
      }
    } catch (error) {
      console.error("Location Error:", error);
      setLocationText("📍 Error fetching location");
    }
    setLoadingLocation(false);
  };

  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const response = await api.get('/services');
      setServices(response.data || []);
    } catch (error) {
   //   console.error("Login Error:", error.response?.data || error.message);
      Alert.alert('Login Error', 'Your Login Session Expired, Please Login Again',
        [
          { text: "OK", onPress: () => navigation.navigate("Login") },
        ]
      )
      setServices([]);
    }
    setLoadingServices(false);
  };

  const fetchStylists = async () => {
    setLoadingStylists(true);
    try {
      const response = await api.get('/stylists');
      setStylists(response.data || []);
    } catch (error) {
  //    console.error("Error fetching stylists:", error.response?.data || error.message);    
  setStylists([]);
    }
    setLoadingStylists(false);
  };

  const handleLocationPress = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to get your current location. Please enable it in settings.",
          [
            { text: "Go to Settings", onPress: () => Linking.openSettings() },
            { text: "Cancel", style: "cancel" },
          ]
        );
        return;
      }

      setLoadingLocation(true);
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (geocode.length > 0) {
        const city = geocode[0].city || geocode[0].region || "Unknown";
        setLocationText(`📍 ${city}`);
      } else {
        setLocationText("📍 Location not found");
      }

      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      Linking.openURL(url);
    } catch (error) {
      console.error("Location Error:", error);
      Alert.alert("Error", "Unable to access your location.");
      setLocationText("📍 Error fetching location");
    } finally {
      setLoadingLocation(false);
    }
  };


  const handleSelectStylist = (stylist) => {
    navigation.navigate('StylistDetailScreen', { stylist });
  };


  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Top Bar */}
      <View style={{ backgroundColor: "#744C80", paddingVertical: 18, paddingHorizontal: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 30 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}>WELCOME</Text>
          
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={handleLocationPress} style={{ flexDirection: "row", alignItems: "center" }}>
              <FontAwesome name="map-marker" size={24} color="#fff" style={{ marginRight: 5 }} />
              {loadingLocation ? (
                <ActivityIndicator size="small" color="#fff" style={{ marginRight: 10 }} />
              ) : (
                <Text style={{ color: "#fff", fontSize: 14 }}>{locationText}</Text>
              )}
            </TouchableOpacity>
          </View> 
                    {/* Notification Icon */}
          {/* <TouchableOpacity
            onPress={() => navigation.navigate("NotificationScreen")}
            style={{
              padding: 0,
              borderRadius: 0,
            }}
          >
            <Ionicons name="notifications" size={28} color="#fff" />
          </TouchableOpacity> */}
        </View>
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        onPress={() => navigation.navigate('SearchScreen', {
          dataHairstyles: services,
          datastylists: stylists,
        })}
        style={{
          flexDirection: "row",
          alignItems: "center",
          margin: 15,
          marginTop: 19,
          borderBottomWidth: 2,
          padding: 3,
          borderBottomColor: "#744C80",
        }}
      >
        <FontAwesome name="search" size={25} color="#744C80" style={{ marginRight: 10 }} />
        <Text style={{ flex: 1, color: "#744C80" }}>Search Hair or Stylists</Text>
      </TouchableOpacity>

      {/* Content */}
      <View>
        {/* Banner */}
        <Image source={require("./assets/banner.png")} style={{ width: "100%", height: 210, borderRadius: 10 }} />
 
{/* Trending Hairstyles */}
<View
  style={{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
    marginTop: 10,
  }}
>
  <Text style={{ fontSize: 18, fontWeight: "bold", color: "#744C80" }}>
    Hairstyles
  </Text>
  <TouchableOpacity onPress={() => navigation.navigate("HairstyleScreen")}>
    <Ionicons
      name="arrow-forward"
      size={26}
      color="#744C80"
      style={{ marginVertical: 5, marginRight: 1 }}
    />
  </TouchableOpacity>
</View>

{loadingServices ? (
  <ActivityIndicator
    size="large"
    color="#744C80"
    style={{ marginVertical: 20 }}
  />
) : (
  <View
    style={{
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginHorizontal: 15,
      marginTop: 0,
    }}
  >
    {services.slice(0, 8).map((item) => (
      <TouchableOpacity
        key={item._id || item.id}
        onPress={() =>
          navigation.navigate(item.screen || "HairstyleDetailScreen", { item })
        }
        style={{
          width: "23%", // 4 items per row
          alignItems: "center",
          marginVertical: 10,
        }}
      >
        <Image
          source={{ uri: item.image }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 50,
          }}
        />
        <Text
          style={{
            color: "#744C80",
            textAlign: "center",
            fontSize: 13,
            marginTop: 5,
          }}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
)}


        {/* Stylists */}
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 10, marginTop: 0 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#744C80" }}>Stylists</Text>
          <TouchableOpacity onPress={() => navigation.navigate("StylistScreen")}> 
            <Ionicons name="arrow-forward" size={26} color="#744C80" style={{ marginVertical: 8, marginRight: 1 }} />
          </TouchableOpacity>
        </View>

        {loadingStylists ? (
          <ActivityIndicator size="large" color="#744C80" style={{ marginVertical: 20 }} />
        ) : (
          <FlatList
            data={stylists}
            horizontal
            scrollEnabled={true}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectStylist(item)}>
                <View style={{ alignItems: "center", margin: 6 }}>
                  <Image source={{ uri: item.image }} style={{ width: 90, height: 99, borderRadius: 10 }} />
                  <Text style={{ color: "#744C80" }}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item._id || item.id}
          />
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={{
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "#744C80",
        paddingVertical: 16,
        position: "absolute",
        bottom: 0,
        width: "100%",
      }}>
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

export default HomeScreen;
