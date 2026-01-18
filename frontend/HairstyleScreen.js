// import React from 'react';
// import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';
// const categories = [
//   { id: "1", name: "Dye", image: require("./assets/dye.png"), screen: "DyeScreen" },
//   { id: "2", name: "Cutting", image: require("./assets/cutting.jpg"), screen: "CuttingScreen" },
//   { id: "3", name: "Blowdry", image: require("./assets/blowdry.png"), screen: "BlowdryScreen" },
//   { id: "4", name: "Hairstyle", image: require("./assets/hairstyle.png"), screen: "HairstyleScreen" },
// ];
// const hairstyleCategories = [
//   { id: "1", name: "Front loose braids", image: require("./assets/hairstyle1.jpg"), description: "A stylish front braid with a relaxed look.",price: 1000 },
//   { id: "2", name: "Loose curls", image: require("./assets/braid.jpg"),description: "A front side braids and loose curls style with volume added." },
//   { id: "3", name: "Back braid with backcomb", image: require("./assets/hairstyle3.jpg"), description: "An elegant back braid combined with a backcomb style.",price: 1500 },
//   { id: "4", name: "Front braid with bun", image: require("./assets/hairstyle4.jpg"), description: "A beautiful braid in the front leading to a bun.",price: 1500 },
//   { id: "5", name: "Back loose twist with backcomb", image: require("./assets/hairstyle6.jpg"), description: "A stylish back loose twist with added volume." ,price: 1500},
//   { id: "6", name: "Back loose braids", image: require("./assets/hairstyle7.jpg"), description: "Loose back braids for a trendy and modern look." ,price: 1000},
// ];

// export default function HairstyleScreen() {
//   const navigation = useNavigation();

//   return (
//     <View style={styles.container}>
//       {/* Header with Back Button */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//           <Ionicons name="arrow-back" size={24} color="white" />
//         </TouchableOpacity>
//         <Text style={styles.headerText}>Hairstyle</Text>
//       </View>

//       {/* Horizontal Category Navigation */}
//       <FlatList
//         data={categories}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <TouchableOpacity onPress={() => navigation.navigate(item.screen)}>
//             <View style={styles.categoryItem}>
//               <Image source={item.image} style={styles.categoryImage} />
//               <Text style={styles.categoryText}>{item.name}</Text>
//             </View>
//           </TouchableOpacity>
//         )}
//       />

//       {/* Blowdry Services Grid */}
//       <FlatList
//         data={hairstyleCategories}
//         keyExtractor={(item) => item.id}
//         numColumns={2}
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             style={styles.card}
//             onPress={() => navigation.navigate('HairstyleDetailScreen', { item })}
//           >
//             <Image source={item.image} style={styles.image} />
//             <Text style={styles.title}>{item.name}</Text>
//             <Text style={styles.price}>Rs. {item.price}</Text>
//           </TouchableOpacity>
//         )}
//       />
//     </View>
//   );
// }

 
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'white',
//     padding: 10,
//     paddingTop:30,
//   },
//   header: {
//     backgroundColor: '#744C80',
//     padding: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   backButton: {
//     position: 'absolute',
//     left: 15,
//     zIndex: 1,
//   },
//   headerText: {
//     flex: 1,
//     textAlign: 'center',
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: 'white',
//   },
//   categoryItem: {
//     alignItems: 'center',
//     marginHorizontal: 5,
//     marginVertical:5,
//   },
//   categoryImage: {
//     width: 80,
//     height: 80,
//     borderRadius: 10,
//   },
//   categoryText: {
//     color: '#7D5BA6',
//     marginBottom: 25,
//   },
//   card: {
//     flex: 1,
//     margin: 10,
//     backgroundColor: '#fff',
//     borderRadius: 15,
//     alignItems: 'center',
//     padding: 20,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 10,
//   },
//   image: {
//     width: 130,
//     height: 200,
//     borderRadius: 8,
//   },
//   title: {
//     marginTop: 8,
//     fontSize: 14,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   price: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#444',
//     marginTop: 4,
//   },
// });

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'; // Added Alert
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from './api';

export default function HairstyleScreen() {
  const navigation = useNavigation();
  const [hairstyleServices, setHairstyleServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHairstyleServices = async () => {
      try {
        const response = await api.get('/services', { params: { type: 'Hairstyle' } }); // Changed to '/services' and 'Hairstyle' (capitalized)
        // Backend returns an array directly, so access response.data
        setHairstyleServices(response.data || []);
      } catch (error) {
        console.error('Failed to fetch hairstyle services:', error.response?.data || error.message);
        Alert.alert("Error", "Failed to load hairstyle services. Please check your network and server."); // User-friendly alert
      } finally {
        setLoading(false);
      }
    };
    fetchHairstyleServices();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#744C80" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Hairstyles</Text>
      </View>

      {/* Services Grid */}
      <FlatList
        data={hairstyleServices}
        keyExtractor={(item) => item._id.toString()} // Use item._id for MongoDB documents
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('HairstyleDetailScreen', { item })}
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.price}>Rs. {item.price}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => ( // Added empty component
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>No hairstyle services found.</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 10, paddingTop: 30 },
  header: { backgroundColor: '#744C80', padding: 18, flexDirection: 'row', alignItems: 'center', marginTop:10, },
  backButton: { position: 'absolute', left: 15, zIndex: 1 },
  headerText: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: 'white' },
  categoryItem: { alignItems: 'center', marginHorizontal: 5, marginVertical: 5 },
  categoryImage: { width: 80, height: 80, borderRadius: 10 },
  categoryText: { color: '#7D5BA6', marginBottom: 25 },
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
  image: { width: 130, height: 200, borderRadius: 8 },
  title: { marginTop: 8, fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  price: { fontSize: 14, fontWeight: 'bold', color: '#444', marginTop: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyListContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyListText: { fontSize: 16, color: '#888' },
});
