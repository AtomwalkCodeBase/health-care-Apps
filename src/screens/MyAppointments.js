import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import CustomModal from '../components/CustomModal';
import * as Calendar from 'expo-calendar';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const initialAppointmentsData = {
  upcoming: [],
  past: [
    {
      id: '3',
      doctorName: 'Dr. Robert Williams',
      specialty: 'Dermatologist',
      date: '2023-05-10',
      time: '11:00AM',
      image: "https://randomuser.me/api/portraits/men/2.jpg",
    }
  ],
  cancelled: []
};

let appointmentsState = { ...initialAppointmentsData };
const listeners = new Set();

export const getAppointments = () => appointmentsState;

export const subscribeToAppointments = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

const notifyListeners = () => {
  listeners.forEach(callback => callback(appointmentsState));
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  
  if (dateString.includes(',')) return dateString;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const [dayAbbr, dayNum] = dateString.split(' ');
  const dayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(dayAbbr);
  const date = new Date();
  date.setDate(parseInt(dayNum));
  date.setMonth(new Date().getMonth());
  date.setFullYear(new Date().getFullYear());

  const formattedDay = String(dayNum).padStart(2, '0');
  return `${days[dayIndex]}, ${formattedDay} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const parseDateTime = (dateString, timeString) => {
  console.log('Parsing dateString:', dateString, 'timeString:', timeString);
  
  let dayNum, monthIndex, year;
  
  if (dateString.includes(',')) {
    const [_, dayMonthYear] = dateString.split(', ');
    const [day, month, yr] = dayMonthYear.split(' ');
    dayNum = parseInt(day);
    monthIndex = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
                 'August', 'September', 'October', 'November', 'December'].indexOf(month);
    year = parseInt(yr);
  } else {
    const [dayAbbr, day] = dateString.split(' ');
    dayNum = parseInt(day);
    monthIndex = new Date().getMonth();
    year = new Date().getFullYear();
  }

  const [startTime] = timeString.split(' - ');
  const [time, period] = startTime.match(/(\d+:\d+)([AP]M)/i).slice(1);
  let [hours, minutes] = time.split(':').map(Number);
  if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
  if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;

  const date = new Date(year, monthIndex, dayNum, hours, minutes, 0);
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

export const useAppointments = () => {
  const [appointments, setAppointments] = useState(initialAppointmentsData);

  const loadStoredAppointments = async () => {
    try {
      const storedBookings = await AsyncStorage.getItem('bookings');
      if (storedBookings) {
        const parsedBookings = JSON.parse(storedBookings);
        
        // Remove duplicates based on doctorName, date, and time
        const uniqueBookings = [];
        const seen = new Set();
        for (const booking of parsedBookings) {
          const key = `${booking.doctorName}-${booking.date}-${booking.time}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueBookings.push(booking);
          }
        }
        
        const updatedAppointments = {
          upcoming: uniqueBookings.filter(b => b.status === 'upcoming'),
          past: appointments.past, // Static past data
          cancelled: uniqueBookings.filter(b => b.status === 'cancelled')
        };
        
        appointmentsState = updatedAppointments;
        setAppointments(updatedAppointments);
        notifyListeners();
        
        // Save cleaned-up data back to AsyncStorage
        await AsyncStorage.setItem('bookings', JSON.stringify(uniqueBookings));
      }
    } catch (error) {
      console.error('Error loading stored appointments:', error);
    }
  };

  const saveAppointmentsToStorage = async (updatedAppointments) => {
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
  };

  const moveToCancelled = (appointmentId) => {
    const appointmentToCancel = appointmentsState.upcoming.find(a => a.id === appointmentId);
    if (!appointmentToCancel) return;

    const updatedAppointments = {
      ...appointmentsState,
      upcoming: appointmentsState.upcoming.filter(a => a.id !== appointmentId),
      cancelled: [...appointmentsState.cancelled, { ...appointmentToCancel, status: 'cancelled', cancellationDate: new Date().toISOString() }]
    };
    appointmentsState = updatedAppointments;
    setAppointments(updatedAppointments);
    saveAppointmentsToStorage(updatedAppointments);
    notifyListeners();
  };

  return { appointments, setAppointments, moveToCancelled, loadStoredAppointments };
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
  const { appointments, moveToCancelled, loadStoredAppointments } = useAppointments();
  const router = useRouter();

  useEffect(() => {
    loadStoredAppointments();
    setActiveTab(tab);
  }, [tab]);

  const moveToCancel = () => {
    moveToCancelled(data);
    setModalVisible(false);
    setCancelClick(false);
    setActiveTab('cancelled');
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

  return (
    <View style={styles.container}>
      <Header title="My Appointments" />
      
      <View style={styles.tabContainer}>
        <TabButton label="Upcoming" active={activeTab === 'upcoming'} onPress={() => setActiveTab('upcoming')} />
        <TabButton label="Past" active={activeTab === 'past'} onPress={() => setActiveTab('past')} />
        <TabButton label="Cancelled" active={activeTab === 'cancelled'} onPress={() => setActiveTab('cancelled')} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {appointments[activeTab]?.length > 0 ? (
          appointments[activeTab].map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onUpdate={() => handleUpdate(appointment.id)}
              onDelete={() => handleCancel(appointment.id)}
              onAddToCalendar={handleAddToCalendar}
              isCancelled={activeTab === 'cancelled'}
              isPast={activeTab === 'past'}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIllustration}>
              <Ionicons name="calendar-outline" size={80} color={COLORS.primary} />
            </View>
            <Text style={styles.noAppointmentsText}>
              {activeTab === 'upcoming' && 'No upcoming appointments'}
              {activeTab === 'past' && 'No past appointments'}
              {activeTab === 'cancelled' && 'No cancelled appointments'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'upcoming' && 'Book an appointment to get started'}
            </Text>
          </View>
        )}
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
            <TouchableOpacity style={styles.modalButton} onPress={() => setCalendarModalVisible(false)}>
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
  tabContainer: { flexDirection: 'row', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#eee', paddingHorizontal: 16 },
  tabButton: { flex: 1, paddingVertical: 16, alignItems: 'center', position: 'relative' },
  activeTabButton: {},
  activeTabIndicator: { position: 'absolute', bottom: 0, height: 3, width: '60%', backgroundColor: COLORS.primary, borderRadius: 3 },
  tabButtonText: { fontSize: 14, color: COLORS.muted, fontWeight: '500' },
  activeTabButtonText: { color: COLORS.primary, fontWeight: '600' },
  scrollContainer: { flexGrow: 1, padding: 20 },
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cancelledCard: { backgroundColor: COLORS.white, borderLeftWidth: 4, borderLeftColor: COLORS.danger },
  pastCard: { backgroundColor: COLORS.white, borderLeftWidth: 4, borderLeftColor: COLORS.success },
  cardContent: { flexDirection: 'row', marginBottom: 12, alignItems: 'center' },
  imageContainer: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  doctorImage: { width: 90, height: 90, borderRadius: 45, marginRight: 16, borderWidth: 2, borderColor: COLORS.light },
  infoContainer: { flex: 1, justifyContent: 'center', position: 'relative' },
  doctorName: { fontSize: 18, fontWeight: '600', marginBottom: 4, color: COLORS.dark },
  specialty: { fontSize: 14, color: COLORS.muted, marginBottom: 8 },
  timeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dateTime: { fontSize: 16, color: COLORS.dark, marginLeft: 6 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  cancelledBadge: { backgroundColor: '#FEEBEE' },
  completedBadge: { backgroundColor: '#E3F2FD' },
  statusBadgeText: { fontSize: 12, fontWeight: '600' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  button: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flex: 1, marginHorizontal: 4, flexDirection: 'row' },
  calendarButtonStyle: { backgroundColor: COLORS.success },
  updateButton: { backgroundColor: COLORS.primary },
  deleteButton: { backgroundColor: COLORS.danger },
  buttonText: { color: COLORS.white, fontWeight: '500', fontSize: 14, marginLeft: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyIllustration: { backgroundColor: '#E3F2FD', width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  noAppointmentsText: { textAlign: 'center', marginTop: 8, fontSize: 18, fontWeight: '600', color: COLORS.dark },
  emptySubtext: { textAlign: 'center', marginTop: 8, fontSize: 14, color: COLORS.muted, maxWidth: '70%' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { backgroundColor: COLORS.white, borderRadius: 12, padding: 20, width: '80%', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '600', color: COLORS.dark, marginBottom: 10 },
  modalText: { fontSize: 16, color: COLORS.muted, textAlign: 'center', marginBottom: 20 },
  modalButton: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  modalButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '500' },
  successIcon: { marginBottom: 20 },
});