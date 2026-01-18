import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from './ThemeContext';
import api from './api';

const MyBookingsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/bookings/my-bookings');

      let bookingsData = [];

      if (Array.isArray(response.data)) {
        bookingsData = response.data;
      } else if (Array.isArray(response.data?.data)) {
        bookingsData = response.data.data;
      } else if (Array.isArray(response.data?.bookings)) {
        bookingsData = response.data.bookings;
      }

      setBookings(bookingsData);
    } catch (error) {
      setError(error.message || 'Unknown error');

      if (error.response?.status === 401) {
        Alert.alert('Unauthorized', 'Please log in again.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', 'Failed to load bookings.');
      }
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const removeBookingCard = (id) => {
    setBookings((prev) => prev.filter((b) => b._id !== id));
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'accepted': return '#37bb4fff';
      case 'rejected': return '#e73c3cff';
      case 'cancelled': return '#e74c3c';
      case 'pending': return '#f39c12';
      default: return '#f39c12';
    }
  };

const deleteBooking = async (id) => {
  try {
    const response = await api.delete(`/bookings/${id}`);

    if (response.data.success) {
      removeBookingCard(id);
      Alert.alert("Deleted", "Booking removed successfully.");
    }
  } catch (error) {
    console.log("Delete error:", error);
    Alert.alert("Error", "Failed to delete booking.");
  }
};

const confirmDelete = (id) => {
  Alert.alert(
    "Remove Booking?",
    "This will permanently delete your booking.",
    [
      { text: "No", style: "cancel" },
      { text: "Yes", onPress: () => deleteBooking(id) },
    ]
  );
};


  const renderRightActions = () => (
    <View style={styles.swipeDeleteBox}>
      <Ionicons name="trash" size={30} color="#fff" />
    </View>
  );

  const renderBookingItem = ({ item }) => (
    <Swipeable
      onSwipeableOpen={() => confirmDelete(item._id)}
      renderRightActions={renderRightActions}
    >
      <View style={styles.bookingCard}>
        
        {/* Cross delete button */}
        <TouchableOpacity
          style={styles.crossButton}
          onPress={() => confirmDelete(item._id)}
        >
          <Ionicons name="close-circle" size={26} color="#744C80" />
        </TouchableOpacity>

        <View style={styles.detailsContainer}>
          <Text style={styles.stylistName}>
            Stylist: {item.stylistId?.name || 'Unknown'}
          </Text>
          <Text style={styles.serviceName}>
            Hairstyle: {item.serviceId?.name || 'Unknown'}
          </Text>
<Text style={styles.dateTime}>
  Date: {formatDate(item.startTime)}
</Text>

<Text style={styles.dateTime}>
  Time: {formatTime(item.startTime)}
</Text>

          <Text style={styles.price}>Price: Rs. {item.price}</Text>
          <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
            Status: {item.status}
          </Text>
        </View>

      </View>
    </Swipeable>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <ActivityIndicator size="large" color="#744C80" style={styles.loading} />
      </View>
    );
  }
  const formatDate = (isoString) => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  return date.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (isoString) => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
  });
};


  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("HomeScreen")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color="#744C80" />
        </TouchableOpacity>
        <Text style={styles.headerText}>My Bookings</Text>
      </View>

      {/* Empty state */}
      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No bookings yet</Text>
          <TouchableOpacity onPress={fetchBookings}>
            <Text style={styles.retryText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item._id}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        />
      )}
      {/* Bottom Navigation */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          backgroundColor: "#744C80",
          paddingVertical: 16,
          position: "fixed",
          bottom: 0,
          width: "100%",
          marginRight:30,
      
        }}
      >
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


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 15,
    paddingTop: 50,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  backButton: {
    padding: 8,
    zIndex: 10,
  },
    headerText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#744C80",
    flex: 1,
    marginRight:28, // balances the back button space
  },

  swipeDeleteBox: {
    width: 80,
    backgroundColor: "#744C80",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 15,
  },

  bookingCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,

    shadowColor: "#744C80",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,

    borderWidth: 1,
    borderColor: "rgba(116, 76, 128, 0.4)",
  },

  crossButton: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 10,
  },

  detailsContainer: {
    flex: 1,
  },

  stylistName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#744C80",
    marginBottom: 5,
  },

  serviceName: {
    fontSize: 16,
    marginBottom: 5,
  },

  dateTime: {
    fontSize: 14,
    marginBottom: 3,
  },

  price: {
    fontSize: 14,
    marginBottom: 3,
  },

  payment: {
    fontSize: 14,
    marginBottom: 3,
  },

  status: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    fontSize: 18,
    marginTop: 10,
  },

  retryText: {
    marginTop: 5,
    color: "#744C80",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default MyBookingsScreen;
