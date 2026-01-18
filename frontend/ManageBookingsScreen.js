import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import api from "./api";

const formatDate = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ManageBookingsScreen = () => {
  const navigation = useNavigation();
  const [bookingList, setBookingList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get("/bookings");

      const formatted = response.data.map((item) => {
        // New system: startTime and endTime exist
        if (item.startTime) {
          return {
            ...item,
            newDate: formatDate(item.startTime),
            newTime: formatTime(item.startTime),
          };
        }

        // Old system fallback: date + time fields exist
        const fallbackDate = item.date || "N/A";
        const fallbackTime = item.time || "N/A";
        return {
          ...item,
          newDate: fallbackDate,
          newTime: fallbackTime,
        };
      });

      setBookingList(formatted);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch bookings.");
      console.error("Fetch bookings error:", error.response?.data || error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateBookingStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      Alert.alert(
        status === "accepted" ? "Booking Accepted" : "Booking Rejected",
        `You have ${status} the booking.`
      );
      fetchBookings();
    } catch (error) {
      Alert.alert("Error", `Failed to ${status} booking.`);
      console.error(`Status update error:`, error.response?.data || error.message);
    }
  };

  const handleAcceptBooking = (id) => updateBookingStatus(id, "accepted");
  const handleRejectBooking = (id) => updateBookingStatus(id, "rejected");

  const handleDeleteBooking = (id) => {
    Alert.alert("Delete Booking", "Are you sure you want to delete this booking?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: async () => {
          try {
            await api.delete(`/bookings/${id}`);
            Alert.alert("Deleted", "Booking deleted successfully.");
            fetchBookings();
          } catch (error) {
            Alert.alert("Error", "Failed to delete booking.");
            console.error("Delete booking error:", error.response?.data || error.message);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const userName = item.userId?.name || "Unknown User";
    const stylistName = item.stylistId?.name || "Unknown Stylist";
    const hairstyleName = item.serviceId?.name || "Unknown Service";
    const price = item.price || "N/A";
    const status = item.status || "pending";

    return (
      <View style={styles.bookingCard}>
        <Text>User Name: {userName}</Text>
        <Text style={styles.text}>Stylist: {stylistName}</Text>
        <Text style={styles.text}>Hairstyle: {hairstyleName}</Text>
        <Text style={styles.text}>Price: Rs. {price}</Text>

        {/* 📌 Updated Date & Time */}
        <Text style={styles.text}>Date: {item.newDate}</Text>
        <Text style={styles.text}>Time: {item.newTime}</Text>

        <Text style={styles.text}>
          Status: {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>

        <View style={styles.actionRow}>
          {status === "pending" && (
            <>
              <TouchableOpacity
                onPress={() => handleAcceptBooking(item._id)}
                style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
              >
                <Text style={styles.actionText}>Accept</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleRejectBooking(item._id)}
                style={[styles.actionButton, { backgroundColor: "#E57373" }]}
              >
                <Text style={styles.actionText}>Reject</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            onPress={() => handleDeleteBooking(item._id)}
            style={[styles.actionButton, { backgroundColor: "#744C80" }]}
          >
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#744C80" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#744C80" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Manage Bookings</Text>
        </View>
      </View>

      {bookingList.length === 0 ? (
        <View style={styles.noData}>
          <Text style={styles.noDataText}>No bookings found.</Text>
        </View>
      ) : (
        <FlatList
          data={bookingList}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

// ----------------------------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 10,
  },

  backButton: { width: 40 },

  titleContainer: { flex: 1, alignItems: "center" },

  title: {
    fontSize: 22,
    color: "#744C80",
    fontWeight: "bold",
  },

  bookingCard: {
    marginBottom: 15,
    padding: 15,
    borderWidth: 2,
    borderColor: "#744C80",
    borderRadius: 10,
  },

  text: { fontSize: 15, marginBottom: 3 },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },

  actionButton: {
    padding: 8,
    borderRadius: 5,
    minWidth: 80,
    alignItems: "center",
  },

  actionText: {
    color: "#fff",
    fontWeight: "bold",
  },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  noData: { flex: 1, alignItems: "center", marginTop: 50 },

  noDataText: { fontSize: 16, color: "#744C80" },
});

export default ManageBookingsScreen;
