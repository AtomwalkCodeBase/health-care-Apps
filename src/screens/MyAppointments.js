import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import * as Calendar from 'expo-calendar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getbookedlistview } from "../services/productServices";

const COLORS = {
  primary: '#2196F3',
  secondary: '#3A0CA3',
  success: '#4CAF50',
  danger: '#F44336',
  warning: '#F8961E',
  light: '#F8F9FA',
  dark: '#212529',
  muted: '#6C757D',
  white: '#FFFFFF',
  background: '#F5F7FF',
};

let appointmentsState = {
  upcoming: [],
  past: [],
  cancelled: [],
};

const listeners = new Set();

export const getAppointments = () => appointmentsState;

export const subscribeToAppointments = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

const notifyListeners = () => {
  listeners.forEach(callback => callback(appointmentsState));
};

const normalizeTime = (startTime, endTime) => {
  if (!startTime || !endTime) return `${startTime || ''}-${endTime || ''}`;
  
  const formatTime = (time) => {
    if (time.includes('AM') || time.includes('PM')) return time;
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 && hours < 24 ? 'PM' : 'AM';
    const normalizedHours = hours % 12 || 12;
    return `${normalizedHours}:${minutes.toString().padStart(2, '0')}${period}`;
  };
  
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "Invalid Date";

  // Handle "dd-mm-yyyy" format
  if (dateString.includes('-')) {
    const [day, month, year] = dateString.split('-').map(Number);
    if (!day || !month || !year) return dateString;
    
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return dateString;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    return `${days[date.getDay()]}, ${day.toString().padStart(2, '0')} ${months[date.getMonth()]} ${year}`;
  }

  return dateString;
};

const parseFullDate = (dateStr) => {
  if (!dateStr) return null;
  
  try {
    // Handle "dd-mm-yyyy" format
    if (dateStr.includes('-')) {
      const [day, month, year] = dateStr.split('-').map(Number);
      if (day && month && year) {
        return new Date(year, month - 1, day);
      }
    }
    
    // Handle "Day, dd Month yyyy" format
    if (dateStr.includes(',')) {
      const [, rest] = dateStr.split(', ');
      const [day, monthName, year] = rest.split(' ');
      const months = ["January", "February", "March", "April", "May", "June", 
                     "July", "August", "September", "October", "November", "December"];
      const monthIndex = months.indexOf(monthName);
      if (monthIndex !== -1 && day && year) {
        return new Date(year, monthIndex, parseInt(day));
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    return null;
  }
};

const parseDateTime = (dateString, timeString) => {
  if (!dateString || !timeString) return null;

  const date = parseFullDate(dateString);
  if (!date) return null;

  const [startTime] = timeString.split('-');
  const match = startTime.match(/(\d+:\d+)([AP]M)?/i);
  if (!match) return null;

  const [time, period] = match.slice(1);
  let [hours, minutes] = time.split(':').map(Number);
  if (period) {
    if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
  }

  date.setHours(hours, minutes, 0, 0);
  return date;
};

const AppointmentCard = ({ appointment, onUpdate, onDelete, isCancelled, isPast, onAddToCalendar }) => {
  return (
    <View style={[
      styles.card,
      isCancelled && styles.cancelledCard,
      isPast && styles.pastCard
    ]}>
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: appointment.image }} style={styles.doctorImage} />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.doctorName}>{appointment.doctorName}</Text>
          <Text style={styles.specialty}>{appointment.specialty}</Text>
          <View style={styles.timeContainer}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.muted} />
            <Text style={styles.dateTime}> {formatDate(appointment.date)}</Text>
          </View>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={16} color={COLORS.muted} />
            <Text style={styles.dateTime}> {appointment.time}</Text>
          </View>
          {isCancelled && (
            <View style={[styles.statusBadge, styles.cancelledBadge]}>
              <Text style={styles.statusBadgeText}>Cancelled</Text>
            </View>
          )}
          {isPast && !isCancelled && (
            <View style={[styles.statusBadge, styles.completedBadge]}>
              <Text style={styles.statusBadgeText}>Completed</Text>
            </View>
          )}
        </View>
      </View>
      {!isCancelled && !isPast && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.calendarButtonStyle]} 
            onPress={() => onAddToCalendar(appointment)}
          >
            <Ionicons name="add-circle" size={18} color={COLORS.white} />
            <Text style={styles.buttonText}> Calendar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.updateButton]} 
            onPress={onUpdate}
          >
            <Ionicons name="calendar" size={18} color={COLORS.white} />
            <Text style={styles.buttonText}> Reschedule</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.deleteButton]} 
            onPress={onDelete}
          >
            <Ionicons name="close-circle" size={18} color={COLORS.white} />
            <Text style={styles.buttonText}> Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const TabButton = ({ active, label, onPress }) => (
  <TouchableOpacity
    style={[styles.tabButton, active && styles.activeTabButton]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.tabButtonText, active && styles.activeTabButtonText]}>
      {label}
    </Text>
    {active && <View style={styles.activeTabIndicator} />}
  </TouchableOpacity>
);

export const fetchBookedAppointments = async () => {
  try {
    const customerId = await AsyncStorage.getItem("Customer_id");
    if (!customerId) {
      throw new Error("Customer ID not found. Please log in.");
    }
    
    const response = await getbookedlistview(parseInt(customerId));
    console.log("API Response:", JSON.stringify(response, null, 2));

    // Handle different response structures
    const apiData = response.data || response;
    
    if (!apiData) {
      throw new Error("No data received from API");
    }

    // Convert array-like response to array if needed
    const bookingsArray = Array.isArray(apiData) ? apiData : [apiData];

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const appointments = {
      upcoming: [],
      past: [],
      cancelled: []
    };

    bookingsArray.forEach(booking => {
      if (!booking) return;
      
      const bookingDate = parseFullDate(booking.booking_date);
      const status = booking.status_display || 'upcoming';
      
      const appointment = {
        id: booking.id?.toString() || `${Date.now()}-${Math.random()}`,
        doctorName: booking.equipment_data?.name || 'Unknown Equipment',
        specialty: booking.equipment_data?.equipment_type || 'Unknown Type',
        date: booking.booking_date || new Date().toISOString(),
        time: normalizeTime(booking.start_time, booking.end_time),
        image: booking.equipment_data?.image || "https://via.placeholder.com/100",
        status: status.toLowerCase()
      };

      if (status.toLowerCase() === 'cancelled') {
        appointments.cancelled.push(appointment);
      } else if (bookingDate && bookingDate < currentDate) {
        appointments.past.push(appointment);
      } else {
        appointments.upcoming.push(appointment);
      }
    });

    appointmentsState = appointments;
    notifyListeners();
    
    // Save to AsyncStorage for offline access
    await AsyncStorage.setItem('bookings', JSON.stringify([
      ...appointments.upcoming,
      ...appointments.past,
      ...appointments.cancelled
    ]));
    
    return appointments;
  } catch (error) {
    console.error('Error fetching booked appointments:', error);
    return { upcoming: [], past: [], cancelled: [] };
  }
};

export const useAppointments = () => {
  const [appointments, setAppointments] = useState(appointmentsState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedAppointments = await fetchBookedAppointments();
      setAppointments(fetchedAppointments);
    } catch (err) {
      setError(err.message);
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
    
    const unsubscribe = subscribeToAppointments((updatedAppointments) => {
      setAppointments(updatedAppointments);
    });
    
    return () => unsubscribe();
  }, [loadAppointments]);

  const saveAppointmentsToStorage = useCallback(async (updatedAppointments) => {
    try {
      const allBookings = [
        ...updatedAppointments.upcoming.map(apt => ({ ...apt, status: 'upcoming' })),
        ...updatedAppointments.cancelled.map(apt => ({ ...apt, status: 'cancelled' })),
        ...updatedAppointments.past.map(apt => ({ ...apt, status: 'past' }))
      ];
      await AsyncStorage.setItem('bookings', JSON.stringify(allBookings));
    } catch (error) {
      console.error('Error saving appointments to storage:', error);
    }
  }, []);

  const moveToCancelled = useCallback((appointmentId) => {
    const appointmentToCancel = appointmentsState.upcoming.find(a => a.id === appointmentId);
    if (!appointmentToCancel) return;

    const updatedAppointments = {
      ...appointmentsState,
      upcoming: appointmentsState.upcoming.filter(a => a.id !== appointmentId),
      cancelled: [...appointmentsState.cancelled, { ...appointmentToCancel, status: 'cancelled' }]
    };
    
    appointmentsState = updatedAppointments;
    setAppointments(updatedAppointments);
    saveAppointmentsToStorage(updatedAppointments);
    notifyListeners();
  }, [saveAppointmentsToStorage]);

  return { 
    appointments, 
    loading, 
    error, 
    refresh: loadAppointments,
    moveToCancelled 
  };
};

const CustomModal = ({ 
  isModalVisible, 
  onpressyes, 
  onpresno, 
  cancelclick, 
  movetocancel,
  rescheduleClick 
}) => {
  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onpresno}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Ionicons 
            name="warning-outline" 
            size={50} 
            color={COLORS.warning} 
            style={styles.successIcon} 
          />
          <Text style={styles.modalTitle}>
            {cancelclick ? 'Cancel Appointment' : 'Reschedule Appointment'}
          </Text>
          <Text style={styles.modalText}>
            {cancelclick 
              ? 'Are you sure you want to cancel this appointment?'
              : 'Do you want to reschedule this appointment?'}
          </Text>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: COLORS.primary }]} 
              onPress={cancelclick ? movetocancel : onpressyes}
            >
              <Text style={styles.modalButtonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: COLORS.danger }]} 
              onPress={onpresno}
            >
              <Text style={styles.modalButtonText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function MyAppointments() {
  const { tab = 'upcoming' } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState(tab);
  const [isModalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState('');
  const [cancelClick, setCancelClick] = useState(false);
  const [rescheduleClick, setRescheduleClick] = useState(false);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [calendarError, setCalendarError] = useState(null);
  const { appointments, loading, error, refresh, moveToCancelled } = useAppointments();
  const router = useRouter();
  const scrollViewRef = useRef(null);

  const SCREEN_WIDTH = Dimensions.get('window').width;

  useEffect(() => {
    setActiveTab(tab);
    scrollToTab(tab);
  }, [tab]);

  const scrollToTab = (tabName) => {
    const index = ['upcoming', 'past', 'cancelled'].indexOf(tabName);
    if (scrollViewRef.current && index !== -1) {
      scrollViewRef.current.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    }
  };

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    const newTab = ['upcoming', 'past', 'cancelled'][index];
    if (newTab && newTab !== activeTab) {
      setActiveTab(newTab);
    }
  };

  const moveToCancel = () => {
    moveToCancelled(data);
    setModalVisible(false);
    setCancelClick(false);
    setActiveTab('cancelled');
    scrollToTab('cancelled');
  };

  const onPressYes = () => {
    if (rescheduleClick) {
      const appointment = appointments.upcoming.find(a => a.id === data);
      if (appointment) {
        router.push({
          pathname: "/DateTime",
          params: {
            appointmentId: appointment.id,
            name: appointment.doctorName,
            specialty: appointment.specialty,
            image: appointment.image,
            isReschedule: true,
          },
        });
      }
      setModalVisible(false);
      setRescheduleClick(false);
    }
  };

  const onPressNo = () => {
    setModalVisible(false);
    setCancelClick(false);
    setRescheduleClick(false);
  };

  const handleUpdate = (appointmentId) => {
    setModalVisible(true);
    setData(appointmentId);
    setCancelClick(false);
    setRescheduleClick(true);
  };

  const handleCancel = (appointmentId) => {
    setModalVisible(true);
    setCancelClick(true);
    setRescheduleClick(false);
    setData(appointmentId);
  };

  const handleAddToCalendar = async (appointment) => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        setCalendarError('Permission to access calendar was denied');
        setCalendarModalVisible(true);
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const writableCalendar = calendars.find(cal => cal.allowsModifications) || calendars[0];
      
      if (!writableCalendar) {
        setCalendarError('No writable calendar found on this device');
        setCalendarModalVisible(true);
        return;
      }

      const startDate = parseDateTime(appointment.date, appointment.time);
      if (!startDate) {
        setCalendarError('Invalid date or time format');
        setCalendarModalVisible(true);
        return;
      }

      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

      const eventDetails = {
        title: `Appointment with ${appointment.doctorName}`,
        startDate,
        endDate,
        location: 'Clinic',
        notes: `Specialty: ${appointment.specialty}`,
        calendarId: writableCalendar.id,
      };

      await Calendar.createEventAsync(writableCalendar.id, eventDetails);
      setCalendarModalVisible(true);
      setCalendarError(null);
    } catch (error) {
      console.error('Error adding event:', error);
      setCalendarError(`Failed to add event to calendar: ${error.message}`);
      setCalendarModalVisible(true);
    }
  };

  const renderTabContent = (tabName) => (
    <ScrollView
      style={[styles.tabContent, { width: SCREEN_WIDTH }]}
      contentContainerStyle={styles.tabContentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refresh}
          colors={[COLORS.primary]}
        />
      }
    >
      {loading && appointments[tabName].length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading appointments...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={40} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : appointments[tabName]?.length > 0 ? (
        appointments[tabName].map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onUpdate={() => handleUpdate(appointment.id)}
            onDelete={() => handleCancel(appointment.id)}
            onAddToCalendar={handleAddToCalendar}
            isCancelled={tabName === 'cancelled'}
            isPast={tabName === 'past'}
          />
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIllustration}>
            <Ionicons name="calendar-outline" size={80} color={COLORS.primary} />
          </View>
          <Text style={styles.noAppointmentsText}>
            {tabName === 'upcoming' && 'No upcoming appointments'}
            {tabName === 'past' && 'No past appointments'}
            {tabName === 'cancelled' && 'No cancelled appointments'}
          </Text>
          {tabName === 'upcoming' && (
            <Text style={styles.emptySubtext}>
              Book an appointment to get started
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Header title="My Appointments" />
      
      <View style={styles.tabContainer}>
        <TabButton 
          label="Upcoming" 
          active={activeTab === 'upcoming'} 
          onPress={() => {
            setActiveTab('upcoming');
            scrollToTab('upcoming');
          }} 
        />
        <TabButton 
          label="Past" 
          active={activeTab === 'past'} 
          onPress={() => {
            setActiveTab('past');
            scrollToTab('past');
          }} 
        />
        <TabButton 
          label="Cancelled" 
          active={activeTab === 'cancelled'} 
          onPress={() => {
            setActiveTab('cancelled');
            scrollToTab('cancelled');
          }} 
        />
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {renderTabContent('upcoming')}
        {renderTabContent('past')}
        {renderTabContent('cancelled')}
      </ScrollView>
      
      <CustomModal
        isModalVisible={isModalVisible}
        onpressyes={onPressYes}
        onpresno={onPressNo}
        cancelclick={cancelClick}
        movetocancel={moveToCancel}
        rescheduleClick={rescheduleClick}
      />

      <Modal
        visible={calendarModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCalendarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {calendarError ? (
              <>
                <Ionicons name="warning" size={50} color={COLORS.danger} style={styles.successIcon} />
                <Text style={styles.modalTitle}>Error</Text>
                <Text style={styles.modalText}>{calendarError}</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={50} color={COLORS.success} style={styles.successIcon} />
                <Text style={styles.modalTitle}>Success</Text>
                <Text style={styles.modalText}>Appointment has been successfully added to your calendar!</Text>
              </>
            )}
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => setCalendarModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, marginTop: 30 },
  tabContainer: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.white, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee', 
    paddingHorizontal: 16 
  },
  tabButton: { 
    flex: 1, 
    paddingVertical: 16, 
    alignItems: 'center', 
    position: 'relative' 
  },
  activeTabButton: {},
  activeTabIndicator: { 
    position: 'absolute', 
    bottom: 0, 
    height: 3, 
    width: '60%', 
    backgroundColor: COLORS.primary, 
    borderRadius: 3 
  },
  tabButtonText: { 
    fontSize: 14, 
    color: COLORS.muted, 
    fontWeight: '500' 
  },
  activeTabButtonText: { 
    color: COLORS.primary, 
    fontWeight: '600' 
  },
  tabContent: { 
    flex: 1,
  },
  tabContentContainer: {
    padding: 20,
    flexGrow: 1,
  },
  card: { 
    backgroundColor: COLORS.white, 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 8, 
    elevation: 2 
  },
  cancelledCard: { 
    backgroundColor: COLORS.white, 
    borderLeftWidth: 4, 
    borderLeftColor: COLORS.danger 
  },
  pastCard: { 
    backgroundColor: COLORS.white, 
    borderLeftWidth: 4, 
    borderLeftColor: COLORS.success 
  },
  cardContent: { 
    flexDirection: 'row', 
    marginBottom: 12, 
    alignItems: 'center' 
  },
  imageContainer: { 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4 
  },
  doctorImage: { 
    width: 90, 
    height: 90, 
    borderRadius: 45, 
    marginRight: 16, 
    borderWidth: 2, 
    borderColor: COLORS.light 
  },
  infoContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    position: 'relative' 
  },
  doctorName: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 4, 
    color: COLORS.dark 
  },
  specialty: { 
    fontSize: 14, 
    color: COLORS.muted, 
    marginBottom: 8 
  },
  timeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 6 
  },
  dateTime: { 
    fontSize: 16, 
    color: COLORS.dark, 
    marginLeft: 6 
  },
  statusBadge: { 
    alignSelf: 'flex-start', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12, 
    marginTop: 8 
  },
  cancelledBadge: { 
    backgroundColor: '#FEEBEE' 
  },
  completedBadge: { 
    backgroundColor: '#E3F2FD' 
  },
  statusBadgeText: { 
    fontSize: 12, 
    fontWeight: '600' 
  },
  buttonContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 12 
  },
  button: { 
    paddingVertical: 10, 
    paddingHorizontal: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center', 
    flex: 1, 
    marginHorizontal: 4, 
    flexDirection: 'row' 
  },
  calendarButtonStyle: { 
    backgroundColor: COLORS.success 
  },
  updateButton: { 
    backgroundColor: COLORS.primary 
  },
  deleteButton: { 
    backgroundColor: COLORS.danger 
  },
  buttonText: { 
    color: COLORS.white, 
    fontWeight: '500', 
    fontSize: 14, 
    marginLeft: 4 
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 60 
  },
  emptyIllustration: { 
    backgroundColor: '#E3F2FD', 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  noAppointmentsText: { 
    textAlign: 'center', 
    marginTop: 8, 
    fontSize: 18, 
    fontWeight: '600', 
    color: COLORS.dark 
  },
  emptySubtext: { 
    textAlign: 'center', 
    marginTop: 8, 
    fontSize: 14, 
    color: COLORS.muted, 
    maxWidth: '70%' 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContainer: { 
    backgroundColor: COLORS.white, 
    borderRadius: 12, 
    padding: 20, 
    width: '80%', 
    alignItems: 'center' 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: '600', 
    color: COLORS.dark, 
    marginBottom: 10 
  },
  modalText: { 
    fontSize: 16, 
    color: COLORS.muted, 
    textAlign: 'center', 
    marginBottom: 20 
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20
  },
  modalButton: { 
    backgroundColor: COLORS.primary, 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center'
  },
  modalButtonText: { 
    color: COLORS.white, 
    fontSize: 16, 
    fontWeight: '500' 
  },
  successIcon: { 
    marginBottom: 20 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    fontSize: 16, 
    color: COLORS.muted,
    marginTop: 10
  },
  errorContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  errorText: { 
    fontSize: 16, 
    color: COLORS.danger, 
    textAlign: 'center', 
    marginBottom: 20,
    marginTop: 10
  },
  retryButton: { 
    backgroundColor: COLORS.primary, 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 8 
  },
  retryButtonText: { 
    color: COLORS.white, 
    fontSize: 16, 
    fontWeight: '500' 
  },
});