import React, { useContext, useRef, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ImageBackground,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import Icon from 'react-native-vector-icons/Ionicons';
import ChangePassword from '../../src/screens/ChangePassword';
import { AppContext } from '../../context/AppContext';

const AuthScreen = () => {
    const {login} = useContext(AppContext);
    const router = useRouter();
    const [mPIN, setMPIN] = useState(['', '', '', '']);
    const [attemptsRemaining, setAttemptsRemaining] = useState(5);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const maxAttempts = 5;

    const inputRefs = Array(4).fill().map(() => useRef(null));

    const handleMPINChange = (text, index) => {
        const updatedMPIN = [...mPIN];
        updatedMPIN[index] = text;
        setMPIN(updatedMPIN);

        if (text && index < 3) {
            inputRefs[index + 1].current.focus();
        } else if (!text && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    useEffect(() => {
        handleBiometricAuthentication();
        const checkStoredPin = async () => {
            const storedPin = await AsyncStorage.getItem('userPin');
            console.log('Stored userPin on mount:', storedPin);
        };
        checkStoredPin();
    }, []);

    const handleMPINSubmit = async () => {
        const enteredPin = mPIN.join('');
        const correctMPIN = await AsyncStorage.getItem('userPin');
        console.log('Entered mPIN:', enteredPin);
        console.log('Stored userPin:', correctMPIN);

        if (enteredPin === correctMPIN) {
            setIsAuthenticated(true);
            const finalUsername = await AsyncStorage.getItem('username');
            try {
                await login(finalUsername, correctMPIN); // Use userPin instead of userPassword
                console.log('PIN login successful with:', { finalUsername, pin: correctMPIN });
                router.push({ pathname: 'home' });
            } catch (error) {
                console.error('Login error:', error);
                Alert.alert('Login Failed', 'Unable to authenticate with PIN.');
            }
        } else {
            const remaining = attemptsRemaining - 1;
            setAttemptsRemaining(remaining);
            if (remaining > 0) {
                Alert.alert('Incorrect mPIN', `${remaining} attempts remaining`);
            } else {
                Alert.alert('Account Locked', 'Too many incorrect attempts.');
            }
        }
    };

    const handleBiometricAuthentication = async () => {
        try {
            const biometricAuth = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate using biometrics',
                fallbackLabel: 'Enter mPIN',
            });
            if (biometricAuth.success) {
                setIsAuthenticated(true);
                const finalUsername = await AsyncStorage.getItem('username');
                const userPin = await AsyncStorage.getItem('userPin');
                try {
                    await login(finalUsername, userPin); // Use userPin instead of userPassword
                    console.log('Biometric login successful with:', { finalUsername, pin: userPin });
                    router.push({ pathname: 'home' });
                } catch (error) {
                    console.error('Biometric login error:', error);
                    Alert.alert('Login Failed', 'Biometric authentication error.');
                }
            }
        } catch (err) {
            console.error('Biometric auth error:', err);
        }
    };

    const openPopup = () => {
        setModalVisible(true);
    };

    return (
        <ImageBackground
            source={require('../../assets/images/Backgroundback.png')}
            style={styles.background}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>Login with PIN</Text>
                    <View style={styles.mPINContainer}>
                        {mPIN.map((value, index) => (
                            <TextInput
                                key={index}
                                ref={inputRefs[index]}
                                style={styles.mPINInput}
                                maxLength={1}
                                keyboardType="number-pad"
                                value={value}
                                onChangeText={(text) => handleMPINChange(text, index)}
                            />
                        ))}
                    </View>
                    {attemptsRemaining < maxAttempts && (
                        <Text style={styles.errorText}>
                            Incorrect mPIN. {attemptsRemaining} attempts remaining.
                        </Text>
                    )}
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleMPINSubmit}
                    >
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={openPopup}>
                        <Text style={styles.forgotText}>Forgot PIN?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.fingerprintButton}
                        onPress={handleBiometricAuthentication}
                    >
                        <Icon name="finger-print" size={30} color="#fff" />
                        <Text style={styles.fingerprintButtonText}>Use Fingerprint</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <ChangePassword setModalVisible={setModalVisible} modalVisible={modalVisible} />
        </ImageBackground>
    );
};

export default AuthScreen;

// Styles remain unchanged
const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 30,
        width: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    mPINContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    mPINInput: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        textAlign: 'center',
        fontSize: 18,
        marginHorizontal: 5,
        backgroundColor: '#f9f9f9',
        color: '#333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 2,
    },
    errorText: {
        color: 'red',
        marginBottom: 20,
        fontSize: 14,
    },
    submitButton: {
        backgroundColor: '#4d88ff',
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 10,
        marginBottom: 15,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    forgotText: {
        color: '#007BFF',
        marginBottom: 20,
        textDecorationLine: 'underline',
    },
    fingerprintButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 10,
    },
    fingerprintButtonText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 10,
    },
});