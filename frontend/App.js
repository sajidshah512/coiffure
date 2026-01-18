      // "usesCleartextTraffic": true,
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { FavoritesProvider } from './FavoritesContext';
import { ThemeProvider } from './ThemeContext';
// Import all your screens
import LandingScreen from './LandingScreen';
import MainScreen from './MainScreen';
import AdminLogin from './AdminLogin';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import ForgotpasswordScreen from './ForgotpasswordScreen';
import ResetOtpScreen from './ResetOtpScreen';
import ResetPasswordScreen from './ResetPasswordScreen';
import HomeScreen from './HomeScreen';
import CameraScreen from './CameraScreen';
import HairTryOnScreen from './HairTryOnScreen';
import HairstyleScreen from './HairstyleScreen';
import HairstyleDetailScreen from './HairstyleDetailScreen';
import FavoriteScreen from "./FavoriteScreen";
import NotificationScreen from './NotificationScreen';
import StylistScreen from './StylistScreen';
import StylistDetailScreen from './StylistDetailScreen';
import BookingScreen from './BookingScreen';
import MyBookingsScreen from './MyBookingsScreen';
import BookingOverviewScreen from './BookingOverviewScreen';
import RatingComponent from './RatingComponent';
import SearchScreen from './SearchScreen';
import VerificationScreen from './VerificationScreen';
import ViewStylist from './ViewStylist';
import ViewHairstyle from './ViewHairtyle';
import ProfileScreen from './ProfileScreen';
import AdminHomeScreen from './AdminHomeScreen';
import ManageStylistScreen from './ManageStylistScreen';
import ManageHairstylesScreen from './ManageHairstylesScreen';
import ManageBookingsScreen from './ManageBookingsScreen';
import  DyeTryOnScreen  from './DyeTryOnScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRouteName, setInitialRouteName] = useState('Landing'); // Default to Landing

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userRole = await AsyncStorage.getItem('userRole');

        if (token && userRole) {
          // User is logged in
          if (userRole === 'admin') {
            setInitialRouteName('AdminHomeScreen');
          } else {
            setInitialRouteName('HomeScreen');
          }
        } else {
          // No token or role, go to Main screen to choose login type
          setInitialRouteName('Landing'); // Or 'Main' if you want to skip Landing after first launch
        }
      } catch (e) {
        console.error("Failed to load login status", e);
        setInitialRouteName('Landing'); // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  if (isLoading) {  
    // You might want to render a splash screen or loading indicator here
    return null; // Or <SplashScreen />
  }

  return (
    <ThemeProvider>
      <FavoritesProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen name="AdminLogin" component={AdminLogin} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Forgotpassword" component={ForgotpasswordScreen} />
            <Stack.Screen name="ResetOtpScreen" component={ResetOtpScreen} />
            <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
           <Stack.Screen name="CameraScreen" component={CameraScreen} />
            <Stack.Screen name="HairTryOnScreen" component={HairTryOnScreen} />
            <Stack.Screen name="HairstyleScreen" component={HairstyleScreen} />
            <Stack.Screen name="HairstyleDetailScreen" component={HairstyleDetailScreen} />
            <Stack.Screen name="DyeTryOnScreen" component={DyeTryOnScreen} />
            <Stack.Screen name="FavoriteScreen" component={FavoriteScreen} />
            <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
            <Stack.Screen name="StylistScreen" component={StylistScreen} />
            <Stack.Screen name="StylistDetailScreen" component={StylistDetailScreen} />
            <Stack.Screen name="BookingScreen" component={BookingScreen} />
            <Stack.Screen name="MyBookingsScreen" component={MyBookingsScreen} />
            <Stack.Screen name="BookingOverviewScreen" component={BookingOverviewScreen} />
            <Stack.Screen name="RatingComponent" component={RatingComponent} />
            <Stack.Screen name="SearchScreen" component={SearchScreen} />
            <Stack.Screen name="VerificationScreen" component={VerificationScreen} />
            <Stack.Screen name="ViewStylist" component={ViewStylist} />
            <Stack.Screen name="ViewHairstyle" component={ViewHairstyle} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="AdminHomeScreen" component={AdminHomeScreen} />
            <Stack.Screen name="ManageStylistScreen" component={ManageStylistScreen} />
            <Stack.Screen name="ManageHairstylesScreen" component={ManageHairstylesScreen} />
            <Stack.Screen name="ManageBookingsScreen" component={ManageBookingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
