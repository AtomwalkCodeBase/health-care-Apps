import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Modal,
  ActivityIndicator,
  Alert
} from "react-native";
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
  const isReschedule = params.isReschedule === 'true';

  // Debug: Log received params
  useEffect(() => {
    console.log("Received params:", params);
  }, []);

  const formatDateForAPI = (dateString) => {
    if (!dateString) return "";
    try {
      const [dayAbbr, dayNum, monthAbbr] = dateString.split(" ");
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndex = months.indexOf(monthAbbr);
      
      const today = new Date();
      const year = today.getFullYear();
      const selectedDate = new Date(year, monthIndex, parseInt(dayNum));
      
      // If date is in past, move to next year
      if (selectedDate < today && today.getMonth() === monthIndex) {
        selectedDate.setFullYear(year + 1);
      }
      
      const formattedDay = String(selectedDate.getDate()).padStart(2, "0");
      const formattedMonth = String(selectedDate.getMonth() + 1).padStart(2, "0");
      return `${formattedDay}-${formattedMonth}-${selectedDate.getFullYear()}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const formatTimeForAPI = (timeStr) => {
    if (!timeStr) return "";
    try {
      // Handle both "9:00AM" and "09:00" formats
      if (timeStr.includes('AM') || timeStr.includes('PM')) {
        const [time, period] = timeStr.match(/(\d+:\d+)([AP]M)/i)?.slice(1) || [];
        return time ? `${time} ${period.toLowerCase()}` : timeStr;
      }
      return timeStr; // Assume it's already in correct format
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeStr;
    }
  };

  const calculateDuration = (startTime, endTime) => {
    try {
      const parseTime = (timeStr) => {
        const cleanTime = timeStr.trim();
        if (cleanTime.includes('AM') || cleanTime.includes('PM')) {
          const [time, period] = cleanTime.match(/(\d+:\d+)([AP]M)/i)?.slice(1) || [];
          if (!time || !period) return null;
          let [hours, minutes] = time.split(':').map(Number);
          if (period.toUpperCase() === "PM" && hours !== 12) hours += 12;
          if (period.toUpperCase() === "AM" && hours === 12) hours = 0;
          return { hours, minutes };
        } else {
          // Handle 24-hour format
          const [hours, minutes] = cleanTime.split(':').map(Number);
          return { hours, minutes };
        }
      };

      const start = parseTime(startTime);
      const end = parseTime(endTime);
      if (!start || !end) return parseFloat(params.duration) || 1.0;

      const startTotalMinutes = start.hours * 60 + start.minutes;
      let endTotalMinutes = end.hours * 60 + end.minutes;
      if (endTotalMinutes < startTotalMinutes) endTotalMinutes += 24 * 60;
      return (endTotalMinutes - startTotalMinutes) / 60;
    } catch (error) {
      console.error("Error calculating duration:", error);
      return 1.0;
    }
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    try {
      const [dayAbbr, dayNum, monthAbbr] = dateString.split(" ");
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      
      const dayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(dayAbbr);
      const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(monthAbbr);
      
      const today = new Date();
      const year = today.getFullYear();
      const date = new Date(year, monthIndex, parseInt(dayNum));
      
      // If date is in past, move to next year
      if (date < today && today.getMonth() === monthIndex) {
        date.setFullYear(year + 1);
      }
      
      return `${days[dayIndex]}, ${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch (error) {
      console.error("Error formatting display date:", error);
      return dateString || "Invalid date";
    }
  };

  const addEventToCalendar = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Calendar access was denied');
        return;
      }
      
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const writableCalendar = calendars.find(cal => cal.allowsModifications) || calendars[0];
      
      if (!writableCalendar) {
        Alert.alert('Error', 'No writable calendar found');
        return;
      }
      
      const startDate = new Date(params.fullDate);
      const [startTime] = params.time.split(" - ");
      const [time, period] = startTime.match(/(\d+:\d+)([AP]M)/i)?.slice(1) || [];
      
      if (!time || !period) {
        Alert.alert('Error', 'Invalid time format');
        return;
      }
      
      let [hours, minutes] = time.split(':').map(Number);
      if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
      if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
      
      startDate.setHours(hours, minutes, 0, 0);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      
      await Calendar.createEventAsync(writableCalendar.id, {
        title: `Appointment with ${params.doctorName}`,
        startDate,
        endDate,
        location: params.location || 'Clinic',
        notes: `Specialty: ${params.specialty}`,
      });
      
      Alert.alert('Success', 'Event added to calendar!');
      setShowCalendarModal(false);
      router.push("/home");
    } catch (error) {
      console.error('Calendar error:', error);
      Alert.alert('Error', 'Failed to add event to calendar');
    }
  };

  const handleConfirmBooking = () => {
    console.log("Confirm booking pressed");
    if (isSubmitting) {
      console.log("Already submitting, ignoring");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmYes = async () => {
    console.log("Confirming booking...");
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      const [startTime, endTime] = params.time.split(" - ");
      const bookingDate = formatDateForAPI(params.date);
      const formattedStartTime = params.startTime || formatTimeForAPI(startTime);
      const formattedEndTime = params.endTime || formatTimeForAPI(endTime);
      const duration = calculateDuration(startTime, endTime);

      console.log("Booking details:", {
        doctorId: params.doctorId,
        bookingDate,
        formattedStartTime,
        formattedEndTime,
        duration,
        isReschedule
      });

      if (!params.doctorId) throw new Error("Doctor ID is missing");
      if (isReschedule && !params.booking_id) throw new Error("Booking ID required for reschedule");

      const customerId = await AsyncStorage.getItem("Customer_id");
      if (!customerId) throw new Error("Customer ID not found");

      const response = await doctorBookingView(
        parseInt(customerId),
        parseInt(params.doctorId),
        bookingDate,
        formattedStartTime,
        formattedEndTime,
        duration,
        isReschedule ? "UPDATE" : "ADD_BOOKING",
        isReschedule ? params.booking_id : null
      );

      console.log("API response:", response);

      if (response?.status === 200 || response?.data?.success) {
        setShowSuccessModal(true);
      } else {
        throw new Error(response?.data?.message || "Booking failed");
      }
    } catch (error) {
      console.error("Booking error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || error.message || "Booking failed"
      );
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
    setShowCalendarModal(true);
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
        title={isReschedule ? "Confirm Reschedule" : "Confirm Booking"}
        showBackButton
        onBackPress={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Doctor Info Card */}
        <View style={styles.card}>
          <View style={styles.doctorInfoContainer}>
            <Image 
              source={{ uri: params.image || "https://via.placeholder.com/100" }} 
              style={styles.doctorImage} 
            />
            <View style={styles.doctorTextContainer}>
              <Text style={styles.doctorName}>{params.doctorName || "Doctor Name"}</Text>
              <Text style={styles.specialization}>{params.specialty || "Specialty"}</Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#FFA000" />
                <Text style={styles.ratingText}>4.9 (500 reviews)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Booking Details Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Icon name="calendar-today" size={20} color="#2a7fba" />
            </View>
            <View>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailText}>{formatDisplayDate(params.date)}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Icon name="access-time" size={20} color="#2a7fba" />
            </View>
            <View>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailText}>{params.time || `${params.startTime} - ${params.endTime}`}</Text>
            </View>
          </View>
        </View>

        {/* Payment Summary Card */}
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

        {/* Policy Info */}
        <View style={styles.policyContainer}>
          <Icon name="info" size={18} color="#666" style={styles.infoIcon} />
          <Text style={styles.policyText}>
            By confirming, you agree to our booking policy. Cancellations must be made at least 2 hours before the scheduled time.
          </Text>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <TouchableOpacity
        style={[
          styles.confirmButton, 
          (isSubmitting || showConfirmModal || showSuccessModal || showCalendarModal) && { 
            backgroundColor: '#cccccc' 
          }
        ]}
        onPress={handleConfirmBooking}
        disabled={isSubmitting || showConfirmModal || showSuccessModal || showCalendarModal}
        activeOpacity={0.7}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <View style={styles.buttonContent}>
            <Text style={styles.confirmButtonText}>
              {isReschedule ? "Confirm Reschedule" : "Confirm Booking"}
            </Text>
            <Icon name="check-circle" size={20} color="white" />
          </View>
        )}
      </TouchableOpacity>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleConfirmNo}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {isReschedule ? "Confirm Reschedule?" : "Confirm Booking?"}
            </Text>
            <Text style={styles.modalText}>
              Are you sure you want to {isReschedule ? "reschedule" : "book"} this appointment?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={styles.yesButton} 
                onPress={handleConfirmYes} 
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? <ActivityIndicator color="white" /> : "Yes"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.noButton} onPress={handleConfirmNo}>
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleSuccessOk}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Icon name="check-circle" size={50} color="#4CAF50" style={styles.successIcon} />
            <Text style={styles.modalTitle}>
              {isReschedule ? "Appointment Rescheduled" : "Appointment Booked"}
            </Text>
            <View style={styles.modalTxt}>
              <Text style={styles.detailText}>Doctor: {params.doctorName}</Text>
              <Text style={styles.detailText}>Specialty: {params.specialty}</Text>
              <Text style={styles.detailText}>Date: {formatDisplayDate(params.date)}</Text>
              <Text style={styles.detailText}>Time: {params.time}</Text>
            </View>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.okButton, { flex: 1, backgroundColor: "#2a7fba", marginRight: 10 }]}
                onPress={handleViewMyBook}
              >
                <Text style={styles.buttonText}>My Bookings</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.okButton, { flex: 1 }]} 
                onPress={handleSuccessOk}
              >
                <Text style={styles.buttonTextOk}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Calendar Modal */}
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
  container: { 
    flex: 1, 
    backgroundColor: "#f5f5f5", 
    marginTop: 30 
  },
  scrollContainer: { 
    padding: 20, 
    paddingBottom: 100 
  },
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
  doctorInfoContainer: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  doctorImage: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    marginRight: 16, 
    borderWidth: 2, 
    borderColor: "#2a7fba" 
  },
  doctorTextContainer: { 
    flex: 1 
  },
  doctorName: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#2c3e50", 
    marginBottom: 4 
  },
  specialization: { 
    fontSize: 14, 
    color: "#666", 
    marginBottom: 6 
  },
  ratingContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 4 
  },
  ratingText: { 
    fontSize: 13, 
    color: "#666", 
    marginLeft: 4 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#2a7fba", 
    marginBottom: 16 
  },
  detailRow: { 
    flexDirection: "row", 
    alignItems: "flex-start", 
    marginBottom: 16 
  },
  iconContainer: {
    backgroundColor: "#E3F2FD",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailLabel: { 
    fontSize: 13, 
    color: "#888", 
    marginBottom: 2 
  },
  detailText: { 
    fontSize: 15, 
    fontWeight: "500", 
    color: "#2c3e50" 
  },
  paymentRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 8 
  },
  paymentLabel: { 
    fontSize: 14, 
    color: "#666" 
  },
  paymentValue: { 
    fontSize: 14, 
    color: "#2c3e50", 
    fontWeight: "500" 
  },
  totalLabel: { 
    fontWeight: "600" 
  },
  totalValue: { 
    color: "#2a7fba", 
    fontWeight: "bold", 
    fontSize: 16 
  },
  divider: { 
    height: 1, 
    backgroundColor: "#e0e0e0", 
    marginVertical: 8 
  },
  policyContainer: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  infoIcon: { 
    marginRight: 8, 
    marginTop: 2 
  },
  policyText: { 
    fontSize: 12, 
    color: "#666", 
    lineHeight: 18, 
    flex: 1 
  },
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
    zIndex: 10,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  confirmButtonText: { 
    color: "white", 
    fontSize: 18, 
    fontWeight: "bold", 
    marginRight: 8 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.5)", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  modalContainer: { 
    backgroundColor: "#ffffff", 
    borderRadius: 16, 
    padding: 20, 
    width: "80%", 
    maxWidth: 400, 
    alignItems: "center" 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#2c3e50", 
    marginBottom: 10 
  },
  modalTxt: { 
    width: "100%", 
    marginBottom: 20 
  },
  modalText: { 
    fontSize: 16, 
    color: "#666", 
    textAlign: "center", 
    marginBottom: 20 
  },
  modalButtonContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    width: "100%" 
  },
  yesButton: { 
    backgroundColor: "#2a7fba", 
    padding: 10, 
    borderRadius: 8, 
    flex: 1, 
    marginRight: 10, 
    alignItems: "center" 
  },
  noButton: { 
    backgroundColor: "#F44336", 
    padding: 10, 
    borderRadius: 8, 
    flex: 1, 
    alignItems: "center" 
  },
  okButton: { 
    backgroundColor: "#2a7fba", 
    paddingVertical: 12, 
    borderRadius: 8, 
    alignItems: "center" 
  },
  buttonText: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  buttonTextOk: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  successIcon: { 
    marginBottom: 20 
  },
});

export default BookingConfirmation;