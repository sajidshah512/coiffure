import React, { useEffect } from 'react';
import { StyleSheet, ImageBackground, 
     } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Dimensions } from 'react-native';

// Get screen width and height
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


const LandingScreen = () => {
    const navigation = useNavigation();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace('Main'); // Navigate to MainScreen after 5 seconds
        }, 3000); // Fixed timeout to 5000 (5 seconds)

        return () => clearTimeout(timer); // Cleanup timeout on unmount
    }, [navigation]);

    return (
        <ImageBackground source={require('./assets/1.png')} style={styles.background}>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1, 
        width: 393,
        height: 870,
        resizeMode: 'cover',
    },
});

export default LandingScreen;
