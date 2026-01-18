import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getRatings, submitRating } from './api'; // Import the specific API functions

const MAX_STARS = 5;

const RatingComponent = ({ serviceId, type }) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [userFeedback, setUserFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // This effect will re-run if serviceId or type changes
    if (serviceId && type) { // Only fetch if serviceId and type are provided
      fetchRatings();
    } else {
      setLoading(false); // If no serviceId/type, stop loading
    }
  }, [serviceId, type]); // Dependency array includes serviceId and type

  // Fetch average rating, total ratings, and user's rating + feedback
  const fetchRatings = async () => {
    setLoading(true);
    try {
      // Use the imported getRatings function
      const response = await getRatings(serviceId, type);
      const { average, totalRatings, userRating, userFeedback } = response.data;
      setAvgRating(average);
      setTotalRatings(totalRatings);
      setSelectedRating(userRating);
      setFeedback(userFeedback || '');
      setUserFeedback(userFeedback || '');
    } catch (error) {
      console.error('Failed to fetch ratings:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load ratings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Submit or update rating and feedback
  const submitUserRating = async () => { // Renamed to avoid conflict with imported submitRating
    if (selectedRating === 0) {
      Alert.alert('Validation Error', 'Please select a star rating before submitting.');
      return;
    }
    if (!serviceId || !type) {
      Alert.alert('Error', 'Cannot submit rating: Missing service ID or type.');
      return;
    }

    setSubmitting(true);
    try {
      // Use the imported submitRating function
      await submitRating({
        serviceId,
        type,
        rating: selectedRating,
        feedback,
      });
      Alert.alert('Success', 'Your rating and feedback have been submitted.');
      setUserFeedback(feedback); // Update local state immediately
      fetchRatings(); // Refresh average and total ratings from server
    } catch (error) {
      console.error('Failed to submit rating:', error.response?.data || error.message);
      Alert.alert('Error', `Failed to submit rating: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#744C80" style={{ marginTop: 20 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your Rating:</Text>
      <View style={styles.starsContainer}>
        {[...Array(MAX_STARS)].map((_, i) => {
          const starNumber = i + 1;
          return (
            <TouchableOpacity
              key={starNumber}
              onPress={() => setSelectedRating(starNumber)}
              disabled={submitting}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.star,
                  selectedRating >= starNumber ? styles.filledStar : styles.emptyStar,
                ]}
              >
                ★
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>Your Feedback:</Text>
      <TextInput
        style={styles.feedbackInput}
        multiline
        numberOfLines={4}
        placeholder="Write your feedback here..."
        value={feedback}
        onChangeText={setFeedback}
        editable={!submitting}
        textAlignVertical="top"
      />

      <Button
        style={styles.button}
        title={submitting ? 'Submitting...' : 'Submit'}
        onPress={submitUserRating} // Call the local submit function
        disabled={submitting || selectedRating === 0}
        color="#744C80"

      />

      <Text style={styles.label}>Average Rating:</Text>
      <Text style={styles.avgText}>
        {avgRating.toFixed(1)} / 5 ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
      </Text>

      {userFeedback ? (
        <>
          <Text style={styles.label}>Your Previous Feedback:</Text>
          <Text style={styles.userFeedback}>{userFeedback}</Text>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  button: {
    backgroundColor: '#744C80',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 10,
    color: 'rgba(116, 76, 128, 1)',
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  star: {
    fontSize: 32,
    marginHorizontal: 5,
  },
  filledStar: {
    color: '#f1c40f',
  },
  emptyStar: {
    color: '#ccc',
  },
  feedbackInput: {
    borderColor: '#744C80',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginTop: 10,
    marginBottom: 15,
    minHeight: 80,
  },
  avgText: {
    marginTop: 10,
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  userFeedback: {
    fontStyle: 'italic',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
});

export default RatingComponent;


// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   Button,
//   StyleSheet,
//   Alert,
// } from 'react-native';

// const RatingComponent = ({ serviceId, type }) => {
//   const [selectedRating, setSelectedRating] = useState(0);
//   const [avgRating, setAvgRating] = useState(0);
//   const [comment, setComment] = useState('');
//   const [totalRatings, setTotalRatings] = useState(0);
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     fetchRatings();
//   }, []);

//   const fetchRatings = async () => {
//     console.warn('No backend API yet — using mock rating data.');
//     setTotalRatings(12);
//   };

//   const submitRating = async () => {
//     if (selectedRating === 0) {
//       Alert.alert('Please select a star rating before submitting.');
//       return;
//     }

//     setSubmitting(true);

//     try {
//       console.warn('No backend API yet — simulating rating submission.');
//       setAvgRating(prev => ((prev * totalRatings + selectedRating) / (totalRatings + 1)));
//       setTotalRatings(prev => prev + 1);
//       setSelectedRating(0);
//       setComment('');
//       Alert.alert('Thank you!', 'Your rating has been recorded.');
//     } catch (err) {
//       console.error('Mock submit error:', err);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <View>
//       <Text style={styles.label}>Rate:</Text>
//       <View style={styles.starsContainer}>
//         {[1, 2, 3, 4, 5].map((star) => (
//           <TouchableOpacity key={star} onPress={() => setSelectedRating(star)}>
//             <Text style={styles.star}>
//               {selectedRating >= star ? '★' : '☆'}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//       <TextInput
//         placeholder="Please add reason..."
//         value={comment}
//         onChangeText={setComment}
//         style={styles.commentInput}
//       />
//       <Button
//         title={submitting ? 'Submitting...' : 'Submit Rating'}
//         onPress={submitRating}
//         disabled={submitting || selectedRating === 0}
//         color="#744C80"
//       />
//       <Text style={styles.avgText}>
//         Average Rating: {avgRating.toFixed(1)} / 5 ({totalRatings} ratings)
//       </Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   starsContainer: { flexDirection: 'row', marginVertical: 5 },
//   star: { fontSize: 30, marginHorizontal: 3, color: '#744C80' },
//   commentInput: {
//     borderWidth: 1,
//     borderColor: '#744C80',
//     borderRadius: 6,
//     padding: 4,
//     marginVertical: 10
//   },
//   label: { fontWeight: 'bold', fontSize: 16 },
//   avgText: { marginTop: 10, fontSize: 16, fontStyle: 'italic' },
// });

// export default RatingComponent;

// import React, { useState, useEffect } from 'react';
// import { View, TouchableOpacity, StyleSheet, Alert, Text, ActivityIndicator } from 'react-native';
// import { FontAwesome } from '@expo/vector-icons';
// import api from './api';

// const MAX_STARS = 5;

// const RatingComponent = ({ serviceId, type }) => {
//   const [rating, setRating] = useState(0); // User's rating
//   const [averageRating, setAverageRating] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     const fetchRatings = async () => {
//       try {
//         const response = await api.get('/ratings', {
//           params: { serviceId, type },
//         });
//         const { average, userRating } = response.data;
//         setAverageRating(average || 0);
//         setRating(userRating || 0);
//       } catch (error) {
//         console.error('Failed to fetch ratings:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchRatings();
//   }, [serviceId, type]);

//   const submitRating = async (newRating) => {
//     setSubmitting(true);
//     try {
//       await api.post('/ratings', {
//         serviceId,
//         type,
//         rating: newRating,
//       });
//       setRating(newRating);
//       Alert.alert('Thank you!', 'Your rating has been submitted.');
//       // Refresh average rating
//       const response = await api.get('/ratings', {
//         params: { serviceId, type },
//       });
//       setAverageRating(response.data.average || 0);
//     } catch (error) {
//       console.error('Failed to submit rating:', error);
//       Alert.alert('Error', 'Failed to submit rating.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) {
//     return <ActivityIndicator size="small" color="#744C80" style={styles.loading} />;
//   }

//   return (
//     <View style={styles.starContainer}>
//       {[...Array(MAX_STARS)].map((_, index) => {
//         const starNumber = index + 1;
//         return (
//           <TouchableOpacity
//             key={index}
//             onPress={() => submitRating(starNumber)}
//             activeOpacity={0.7}
//             disabled={submitting}
//           >
//             <FontAwesome
//               name={starNumber <= rating ? 'star' : 'star-o'}
//               size={18}
//               color="#f1c40f"
//               style={styles.star}
//             />
//           </TouchableOpacity>
//         );
//       })}
//       <Text style={styles.averageText}>{averageRating.toFixed(1)} / 5</Text>
//     </View>
//   );
// };

// export default RatingComponent;

// const styles = StyleSheet.create({
//   starContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   star: {
//     marginRight: 5,
//   },
//   averageText: {
//     marginLeft: 10,
//     fontSize: 14,
//     color: '#555',
//   },
//   loading: {
//     marginVertical: 10,
//   },
// });
