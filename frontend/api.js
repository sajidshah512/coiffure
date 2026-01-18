import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Extract IP from Expo linkingUri (e.g., exp://192.168.128.216:8081 --> 192.168.128.216)
const getLocalIp = () => {
  const linkingUri = Constants.linkingUri;
  if (linkingUri) {
    const match = linkingUri.match(/\/\/([^:]+):/);
    return match ? match[1] : 'localhost';
  }
  return 'localhost';
};

const localIp = getLocalIp();
const API_URL = `http://${localIp}:8080/api`;
const AI_API_URL = `http://${localIp}:3000/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const aiApi = axios.create({
  baseURL: AI_API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Request interceptor to add auth token to headers
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // Use standard Authorization header
        config.headers['Authorization'] = `Bearer ${token}`;
        // If your backend ONLY expects 'x-auth-token', uncomment the line below and comment the one above:
        // config.headers['x-auth-token'] = token;
      }
    } catch (error) {
      console.error('Error getting token from AsyncStorage', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// User APIs
export const registerUser = (userData) => api.post('/users/register', userData);
export const loginUser = (credentials) => api.post('/users/login', credentials);
export const getUserProfile = () => api.get('/users/profile');

// Stylist APIs
export const getStylists = () => api.get('/stylists');
export const getStylistById = (id) => api.get(`/stylists/${id}`);
export const addStylist = (stylistData) => api.post('/stylists', stylistData);
export const updateStylist = (id, stylistData) => api.put(`/stylists/${id}`, stylistData);
export const deleteStylist = (id) => api.delete(`/stylists/${id}`);

// Service APIs
export const getServices = (type = '') => api.get(`/services?type=${encodeURIComponent(type)}`);
export const getServiceById = (id) => api.get(`/services/${id}`);
export const addService = (serviceData) => api.post('/services', serviceData);
export const updateService = (id, serviceData) => api.put(`/services/${id}`, serviceData);
export const deleteService = (id) => api.delete(`/services/${id}`);

// Rating APIs (These are the correct ones based on your backend routes/ratings.js)
export const getRatings = (serviceId, type) =>
  api.get('/ratings', { params: { serviceId, type } });

export const submitRating = (ratingData) =>
  api.post('/ratings', ratingData);

// Booking APIs
export const createBooking = (bookingData) => api.post('/bookings', bookingData);
export const getMyBookings = () => api.get('/bookings/my-bookings');
export const getAllBookings = () => api.get('/bookings'); // Admin only
export const updateBookingStatus = (id, status) => api.put(`/bookings/${id}/status`, { status }); // Admin only
export const deleteBooking = (id) => api.delete(`/bookings/${id}`); // Admin only

// AI APIs
export const hairTryOn = (formData) => api.post('/ai/hairtryon', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
export const dyeTryOn = (formData) => aiApi.post('/tryon', formData);

// Constants
export const BASE_URL = `http://${localIp}:8080`;

//export const 

// Export default api instance if needed
export default api;
