import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { setUserPinView } from '../../src/services/productServices';
import { StatusBar } from "expo-status-bar";
import Header from "../components/Header";

const ChangePinScreen = () => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = async () => {
    setErrorMessage('');

    if (!oldPin || !newPin || !confirmPin) {
      setErrorMessage('All fields are required.');
      triggerShake();
      return;
    }
    if (newPin !== confirmPin) {
      setErrorMessage('New PIN and Confirm PIN do not match.');
      triggerShake();
      return;
    }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setErrorMessage('Please enter a 4-digit numeric PIN.');
      triggerShake();
      return;
    }

    try {
      const response = await setUserPinView(oldPin, newPin);
      if (response.status) {
        await AsyncStorage.setItem('userPin', newPin);
        Alert.alert('Success', 'Your PIN has been updated successfully.');
        router.push({ pathname: 'home' });
      } else {
        setErrorMessage(response.message || 'Failed to update PIN.');
        triggerShake();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred while updating your PIN.';
      setErrorMessage(errorMsg);
      triggerShake();
    }
  };

  return (
    <>
      <StatusBar backgroundColor="#2a7fba" barStyle="light-content" />
      <View style={styles.container}/>
      <Header title={"Update PIN"} />
      <View style={styles.root}>
        <View style={styles.card}>
          <Text style={styles.heading}>Change PIN</Text>
          <Text style={styles.subheading}>Enter your old and new PIN below</Text>
          <TextInput
            style={styles.input}
            placeholder="Old PIN"
            secureTextEntry
            keyboardType="numeric"
            maxLength={6}
            value={oldPin}
            onChangeText={setOldPin}
            placeholderTextColor="#bbb"
          />
          <TextInput
            style={styles.input}
            placeholder="New PIN"
            keyboardType="numeric"
            maxLength={6}
            value={newPin}
            onChangeText={setNewPin}
            secureTextEntry
            placeholderTextColor="#bbb"
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm New PIN"
            keyboardType="numeric"
            maxLength={6}
            value={confirmPin}
            onChangeText={setConfirmPin}
            secureTextEntry
            placeholderTextColor="#bbb"
          />
          {errorMessage ? (
            <Animated.Text style={[styles.error, { transform: [{ translateX: shakeAnim }] }]}>
              {errorMessage}
            </Animated.Text>
          ) : null}
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Update PIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default ChangePinScreen;

const styles = StyleSheet.create({
  container: {
    marginTop: 30
  },
  root: {
    flex: 1,
    backgroundColor: '#f6f8fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    alignItems: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2a7fba',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  subheading: {
    color: '#888',
    fontSize: 14,
    marginBottom: 18,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e7ef',
    paddingHorizontal: 14,
    marginBottom: 12,
    fontSize: 16,
    color: '#222',
  },
  error: {
    color: '#ef4444',
    fontWeight: '600',
    marginBottom: 10,
    fontSize: 14,
    alignSelf: 'flex-start',
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#2a7fba',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    elevation: 1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});