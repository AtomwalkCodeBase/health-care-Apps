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
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { router } from "expo-router";
import React, { useState, useEffect, useMemo } from "react";
import { getProfileInfo } from "../services/authServices";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { getemployelistview } from "../services/productServices";
import { getAppointments, subscribeToAppointments, fetchBookedAppointments } from "./MyAppointments";
import { StatusBar } from "expo-status-bar";

// Constants
const COLORS = {
  primary: "#2a7fba",
  background: "#fff",
  text: "#333",
  secondaryText: "#666",
  rating: "#FFD700",
  danger: "#EF4444",
};

const STRINGS = {
  greeting: (name) =>
    name ? (name.length > 20 ? `${name.slice(0, 17)}...` : name) : "User",
  searchPlaceholder: "Search doctors or services",
  servicesTitle: "Services",
  doctorsTitle: "Top Rated Doctors",
  noServices: "No services found!",
  noDoctors: "No doctors found!",
  bookNow: "Book Now!",
  loading: "Loading data...",
  error: "Failed to load data. Please try again.",
  appointmentLoading: "Loading appointments...",
};

// Services list sorted alphabetically
const serviceList = [
  { name: "Cardiology", icon: "heart-pulse" },
  { name: "Dentistry", icon: "tooth-outline" },
  { name: "ENT (Otolaryngology)", icon: "ear-hearing" },
  { name: "Gastroenterology", icon: "stomach" },
  { name: "Gynecology", icon: "gender-female" },
  { name: "Neurology", icon: "brain" },
  { name: "Oncology", icon: "ribbon" },
  { name: "Ophthalmology", icon: "eye-outline" },
  { name: "Orthopedics", icon: "walk" },
  { name: "Pediatrics", icon: "baby-face-outline" },
  { name: "Psychiatry", icon: "emoticon-outline" },
  { name: "Pulmonology", icon: "lungs" },
  { name: "Radiology", icon: "radiology-box" },
  { name: "Urology", icon: "water" },
].sort((a, b) => a.name.localeCompare(b.name));

const HomeScreen = () => {
  // State management
  const [profile, setProfile] = useState({});
  const [searchText, setSearchText] = useState("");
  const [isAscending, setIsAscending] = useState(true);
  const [doctorList, setDoctorList] = useState([]);
  const [appointments, setAppointments] = useState({ upcoming: [] });
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [appointmentLoading, setAppointmentLoading] = useState(false);

  // Load appointments data with proper error handling
  const loadAppointmentsData = async () => {
    try {
      setAppointmentLoading(true);
      
      // First try to get cached appointments
      const cachedAppointments = getAppointments();
      if (cachedAppointments?.upcoming?.length > 0) {
        setAppointments(cachedAppointments);
      }
      
      // Then fetch fresh data
      await fetchBookedAppointments();
      const freshAppointments = getAppointments();
      setAppointments(freshAppointments || { upcoming: [] });
      
    } catch (error) {
      console.log("Appointments fetch warning:", error.message);
      // Fallback to cached data if available
      const cachedAppointments = getAppointments();
      if (cachedAppointments) {
        setAppointments(cachedAppointments);
      }
    } finally {
      setAppointmentLoading(false);
    }
  };

  // Main data loading function
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch profile and doctors in parallel
      const [employeeRes, profileRes] = await Promise.all([
        getemployelistview().catch(e => {
          console.error("Employee fetch error:", e);
          return { data: [] }; // Return empty array on error
        }),
        getProfileInfo().catch(e => {
          console.error("Profile fetch error:", e);
          return { data: {} }; // Return empty object on error
        })
      ]);

      setDoctorList(employeeRes?.data || []);
      setProfile(profileRes?.data || {});

      // Load appointments separately
      await loadAppointmentsData();

    } catch (error) {
      console.error("Data loading error:", error);
      setError(STRINGS.error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load and subscription setup
  useEffect(() => {
    loadData();

    // Subscribe to appointment updates
    const unsubscribe = subscribeToAppointments((updatedAppointments) => {
      setAppointments(updatedAppointments || { upcoming: [] });
    });

    return () => unsubscribe();
  }, []);

  // Refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Filter and sort doctors based on search and selection
  const { filteredServices, filteredDoctors } = useMemo(() => {
    const lowerText = searchText.toLowerCase();

    const matchedServices = serviceList.filter((service) =>
      service.name.toLowerCase().includes(lowerText)
    );

    let matchedDoctors = (doctorList || []).filter(
      (doc) =>
        (doc.name?.toLowerCase()?.includes(lowerText) ||
        doc.department_name?.toLowerCase()?.includes(lowerText)) &&
        (!selectedService || doc.department_name === selectedService)
    );

    matchedDoctors = matchedDoctors.sort((a, b) =>
      isAscending
        ? (a.name || "").localeCompare(b.name || "")
        : (b.name || "").localeCompare(a.name || "")
    );

    return {
      filteredServices: matchedServices,
      filteredDoctors: matchedDoctors,
    };
  }, [searchText, isAscending, doctorList, selectedService]);

  const handleServicePress = (serviceName) => {
    setSelectedService(serviceName === selectedService ? null : serviceName);
  };
  // UI Components
  const AppointmentCard = ({ item }) => (
    <TouchableOpacity style={styles.appointmentCard}>
      <Image source={{ uri: item.image }} style={styles.appointmentImage} />
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
    <TouchableOpacity
      style={[
        styles.serviceCard,
        selectedService === item.name && styles.selectedServiceCard,
      ]}
      onPress={() => handleServicePress(item.name)}
    >
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
      onPress={() => router.push({
        pathname: "/DoctorDetails",
        params: { name: item.name, image: item.image, specialty: item.department_name },
      })}
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

  // Loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{STRINGS.loading}</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons 
          name="alert-circle-outline" 
          size={40} 
          color={COLORS.danger} 
        />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main render
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2a7fba" barStyle="light-content" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={{ uri: profile?.image }} style={styles.profileImage} />
          <Text style={styles.greeting}>
            {STRINGS.greeting(profile?.emp_data?.name)}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            onPress={() => router.push("/BookingAppointment")} 
            style={styles.bookNowButton}
          >
            <MaterialCommunityIcons name="plus" size={18} color="#fff" />
            <Text style={styles.bookNowText}>{STRINGS.bookNow}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Section */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={22} color="gray" />
        <TextInput
          placeholder={STRINGS.searchPlaceholder}
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
        <TouchableOpacity 
          onPress={() => setIsAscending(!isAscending)} 
          style={styles.filterButton}
        >
          <MaterialCommunityIcons
            name={
              isAscending
                ? "sort-alphabetical-ascending"
                : "sort-alphabetical-descending"
            }
            size={22}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Appointments Section */}
        {appointmentLoading ? (
          <View style={styles.sectionLoading}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.sectionLoadingText}>{STRINGS.appointmentLoading}</Text>
          </View>
        ) : (
          appointments.upcoming?.length > 0 && (
            <View style={styles.appointmentsContainer}>
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
          )
        )}

        {/* Services Section */}
        <Text style={styles.sectionTitle}>{STRINGS.servicesTitle}</Text>
        <FlatList
          horizontal
          data={filteredServices}
          renderItem={({ item }) => <ServiceCard item={item} />}
          keyExtractor={(item) => item.name}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.servicesContainer}
        />

        {/* Doctors Section */}
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

// Styles
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
  filterButton: {
    padding: 5,
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
  selectedServiceCard: {
    backgroundColor: "#1E40AF",
    borderWidth: 2,
    borderColor: "#fff",
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
    paddingBottom: 0,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  sectionLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  sectionLoadingText: {
    marginLeft: 10,
    color: COLORS.text,
  },
});

export default HomeScreen;