import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from './api';

export default function StylistsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  // Get the service object passed as 'item' from the previous screen (e.g., BlowdryDetailScreen)
  const { item: selectedService } = route.params || {};

  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStylists = async () => {
      try {
        const response = await api.get('/stylists');
        setStylists(response.data || []);
      } catch (error) {
        console.error('Failed to fetch stylists:', error.response?.data || error.message);
        Alert.alert('Error', 'Failed to load stylists. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStylists();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#744C80" />
      </View>
    );
  }

  // Function to handle selecting a stylist and navigating to StylistDetailScreen
  const handleSelectStylist = (stylist) => {
 
    navigation.navigate('StylistDetailScreen', {
      stylist: stylist, // The stylist object that was tapped
      selectedLook: selectedService, // The service object received from the previous screen
    });
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Stylists</Text>
      </View>

      {/* Grid List */}
      <FlatList
        data={stylists}
        keyExtractor={(item) => item._id}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelectStylist(item)} // Use the new handler
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.title}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>No stylists found.</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
    paddingTop: 30,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#744C80',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop:10, 
  },
  backButton: {
    position: 'absolute',
    left: 15,
    zIndex: 1,
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  card: {
    flex: 1,
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    alignItems: 'center',
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  image: {
    width: 150,
    height: 250,
    borderRadius: 8,
  },
  title: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyListText: {
    fontSize: 16,
    color: '#888',
  },
});
