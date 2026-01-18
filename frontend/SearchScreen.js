import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import api from "./api";

const SearchScreen = () => {
  const navigation = useNavigation();

  const [searchText, setSearchText] = useState("");
  const [stylists, setStylists] = useState([]);
  const [services, setServices] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch stylists and services on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stylistsRes, servicesRes] = await Promise.all([
        api.get("/stylists"),
        api.get("/services"),
      ]);
      setStylists(stylistsRes.data || []);
      setServices(servicesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error.response?.data || error.message);
    }
    setLoading(false);
  };

  // Filter only AFTER user starts typing
  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredResults([]); // show nothing before typing
      return;
    }

    const filteredStylistData = stylists.filter((stylist) =>
      stylist.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const filteredServiceData = services.filter((service) =>
      service.name.toLowerCase().includes(searchText.toLowerCase())
    );

    setFilteredResults([...filteredStylistData, ...filteredServiceData]);
  }, [searchText, stylists, services]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() =>
        item.type === "stylist"
          ? navigation.navigate("ViewStylist", { item })
          : navigation.navigate("ViewHairstyle", { item })
      }
    >
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <Text style={styles.itemTitle}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("HomeScreen")}
      >
        <Image source={require("./assets/leftarrow.png")} style={styles.leftarrow} />
      </TouchableOpacity>

      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search Stylists or Services"
        value={searchText}
        onChangeText={setSearchText}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Loading Indicator */}
      {loading && <ActivityIndicator size="large" color="#744C80" />}

      {/* Results only AFTER search */}
      {searchText.trim() !== "" && (
        <>
          {filteredResults.length > 0 ? (
            <FlatList
              data={filteredResults}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          ) : (
            <Text style={styles.noResultsText}>No results found.</Text>
          )}
        </>
      )}
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    marginTop: 35,
    marginBottom: 0,
    alignSelf: "flex-start",
  },
  leftarrow: {
    width: 35,
    height: 40,
  },
  searchInput: {
    height: 45,
    borderColor: "#744C80",
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    marginTop: 20,
  },
  itemContainer: {
    flexDirection: "row",
    marginBottom: 12,
    padding: 1,
    backgroundColor: "#fafafa",
    alignItems: "center",
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 15,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#744C80",
  },
  noResultsText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#744C80",
  },
});
