import { View, Text } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

const _layout = () => {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "blue" }}>
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="doctor"
        options={{
          title: "Doctor Profile",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="medkit-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="book"
        options={{
          title: "Appoinment",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      ></Tabs.Screen>
      {/* <Tabs.Screen name='profile'/> */}
    </Tabs>
  );
};

export default _layout;
