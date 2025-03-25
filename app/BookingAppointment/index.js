import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AppointmentScreen from '../../src/screens/AppointmentScreen'
import { SafeAreaView } from 'react-native-safe-area-context'

const index = () => {
  return (
    <SafeAreaView>
     <AppointmentScreen></AppointmentScreen>
    </SafeAreaView>
  )
}

export default index

const styles = StyleSheet.create({})