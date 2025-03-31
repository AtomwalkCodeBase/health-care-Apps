import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import CustomModal from '../components/CustomModal';

// Updated color scheme (kept as is)
const COLORS = {
  primary: '#2196F3',       // Vibrant blue
  secondary: '#3A0CA3',     // Deep purple
  success: '#4CAF50',       // Teal
  danger: '#F44336',        // Pink
  warning: '#F8961E',       // Orange
  light: '#F8F9FA',         // Very light gray
  dark: '#212529',          // Dark gray
  muted: '#6C757D',         // Medium gray
  white: '#FFFFFF',         // White
  background: '#F5F7FF',    // Very light blue background
};

// Initial appointment data structure (kept as is)
export const initialAppointmentsData = {
  upcoming: [
    {
      id: '1',
      doctorName: 'Dr. Sarah Johnson',
      designation: 'Cardiologist',
      date: '2023-06-15',
      time: '10:30 AM',
      image: { uri: "https://randomuser.me/api/portraits/women/1.jpg" },
    },
    {
      id: '2',
      doctorName: 'Dr. Michael Chen',
      designation: 'Neurologist',
      date: '2023-06-18',
      time: '2:15 PM',
      image: { uri: "https://randomuser.me/api/portraits/men/1.jpg" },
    },
  ],
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

// Appointment state management
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

// AppointmentCard component
const AppointmentCard = ({ appointment, onComplete, onUpdate, onDelete, isCancelled, isPast }) => {
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

// Modern TabButton component (kept as is)
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

// Custom hook to manage appointments state (kept as is)
export const useAppointments = () => {
  const [appointments, setAppointments] = useState(initialAppointmentsData);

  const moveToPast = (appointmentId) => {
    const appointmentToComplete = appointmentsState.upcoming.find(a => a.id === appointmentId);
    if (!appointmentToComplete) return;

    appointmentsState = {
      ...appointmentsState,
      upcoming: appointmentsState.upcoming.filter(a => a.id !== appointmentId),
      past: [...appointmentsState.past, {
        ...appointmentToComplete,
        completionDate: new Date().toISOString().split('T')[0]
      }]
    };
    setAppointments(appointmentsState);
    notifyListeners();
  };

  const moveToCancelled = (appointmentId) => {
    const appointmentToCancel = appointmentsState.upcoming.find(a => a.id === appointmentId);
    if (!appointmentToCancel) return;

    appointmentsState = {
      ...appointmentsState,
      upcoming: appointmentsState.upcoming.filter(a => a.id !== appointmentId),
      cancelled: [...appointmentsState.cancelled, {
        ...appointmentToCancel,
        cancellationDate: new Date().toISOString().split('T')[0]
      }]
    };
    setAppointments(appointmentsState);
    notifyListeners();
  };

  return { appointments, setAppointments, moveToPast, moveToCancelled };
};

// Main MyAppointments component (kept as is)
export default function MyAppointments() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isModalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState('');
  const [cancelclick, setCancelclick] = useState(false);
  const { appointments, moveToPast, moveToCancelled } = useAppointments();

  const movetocancel = () => {
    moveToCancelled(data);
    setModalVisible(false);
    setActiveTab('cancelled');
  };

  const onpressyes = () => {
    moveToPast(data);
    setModalVisible(false);
    setActiveTab('past');
  };

  const onpresno = () => {
    setModalVisible(false);
  };

  const handleComplete = (appointmentId) => {
    setModalVisible(true);
    setData(appointmentId);
  };

  const handleUpdate = (appointmentId) => {
    router.push(`/appointments/${appointmentId}/update`);
  };

  const handleCancel = (appointmentId) => {
    setModalVisible(true);
    setCancelclick(true);
    setData(appointmentId);
  };

  return (
    <View style={styles.container}>
      <Header title="My Appointments" />
      
      {/* Modern Tabs */}
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

      {/* Content */}
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
      />
    </View>
  );
}

// Modern Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  activeTabButton: {
    // Active state handled by indicator
  },
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
    alignItems: 'center', // Align items vertically for better balance with larger image
  },
  imageContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doctorImage: {
    width: 90, // Increased from 70 to 90 for a more prominent look
    height: 90, // Increased from 70 to 90
    borderRadius: 15, // Slightly increased border radius for a softer look
    marginRight: 16,
    borderWidth: 2,
    borderColor: COLORS.light,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
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
    marginBottom: 6, // Slightly increased spacing between date and time
  },
  dateTime: {
    fontSize: 16, // Increased from 14 to 16 for better readability
    color: COLORS.dark,
    marginLeft: 6, // Added a small margin for better spacing with the icon
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
  cancelledBadgeText: {
    color: COLORS.danger,
  },
  completedBadgeText: {
    color: COLORS.primary,
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
});