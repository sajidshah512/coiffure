import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import api from './api';

export default function BookingOverviewScreen({ route, navigation }) {
  const {
    makeupLook = "",
    stylist = "",
    selectedDate = "",
    selectedTime = "",
    price = 2000,
    serviceId, // Received from BookingScreen
    stylistId, // Received from BookingScreen
  } = route.params || {};

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    if (!serviceId || !stylistId) {
      Alert.alert("Error", "Missing service or stylist ID. Please go back and select again.");
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        serviceId: serviceId,
        stylistId: stylistId,
        date: selectedDate,
        time: selectedTime,
        price: price,
        paymentMethod: paymentMethod,
      };

      const response = await api.post('/bookings', bookingData);

      if (response.status === 201) {
        Alert.alert("Booking Confirmed", `Thank you for your booking!`, [
          { text: "OK", onPress: () => navigation.navigate("HomeScreen") },
        ]);
      } else {
        Alert.alert("Booking Failed", response.data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
    //  console.error("Booking error:", error.response?.data || error.message);
      
        if (error.response?.status === 400) {
    Alert.alert("Slot Unavailable", error.response.data.message);
    return;
  }

      Alert.alert(
        "Booking Failed",
   //     error.response?.data?.message || "Could not complete booking. Please check your network or try again later."
      );
    } 
    finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
        <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={30} color="#744C80" />
      </TouchableOpacity>
      <Text style={styles.heading}>Booking Overview</Text>

      <View style={styles.detailItem}>
        <Text style={styles.label}>Hairstyle:</Text>
        <Text style={styles.value}>{makeupLook}</Text>
      </View>

      <View style={styles.detailItem}>
        <Text style={styles.label}>Stylist:</Text>
        <Text style={styles.value}>{stylist}</Text>
      </View>

      <View style={styles.detailItem}>
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>{selectedDate}</Text>
      </View>

      <View style={styles.detailItem}>
        <Text style={styles.label}>Time:</Text>
        <Text style={styles.value}>{selectedTime}</Text>
      </View>

      <View style={styles.detailItem}>
        <Text style={styles.label}>Price:</Text>
        <Text style={styles.value}>Rs. {price}</Text>
      </View>

      <Text style={[styles.label, { marginTop: 20 }]}></Text>
      <View style={styles.paymentContainer}>
        {[""].map((method) => (
          <TouchableOpacity
            key={method}
            style={[
              styles.paymentOption,
              paymentMethod === method && styles.selectedPaymentOption,
            ]}
            onPress={() => setPaymentMethod(method)}
          >
            <Text
              style={[
                styles.paymentText,
                paymentMethod === method && styles.selectedPaymentText,
              ]}
            >
              {method}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.bookButton}
        onPress={handleBooking}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.bookButtonText}>Proceed with Booking</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    marginTop:40,
  },
    backButton: {
    position: 'absolute',
    top: 15, // Adjust based on your header/status bar
    left: 20,
    zIndex: 10,
    padding: 5,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#744C80",
    marginBottom: 30,
    textAlign: "center",
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
    padding: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  value: {
    fontSize: 16,
    color: "#666",
  },
  selectedPaymentOption: {
    backgroundColor: "#744C80",
    borderColor: "#744C80",
  },
  paymentText: {
    color: "#000",
    fontWeight: "bold",
  },
  selectedPaymentText: {
    color: "#fff",
  },
  bookButton: {
    marginTop: 20,
    backgroundColor: "#744C80",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  bookButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
}); 