import React, { useState } from 'react';
import { Dimensions, View, Text, Image, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from './api'; // Adjust path
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AdminLoginScreen = () => {
    const navigation = useNavigation();
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    // Validation Checks
    const isValidEmail = adminEmail.endsWith("@gmail.com") && !adminEmail.includes(" ");
    const isValidPassword = adminPassword.length >= 8; // Assuming backend also validates this length
    const isButtonDisabled = !isValidEmail || !isValidPassword;
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        try {
            const response = await loginUser({ email: adminEmail, password: adminPassword });

            // --- ADDED: Store token and user role ---
            await AsyncStorage.setItem('token', response.data.token);
            await AsyncStorage.setItem('userRole', response.data.user.role); // Store the role received from backend

            // Check if the logged-in user is actually an admin
            if (response.data.user.role === 'admin') {
                navigation.navigate('AdminHomeScreen');
            } else {
                // If a non-admin tries to log in via AdminLogin, log them out and show error
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('userRole');
                Alert.alert('Login Failed', 'You do not have admin privileges.');
            }
        } catch (error) {
            Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <View style={styles.container}>
            {/* Main Content */}
            <View style={styles.content}>
                {/* Back Button */}
                <View style={styles.backButton}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Image source={require('./assets/leftarrow.png')} style={styles.leftarrow} />
                    </TouchableOpacity>
                </View>

                {/* Admin Profile Circle */}
                <View style={styles.circle}>
                    <Image source={require('./assets/profilepic.png')} style={styles.circleImage} />
                </View>

                {/* Input Fields */}
                <View style={styles.inputContainer}>
                    <View style={styles.inputField}>
                        <Text style={styles.inputLabel}>Admin Email</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter admin Gmail address"
                            placeholderTextColor="#aaa"
                            value={adminEmail}
                            onChangeText={setAdminEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {!isValidEmail && adminEmail.length > 0 && (
                            <Text style={styles.errorText}>
                                Email must contain "@gmail.com" and have no spaces
                            </Text>
                        )}
                    </View>
                    <View style={styles.inputField}>
                        <Text style={styles.inputLabel}>Admin Password</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter admin password"
                            placeholderTextColor="#aaa"
                            secureTextEntry={!showPassword}
                            value={adminPassword}
                            onChangeText={setAdminPassword}
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
                                            {!isValidPassword && adminPassword.length > 0 && (
                            <Text style={styles.errorText}>Password must be at least 8 characters</Text>
                        )}
                </View>

                {/* Login Button */}
                <TouchableOpacity
                    style={[styles.loginButton, isButtonDisabled && styles.disabledButton]}
                    disabled={isButtonDisabled}
                    onPress={handleLogin}
                >
                    <Text style={styles.loginButtonText}>Admin Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default AdminLoginScreen;

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
        width: 36,
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
eyeIcon: {
    position: 'absolute',
    right: 15,
    height: "130%",
    justifyContent: "center",
},
    loginButton: {
        backgroundColor: '#744C80',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 10,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    loginButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
});
