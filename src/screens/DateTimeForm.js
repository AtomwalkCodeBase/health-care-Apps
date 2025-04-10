import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Modal } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "../components/Header";
import { StatusBar } from "expo-status-bar";
import { Calendar } from 'react-native-calendars';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doctorBookingView } from "../services/productServices";

const DateTimeForm = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const doctor = {
    id: params.id,
    duration: params.duration,
    name: params.name || "Unknown Doctor",
    specialty: params.specialty || "Unknown Specialty",
    image: params.image || "https://via.placeholder.com/100",
    startTime: params.startTime,
    endTime: params.endTime,
    minUsagePeriod: parseFloat(params.minUsagePeriod) || 1.0,
    maxUsagePeriod: parseFloat(params.maxUsagePeriod) || 2.0,
    unitOfUsage: params.unitOfUsage || "HOUR",
    numSlots: parseInt(params.numSlots) || 1,
    maxSlotTime: params.maxSlotTime || "14:48",
  };
  console.log(doctor, "doctordetails");

  const generateWeekDates = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = days[date.getDay()];
      const dayNum = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return {
        display: `${dayName} ${dayNum} ${month}`,
        fullDate: `${year}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`
      };
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
  const [selectedDate, setSelectedDate] = useState(generateWeekDates()[0].display);
  const [selectedFullDate, setSelectedFullDate] = useState(generateWeekDates()[0].fullDate);
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
    const selectedDate = new Date(day.dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return;
    }

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayName = days[selectedDate.getDay()];
    const dayNum = selectedDate.getDate();
    const month = months[selectedDate.getMonth()];
    const year = selectedDate.getFullYear();
    const formattedDate = `${dayName} ${dayNum} ${month}`;
    const fullDate = `${year}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;

    const newWeekDates = Array.from({ length: 7 }).map((_, i) => {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + (i - selectedDate.getDay()));
      const newDayName = days[newDate.getDay()];
      const newDayNum = newDate.getDate();
      const newMonth = months[newDate.getMonth()];
      const newYear = newDate.getFullYear();
      return {
        display: `${newDayName} ${newDayNum} ${newMonth}`,
        fullDate: `${newYear}-${(newDate.getMonth() + 1).toString().padStart(2, '0')}-${newDayNum.toString().padStart(2, '0')}`
      };
    });

    setDates(newWeekDates);
    setSelectedDate(formattedDate);
    setSelectedFullDate(fullDate);
    setShowCalendar(false);
  };

  const handleDateSelection = (dateObj) => {
    const selectedDate = new Date(dateObj.fullDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return;
    }
    setSelectedDate(dateObj.display);
    setSelectedFullDate(dateObj.fullDate);
  };

  const handleSubmit = () => {
    if (!selectedTime || isSubmitting) return;
    setIsSubmitting(true);

    const slot = timeSlots.find(s => s.start === selectedTime);
    const bookingData = {
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      image: doctor.image,
      date: selectedDate,
      fullDate: selectedFullDate,
      time: `${slot.start} - ${slot.end}`,
    };

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
            {dates.map((dateObj, index) => {
              const [dayName, dayNum, month] = dateObj.display.split(" ");
              const isPast = new Date(dateObj.fullDate) < new Date().setHours(0, 0, 0, 0);
              return (
                <TouchableOpacity
                  key={`${dateObj.fullDate}-${index}`}
                  style={[
                    styles.dateButton,
                    selectedDate === dateObj.display && styles.selectedDate,
                    isPast && styles.disabledDate
                  ]}
                  onPress={() => handleDateSelection(dateObj)}
                  disabled={isPast}
                >
                  <Text style={[
                    styles.dayText,
                    selectedDate === dateObj.display && styles.selectedDateText,
                    isPast && styles.disabledText
                  ]}>
                    {dayName}
                  </Text>
                  <Text style={[
                    styles.dateNumText,
                    selectedDate === dateObj.display && styles.selectedDateText,
                    isPast && styles.disabledText
                  ]}>
                    {dayNum}
                  </Text>
                  <Text style={[
                    styles.monthText,
                    selectedDate === dateObj.display && styles.selectedDateText,
                    isPast && styles.disabledText
                  ]}>
                    {month}
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
              minDate={new Date().toISOString().split('T')[0]}
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
    width: 65,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fafafa",
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: { fontSize: 12, color: "#666", fontWeight: "500" },
  dateNumText: { fontSize: 16, color: "#666", fontWeight: "500", marginTop: 1 },
  monthText: { fontSize: 10, color: "#666", fontWeight: "500", marginTop: 1 },
  selectedDate: { backgroundColor: "#2a7fba", borderColor: "#2a7fba" },
  selectedDateText: { color: "white", fontWeight: "600" },
  disabledDate: {
    backgroundColor: '#f0f0f0',
    borderColor: '#e0e0e0',
  },
  disabledText: {
    color: '#999999',
  },
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
  selectedTimeText: { color: "#ffffff" },
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