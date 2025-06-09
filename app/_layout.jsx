import { Stack } from "expo-router";
import {AppProvider} from '../context/AppContext'
import CustomStatusBar from '../src/components/StatusBar';

export default function RootLayout() {
  return (
    <AppProvider>
       <CustomStatusBar />
    <Stack>
      <Stack.Screen name="index"/>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      <Stack.Screen name="AuthScreen/index" options={{headerShown:false}}/> 
      <Stack.Screen name="PinScreen/index" options={{headerShown:false}}/> 
      <Stack.Screen name="ResetPassword/index" options={{headerShown:false}}/>
      <Stack.Screen name="DoctorDetails/index" options={{headerShown:false}}/>
      <Stack.Screen name="BookingAppointment/index" options={{headerShown:false}}/>
      <Stack.Screen name="DateTime/index" options={{headerShown:false}}/>
      <Stack.Screen name="BookingConfirmation/index" options={{headerShown:false}}/>
      <Stack.Screen name="Reports/index" options={{headerShown:false}}/>
      <Stack.Screen name="ReportMain/index" options={{headerShown:false}}/>
      <Stack.Screen name="TaskCategory/index" options={{headerShown:false}}/>
      <Stack.Screen name="AudioTask/index" options={{headerShown:false}}/>

    </Stack>
    </AppProvider>
  );
}
