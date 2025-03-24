import { View, Text } from "react-native";
import React from "react";
import HomeScreen from "../../src/screens/HomeScreen";
import { SafeAreaView } from "react-native-safe-area-context";
import PinPopup from "../../src/screens/PinPopup";

const home = () => {
  return (
    <SafeAreaView>
      <HomeScreen />
      <PinPopup></PinPopup>
    </SafeAreaView>
  );
};

export default home;
