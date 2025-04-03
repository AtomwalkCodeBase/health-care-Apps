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
      designation: 'Dermatologist',
      date: '2023-05-10',
      time: '11:00 AM',
      image: { uri: "https://randomuser.me/api/portraits/men/2.jpg" },
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

const parseDateTime = (dateString, timeString) => {
  const [year, month, day] = dateString.split('-');
  const [time, period] = timeString.split(' ');
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  const date = new Date();
  date.setFullYear(parseInt(year));
  date.setMonth(parseInt(month) - 1);
  date.setDate(parseInt(day));
  date.setHours(hours);
  date.setMinutes(parseInt(minutes));
  date.setSeconds(0);

  return date;
};

const AppointmentCard = ({ appointment, onComplete, onUpdate, onDelete, isCancelled, isPast, onAddToCalendar }) => {
  return (
    <View style={[
      styles.card,
      isCancelled && styles.cancelledCard,
      isPast && styles.pastCard
    ]}>
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          <Image source={appointment.image} style={styles.doctorImage} />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.doctorName}>{appointment.doctorName}</Text>
          {!isCancelled && !isPast && (
            <TouchableOpacity 
              style={styles.calendarButton}
              onPress={() => onAddToCalendar(appointment)}
            >
              <Text style={styles.calendarButtonText}>Add to Calendar</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.designation}>{appointment.designation}</Text>
          
          <View style={styles.timeContainer}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.muted} />
            <Text style={styles.dateTime}> {appointment.date}</Text>
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
            style={[styles.button, styles.completeButton]} 
            onPress={onComplete}
          >
            <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
            <Text style={styles.buttonText}> Complete</Text>
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
      const storedAppointments = await AsyncStorage.getItem('appointments');
      console.log('Raw stored appointments:', storedAppointments);
      
      if (storedAppointments) {
        const parsedAppointments = JSON.parse(storedAppointments);
        console.log('Parsed appointments:', parsedAppointments);
        
        if (!Array.isArray(parsedAppointments)) {
          console.error('Stored appointments is not an array, resetting to empty array');
          await AsyncStorage.setItem('appointments', JSON.stringify([]));
          return;
        }

        const formattedAppointments = parsedAppointments.map((apt, index) => {
          try {
            return {
              id: apt.appointmentId || `fallback-${Date.now()}-${index}`,
              doctorName: apt.doctorName || 'Unknown Doctor',
              designation: apt.specialty || 'Unknown Specialty',
              date: apt.date.includes('-') ? apt.date : formatDate(apt.date || 'Wed 1'),
              time: apt.time ? (apt.time.includes('-') ? apt.time.split(' - ')[0] : apt.time) : 'Unknown Time',
              image: { uri: apt.image || 'https://via.placeholder.com/100' },
              status: apt.status || 'Confirmed',
              cancellationDate: apt.cancellationDate || null
            };
          } catch (error) {
            console.error('Error formatting appointment:', apt, error);
            return null;
          }
        }).filter(apt => apt !== null);

        const updatedAppointments = {
          upcoming: formattedAppointments.filter(apt => apt.status === 'Confirmed'),
          past: appointments.past,
          cancelled: formattedAppointments.filter(apt => apt.status === 'Cancelled')
        };
        appointmentsState = updatedAppointments;
        setAppointments(updatedAppointments);
        console.log('Loaded appointments into state:', updatedAppointments);
        notifyListeners();
      } else {
        console.log('No stored appointments found, using initial state');
      }
    } catch (error) {
      console.error('Detailed error loading stored appointments:', error.message, error.stack);
    }
  };

  const saveAppointmentsToStorage = async (updatedAppointments) => {
    try {
      const allAppointments = [
        ...updatedAppointments.upcoming.map(apt => ({
          appointmentId: apt.id,
          doctorName: apt.doctorName,
          specialty: apt.designation,
          date: apt.date,
          time: apt.time,
          image: apt.image.uri,
          status: 'Confirmed'
        })),
        ...updatedAppointments.cancelled.map(apt => ({
          appointmentId: apt.id,
          doctorName: apt.doctorName,
          specialty: apt.designation,
          date: apt.date,
          time: apt.time,
          image: apt.image.uri,
          status: 'Cancelled',
          cancellationDate: apt.cancellationDate
        }))
      ];
      await AsyncStorage.setItem('appointments', JSON.stringify(allAppointments));
      console.log('Saved appointments to AsyncStorage:', allAppointments);
    } catch (error) {
      console.error('Error saving appointments to storage:', error);
    }
  };

  const formatDate = (dateStr) => {
    const [dayName, dayNum] = dateStr.split(' ');
    const currentYear = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const formattedDay = dayNum.padStart(2, '0');
    const formattedMonth = month.toString().padStart(2, '0');
    return `${currentYear}-${formattedMonth}-${formattedDay}`;
  };

  const addNewAppointment = (newAppointment) => {
    const formattedAppointment = {
      id: newAppointment.appointmentId || Date.now().toString(),
      doctorName: newAppointment.doctorName || 'Unknown Doctor',
      designation: newAppointment.specialty || 'Unknown Specialty',
      date: formatDate(newAppointment.date),
      time: newAppointment.time.split(' - ')[0],
      image: { uri: newAppointment.image || 'https://via.placeholder.com/100' },
      status: 'Confirmed'
    };
    const updatedAppointments = {
      ...appointments,
      upcoming: [...appointments.upcoming.filter(a => a.id !== formattedAppointment.id), formattedAppointment]
    };
    appointmentsState = updatedAppointments;
    setAppointments(updatedAppointments);
    saveAppointmentsToStorage(updatedAppointments);
    console.log('Added new appointment:', formattedAppointment);
    notifyListeners();
  };

  const moveToPast = (appointmentId) => {
    const appointmentToComplete = appointmentsState.upcoming.find(a => a.id === appointmentId);
    if (!appointmentToComplete) return;

    const updatedAppointments = {
      ...appointmentsState,
      upcoming: appointmentsState.upcoming.filter(a => a.id !== appointmentId),
      past: [...appointmentsState.past, {
        ...appointmentToComplete,
        completionDate: new Date().toISOString().split('T')[0]
      }]
    };
    appointmentsState = updatedAppointments;
    setAppointments(updatedAppointments);
    saveAppointmentsToStorage(updatedAppointments);
    notifyListeners();
  };

  const moveToCancelled = (appointmentId) => {
    const appointmentToCancel = appointmentsState.upcoming.find(a => a.id === appointmentId);
    if (!appointmentToCancel) return;

    const updatedAppointments = {
      ...appointmentsState,
      upcoming: appointmentsState.upcoming.filter(a => a.id !== appointmentId),
      cancelled: [...appointmentsState.cancelled, {
        ...appointmentToCancel,
        status: 'Cancelled',
        cancellationDate: new Date().toISOString().split('T')[0]
      }]
    };
    appointmentsState = updatedAppointments;
    setAppointments(updatedAppointments);
    saveAppointmentsToStorage(updatedAppointments);
    notifyListeners();
  };

  return { appointments, setAppointments, moveToPast, moveToCancelled, addNewAppointment, loadStoredAppointments };
};

export default function MyAppointments() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isModalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState('');
  const [cancelclick, setCancelclick] = useState(false);
  const [rescheduleClick, setRescheduleClick] = useState(false);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [calendarError, setCalendarError] = useState(null);
  const { appointments, moveToPast, moveToCancelled, addNewAppointment, loadStoredAppointments } = useAppointments();
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    loadStoredAppointments();
  }, []);

  useEffect(() => {
    if (params.newAppointment) {
      try {
        const newAppointment = JSON.parse(params.newAppointment);
        console.log('New appointment from params:', newAppointment);
        addNewAppointment(newAppointment);
        router.setParams({ newAppointment: null });
      } catch (error) {
        console.error("Error parsing newAppointment:", error);
      }
    }
  }, [params.newAppointment]);

  const movetocancel = () => {
    moveToCancelled(data);
    setModalVisible(false);
    setCancelclick(false);
    setActiveTab('cancelled');
  };

  const onpressyes = () => {
    if (rescheduleClick) {
      const appointment = appointments.upcoming.find(a => a.id === data);
      if (appointment) {
        console.log('Navigating to DateTimeForm for reschedule with params:', {
          appointmentId: appointment.id,
          doctorName: appointment.doctorName,
          designation: appointment.designation,
          image: appointment.image.uri,
          isReschedule: true,
        });
        router.push({
          pathname: "/DateTimeForm",
          params: {
            appointmentId: appointment.id,
            doctorName: appointment.doctorName,
            designation: appointment.designation,
            image: appointment.image.uri,
            isReschedule: true,
          },
        });
      } else {
        console.error('Appointment not found for reschedule:', data);
      }
      setModalVisible(false);
      setRescheduleClick(false);
    } else {
      moveToPast(data);
      setModalVisible(false);
      setActiveTab('past');
    }
  };

  const onpresno = () => {
    setModalVisible(false);
    setCancelclick(false);
    setRescheduleClick(false);
  };

  const handleComplete = (appointmentId) => {
    setModalVisible(true);
    setData(appointmentId);
    setCancelclick(false);
    setRescheduleClick(false);
  };

  const handleUpdate = (appointmentId) => {
    setModalVisible(true);
    setData(appointmentId);
    setCancelclick(false);
    setRescheduleClick(true);
  };

  const handleCancel = (appointmentId) => {
    setModalVisible(true);
    setCancelclick(true);
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
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

      const eventDetails = {
        title: `Appointment with ${appointment.doctorName}`,
        startDate,
        endDate,
        location: 'Clinic',
        notes: `Specialty: ${appointment.designation}`,
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
        <TabButton
          label="Upcoming"
          active={activeTab === 'upcoming'}
          onPress={() => setActiveTab('upcoming')}
        />
        <TabButton
          label="Past"
          active={activeTab === 'past'}
          onPress={() => setActiveTab('past')}
        />
        <TabButton
          label="Cancelled"
          active={activeTab === 'cancelled'}
          onPress={() => setActiveTab('cancelled')}
        />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {appointments[activeTab]?.length > 0 ? (
          appointments[activeTab].map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onComplete={() => handleComplete(appointment.id)}
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
        onpressyes={onpressyes}
        onpresno={onpresno}
        cancelclick={cancelclick}
        movetocancel={movetocancel}
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: 30
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  activeTabButton: {},
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '60%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  tabButtonText: {
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
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
    elevation: 2,
  },
  cancelledCard: {
    backgroundColor: COLORS.white,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
  },
  pastCard: {
    backgroundColor: COLORS.white,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  cardContent: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  imageContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doctorImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: 16,
    borderWidth: 2,
    borderColor: COLORS.light,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: COLORS.dark,
  },
  designation: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateTime: {
    fontSize: 16,
    color: COLORS.dark,
    marginLeft: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  cancelledBadge: {
    backgroundColor: '#FEEBEE',
  },
  completedBadge: {
    backgroundColor: '#E3F2FD',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 4,
    flexDirection: 'row',
  },
  completeButton: {
    backgroundColor: COLORS.success,
  },
  updateButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 4,
  },
  calendarButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
  },
  calendarButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIllustration: {
    backgroundColor: '#E3F2FD',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  noAppointmentsText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
  },
  emptySubtext: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: COLORS.muted,
    maxWidth: '70%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  successIcon: {
    marginBottom: 20,
  },
});