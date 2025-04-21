import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Modal,
  ActivityIndicator
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "../components/Header";
import { StatusBar } from "expo-status-bar";
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getbookedlistview } from "../services/productServices";
import moment from 'moment-timezone';

const DateTimeForm = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const TIMEZONE = 'Asia/Kolkata';

  const doctor = {
    id: params.id,
    duration: params.duration,
    name: params.name || "Unknown Doctor",
    specialty: params.specialty || "Unknown Specialty",
    image: params.image || "https://via.placeholder.com/100",
    startTime: params.startTime || "09:00",
    endTime: params.endTime || "17:00",
    minUsagePeriod: parseFloat(params.minUsagePeriod) || 1.0,
    maxUsagePeriod: parseFloat(params.maxUsagePeriod) || 2.0,
    unitOfUsage: params.unitOfUsage || "HOUR",
    numSlots: parseInt(params.numSlots) || 8,
    maxSlotTime: params.maxSlotTime || "17:00",
  };

  const generateWeekDates = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = moment().tz(TIMEZONE).startOf('day');
    
    return Array.from({ length: 7 }).map((_, i) => {
      const date = today.clone().add(i, 'days');
      const dayName = days[date.day()];
      const dayNum = date.date();
      const month = months[date.month()];
      return {
        display: `${dayName} ${dayNum} ${month}`,
        fullDate: date.format('YYYY-MM-DD'),
        dateObj: date.toDate()
      };
    });
  };

  const normalizeTime = (timeStr) => {
    if (!timeStr) return "";
    if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
    
    return moment.tz(timeStr, 'HH:mm', TIMEZONE).format('h:mmA');
  };

  const generateTimeSlots = (startTime, minUsagePeriod, numSlots, maxSlotTime) => {
    const slots = [];
    const start = moment.tz(startTime, 'HH:mm', TIMEZONE);
    const maxTime = moment.tz(maxSlotTime, 'HH:mm', TIMEZONE);
    
    let currentTime = start.clone();

    for (let i = 0; i < numSlots; i++) {
      const slotStart = currentTime.clone();
      const slotEnd = slotStart.clone().add(minUsagePeriod, 'hours');

      if (slotStart.isSameOrAfter(maxTime)) break;

      slots.push({
        start: slotStart.format('h:mmA'),
        end: slotEnd.format('h:mmA'),
        start24: slotStart.format('HH:mm'),
        end24: slotEnd.format('HH:mm'),
        status: "Available"
      });

      currentTime = slotEnd;
    }
    return slots;
  };

  const [dates, setDates] = useState(generateWeekDates());
  const [selectedDate, setSelectedDate] = useState(dates[0].display);
  const [selectedFullDate, setSelectedFullDate] = useState(dates[0].fullDate);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBookings = async () => {
      setLoadingSlots(true);
      setError(null);
      const baseSlots = generateTimeSlots(
        doctor.startTime,
        doctor.minUsagePeriod,
        doctor.numSlots,
        doctor.maxSlotTime
      );
      
      try {
        const customerId = await AsyncStorage.getItem("Customer_id");
        if (!customerId) throw new Error("Customer ID not found");
        
        const response = await getbookedlistview(parseInt(customerId));
        
        const formattedSelectedDate = moment(selectedFullDate).format('DD-MM-YYYY');
        
        const bookedSlots = response?.data
          ?.filter(booking => 
            booking.equipment_data?.id === parseInt(doctor.id) &&
            booking.booking_date === formattedSelectedDate
          )
          ?.map(booking => ({
            start: normalizeTime(booking.start_time),
            end: normalizeTime(booking.end_time),
            start24: booking.start_time,
            end24: booking.end_time
          })) || [];

        const updatedSlots = baseSlots.map(slot => {
          const isBooked = bookedSlots.some(booking => 
            booking.start24 === slot.start24 && booking.end24 === slot.end24
          );
          return {
            ...slot,
            status: isBooked ? "Booked" : "Available"
          };
        });
        
        setTimeSlots(updatedSlots);
      } catch (err) {
        console.error("Error fetching booked slots:", err);
        setError("Failed to load time slots. Please try again.");
        setTimeSlots(baseSlots);
      } finally {
        setLoadingSlots(false);
      }
    };
    
    loadBookings();
  }, [doctor.id, selectedFullDate]);

  const handleTimeSelection = (slot) => {
    if (slot.status === "Booked") return;
    setSelectedTime(selectedTime === slot.start ? null : slot.start);
  };

  const handleCalendarSelect = (day) => {
    const selectedDate = moment.tz(day.dateString, 'YYYY-MM-DD', TIMEZONE);
    const today = moment().tz(TIMEZONE).startOf('day');
    
    if (selectedDate.isBefore(today)) return;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const newDates = Array.from({ length: 7 }).map((_, i) => {
      const date = selectedDate.clone().add(i, 'days');
      return {
        display: `${days[date.day()]} ${date.date()} ${months[date.month()]}`,
        fullDate: date.format('YYYY-MM-DD')
      };
    });

    setDates(newDates);
    setSelectedDate(newDates[0].display);
    setSelectedFullDate(newDates[0].fullDate);
    setShowCalendar(false);
    setSelectedTime(null);
  };

  const handleDateSelection = (dateObj) => {
    const selectedDate = moment.tz(dateObj.fullDate, 'YYYY-MM-DD', TIMEZONE);
    const today = moment().tz(TIMEZONE).startOf('day');
    
    if (selectedDate.isBefore(today)) return;
    setSelectedDate(dateObj.display);
    setSelectedFullDate(dateObj.fullDate);
    setSelectedTime(null);
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
      startTime: slot.start24,
      endTime: slot.end24,
      duration: doctor.minUsagePeriod,
      timezone: TIMEZONE
    };

    router.push({
      pathname: "/BookingConfirmation",
      params: bookingData,
    });
    setIsSubmitting(false);
  };

  const renderDateButtons = () => {
    return dates.map((dateObj, index) => {
      const [dayName, dayNum, month] = dateObj.display.split(" ");
      const isPast = moment.tz(dateObj.fullDate, 'YYYY-MM-DD', TIMEZONE).isBefore(moment().tz(TIMEZONE).startOf('day'));
      
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
    });
  };

  const renderTimeSlots = () => {
    if (loadingSlots) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2a7fba" />
          <Text style={styles.loadingText}>Loading time slots...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={40} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => setSelectedFullDate(selectedFullDate)} // Triggers useEffect
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.timeGrid}>
        {timeSlots.map((slot, index) => (
          <TouchableOpacity
            key={`${slot.start}-${index}`}
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
    );
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
            {renderDateButtons()}
          </ScrollView>
        </View>

        <View style={styles.timeCard}>
          <Text style={styles.sectionTitle}>Available Time Slots</Text>
          {renderTimeSlots()}
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
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <View style={styles.buttonContent}>
            <Text style={styles.bookButtonText}>Select Appointment</Text>
            <Icon name="check-circle" size={20} color="white" />
          </View>
        )}
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
              markedDates={{
                [selectedFullDate]: {selected: true, selectedColor: '#2a7fba'}
              }}
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
  disabledDate: { backgroundColor: '#f0f0f0', borderColor: '#e0e0e0' },
  disabledText: { color: '#999999' },
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
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  calendarContainer: { 
    backgroundColor: '#ffffff', 
    borderRadius: 16, 
    padding: 20, 
    width: '90%', 
    maxWidth: 400 
  },
  closeButton: { 
    marginTop: 16, 
    padding: 12, 
    backgroundColor: '#2a7fba', 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  closeButtonText: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: 10,
    color: '#666'
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorText: {
    marginTop: 10,
    color: '#F44336',
    textAlign: 'center'
  },
  retryButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#2a7fba',
    borderRadius: 5
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});

export default DateTimeForm;