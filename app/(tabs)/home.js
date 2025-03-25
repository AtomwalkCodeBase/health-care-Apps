import { StatusBar } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeScreen from "../../src/screens/HomeScreen";
import PinPopup from "../../src/screens/PinPopup";

const Home = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HomeScreen />
      <PinPopup />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

export default Home;
