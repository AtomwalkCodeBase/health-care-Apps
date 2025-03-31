import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import CustomModal from '../components/CustomModal';

// Initial appointment data structure
const initialAppointmentsData = {
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
        <Image source={appointment.image} style={styles.doctorImage} />
        <View style={styles.infoContainer}>
          <Text style={styles.doctorName}>{appointment.doctorName}</Text>
          <Text style={styles.designation}>{appointment.designation}</Text>
          <Text style={styles.dateTime}>
            {appointment.date} at {appointment.time}
          </Text>
          {isCancelled && (
            <Text style={styles.cancelledText}>CANCELLED</Text>
          )}
          {isPast && !isCancelled && (
            <Text style={styles.completedText}>COMPLETED</Text>
          )}
        </View>
      </View>
      {!isCancelled && !isPast && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.completeButton]} onPress={onComplete}>
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.updateButton]} onPress={onUpdate}>
            <Text style={styles.buttonText}>Reschedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={onDelete}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// TabButton component
const TabButton = ({ active, label, onPress }) => (
  <TouchableOpacity
    style={[styles.tabButton, active && styles.activeTabButton]}
    onPress={onPress}
  >
    <Text style={[styles.tabButtonText, active && styles.activeTabButtonText]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// Custom hook to manage appointments state
export const useAppointments = () => {
  const [appointments, setAppointments] = useState(appointmentsState);

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

// Main MyAppointments component
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
      
      {/* Tabs */}
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
            <Ionicons name="calendar-outline" size={60} color="#ccc" />
            <Text style={styles.noAppointmentsText}>
              {activeTab === 'upcoming' && 'No upcoming appointments'}
              {activeTab === 'past' && 'No past appointments'}
              {activeTab === 'cancelled' && 'No cancelled appointments'}
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

// Styles (unchanged)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#2a7fba',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabButtonText: {
    color: '#2a7fba',
    fontWeight: 'bold',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelledCard: {
    backgroundColor: '#fafafa',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  pastCard: {
    backgroundColor: '#fafafa',
    borderLeftWidth: 4,
    borderLeftColor: '#2a7fba',
  },
  cardContent: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  designation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dateTime: {
    fontSize: 14,
    color: '#444',
  },
  cancelledText: {
    color: '#F44336',
    fontWeight: 'bold',
    marginTop: 4,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  completedText: {
    color: '#2a7fba',
    fontWeight: 'bold',
    marginTop: 4,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  updateButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noAppointmentsText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});