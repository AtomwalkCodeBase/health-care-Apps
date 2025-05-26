import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";

const Sidebar = ({ profile, onNavigate, onLogout, onClose }) => {
  const [activeItem, setActiveItem] = useState("Homepage");

  const handleNavigation = (route, label) => {
    setActiveItem(label);
    onClose?.();
    if (route !== "/home") {
      router.push(route);
    }
  };

  return (
    <View style={styles.sidebarContainer}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        {profile?.image ? (
          <Image source={{ uri: profile.image }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <MaterialCommunityIcons name="account" size={36} color="#fff" />
          </View>
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {profile?.emp_data?.name ? profile.emp_data.name : "User"}
          </Text>
          <Text style={styles.profileEmail}>
            {profile?.email ? profile.email : ""}
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
          icon="bell-outline" 
          label="Notifications" 
          active={activeItem === "Notifications"}
          onPress={() => handleNavigation("/Notifications", "Notifications")} 
        />
        <SidebarItem 
          icon="file-document-outline" 
          label="My Reports" 
          active={activeItem === "My Reports"}
          onPress={() => handleNavigation("/Reports", "My Reports")} 
        />
        <SidebarItem 
          icon="clipboard-text-outline" 
          label="My Tasks" 
          active={activeItem === "My Tasks"}
          onPress={() => handleNavigation("/TaskCategory", "My Tasks")} 
        />
        <SidebarItem 
          icon="stethoscope" 
          label="Medical Records" 
          active={activeItem === "Medical Records"}
          onPress={() => handleNavigation("MedicalRecords", "Medical Records")} 
        />
        <SidebarItem 
          icon="bed-outline" 
          label="In-Patient System" 
          active={activeItem === "In-Patient System"}
          onPress={() => handleNavigation("InPatientSystem", "In-Patient System")} 
        />
        <SidebarItem 
          icon="file-document-outline" 
          label="Feedback/Query" 
          active={activeItem === "Feedback/Query"}
          onPress={() => handleNavigation("Feedback", "Feedback/Query")}
        />
      </View>

      {/* Other Section */}
      <Text style={styles.otherLabel}>OTHER</Text>
      <View style={styles.menuSection}>
        <SidebarItem 
          icon="cog-outline" 
          label="Setting" 
          active={activeItem === "Setting"}
          onPress={() => {
            setActiveItem("Setting");
            onClose?.();
            onNavigate("Setting");
          }} 
        />
        <SidebarItem 
          icon="email-outline" 
          label="Support" 
          active={activeItem === "Support"}
          onPress={() => {
            setActiveItem("Support");
            onClose?.();
            onNavigate("Support");
          }} 
        />
        <SidebarItem 
          icon="information-outline" 
          label="About us" 
          active={activeItem === "About us"}
          onPress={() => {
            setActiveItem("About us");
            onClose?.();
            onNavigate("AboutUs");
          }} 
        />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => {
        onClose?.();
        onLogout();
      }}>
        <MaterialCommunityIcons name="logout" size={22} color="#EF4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
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
  profileEmail: {
    fontSize: 14,
    color: "#666",
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
  menuItemHighlight: {
    backgroundColor: "#eaf6fd",
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
  otherLabel: {
    fontSize: 13,
    color: "#888",
    marginTop: 18,
    marginBottom: 4,
    marginLeft: 4,
    fontWeight: "bold",
    letterSpacing: 0.5,
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