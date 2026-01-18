// MultipleFiles/VerificationScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native'; // Import useRoute
import LottieView from 'lottie-react-native';
import api from './api'; // Assuming your api.js exports an axios instance

const VerificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute(); // Get route params
  const { userEmail } = route.params; // Extract email passed from SignupScreen

  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(60); // Initial timer for resend
  const [resendDisabled, setResendDisabled] = useState(true);
  const [animationType, setAnimationType] = useState(null); // 'success' or 'error'
  const [showAnimation, setShowAnimation] = useState(false);

  const successRef = useRef(null);
  const errorRef = useRef(null);

  // --- EFFECT: Timer for resend button ---
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setResendDisabled(false); // Enable resend button when timer runs out
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // --- EFFECT: Send OTP automatically when screen loads ---
  useEffect(() => {
    // Only send OTP if email is available
    if (userEmail) {
      handleSendOtp();
    } else {
      Alert.alert('Error', 'Email not provided for verification. Please sign up again.');
      navigation.goBack(); // Go back if no email
    }
  }, [userEmail]); // Dependency on userEmail

  // --- API CALL: Send OTP to email ---
  const handleSendOtp = async () => {
    try {
      setResendDisabled(true); // Disable resend immediately
      setTimer(60); // Reset timer
      setCode(''); // Clear any previous code

      const response = await api.post('/otpauth/send-otp', { email: userEmail });
      Alert.alert('Success', response.data.message || 'A new verification code has been sent to your email.');
    } catch (error) {
      console.error('Send OTP Error:', error.response?.data || error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP. Please try again.');
      setResendDisabled(false); // Re-enable resend if sending failed
      setTimer(0); // Reset timer to 0 to allow immediate resend
    }
  };

  // --- API CALL: Verify OTP ---
  const handleVerify = async () => {
    if (code.length !== 5) {
      Alert.alert('Invalid Code', 'Please enter the 5-digit verification code.');
      return;
    }

    try {
      const response = await api.post('/otpauth/verify-otp', { email: userEmail, otp: code });

      if (response.data.isVerified) {
        setAnimationType('success');
        setShowAnimation(true);
        setTimeout(() => {
          setShowAnimation(false);
          Alert.alert('Success', 'Email verified successfully!');
          navigation.navigate('HomeScreen'); // Navigate to home after successful verification
        }, 2000);
      } else {
        // This path should ideally not be hit if backend sends isVerified: true on success
        setAnimationType('error');
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 2000);
        Alert.alert('Verification Failed', response.data.message || 'Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Verify OTP Error:', error.response?.data || error);
      setAnimationType('error');
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 2000);
      Alert.alert('Verification Failed', error.response?.data?.message || 'Invalid or expired code. Please try again.');
    }
  };

  // --- UI Render ---
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Email</Text>
      <Text style={styles.subtitle}>
        Enter the 5-digit code sent to <Text style={{ fontWeight: 'bold' }}>{userEmail}</Text>
      </Text>

      <TextInput
        style={styles.codeInput}
        placeholder="_____"
        placeholderTextColor="#aaa"
        keyboardType="numeric"
        maxLength={5}
        value={code}
        onChangeText={(text) => setCode(text.replace(/[^0-9]/g, ''))}
      />

      <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
        <Text style={styles.verifyText}>Verify</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.resendButton, resendDisabled && { backgroundColor: '#eee' }]}
        disabled={resendDisabled}
        onPress={handleSendOtp} // Call handleSendOtp for resend
      >
        <Text style={[styles.resendText, resendDisabled && { color: '#aaa' }]}>
          {resendDisabled ? `Resend in ${timer}s` : 'Resend Code'}
        </Text>
      </TouchableOpacity>

      <Modal visible={showAnimation} transparent animationType="fade">
        <View style={styles.animationContainer}>
          {animationType === 'success' && (
            <LottieView
              ref={successRef}
              source={require('./assets/success.json')}
              autoPlay
              loop={false}
              style={styles.lottie}
            />
          )}
          {animationType === 'error' && (
            <LottieView
              ref={errorRef}
              source={require('./assets/error.json')}
              autoPlay
              loop={false}
              style={styles.lottie}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

export default VerificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#744C80',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 30,
    textAlign: 'center',
  },
  codeInput: {
    fontSize: 24,
    letterSpacing: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#744C80',
    width: '60%',
    textAlign: 'center',
    marginBottom: 30,
    color: '#000',
  },
  verifyButton: {
    backgroundColor: '#744C80',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 20,
  },
  verifyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  resendText: {
    fontSize: 14,
    color: '#744C80',
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  lottie: {
    width: 150,
    height: 150,
  },
});
