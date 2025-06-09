import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCustomerDetailList } from "../services/productServices";

const Sidebar = ({ onClose }) => {
  const [activeItem, setActiveItem] = useState("Homepage");
  const [name, setName] = useState({}); // Initialize as object

  const handleNavigation = (route, label) => {
    setActiveItem(label);
    onClose?.();
    if (route !== "/home") {
      router.push(route);
    }
  };

  const fetchProfileData = async () => {
    try {
      const customerId = await AsyncStorage.getItem("Customer_id");
      if (customerId) {
        const res = await getCustomerDetailList(customerId);
        setName(Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : {});
      } else {
        console.warn("No Customer_id found in AsyncStorage");
        setName({});
      }
    } catch (error) {
      console.error("Failed to fetch profile data:", error.message);
      setName({});
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  return (
    <View style={styles.sidebarContainer}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        {name?.image ? (
          <Image source={{ uri: name.image }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <MaterialCommunityIcons name="account" size={36} color="#fff" />
          </View>
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {name.name || "User"}
          </Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <SidebarItem
          icon="home-outline"
          label="Homepage"
          active={activeItem === "Homepage"}
          onPress={() => handleNavigation("/home", "Homepage")}
        />
        <SidebarItem
          icon="calendar-outline"
          label="My Appointments"
          active={activeItem === "My Appointments"}
          onPress={() => handleNavigation("/book", "My Appointments")}
        />
        <SidebarItem
          icon="file-document-outline"
          label="My Reports"
          active={activeItem === "My Reports"}
          onPress={() => handleNavigation("/ReportMain", "My Reports")}
        />
        <SidebarItem
          icon="clipboard-text-outline"
          label="My Activities"
          active={activeItem === "My Activities"}
          onPress={() => handleNavigation("/TaskCategory", "My Activities")}
        />
        <SidebarItem
          icon="account-circle"
          label="My Profile"
          active={activeItem === "My Profile"}
          onPress={() => handleNavigation("/profile", "My Profile")}
        />
      </View>
    </View>
  );
};

const SidebarItem = ({ icon, label, onPress, active }) => (
  <TouchableOpacity
    style={[styles.menuItem, active && styles.menuItemHighlight]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <MaterialCommunityIcons
      name={icon}
      size={22}
      color={active ? "#2a7fba" : "#555"}
    />
    <Text style={[styles.menuLabel, active && styles.menuLabelHighlight]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  sidebarContainer: {
    backgroundColor: "#fff",
    paddingTop: 44,
    paddingHorizontal: 24,
    width: 300,
    height: "100%",
    elevation: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    shadowOffset: { width: 4, height: 0 },
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 36,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2a7fba",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholder: {
    backgroundColor: "#2a7fba",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontWeight: "700",
    fontSize: 18,
    color: "#222",
    marginBottom: 2,
  },
  menuSection: {
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  menuLabel: {
    marginLeft: 18,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  menuLabelHighlight: {
    color: "#2a7fba",
    fontWeight: "700",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "auto",
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: "#EF4444",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 18,
  },
});

export default Sidebar;