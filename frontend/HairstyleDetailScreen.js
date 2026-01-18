
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import RatingComponent from './RatingComponent';

const HairstyleDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params;

  if (!item) {
    // Handle missing item gracefully
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#744C80', fontSize: 18 }}>No hairstyle data found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
          <Text style={{ color: '#fff' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={30} color="#744C80" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Service Image */}
        <Image source={{ uri: item.image }} style={styles.image} />

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{item.name}</Text>

          <Text style={styles.sectionTitle}>Price</Text>
          <Text style={styles.price}>{item.price}</Text>

          <Text style={styles.sectionTitle}>Hair Description</Text>
          <Text style={styles.description}>{item.description}</Text>
          {/* <Text style={styles.sectionTitle}>Ratings</Text> */}
      
          <RatingComponent serviceId={item._id || item.id} type="Hairstyle" />

          {/* Choose Stylist Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('StylistScreen', { item })}
          >
            <Text style={styles.buttonText}>Choose Stylist</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default HairstyleDetailScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 80, // To avoid overlap with back button
  },
  backButton: {
    position: 'absolute',
    top: 35,
    left: 20,
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#744C80',
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#744C80',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  price: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goBackButton: {
    marginTop: 20,
    backgroundColor: '#744C80',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});

