import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import React, { useState, useEffect, useMemo } from "react";
import { getProfileInfo } from "../services/authServices";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { getemployelistview } from "../services/productServices";
import { getAppointments, subscribeToAppointments } from "./MyAppointments";
import { StatusBar } from "expo-status-bar";

// Constants
const COLORS = {
  primary: "#3B82F6",
  background: "#fff",
  text: "#333",
  secondaryText: "#666",
  rating: "#FFD700",
};

const STRINGS = {
  greeting: (name) => {
    const parts = name?.split(" ") || [];
    return `Hello ${parts.length > 1 ? parts[1] : parts[0] || "User"}`;
  },
  searchPlaceholder: "Search doctors or services",
  servicesTitle: "Services",
  doctorsTitle: "Top Rated Doctors",
  noServices: "No services found!",
  noDoctors: "No doctors found!",
  bookNow: "Book Now!",
};

// Services list with validated icons
const serviceList = [
  { name: "Dentistry", icon: "tooth-outline" },
  { name: "Neurology", icon: "brain" },
  { name: "Cardiology", icon: "heart-pulse" },
  { name: "Orthopedics", icon: "walk" },
  { name: "Pediatrics", icon: "baby-face-outline" },
  { name: "Radiology", icon: "radiology-box" },
  { name: "Psychiatry", icon: "emoticon-outline" },
  { name: "Ophthalmology", icon: "eye-outline" },
  { name: "Gynecology", icon: "gender-female" },
  { name: "ENT (Otolaryngology)", icon: "ear-hearing" },
  { name: "Gastroenterology", icon: "stomach" },
  { name: "Urology", icon: "water" },
  { name: "Pulmonology", icon: "lungs" },
  { name: "Oncology", icon: "ribbon" },
];



const HomeScreen = () => {
  const [profile, setProfile] = useState({});
  const [searchText, setSearchText] = useState("");
  const [isAscending, setIsAscending] = useState(true);
  const [doctorList, setDoctorList] = useState([]);
  const [appointments, setAppointments] = useState(getAppointments());

  useEffect(() => {
    // Load initial data
    getemployelistview()
      .then((res) => setDoctorList(res.data))
      .catch((error) => console.error("employee load failed:", error));
    getProfileInfo()
      .then((res) => setProfile(res.data))
      .catch((error) => console.error("Profile load failed:", error));

    // Subscribe to appointment updates
    const unsubscribe = subscribeToAppointments((updatedAppointments) => {
      setAppointments(updatedAppointments);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  
  const { filteredServices, filteredDoctors } = useMemo(() => {
    const lowerText = searchText.toLowerCase();

    const matchedServices = serviceList.filter((service) =>
      service.name.toLowerCase().includes(lowerText)
    );

    const matchedDoctors = (doctorList || [])
      .filter(
        (doc) =>
          doc.name?.toLowerCase()?.includes(lowerText) ||
          doc.specialty?.toLowerCase()?.includes(lowerText)
      )
      .sort((a, b) =>
        isAscending
          ? (a.name || "").localeCompare(b.name || "")
          : (b.name || "").localeCompare(a.name || "")
      );

      
    return {
      filteredServices: matchedServices,
      filteredDoctors: matchedDoctors,
    };
  }, [searchText, isAscending, doctorList]);

  const toggleSortOrder = () => setIsAscending(!isAscending);

  const handleDoctorPress = (name,image) => {
    router.push({
      pathname: "/DoctorDetails",
      params: { name: name,image: image },
             
    });
  };

  const handleBookNow = () => router.push("/BookingAppointment");

  const AppointmentCard = ({ item }) => (
    <TouchableOpacity style={styles.appointmentCard}>
      <Image source={{uri:item.image}} style={styles.appointmentImage} />
      <View style={styles.appointmentInfo}>
        <Text style={styles.appointmentDoctorName}>{item.doctorName}</Text>
        <Text style={styles.appointmentDesignation}>{item.specialty}</Text>
        <Text style={styles.appointmentDateTime}>
          {item.date} at {item.time}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const ServiceCard = ({ item }) => (
    <TouchableOpacity style={styles.serviceCard}>
      <MaterialCommunityIcons
        name={item.icon}
        size={30}
        color="#fff"
        style={styles.serviceIcon}
      />
      <Text style={styles.serviceText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const DoctorCard = ({ item }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => handleDoctorPress(item.name, item.image)}
    >
      <Image source={{ uri: item.image }} style={styles.doctorImage} />
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>{item.name}</Text>
        <Text style={styles.doctorSpecialty}>
          {item.department_name} - {item.grade_name}
        </Text>
        <Text style={styles.doctorDetails}>
          ⏰ 10:30 AM - 3:30 PM | Fee: 400
        </Text>
      </View>
      <Text style={styles.rating}>⭐ 4.5</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2a7fba" barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={{ uri: profile?.image }} style={styles.profileImage} />
          <Text style={styles.greeting}>
            {STRINGS.greeting(profile?.emp_data?.name)}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleBookNow} style={styles.bookNowButton}>
            <MaterialCommunityIcons name="plus" size={18} color="#fff" />
            <Text style={styles.bookNowText}>{STRINGS.bookNow}</Text>
          </TouchableOpacity>
        </View>
      </View>
  
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={22} color="gray" />
        <TextInput
          placeholder={STRINGS.searchPlaceholder}
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={toggleSortOrder} style={styles.filterButton}>
          <MaterialCommunityIcons
            name={isAscending ? "sort-alphabetical-ascending" : "sort-alphabetical-descending"}
            size={22}
            color="gray"
          />
        </TouchableOpacity>
      </View>
  
      {appointments.upcoming.length > 0 && (
        <View style={styles.filterixedAppointmentsContainer}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          <FlatList
            horizontal
            data={appointments.upcoming}
            renderItem={({ item }) => <AppointmentCard item={item} />}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.appointmentsList}
          />
        </View>
      )}
  
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{STRINGS.servicesTitle}</Text>
        <FlatList
          horizontal
          data={filteredServices}
          renderItem={({ item }) => <ServiceCard item={item} />}
          keyExtractor={(item) => item.name}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.servicesContainer}
        />
  
        <Text style={styles.sectionTitle}>{STRINGS.doctorsTitle}</Text>
        {filteredDoctors.length === 0 ? (
          <Text style={styles.noResultsText}>{STRINGS.noDoctors}</Text>
        ) : (
          <FlatList
            data={filteredDoctors}
            renderItem={({ item }) => <DoctorCard item={item} />}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.verticalList}
          />
        )}
      </ScrollView>
    </View>
  );
};

// Styles (unchanged)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 25,
    backgroundColor: COLORS.background,
  },
  header: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#F1E7E7",
  },
  greeting: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 15,
    color: COLORS.text,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bookNowButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  bookNowText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 10,
    color: COLORS.text,
  },
  servicesContainer: {
    paddingBottom: 10,
  },
  serviceCard: {
    width: Dimensions.get("window").width * 0.4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minHeight: 80,
  },
  serviceText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  verticalList: {
    marginBottom: 30,
  },
  doctorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
  },
  doctorImage: {
    width: 70,
    height: 70,
    borderRadius: 30,
    marginRight: 15,
    justifyContent: "center",
    resizeMode: "cover",
    alignItems: "center",
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 2,
  },
  doctorSpecialty: {
    color: COLORS.secondaryText,
    fontSize: 14,
    marginBottom: 3,
  },
  doctorDetails: {
    fontSize: 13,
    color: COLORS.secondaryText,
  },
  rating: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.rating,
  },
  noResultsText: {
    fontSize: 14,
    color: COLORS.secondaryText,
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 20,
  },
  appointmentsContainer: {
    marginBottom: 20,
  },
  appointmentsList: {
    paddingBottom: 10,
  },
  appointmentCard: {
    width: Dimensions.get("window").width * 0.7,
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 12,
    marginRight: 12,
    alignItems: "center",
  },
  appointmentImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentDoctorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 2,
  },
  appointmentDesignation: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginBottom: 2,
  },
  appointmentDateTime: {
    fontSize: 13,
    color: COLORS.secondaryText,
  },
});

export default HomeScreen;