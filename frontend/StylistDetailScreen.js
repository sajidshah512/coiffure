import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import RatingComponent from './RatingComponent';

const StylistDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // Receive both stylist and selectedLook from StylistScreen
  const { stylist, selectedLook } = route.params || {};

  // Use 'stylist' object for display
  const item = stylist; // For consistency with existing code that uses 'item'

  if (!item) {
    // Handle case where stylist data is not passed correctly
    Alert.alert("Error", "Stylist data not found. Please go back.");
    navigation.goBack();
    return null; // Don't render anything if data is missing
  }

  // Function to handle booking navigation
  const handleBookAppointment = () => {
    if (!selectedLook || !selectedLook._id) {
      Alert.alert("Error", "Hairstyle details are missing. Please go back and select a Hairstyle first.");
      return;
    }
    navigation.navigate('BookingScreen', {
      selectedStylist: item, // The stylist object
      selectedLook: selectedLook, // The service object
    });
  };

  return (
    <View style={styles.screenContainer}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={30} color="#744C80" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Stylist Image */}
        <Image source={{ uri: item.image }} style={styles.image} />

        <View style={styles.content}>
          <Text style={styles.title}>{item.name}</Text>


          <Text style={styles.descriptiontitle}>Stylist Description</Text>
          <Text style={styles.description}>{item.description}</Text>
          {/* Dynamic Rating Component */}
          {/* Assuming item._id is the stylist's ID for rating */}
          <RatingComponent serviceId={item._id || item.id} type="Stylist" />
          {/* Book Appointment Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleBookAppointment} // Use the new handler
          >
            <Text style={styles.buttonText}>Book Appointment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default StylistDetailScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 80, // To avoid overlap with back button
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 10,
    zIndex: 10,
    padding: 10,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.8)', // Optional: background for visibility
  },
  image: {
    width: 300,
    height: 400,
    borderRadius: 10,
    marginBottom: 20,
  },
  content: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 9,
  },
  rating: {
    fontSize: 18,
    color: '#744C80',
    marginBottom: 13,
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#744C80',
    marginBottom: 10,
    textAlign: 'center',
  },
  descriptiontitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#744C80',
    marginBottom: 3,
    textAlign: 'center',
    marginTop: 10,
  },
  description: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 25,
  },
  button: {
    backgroundColor: '#744C80',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
