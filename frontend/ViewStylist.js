import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import RatingComponent from './RatingComponent';

const ViewStylist = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Get stylist object passed as 'item' param
  const { item } = route.params || {};

  if (!item) {
    Alert.alert("Error", "Stylist data not found. Please go back.");
    navigation.goBack();
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={30} color="#744C80" />
      </TouchableOpacity>

      {/* Stylist Image */}
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={{ color: '#888' }}>No Image Available</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{item.name}</Text>

        {/* Dynamic Rating Component */}
        {/* <RatingComponent serviceId={item._id || item.id} type="stylist" /> */}
        
        <Text style={styles.descriptiontitle}>Stylist Description</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </ScrollView>
  );
};

export default ViewStylist;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 60,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    borderRadius: 50,
    paddingTop: 5,
  },
  image: {
    width: 300,
    height: 400,
    borderRadius: 10,
    marginVertical: 60,
    marginBottom: 10,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  content: {
    backgroundColor: '#fff',
    padding: 10,
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
    marginBottom: 0,
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
    marginTop: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
});
