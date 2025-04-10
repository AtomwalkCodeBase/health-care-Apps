import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import HeaderComponent from './HeaderComponent';
import { setuserpinview } from '../../src/services/productServices'; // Adjust the import path

const ChangePinScreen = () => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const shakeAnim = new Animated.Value(0);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
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
      console.log('Submitting:', { oldPin, newPin });
      const response = await setuserpinview(oldPin, newPin);
      console.log('API Response:', response);

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
      console.error('Error in handleSubmit:', errorMsg);
      setErrorMessage(errorMsg); // Displays "Old Pin is not valid" from API
      triggerShake();
    }
  };

  return (
    <>
      <HeaderComponent
        headerTitle="Update Your PIN"
        onBackPress={() => router.back()}
      />
      <View style={styles.container}>
        <Text style={styles.title}>Update Your PIN</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your old PIN"
          secureTextEntry
          keyboardType="numeric"
          maxLength={4}
          value={oldPin}
          onChangeText={setOldPin}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Enter your new 4-digit PIN"
          keyboardType="numeric"
          maxLength={4}
          value={newPin}
          onChangeText={setNewPin}
          secureTextEntry
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm new PIN"
          keyboardType="numeric"
          maxLength={4}
          value={confirmPin}
          onChangeText={setConfirmPin}
          secureTextEntry
          placeholderTextColor="#888"
        />
        {errorMessage ? (
          <Animated.Text style={[styles.error, { transform: [{ translateX: shakeAnim }] }]}>
            {errorMessage}
          </Animated.Text>
        ) : null}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default ChangePinScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#454545',
  },
  input: {
    height: 50,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#ececec',
    color: '#454545',
    fontSize: 16,
  },
  error: {
    color: '#ff6b6b',
    marginBottom: 15,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  submitButton: {
    height: 50,
    backgroundColor: '#007bff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});