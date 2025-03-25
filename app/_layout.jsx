import { Stack } from "expo-router";
import {AppProvider} from '../context/AppContext'

export default function RootLayout() {
  return (
    <AppProvider>
    <Stack>
      <Stack.Screen name="index"/>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      <Stack.Screen name="AuthScreen/index" options={{headerShown:false}}/> 
      <Stack.Screen name="PinScreen/index" options={{headerShown:false}}/> 
      <Stack.Screen name="ResetPassword/index" options={{headerShown:false}}/>
      <Stack.Screen name="DoctorDetails/index" options={{headerShown:false}}/>
      <Stack.Screen name="BookingAppointment/index" options={{headerShown:false}}/>

    </Stack>
    </AppProvider>
  );
}
