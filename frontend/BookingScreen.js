
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useNavigation, useRoute } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from '@expo/vector-icons';
export default function BookingScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // Destructure selectedLook (service) and selectedStylist from route.params
  const { selectedLook, selectedStylist } = route.params || {};

  // Provide fallback names and price for display if objects are missing
  const displayMakeupLookName = selectedLook?.name || "Selected Service";
  const displayStylistName = selectedStylist?.name || "Selected Stylist";
  const displayPrice = selectedLook?.price || 0; // Use selectedLook's price

  // Get today's date for calendar and time picker initialization
  const today = new Date();
  const todayDateString = today.toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(todayDateString);
  const [selectedTime, setSelectedTime] = useState(new Date()); // Initialize with current time
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onTimeChange = (event, selected) => {
    if (selected) {
      setSelectedTime(selected);
    }
    setShowTimePicker(false);
  };

  const handleOverviewPress = () => {
    // Validate that we have the necessary IDs before proceeding
    if (!selectedLook || !selectedLook._id) {
      Alert.alert("Error", "Service details are missing. Please go back and select a service.");
      return;
    }
    if (!selectedStylist || !selectedStylist._id) {
      Alert.alert("Error", "Stylist details are missing. Please go back and select a stylist.");
      return;
    }

    navigation.navigate("BookingOverviewScreen", {
      // Data for display on overview screen
      makeupLook: displayMakeupLookName,
      stylist: displayStylistName,
      selectedDate: selectedDate,
      selectedTime: selectedTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      price: displayPrice,

      // Data required for backend booking (IDs)
      serviceId: selectedLook._id,
      stylistId: selectedStylist._id,
    });
  };

  return (
    <View style={styles.container}>
            {/* Back Button - Top Left Corner */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={30} color="#744C80" />
      </TouchableOpacity>
      {/* Calendar */}
      <Calendar
        current={todayDateString}
        minDate={todayDateString}
        style={styles.calender}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: {
            selected: true,
            disableTouchEvent: true,
            selectedColor: "#744C80",
            selectedTextColor: "white",
          },
        }}
        theme={{
          selectedDayBackgroundColor: "#744C80",
          arrowColor: "#744C80",
          todayTextColor: "#744C80",
        }}
      />

      {/* Time Picker */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Time</Text>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.timeText}>
            {selectedTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            is24Hour={false}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onTimeChange}
          />
        )}
      </View>

      {/* Overview Button */}
      <TouchableOpacity
        style={styles.overviewButton}
        onPress={handleOverviewPress}
      >
        <Text style={styles.overviewButtonText}>Overview</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",   
  },
  
  calender: {
marginTop:70,

  },
    backButton: {
    position: 'absolute',
    top: 60, // Adjust based on your header/status bar
    left: 20,
    zIndex: 10,
    padding: 0,
  },
  section: {
    marginTop: 30,
    marginLeft: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#744C80",
    marginBottom: 10,
  },
  timeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f0f0f0",
    alignSelf: "flex-start",
  },
  timeText: {
    fontSize: 16,
    color: "#000",
    
  },
  overviewButton: {
    marginTop: 40,
    backgroundColor: "#744C80",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  overviewButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
