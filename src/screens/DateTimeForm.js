import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Modal } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "../components/Header";
import { StatusBar } from "expo-status-bar";
import { Calendar } from 'react-native-calendars';
import AsyncStorage from "@react-native-async-storage/async-storage";

const DateTimeForm = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const doctor = {
    name: params.name || "Unknown Doctor",
    specialty: params.specialty || "Unknown Specialty",
    image: params.image || "https://via.placeholder.com/100",
    startTime: params.startTime || "10:30",
    minUsagePeriod: parseFloat(params.minUsagePeriod) || 1.0,
    maxUsagePeriod: parseFloat(params.maxUsagePeriod) || 2.0,
    unitOfUsage: params.unitOfUsage || "HOUR",
    numSlots: parseInt(params.numSlots) || 1,
    maxSlotTime: params.maxSlotTime || "14:48",
  };

  const generateWeekDates = (startDate) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const baseDate = startDate ? new Date(startDate) : new Date();
    const currentDate = baseDate.getDate();
    const currentDay = baseDate.getDay();

    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(baseDate);
      date.setDate(currentDate + (i - currentDay));
      const dayName = days[date.getDay()];
      const dayNum = date.getDate();
      return `${dayName} ${dayNum}`;
    });
  };

  const generateTimeSlots = (startTime, minUsagePeriod, numSlots, maxSlotTime) => {
    const slots = [];
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [maxHours, maxMinutes] = maxSlotTime.split(':').map(Number);
    
    let currentTime = new Date();
    currentTime.setHours(startHours, startMinutes, 0);
    const maxTime = new Date();
    maxTime.setHours(maxHours, maxMinutes, 0);
  
    const isMaxTimeInvalid = currentTime > maxTime;
    console.log(`Generating slots: startTime=${startTime}, maxSlotTime=${maxSlotTime}, numSlots=${numSlots}, minUsagePeriod=${minUsagePeriod}, isMaxTimeInvalid=${isMaxTimeInvalid}`);
  
    for (let i = 0; i < numSlots; i++) {
      const slotStart = new Date(currentTime);
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotStart.getMinutes() + (minUsagePeriod * 60));
  
      if (!isMaxTimeInvalid && slotStart >= maxTime) {
        console.log(`Stopped at slot ${i}: slotStart=${slotStart.toLocaleTimeString()} >= maxTime=${maxTime.toLocaleTimeString()}`);
        break;
      }
  
      const formatTime = (date) => {
        const hrs = date.getHours();
        const mins = date.getMinutes().toString().padStart(2, '0');
        const period = hrs >= 12 ? 'PM' : 'AM';
        const displayHrs = (hrs % 12) || 12;
        return `${displayHrs}:${mins}${period}`;
      };
  
      slots.push({
        start: formatTime(slotStart),
        end: formatTime(slotEnd),
        status: "Available"
      });
  
      currentTime = slotEnd;
    }
    console.log(`Generated slots:`, slots);
    return slots;
  };

  const [dates, setDates] = useState(generateWeekDates());
  const [selectedDate, setSelectedDate] = useState(generateWeekDates()[0]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadBookings = async () => {
      const baseSlots = generateTimeSlots(
        doctor.startTime,
        doctor.minUsagePeriod,
        doctor.numSlots,
        doctor.maxSlotTime
      );
      try {
        const storedBookings = await AsyncStorage.getItem('bookings');
        const bookings = storedBookings ? JSON.parse(storedBookings) : [];
        
        const updatedSlots = baseSlots.map(slot => {
          const isBooked = bookings.some(booking => 
            booking.doctorName === doctor.name &&
            booking.date === selectedDate &&
            booking.time === `${slot.start} - ${slot.end}`
          );
          return {
            ...slot,
            status: isBooked ? "Booked" : "Available"
          };
        });
        setTimeSlots(updatedSlots);
      } catch (error) {
        console.error("Error loading bookings:", error);
        setTimeSlots(baseSlots);
      }
    };
    loadBookings();
  }, [doctor.name, doctor.startTime, doctor.minUsagePeriod, doctor.numSlots, doctor.maxSlotTime, selectedDate]);

  const handleTimeSelection = (slot) => {
    if (slot.status === "Booked") return;
    setSelectedTime(selectedTime === slot.start ? null : slot.start);
  };

  const handleCalendarSelect = (day) => {
    const date = new Date(day.dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[date.getDay()];
    const dayNum = date.getDate();
    const formattedDate = `${dayName} ${dayNum}`;

    const newWeekDates = Array.from({ length: 7 }).map((_, i) => {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() + (i - date.getDay()));
      const newDayName = days[newDate.getDay()];
      const newDayNum = newDate.getDate();
      return `${newDayName} ${newDayNum}`;
    });

    setDates(newWeekDates);
    setSelectedDate(formattedDate);
    setShowCalendar(false);
  };

  const handleSubmit = () => {
    if (!selectedTime || isSubmitting) return;
    setIsSubmitting(true);

    const slot = timeSlots.find(s => s.start === selectedTime);
    const bookingData = {
      doctorName: doctor.name,
      specialty: doctor.specialty,
      image: doctor.image,
      date: selectedDate,
      time: `${slot.start} - ${slot.end}`,
    };

    // Navigate to BookingConfirmation without saving yet
    router.push({
      pathname: "/BookingConfirmation",
      params: bookingData,
    });
    setIsSubmitting(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2a7fba" barStyle="light-content" />
      <Header title="Book an Appointment" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <Image source={{ uri: doctor.image }} style={styles.doctorImage} />
            <View style={styles.statusIndicator} />
          </View>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.specialization}>{doctor.specialty}</Text>
        </View>

        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeader}>Select Date</Text>
          <TouchableOpacity
            style={styles.calendarButton}
            onPress={() => setShowCalendar(true)}
          >
            <Icon name="calendar-today" size={20} color="#2a7fba" />
          </TouchableOpacity>
        </View>

        <View style={styles.dateCard}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datesContainer}
          >
            {dates.map((date, index) => {
              const [dayName, dayNum] = date.split(" ");
              return (
                <TouchableOpacity
                  key={`${date}-${index}`}
                  style={[
                    styles.dateButton,
                    selectedDate === date && styles.selectedDate
                  ]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text style={[
                    styles.dayText,
                    selectedDate === date && styles.selectedDateText
                  ]}>
                    {dayName}
                  </Text>
                  <Text style={[
                    styles.dateNumText,
                    selectedDate === date && styles.selectedDateText
                  ]}>
                    {dayNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.timeCard}>
          <Text style={styles.sectionTitle}>Available Time Slots</Text>
          <View style={styles.timeGrid}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.start}
                style={[
                  styles.timeSlot,
                  selectedTime === slot.start && slot.status === "Available" && styles.selectedTimeSlot,
                  slot.status === "Booked" && styles.bookedTimeSlot,
                ]}
                onPress={() => handleTimeSelection(slot)}
                disabled={slot.status === "Booked"}
              >
                <Text
                  style={[
                    styles.timeRangeText,
                    selectedTime === slot.start && slot.status === "Available" && styles.selectedTimeText,
                    slot.status === "Booked" && styles.bookedTimeText,
                  ]}
                >
                  {`${slot.start} - ${slot.end}`}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    slot.status === "Available" ? styles.availableBadge : styles.bookedBadge
                  ]}
                >
                  <Text style={styles.statusText}>
                    {slot.status}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.bookButton,
          (!selectedTime || isSubmitting) && { backgroundColor: '#cccccc' },
        ]}
        disabled={!selectedTime || isSubmitting}
        onPress={handleSubmit}
      >
        <View style={styles.buttonContent}>
          <Text style={styles.bookButtonText}>Select Appointment</Text>
          <Icon name="check-circle" size={20} color="white" />
        </View>
      </TouchableOpacity>

      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarContainer}>
            <Calendar
              onDayPress={handleCalendarSelect}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#2a7fba',
                selectedDayBackgroundColor: '#2a7fba',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#2a7fba',
                dayTextColor: '#2c3e50',
                textDisabledColor: '#d9d9d9',
                arrowColor: '#2a7fba',
                monthTextColor: '#2c3e50',
                indicatorColor: '#2a7fba',
              }}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCalendar(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", marginTop: 30 },
  scrollContainer: { padding: 16, paddingBottom: 100 },
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    elevation: 3,
  },
  profileImageContainer: { position: "relative", marginBottom: 16 },
  doctorImage: { width: 100, height: 100, borderRadius: 50 },
  statusIndicator: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "white",
  },
  doctorName: { fontSize: 22, fontWeight: "bold", color: "#2c3e50", marginBottom: 4 },
  specialization: { fontSize: 16, color: "#666", marginBottom: 8 },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginLeft: 8,
    marginRight: 8,
  },
  sectionHeader: { fontSize: 18, fontWeight: "600", color: "#2c3e50" },
  calendarButton: { backgroundColor: '#f0f0f0', padding: 8, borderRadius: 20 },
  dateCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  datesContainer: { paddingHorizontal: 4 },
  dateButton: {
    width: 60,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fafafa",
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: { fontSize: 14, color: "#666", fontWeight: "500" },
  dateNumText: { fontSize: 18, color: "#666", fontWeight: "500", marginTop: 4 },
  selectedDate: { backgroundColor: "#2a7fba", borderColor: "#2a7fba" },
  selectedDateText: { color: "white", fontWeight: "600" },
  timeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#2c3e50", marginBottom: 12 },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  timeSlot: {
    width: '48%',
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafafa",
  },
  selectedTimeSlot: { backgroundColor: "#2a7fba", borderColor: "#2a7fba" },
  bookedTimeSlot: { backgroundColor: "#EAEAEA", borderColor: "#e0e0e0" },
  timeRangeText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 4,
  },
  selectedTimeText: { color: "white" },
  bookedTimeText: { color: "#999" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 4 },
  availableBadge: { backgroundColor: "#E8F5E9" },
  bookedBadge: { backgroundColor: "#DBDBDB" },
  statusText: { fontSize: 12, fontWeight: "500", color: "#2c3e50" },
  bookButton: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#2a7fba",
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  buttonContent: { flexDirection: "row", alignItems: "center" },
  bookButtonText: { color: "white", fontSize: 18, fontWeight: "bold", marginRight: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  calendarContainer: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, width: '90%', maxWidth: 400 },
  closeButton: { marginTop: 16, padding: 12, backgroundColor: '#2a7fba', borderRadius: 8, alignItems: 'center' },
  closeButtonText: { color: 'white', fontWeight: 'bold' },
});

export default DateTimeForm;