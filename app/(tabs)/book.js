import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AppointmentScreen from '../../src/screens/AppointmentScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

const book = () => {
  return (
    <SafeAreaView>
      <AppointmentScreen />
    </SafeAreaView>
  )
}

export default book
