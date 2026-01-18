import React, { useState } from 'react';
import {
    Dimensions, View, Text, Image, TouchableOpacity,
    StyleSheet, TextInput, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from './api'; // Adjust path
import { registerForPushNotifications } from "./NotificationScreen";
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const LoginScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const isValidEmail = email.endsWith("@gmail.com") && !email.includes(" ");
    const isValidPassword = password.length >= 8; // Assuming backend also validates this length
    const isButtonDisabled = !isValidEmail || !isValidPassword;
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        try {
            const response = await loginUser({ email, password });

            // --- ADDED: Store token and user role ---
            await AsyncStorage.setItem('token', response.data.token);
            await AsyncStorage.setItem('userRole', response.data.user.role); // Store the role received from backend

            // Check if the logged-in user is a regular user
            if (response.data.user.role === 'user') {
                navigation.navigate('HomeScreen');
            } else {
                // If an admin tries to log in via UserLogin, log them out and show error
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('userRole');
                Alert.alert('Login Failed', 'You are an admin. Please use the Admin Login.');
            }
        } catch (error) {
            Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
        }
          const expoPushToken = await registerForPushNotifications();

  if (expoPushToken) {
    await api.post("/users/save-push-token", { expoPushToken });
  }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={styles.content}>
                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Main')}>
                    <Image source={require('./assets/leftarrow.png')} style={styles.leftarrow} />
                    <Text> </Text>
                </TouchableOpacity>

                {/* Profile Circle */}
                <View style={styles.circle}>
                    <Image source={require('./assets/profilepic.png')} style={styles.circleImage} />
                </View>

                {/* Input Fields */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter your Gmail address"
                        placeholderTextColor="#aaa"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    {!isValidEmail && email.length > 0 && (
                        <Text style={styles.errorText}>Enter a valid Gmail address</Text>
                    )}

                   <Text style={[styles.inputLabel, { marginTop: 15 }]}>Password</Text>

<View style={styles.passwordWrapper}>
    <TextInput
        style={styles.textInput}
        placeholder="Enter password"
        placeholderTextColor="#aaa"
        secureTextEntry={!showPassword}
        value={password}
        onChangeText={setPassword}
    />

    <TouchableOpacity
        style={styles.eyeIcon}
        onPress={() => setShowPassword(!showPassword)}
    >
        <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={24}
            color="#744C80"
        />
    </TouchableOpacity>
</View>

{!isValidPassword && password.length > 0 && (
    <Text style={styles.errorText}>
        Password must be at least 8 characters
    </Text>
)}


                    {/* Forgot Password */}
                    <TouchableOpacity onPress={() => navigation.navigate('Forgotpassword')}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                    style={[styles.loginButton, isButtonDisabled && styles.disabledButton]}
                    disabled={isButtonDisabled}
                    onPress={handleLogin}
                >
                    <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>

                {/* Signup Link */}
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                    <Text style={styles.signupText}>Don't have an account? <Text style={{ fontWeight: 'bold' }}>Sign up</Text></Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        width: screenWidth,
        height: screenHeight,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 70,
    },
    backButton: {
        marginBottom: 10,
        alignSelf: 'flex-start',

    },
    leftarrow: {
        width: 35,
        height: 30,
    },
    circle: {
        width: 140,
        height: 140,
        alignSelf: 'center',
        marginBottom: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleImage: {
        width: 140,
        height: 140,
        borderRadius: 20,
    },
    inputContainer: {
        marginBottom: 25,
    },
    inputLabel: {
        fontSize: 16,
        color: '#7D5BA6',
        marginBottom: 5,
    },
    textInput: {
        fontSize: 16,
        color: '#000',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#F9F9F9',
    },
    errorText: {
        fontSize: 12,
        color: 'red',
        marginTop: 5,
    },
    forgotPasswordText: {
        color: '#744C80',
        marginTop: 10,
        alignSelf: 'flex-end',
        fontSize: 14,
    },
    loginButton: {
        backgroundColor: '#744C80',
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 3,
        marginBottom: 15,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    loginButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    signupText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#744C80',
        marginTop: 5,
    },
    passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
},

eyeIcon: {
    position: 'absolute',
    right: 15,
    height: "100%",
    justifyContent: "center",
},

});
