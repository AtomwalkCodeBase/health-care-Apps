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
  RefreshControl,
  Animated
} from "react-native";
import { router } from "expo-router";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { getProfileInfo } from "../services/authServices";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { getemployelistview } from "../services/productServices";
import { getAppointments, subscribeToAppointments, fetchBookedAppointments } from "./MyAppointments";
import { StatusBar } from "expo-status-bar";
import Sidebar from "./Sidebar";

const COLORS = {
  primary: "#2a7fba",
  background: "#fff",
  text: "#333",
  secondaryText: "#666",
  rating: "#FFD700",
  danger: "#EF4444",
  searchBackground: "#f5f5f5",
};

const STRINGS = {
  greeting: (name) =>
    name ? (name.length > 20 ? `${name.slice(0, 17)}...` : name) : "User",
  searchBase: "Search",
  searchPhrase: "doctors or services",
  servicesTitle: "Services",
  doctorsTitle: "Top Rated Doctors",
  noServices: "No services found!",
  noDoctors: "No doctors found!",
  bookNow: "Book Now",
  loading: "Loading data...",
  error: "Failed to load data. Please try again.",
  appointmentLoading: "Loading appointments...",
};

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

const ServiceCard = React.memo(({ item, isSelected, onPress }) => (
  <TouchableOpacity
    style={[
      styles.serviceCard,
      isSelected && styles.selectedServiceCard,
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <MaterialCommunityIcons
      name={item.icon}
      size={30}
      color="#fff"
      style={styles.serviceIcon}
    />
    <Text style={styles.serviceText}>{item.name}</Text>
  </TouchableOpacity>
));

const DoctorCard = React.memo(({ item, onPress }) => (
  <TouchableOpacity
    style={styles.doctorCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {item.image ? (
      <Image 
        source={{ uri: item.image }} 
        style={styles.doctorImage}
      />
    ) : (
      <View style={[styles.doctorImage, styles.placeholderImage]}>
        <MaterialCommunityIcons name="account" size={30} color="#ccc" />
      </View>
    )}
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
));

const HomeScreen = () => {
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
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState(STRINGS.searchBase);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  const animationRef = useRef(null);
  const isTypingRef = useRef(true);
  const currentIndexRef = useRef(0);
  const sidebarAnim = useRef(new Animated.Value(-300)).current;

  const loadAppointmentsData = useCallback(async () => {
    try {
      setAppointmentLoading(true);
      await fetchBookedAppointments();
      const freshAppointments = getAppointments();
      setAppointments(freshAppointments || { upcoming: [] });
    } catch (error) {
      console.log("Appointments fetch warning:", error.message);
    } finally {
      setAppointmentLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [employeeRes, profileRes] = await Promise.all([
        getemployelistview(),
        getProfileInfo()
      ]);
      setDoctorList(employeeRes?.data || []);
      setProfile(profileRes?.data || {});
      await loadAppointmentsData();
    } catch (error) {
      console.error("Data loading error:", error);
      setError(STRINGS.error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadAppointmentsData]);

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToAppointments(setAppointments);
    return () => {
      unsubscribe && unsubscribe();
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [loadData]);

  useEffect(() => {
    const typeText = () => {
      if (isTypingRef.current) {
        if (currentIndexRef.current <= STRINGS.searchPhrase.length) {
          setAnimatedPlaceholder(
            `${STRINGS.searchBase} ${STRINGS.searchPhrase.substring(0, currentIndexRef.current)}`
          );
          currentIndexRef.current++;
          animationRef.current = setTimeout(typeText, 100);
        } else {
          isTypingRef.current = false;
          animationRef.current = setTimeout(typeText, 1500);
        }
      } else {
        if (currentIndexRef.current >= 0) {
          setAnimatedPlaceholder(
            `${STRINGS.searchBase} ${STRINGS.searchPhrase.substring(0, currentIndexRef.current)}`
          );
          currentIndexRef.current--;
          animationRef.current = setTimeout(typeText, 50);
        } else {
          isTypingRef.current = true;
          animationRef.current = setTimeout(typeText, 500);
        }
      }
    };

    animationRef.current = setTimeout(typeText, 1000);
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, []);

  const toggleSidebar = () => {
    if (sidebarVisible) {
      Animated.timing(sidebarAnim, {
        toValue: -300,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setSidebarVisible(false));
    } else {
      setSidebarVisible(true);
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };

  const { filteredServices, filteredDoctors } = useMemo(() => {
    const lowerText = searchText.toLowerCase();
    const matchedServices = serviceList.filter(service =>
      service.name.toLowerCase().includes(lowerText)
    );

    let matchedDoctors = doctorList.filter(doc =>
      (doc.name?.toLowerCase()?.includes(lowerText) ||
      doc.department_name?.toLowerCase()?.includes(lowerText)) &&
      (!selectedService || doc.department_name === selectedService)
    );

    matchedDoctors = matchedDoctors.sort((a, b) =>
      isAscending
        ? (a.name || "").localeCompare(b.name || "")
        : (b.name || "").localeCompare(a.name || "")
    );

    return { filteredServices: matchedServices, filteredDoctors: matchedDoctors };
  }, [searchText, isAscending, doctorList, selectedService]);

  const handleServicePress = useCallback((serviceName) => {
    setSelectedService(selectedService === serviceName ? null : serviceName);
  }, [selectedService]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleDoctorPress = useCallback((item) => {
    router.push({
      pathname: "/DoctorDetails",
      params: { 
        id: item.id.toString(),
        name: item.name,
        image: item.image, 
        specialty: item.department_name,
        grade: item.grade_name
      },
    });
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{STRINGS.loading}</Text>
      </View>
    );
  }

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

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2a7fba" barStyle="light-content" />
      
      {/* Sidebar Animation */}
      {sidebarVisible && (
        <Animated.View 
          style={[
            styles.sidebarWrapper,
            { transform: [{ translateX: sidebarAnim }] }
          ]}
        >
          <Sidebar
            profile={profile}
            onNavigate={(screen) => router.push("/" + screen)}
            onLogout={() => router.replace("/Login")}
            onClose={toggleSidebar}
          />
        </Animated.View>
      )}
      
      {/* Overlay when sidebar is open */}
      {sidebarVisible && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.topRow}>
            <TouchableOpacity
              onPress={toggleSidebar}
              activeOpacity={0.7}
              style={styles.menuButton}
            >
              <MaterialCommunityIcons name="menu" size={32} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.bookNowButton}
              onPress={() => router.push("/BookingAppointment")}
              activeOpacity={0.7}
            >
              <View style={styles.bookNowIconWrapper}>
                <MaterialCommunityIcons name="calendar-plus" size={22} color="#2a7fba" />
              </View>
              <Text style={styles.bookNowText}>{STRINGS.bookNow}</Text>
            </TouchableOpacity>
          </View>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color="#777" />
            <TextInput
              placeholder={animatedPlaceholder}
              placeholderTextColor="#999"
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity 
              onPress={() => setIsAscending(!isAscending)}
              style={styles.filterButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={isAscending ? "sort-alphabetical-ascending" : "sort-alphabetical-descending"}
                size={20}
                color="#777"
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Scrollable Content */}
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
          {/* Appointments */}
          {appointmentLoading ? (
            <View style={styles.sectionLoading}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.sectionLoadingText}>{STRINGS.appointmentLoading}</Text>
            </View>
          ) : (
            appointments.upcoming?.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
                <FlatList
                  horizontal
                  data={appointments.upcoming}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.appointmentCard}
                      activeOpacity={0.7}
                    >
                      {item.image ? (
                        <Image 
                          source={{ uri: item.image }} 
                          style={styles.appointmentImage}
                        />
                      ) : (
                        <View style={[styles.appointmentImage, styles.placeholderImage]}>
                          <MaterialCommunityIcons name="account" size={24} color="#ccc" />
                        </View>
                      )}
                      <View style={styles.appointmentInfo}>
                        <Text style={styles.appointmentDoctorName}>{item.doctorName}</Text>
                        <Text style={styles.appointmentDesignation}>{item.specialty}</Text>
                        <Text style={styles.appointmentDateTime}>
                          {item.date} at {item.time}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.appointmentsList}
                />
              </View>
            )
          )}
          
          {/* Services */}
          <Text style={styles.sectionTitle}>{STRINGS.servicesTitle}</Text>
          <FlatList
            horizontal
            data={filteredServices}
            renderItem={({ item }) => (
              <ServiceCard 
                item={item}
                isSelected={selectedService === item.name}
                onPress={() => handleServicePress(item.name)}
              />
            )}
            keyExtractor={(item) => item.name}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesContainer}
          />
          
          {/* Doctors */}
          <Text style={styles.sectionTitle}>{STRINGS.doctorsTitle}</Text>
          {filteredDoctors.length === 0 ? (
            <Text style={styles.noResultsText}>{STRINGS.noDoctors}</Text>
          ) : (
            <FlatList
              data={filteredDoctors}
              renderItem={({ item }) => (
                <DoctorCard item={item} onPress={() => handleDoctorPress(item)} />
              )}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.verticalList}
            />
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    flex: 1,
  },
  sidebarWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    zIndex: 100,
    elevation: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 99,
  },
  headerContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 18,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: -8,
  },
  menuButton: {
    padding: 12,
  },
  bookNowButton: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 7,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    minWidth: 130,
    justifyContent: 'center',
  },
  bookNowIconWrapper: {
    backgroundColor: 'rgba(42, 127, 186, 0.1)',
    borderRadius: 12,
    padding: 4,
    marginRight: 8,
  },
  bookNowText: {
    color: '#2a7fba',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  searchContainer: {
    backgroundColor: COLORS.searchBackground,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 0,
  },
  filterButton: {
    marginLeft: 5,
    padding: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 10,
    marginHorizontal: 20,
    color: COLORS.text,
  },
  servicesContainer: {
    paddingLeft: 20,
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
    backgroundColor: "#15507b",
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
    paddingHorizontal: 20,
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
  appointmentsList: {
    paddingLeft: 20,
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.background,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 16,
    textAlign: "center",
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
    color: "#fff",
    fontSize: 16,
  },
  sectionLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  sectionLoadingText: {
    marginLeft: 10,
    color: COLORS.text,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;