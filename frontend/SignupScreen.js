import React, { useState } from 'react';
import { Dimensions, ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser } from './api'; // Adjust path
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SignupScreen = () => {
    const navigation = useNavigation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    // Show/hide passwords
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const isValidEmail = email.endsWith("@gmail.com") && !email.includes(" ");
    const isValidPassword = password.length >= 8;
    const doPasswordsMatch = password === confirmPassword;

    const isButtonDisabled =
        !isValidEmail || !isValidPassword || !doPasswordsMatch || !name;

    const handleSignup = async () => {
        try {
            const response = await registerUser({
                name,
                email,
                password,
                confirmPassword,
            });

            await AsyncStorage.setItem('token', response.data.token);
            await AsyncStorage.setItem('userRole', response.data.user.role);

            Alert.alert(
                'Signup Success',
                'You have been registered successfully! Please verify your email.'
            );

            navigation.navigate('VerificationScreen', { userEmail: email });
        } catch (error) {
            Alert.alert('Signup Failed', error.response?.data?.message || 'Something went wrong');
        }
    };

    return (
              <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
            <View style={styles.content}>
                
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Main')}>
                    <Image source={require('./assets/leftarrow.png')} style={styles.leftarrow} />
                </TouchableOpacity>

                <View style={styles.circle}>
                    <Image source={require('./assets/profilepic.png')} style={styles.circleImage} />
                </View>

                {/* Input Fields */}
                <View style={styles.inputContainer}>
                    
                    {/* Name */}
                    <Text style={styles.inputLabel}>Name</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter your name"
                        placeholderTextColor="#aaa"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />

                    {/* Email */}
                    <Text style={[styles.inputLabel, { marginTop: 15 }]}>Email</Text>
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
                        <Text style={styles.errorText}>Email must contain "@gmail.com" and no spaces</Text>
                    )}

                    {/* Password */}
                    <Text style={[styles.inputLabel, { marginTop: 15 }]}>Password</Text>
                    <View style={styles.passwordContainer}>
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
                                size={22}
                                color="#7D5BA6"
                            />
                        </TouchableOpacity>
                    </View>
                    {!isValidPassword && password.length > 0 && (
                        <Text style={styles.errorText}>Password must be at least 8 characters</Text>
                    )}

                    {/* Confirm Password */}
                    <Text style={[styles.inputLabel, { marginTop: 15 }]}>Confirm Password</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Re-enter your password"
                            placeholderTextColor="#aaa"
                            secureTextEntry={!showConfirmPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <Ionicons
                                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                size={22}
                                color="#7D5BA6"
                            />
                        </TouchableOpacity>
                    </View>
                     
                    {!doPasswordsMatch && confirmPassword.length > 0 && (
                        <Text style={styles.errorText}>Passwords do not match</Text>
                    )}

                </View>

                {/* Signup Button */}
                <TouchableOpacity
                    style={[styles.signupButton, isButtonDisabled && styles.disabledButton]}
                    disabled={isButtonDisabled}
                    onPress={handleSignup}
                >
                    <Text style={styles.signupButtonText}>Sign Up</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginText}>
                        Already have an account? <Text style={{ fontWeight: 'bold' }}>Login</Text>
                    </Text>
                </TouchableOpacity>

            </View>
        </View>
</ScrollView>
    );
};

export default SignupScreen;

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
    passwordContainer: {
        position: "relative",
        justifyContent: "center",
    },
    eyeIcon: {
        position: 'absolute',
        right: 12,
        top: 13,
    },
    errorText: {
        fontSize: 12,
        color: 'red',
        marginTop: 5,
    },
    signupButton: {
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
    signupButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    loginText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#744C80',
        marginTop: 5,
    },
});
