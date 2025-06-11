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
import React, { useState, useEffect, useRef, useCallback } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { getAppointments, subscribeToAppointments, fetchBookedAppointments } from "./MyAppointments";
import { StatusBar } from "expo-status-bar";
import Sidebar from "./Sidebar";
import img1 from "../../assets/images/home01.png";
import img2 from "../../assets/images/home02.jpg";
import img3 from "../../assets/images/home03.jpg";
import Cimg1 from "../../assets/images/Home_04.jpg";
import Cimg3 from "../../assets/images/Home_06.jpg";
import Cimg4 from "../../assets/images/Home_07.jpg";

// ---- CARD GRID CONSTANTS ----
const CARD_MARGIN = 12;
const NUM_COLUMNS = 2;
const CARD_WIDTH = (Dimensions.get('window').width - (CARD_MARGIN * (NUM_COLUMNS + 1))) / NUM_COLUMNS;

const COLORS = {
  primary: "#2a7fba",
  background: "#fff",
  text: "#333",
  secondaryText: "#666",
  rating: "#FFD700",
  danger: "#EF4444",
  searchBackground: "#f5f5f5",
  cardGradientStart: "#ffffff",
  cardGradientEnd: "#e6f0fa",
};

const STRINGS = {
  greeting: (name) =>
    name ? (name.length > 20 ? `${name.slice(0, 17)}...` : name) : "User",
  searchBase: "Search",
  searchPhrase: "appointments...",
  bookNow: "Book Now",
  loading: "Loading data...",
  error: "Failed to load data. Please try again.",
  appointmentLoading: "Loading appointments...",
  quickMenu: "Quick Menu",
  noAppointments: "No appointments match your search.",
};

const AD_IMAGES = [
  { id: "1", image: img1, title: "My Appointments", screen: "/book" },
  { id: "2", image: img2, title: "My Activities", screen: "/TaskCategory" },
  { id: "3", image: img3, title: "My Reports", screen: "/ReportMain" },
];

const QUICK_MENU_CARDS = [
  { id: "1", title: "Appointments", image: Cimg1, screen: "Appointments"},
  { id: "4", title: "Activities", image: Cimg4, screen: "Activities" },
  { id: "3", title: "Reports", image: Cimg3, screen: "Reports" },
];

const HomeScreen = () => {
  const [profile, setProfile] = useState({});
  const [searchText, setSearchText] = useState("");
  const [appointments, setAppointments] = useState({ upcoming: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState(STRINGS.searchBase);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const animationRef = useRef(null);
  const isTypingRef = useRef(true);
  const currentIndexRef = useRef(0);
  const sidebarAnim = useRef(new Animated.Value(-300)).current;
  const flatListRef = useRef(null);

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleCardPress = (screen) => {
    if (screen === "Appointments") {
      router.push("/book");
    } else if (screen === "Reports") {
      router.push("/ReportMain");
    } else if (screen === "Activities") {
      router.push("/TaskCategory");
    }
  };

  const handleAdPress = (screen) => {
    router.push(screen);
  };

  const handleAdScroll = useCallback((event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (Dimensions.get("window").width - 40));
    setCurrentAdIndex(index);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (flatListRef.current) {
        const nextIndex = (currentAdIndex + 1) % AD_IMAGES.length;
        flatListRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        setCurrentAdIndex(nextIndex);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [currentAdIndex]);

  // Filter upcoming appointments based on searchText
  const filteredAppointments = appointments.upcoming.filter((appointment) => {
    const searchLower = searchText.trim().toLowerCase();
    if (!searchLower) return true; // Show all if search is empty
    return (
      appointment.doctorName?.toLowerCase().includes(searchLower) ||
      appointment.specialty?.toLowerCase().includes(searchLower) ||
      appointment.date?.toLowerCase().includes(searchLower) ||
      appointment.time?.toLowerCase().includes(searchLower)
    );
  });

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
      {sidebarVisible && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleSidebar}
        />
      )}
      <View style={styles.contentContainer}>
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
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color="#777" />
            <TextInput
              placeholder={animatedPlaceholder}
              placeholderTextColor="#999"
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>
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
          {appointmentLoading ? (
            <View style={styles.sectionLoading}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.sectionLoadingText}>{STRINGS.appointmentLoading}</Text>
            </View>
          ) : appointments.upcoming?.length > 0 ? (
            <View>
              <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
              {filteredAppointments.length > 0 ? (
                <FlatList
                  horizontal
                  data={filteredAppointments}
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
              ) : (
                <View style={styles.noAppointmentsContainer}>
                  <MaterialCommunityIcons name="calendar-blank-outline" size={40} color="#999" />
                  <Text style={styles.noAppointmentsText}>{STRINGS.noAppointments}</Text>
                </View>
              )}
            </View>
          ) : null}
          <View style={styles.adCarouselContainer}>
            <FlatList
              ref={flatListRef}
              horizontal
              data={AD_IMAGES}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.adCard}
                  activeOpacity={0.7}
                  onPress={() => handleAdPress(item.screen)}
                >
                  <Image
                    source={item.image}
                    style={styles.adImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.adText}>{item.title}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              onScroll={handleAdScroll}
              scrollEventThrottle={16}
              contentContainerStyle={styles.adCarouselContent}
            />
            <View style={styles.dotContainer}>
              {AD_IMAGES.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentAdIndex === index ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
          </View>
          <View style={styles.quickMenuContainer}>
            <Text style={styles.sectionTitle}>{STRINGS.quickMenu}</Text>
          </View>
          <View style={styles.cardGrid}>
            {QUICK_MENU_CARDS.map((card) => (
              <TouchableOpacity 
                key={card.id}
                style={styles.dashboardCard}
                onPress={() => handleCardPress(card.screen)}
                activeOpacity={0.7}
              >
                <Image
                  source={card.image}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <Text style={styles.cardTitle}>{card.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 10,
    marginHorizontal: 20,
    color: COLORS.text,
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
  quickMenuContainer: {
    marginTop: 20,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    marginTop: 10,
    marginBottom: 30,
  },
  dashboardCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.cardGradientStart,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    marginHorizontal: CARD_MARGIN / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    paddingBottom: 15,
  },
  cardImage: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 0.7,
    borderRadius: 15,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 6,
    marginBottom: 8,
    textAlign: 'center',
  },
  adCarouselContainer: {
    marginVertical: 20,
    paddingHorizontal: 15,
  },
  adCarouselContent: {
    paddingRight: 20,
  },
  adCard: {
    width: Dimensions.get("window").width - 40,
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 10,
  },
  adImage: {
    width: '100%',
    height: '100%',
  },
  adText: {
    position: 'absolute',
    top: 10,
    left: 15,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
  },
  inactiveDot: {
    backgroundColor: '#ccc',
  },
  noAppointmentsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noAppointmentsText: {
    marginTop: 10,
    color: COLORS.secondaryText,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default HomeScreen;