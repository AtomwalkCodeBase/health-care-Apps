import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Modal } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "../../src/components/Header";
import { StatusBar } from "expo-status-bar";
import * as Calendar from 'expo-calendar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doctorBookingView } from "../../src/services/productServices";

const BookingConfirmation = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDateForAPI = (dateString) => {
    if (!dateString) return "";
    const [dayAbbr, dayNum] = dateString.split(" ");
    const selectedDate = new Date();
    selectedDate.setDate(parseInt(dayNum));

    const today = new Date();
    selectedDate.setFullYear(today.getFullYear());
    if (selectedDate < today && today.getDate() > parseInt(dayNum)) {
      selectedDate.setMonth(today.getMonth() + 1);
    } else {
      selectedDate.setMonth(today.getMonth());
    }

    const formattedDay = String(selectedDate.getDate()).padStart(2, "0");
    const formattedMonth = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const year = selectedDate.getFullYear();
    return `${formattedDay}-${formattedMonth}-${year}`; // e.g., "08-04-2025"
  };

  const formatTimeForAPI = (timeStr) => {
    const cleanTime = timeStr.trim();
    const [time, period] = cleanTime.match(/(\d+:\d+)([AP]M)/i)?.slice(1) || [];
    if (!time || !period) return cleanTime;
    return `${time} ${period.toLowerCase()}`; // e.g., "10:30 am"
  };

  const calculateDuration = (startTime, endTime) => {
    const parseTime = (timeStr) => {
      const cleanTime = timeStr.trim();
      const [time, period] = cleanTime.match(/(\d+:\d+)([AP]M)/i)?.slice(1) || [];
      if (!time || !period) return null;
      let [hours, minutes] = time.split(':').map(Number);
      if (period.toUpperCase() === "PM" && hours !== 12) hours += 12;
      if (period.toUpperCase() === "AM" && hours === 12) hours = 0;
      return { hours, minutes };
    };

    const start = parseTime(startTime);
    const end = parseTime(endTime);
    if (!start || !end) return 1.0;

    const startTotalMinutes = start.hours * 60 + start.minutes;
    let endTotalMinutes = end.hours * 60 + end.minutes;
    if (endTotalMinutes < startTotalMinutes) endTotalMinutes += 24 * 60;
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    return durationMinutes / 60;
  };

  const formatDate = (dateString) => {
    if (!dateString || !params.fullDate) return "";
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const [dayAbbr] = dateString.split(" ");
    const dayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(dayAbbr);
    
    const [year, month, day] = params.fullDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    const formattedDay = String(date.getDate()).padStart(2, '0');
    return `${days[dayIndex]}, ${formattedDay} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const parseDateTime = (formattedDate, timeString) => {
    const [, dayMonthYear] = formattedDate.split(', ');
    const [dayNum, monthName, year] = dayMonthYear.split(' ');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthIndex = months.indexOf(monthName);
    const [startTime] = timeString.split(" - ");
    const [time, period] = startTime.match(/(\d+:\d+)([AP]M)/i)?.slice(1) || [];
    if (!time || !period) return null;
    let [hours, minutes] = time.split(':').map(Number);
    if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
    const date = new Date(year, monthIndex, parseInt(dayNum), hours, minutes, 0);
    return date;
  };

  const addEventToCalendar = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access calendar was denied');
        return;
      }
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const writableCalendar = calendars.find(cal => cal.allowsModifications) || calendars[0];
      if (!writableCalendar) {
        alert('No writable calendar found on this device');
        return;
      }
      const startDate = parseDateTime(formatDate(params.date), params.time);
      if (!startDate) {
        alert('Invalid date or time format');
        return;
      }
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      const eventDetails = {
        title: `Appointment with ${params.doctorName}`,
        startDate,
        endDate,
        location: 'Clinic',
        notes: `Specialty: ${params.specialty}`,
        calendarId: writableCalendar.id,
      };
      await Calendar.createEventAsync(writableCalendar.id, eventDetails);
      alert('Event added to calendar successfully!');
      setShowCalendarModal(false);
      router.push("/home");
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Failed to add event to calendar: ' + error.message);
    }
  };

  const handleConfirmBooking = () => {
    if (isSubmitting) return;
    setShowConfirmModal(true);
  };

  const handleConfirmYes = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmModal(false);
  
    try {
      const [startTime, endTime] = params.time.split(" - ");
      const bookingDate = formatDateForAPI(params.date);
      const formattedStartTime = formatTimeForAPI(params.startTime); // Use the 24-hour version passed from DateTimeForm
      const formattedEndTime = formatTimeForAPI(params.endTime);     // Use the 24-hour version passed from DateTimeForm
      const duration = calculateDuration(startTime, endTime);
  
      if (!params.doctorId) throw new Error("Doctor ID is missing.");
  
      const customerId = await AsyncStorage.getItem("Customer_id");
      if (!customerId) throw new Error("Customer ID not found in AsyncStorage.");
  
      const response = await doctorBookingView(
        parseInt(customerId),
        parseInt(params.doctorId),
        bookingDate,
        formattedStartTime, // Already in 24-hour format
        formattedEndTime,   // Already in 24-hour format
        duration
      );
  
      console.log("API Response:", JSON.stringify(response, null, 2));
  
      if (response && (response.status === 200 || response.data?.success)) {
        setShowSuccessModal(true);
      } else {
        alert('Booking failed. The slot may already be taken or an error occurred.');
      }
    } catch (error) {
      console.error('Error confirming booking:', error.response?.data || error.message);
      alert(`An error occurred: ${error.message || 'Server error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmNo = () => {
    setShowConfirmModal(false);
    router.back();
  };

  const handleSuccessOk = () => {
    setShowSuccessModal(false);
    setShowCalendarModal(true); // Prompt for calendar after success
  };

  const handleCalendarCancel = () => {
    setShowCalendarModal(false);
    router.push("/home");
  };

  const handleViewMyBook = () => {
    setShowSuccessModal(false);
    router.push({
      pathname: "/book",
      params: { tab: 'upcoming' }
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2a7fba" barStyle="light-content" />
      <Header
        title="Confirm Booking"
        showBackButton
        onBackPress={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <View style={styles.doctorInfoContainer}>
            <Image source={{ uri: params.image }} style={styles.doctorImage} />
            <View style={styles.doctorTextContainer}>
              <Text style={styles.doctorName}>{params.doctorName}</Text>
              <Text style={styles.specialization}>{params.specialty}</Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#FFA000" />
                <Text style={styles.ratingText}>4.9 (500 reviews)</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Icon name="calendar-today" size={20} color="#2a7fba" />
            </View>
            <View>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailText}>{formatDate(params.date)}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Icon name="access-time" size={20} color="#2a7fba" />
            </View>
            <View>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailText}>{params.time}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#2a7fba' }]}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Consultation Fee:</Text>
            <Text style={styles.paymentValue}>500</Text>
          </View>
          <View style={styles.divider} />
          <View style={[styles.paymentRow, { marginTop: 12 }]}>
            <Text style={[styles.paymentLabel, styles.totalLabel]}>Total Amount:</Text>
            <Text style={[styles.paymentValue, styles.totalValue]}>500</Text>
          </View>
        </View>
        <View style={styles.policyContainer}>
          <Icon name="info" size={18} color="#666" style={styles.infoIcon} />
          <Text style={styles.policyText}>
            By confirming, you agree to our booking policy. Cancellations must be made at least 2 hours before the scheduled time.
          </Text>
        </View>
      </ScrollView>
      <TouchableOpacity
        style={[styles.confirmButton, isSubmitting && { backgroundColor: '#cccccc' }]}
        onPress={handleConfirmBooking}
        disabled={isSubmitting}
      >
        <Text style={styles.confirmButtonText}>Confirm Booking</Text>
        <Icon name="check-circle" size={20} color="white" style={styles.buttonIcon} />
      </TouchableOpacity>
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleConfirmNo}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Booking?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to book this appointment?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.yesButton} onPress={handleConfirmYes} disabled={isSubmitting}>
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.noButton} onPress={handleConfirmNo}>
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleSuccessOk}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Icon name="check-circle" size={50} color="#4CAF50" style={styles.successIcon} />
            <Text style={styles.modalTitle}>Appointment Booked</Text>
            <View style={styles.modalTxt}>
              <Text style={styles.detailText}>Doctor: {params.doctorName}</Text>
              <Text style={styles.detailText}>Specialty: {params.specialty}</Text>
              <Text style={styles.detailText}>Date: {formatDate(params.date)}</Text>
              <Text style={styles.detailText}>Time: {params.time}</Text>
            </View>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.okButton, { flex: 1, backgroundColor: "#2a7fba", marginRight: 10 }]}
                onPress={handleViewMyBook}
              >
                <Text style={styles.buttonText}>My Bookings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.okButton, { flex: 1 }]} onPress={handleSuccessOk}>
                <Text style={styles.buttonTextOk}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showCalendarModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCalendarCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add to Calendar?</Text>
            <Text style={styles.modalText}>
              Would you like to add this appointment to your calendar?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.yesButton} onPress={addEventToCalendar}>
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.noButton} onPress={handleCalendarCancel}>
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", marginTop: 30 },
  scrollContainer: { padding: 20, paddingBottom: 100 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  doctorInfoContainer: { flexDirection: "row", alignItems: "center" },
  doctorImage: { width: 80, height: 80, borderRadius: 40, marginRight: 16, borderWidth: 2, borderColor: "#2a7fba" },
  doctorTextContainer: { flex: 1 },
  doctorName: { fontSize: 18, fontWeight: "bold", color: "#2c3e50", marginBottom: 4 },
  specialization: { fontSize: 14, color: "#666", marginBottom: 6 },
  ratingContainer: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  ratingText: { fontSize: 13, color: "#666", marginLeft: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#2a7fba", marginBottom: 16 },
  detailRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 16 },
  iconContainer: {
    backgroundColor: "#E3F2FD",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailLabel: { fontSize: 13, color: "#888", marginBottom: 2 },
  detailText: { fontSize: 15, fontWeight: "500", color: "#2c3e50" },
  paymentRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  paymentLabel: { fontSize: 14, color: "#666" },
  paymentValue: { fontSize: 14, color: "#2c3e50", fontWeight: "500" },
  totalLabel: { fontWeight: "600" },
  totalValue: { color: "#2a7fba", fontWeight: "bold", fontSize: 16 },
  divider: { height: 1, backgroundColor: "#e0e0e0", marginVertical: 8 },
  policyContainer: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  infoIcon: { marginRight: 8, marginTop: 2 },
  policyText: { fontSize: 12, color: "#666", lineHeight: 18, flex: 1 },
  confirmButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#2a7fba",
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmButtonText: { color: "white", fontSize: 18, fontWeight: "bold", marginRight: 8 },
  buttonIcon: { marginLeft: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { backgroundColor: "#ffffff", borderRadius: 16, padding: 20, width: "80%", maxWidth: 400, alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#2c3e50", marginBottom: 10 },
  modalTxt: { textAlign: "left" },
  modalText: { fontSize: 16, color: "#666", textAlign: "left", marginBottom: 20 },
  modalButtonContainer: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  yesButton: { backgroundColor: "#2a7fba", padding: 10, borderRadius: 8, flex: 1, marginRight: 10, alignItems: "center" },
  noButton: { backgroundColor: "#F44336", padding: 10, borderRadius: 8, flex: 1, alignItems: "center" },
  okButton: { backgroundColor: "#2a7fba", paddingVertical: 7, borderRadius: 8, width: "80%", alignItems: "center", marginTop: 20 },
  buttonTextOk: { color: "white", fontSize: 16, fontWeight: "bold", padding: 12 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold", marginTop: 10 },
  successIcon: { marginBottom: 20 },
});

export default BookingConfirmation;