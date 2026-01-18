// NotificationScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
// import * as Notifications from "expo-notifications";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadDeliveredNotifications();
  }, []);

  const loadDeliveredNotifications = async () => {
    const delivered = await Notifications.getDeliveredNotificationsAsync();

    const formatted = delivered.map((item) => ({
      id: item.identifier,
      title: item.request.content.title,
      body: item.request.content.body,
      date: new Date(item.date).toLocaleString(),
    }));

    setNotifications(formatted);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={{ width: 40 }} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerText}>Notifications</Text>

        <View style={{ width: 40 }} />
      </View>

      {/* Notification List */}
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="bell-o" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No Notifications Yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 15, paddingBottom: 80 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    backgroundColor: "#744C80",
    paddingVertical: 18,
    paddingHorizontal: 15,
    paddingTop: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },

  card: {
    backgroundColor: "#f8f3fa",
    borderLeftWidth: 5,
    borderLeftColor: "#744C80",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#744C80",
  },

  body: {
    fontSize: 14,
    marginTop: 5,
    color: "#333",
  },

  date: {
    marginTop: 8,
    fontSize: 12,
    color: "#777",
    textAlign: "right",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#999",
  },
});
