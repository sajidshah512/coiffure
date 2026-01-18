import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
// import RatingComponent from './RatingComponent';

const ViewHairstyle = () => {
  const navigation = useNavigation();
  const route = useRoute();
    const { item } = route.params || {};
  
    if (!item) {
      Alert.alert("Error", "Hairstyle data not found. Please go back.");
      navigation.goBack();
      return null;
    }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={30} color='#744C80' />
      </TouchableOpacity>

      {/* Service Image */}
      <Image source={{ uri: item.image }} style={styles.image} />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{item.name}</Text>

        {/* Rating Component */}
        {/* <RatingComponent serviceId={item._id || item.id} type="Hairstyle" /> */}
        
        <Text style={styles.PriceTitle}>Price</Text>
        <Text style={styles.Price}>Rs.{item.price}</Text>
        <Text style={styles.descriptiontitle}>Hair Description</Text>
        <Text style={styles.description}>{item.description}</Text>

        {/* Choose Stylist Button */}
        {/* <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('StylistScreen', { item })}
        >
          <Text style={styles.buttonText}>Choose Stylist</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

export default ViewHairstyle;

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', alignItems: 'center', padding: 60 },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10, borderRadius: 50, paddingTop: 5 },
 image: {
    width: 300,
    height: 400,
    borderRadius: 10,
    marginVertical: 60,
    marginBottom: 10,
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
  title: { fontSize: 22, fontWeight: 'bold', color: '#744C80', marginBottom: 10, textAlign: 'center'},
  PriceTitle: { fontSize: 18, fontWeight: 'bold', color: '#744C80', marginBottom: 3, marginTop: 5, textAlign: 'center' },
  Price: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 3 },
  descriptiontitle: { fontSize: 18, fontWeight: 'bold', color: '#744C80', marginBottom: 3, marginTop: 5, textAlign: 'center' },
  description: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 20 },
//   button: { backgroundColor: '#744C80', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
//   buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
