import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons'; // For back button icon
import { useNavigation } from '@react-navigation/native';
import { useTheme } from './ThemeContext';
import { getUserProfile } from './api'; // Import the API function to fetch user profile

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { theme, themeName, setThemeName } = useTheme(); // Removed 'user' from here since we'll fetch it

  const [user, setUser ] = useState({ name: '', email: '' }); // Local state for user data
  const [loading, setLoading] = useState(true); // Loading state for fetching user data
  const [permissions, setPermissions] = React.useState([]);

  useEffect(() => {
    fetchUserProfile();
    checkPermissions();
  }, []);

// Fetch user profile from API
const fetchUserProfile = async () => {
  try {
    setLoading(true);
    const response = await getUserProfile(); // From api.js
   // console.log('ProfileScreen: Full profile response:', JSON.stringify(response, null, 2)); // DEBUG LOG

    // Handle nested data: response.data.data (since backend now wraps in { data: user })
    const userData = response.data?.data || response.data || {};
    setUser ({
      name: userData.name || 'User ',
      email: userData.email || 'No email set',
    });
  } catch (error) {
  //  console.error('ProfileScreen: Failed to fetch user profile:', error.response?.data || error.message); // Enhanced log
    Alert.alert('Error', 'Failed to load profile. Please try logging in again.');
    setUser ({ name: 'User ', email: 'Profile not available' }); // Fallback
  } finally {
    setLoading(false);
  }
};

  const checkPermissions = async () => {
    const cameraStatus = await Camera.getCameraPermissionsAsync();
    const locationStatus = await Location.getForegroundPermissionsAsync();
    const mediaStatus = await MediaLibrary.getPermissionsAsync();

    const grantedPermissions = [
      { name: 'Camera', status: cameraStatus.granted ? 'granted' : 'denied' },
      { name: 'Location', status: locationStatus.granted ? 'granted' : 'denied' },
      { name: 'Media Library', status: mediaStatus.granted ? 'granted' : 'denied' },
    ];

    setPermissions(grantedPermissions);
  };

  const handleLogout = () => {
    Alert.alert('Logged Out', 'You have been successfully logged out.');
    navigation.navigate('Login');
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Deleted', 'Your account has been deleted.');
          navigation.navigate('Signup');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <ActivityIndicator size="large" color="#744C80" style={{ flex: 1, justifyContent: 'center' }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      {/* Back Button - Top Left Corner */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={30} color="#744C80" />
      </TouchableOpacity>

      <View style={styles.profileContainer}>
        <Image source={require('./assets/user.jpg')} style={styles.profileImage} />
        <Text style={[styles.name, { color: theme.textColor }]}>{user.name}</Text>
        <Text style={[styles.email, { color: theme.textColor }]}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Choose App Theme</Text>
        {['light', 'dark', 'system'].map((option) => (
          <View key={option} style={styles.themeOption}>
            <Text style={{ color: theme.textColor }}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
            <Switch value={themeName === option} onValueChange={() => setThemeName(option)} />
          </View>
        ))}
      </View>


      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <Text style={styles.deleteText}>Delete Account</Text>
      </TouchableOpacity>
        {/* Bottom Navigation */}
      <View style={{
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "#744C80",
        paddingVertical: 16,
        position: "absolute",
        bottom: 0,
        width: "111%",
      }}>
        {[
          { name: "home", label: "Home", screen: "HomeScreen" },
          { name: "heart", label: "Favorite", screen: "FavoriteScreen" },
          { name: "camera", label: "Camera", screen: "CameraScreen" },
          { name: "calendar", label: "Bookings", screen: "MyBookingsScreen" },          { name: "user", label: "Profile", screen: "ProfileScreen" },
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
  container: { 
    flex: 1, 
    padding: 20,
    position: 'relative', // For absolute positioning of back button
  },
  backButton: {
    position: 'absolute',
    top: 50, // Adjust based on your header/status bar
    left: 20,
    zIndex: 10,
    padding: 5,
  },
  profileContainer: { alignItems: 'center', marginVertical: 20, marginTop: 80 }, // Added marginTop to account for back button
  profileImage: { width: 100, height: 100, borderRadius: 100, marginBottom: 15 },
  name: { fontSize: 20, fontWeight: 'bold' },
  email: { fontSize: 16, marginTop: 5 },
  section: { marginTop: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  permission: { fontSize: 14, marginVertical: 4 },
  bookingsButton: { // New style for My Bookings button
    marginTop: 20,
    backgroundColor: '#744C80',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookingsText: { // New style for My Bookings text
    color: '#fff',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 20, // Adjusted from 40 to 20 for better spacing with new button
    backgroundColor: '#744C80',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontSize: 16 },
  deleteButton: {
    marginTop: 15,
    borderColor: 'red',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteText: { color: 'red', fontSize: 16 },
});

export default ProfileScreen;
