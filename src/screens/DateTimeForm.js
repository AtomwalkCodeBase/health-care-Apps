import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useLocalSearchParams } from "expo-router";
import Header from "../components/Header";
import { StatusBar } from "expo-status-bar";
import CustomModal from "../components/CustomModal";
import Modal from "react-native-modal";

const DateTimeForm = () => {
  const params = useLocalSearchParams();
  const doctor = {
    name: params.name || "Dr. Kevon Lane",
    specialty: params.specialty || "Gynecologist",
    experience: "05+ Years",
    rating: "4.9 (500)",
    fee: "₹500",
    education: ["MD (Gynecology)", "DGO", "MBBS"],
    image: params.image || "https://via.placeholder.com/100",
  };

  const [selectedDate, setSelectedDate] = useState("Fri 16");
  const [selectedTime, setSelectedTime] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const dates = ["Fri 16", "Sat 17", "Sun 18", "Mon 19", "Tue 20"];
  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "02:00 PM", "03:00 PM",
    "06:00 PM", "07:00 PM", "08:00 PM"
  ];

  // Helper functions for formatting
  const formatDate = (date) => {
    return `${date} February 2025`;
  };

  const formatTime = (time) => {
    return time;
  };

  const calculateEndTime = (startTime) => {
    const [time, period] = startTime.split(" ");
    const [hours, minutes] = time.split(":");
    let newHours = parseInt(hours) + 1;
    if (newHours > 12) newHours -= 12;
    return `${newHours.toString().padStart(2, '0')}:${minutes} ${period}`;
  };

  const handleSubmit = () => {
    if (selectedTime) {
      setModalVisible(true);
    }
  };

  const handleConfirmation = () => {
    setBookingConfirmed(true);
    setModalVisible(false);
  };

  const handleTimeSelection = (slot) => {
    if (selectedTime === slot) {
      setSelectedTime(null);
    } else {
      setSelectedTime(slot);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2a7fba" barStyle="light-content" />
      <Header title="Book an Appointment" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Doctor Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <Image source={{ uri: doctor.image }} style={styles.doctorImage} />
            <View style={styles.statusIndicator} />
          </View>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.specialization}>{doctor.specialty}</Text>
          <Text style={styles.education}>{doctor.education.join(" • ")}</Text>
        </View>

        {/* Stats Cards Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Icon name="work" size={24} color="#2a7fba" />
            <Text style={styles.statValue}>{doctor.experience}</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#FFF8E1' }]}>
            <Icon name="star" size={24} color="#FFA000" />
            <Text style={styles.statValue}>{doctor.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <Icon name="currency-rupee" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{doctor.fee}</Text>
            <Text style={styles.statLabel}>Fee</Text>
          </View>
        </View>

        {/* Available Time Section */}
        <Text style={styles.sectionHeader}>Available Time</Text>
        
        {/* Date Picker Card */}
        <View style={styles.dateCard}>
          <View style={styles.monthHeader}>
            <Text style={styles.monthText}>February</Text>
            <View style={styles.arrowsContainer}>
              <Icon name="chevron-left" size={24} color="#2a7fba" />
              <Icon name="chevron-right" size={24} color="#2a7fba" style={{ marginLeft: 15 }} />
            </View>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datesContainer}
          >
            {dates.map((date) => (
              <TouchableOpacity
                key={date}
                style={[
                  styles.dateButton, 
                  selectedDate === date && styles.selectedDate
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[
                  styles.dateText,
                  selectedDate === date && styles.selectedDateText
                ]}>
                  {date}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Time Slots Card */}
        <View style={styles.timeCard}>
          <Text style={styles.sectionTitle}>Available Time Slots</Text>
          <View style={styles.timeGrid}>
            {timeSlots.map((slot, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timeSlot,
                  selectedTime === slot && styles.selectedTimeSlot
                ]}
                onPress={() => handleTimeSelection(slot)}
              >
                <Text style={[
                  styles.timeText,
                  selectedTime === slot && styles.selectedTimeText
                ]}>
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Book Appointment Button */}
      <TouchableOpacity 
        style={[
          styles.bookButton,
          !selectedTime && { backgroundColor: '#cccccc' }
        ]}
        disabled={!selectedTime}
        onPress={handleSubmit}
      >
        <View style={styles.buttonContent}>
          <Text style={styles.bookButtonText}>Confirm Booking</Text>
          <Icon name="check-circle" size={20} color="white" />
        </View>
      </TouchableOpacity>

      {/* Initial Confirmation Modal */}
      <CustomModal 
        isModalVisible={isModalVisible}
        onpressyes={handleConfirmation}
        onpresno={() => setModalVisible(false)}
        cancelclick={false}
        movetocancel={null}
      />

      {/* Success Confirmation Modal */}
      <Modal 
        isVisible={bookingConfirmed} 
        animationIn="fadeIn" 
        animationOut="fadeOut"
      >
        <View style={styles.modalContent}>
          <Icon 
            name="check-circle" 
            size={60} 
            color="#4CAF50" 
            style={styles.modalIcon} 
          />
          <Text style={styles.modalTitle}>Appointment Confirmed!</Text>
          <Text style={styles.modalText}>
            Your appointment with {doctor.name} is booked on {formatDate(selectedDate)} 
            from {formatTime(selectedTime)} to {selectedTime ? calculateEndTime(selectedTime) : ""}
          </Text>
          <TouchableOpacity 
            style={styles.okButton}
            onPress={() => {
              setBookingConfirmed(false);
              // You might want to navigate back here
              // router.back();
            }}
          >
            <Text style={styles.okButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 25,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  doctorImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
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
  doctorName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  specialization: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  education: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 12,
    marginLeft: 8,
  },
  dateCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  arrowsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  datesContainer: {
    paddingHorizontal: 4,
  },
  dateButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  selectedDate: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
  },
  selectedDateText: {
    color: "#2a7fba",
    fontWeight: "600",
  },
  timeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 12,
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  timeSlot: {
    width: Dimensions.get('window').width / 3 - 22,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  selectedTimeSlot: {
    backgroundColor: "#2a7fba",
    borderColor: "#2a7fba",
  },
  timeText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  selectedTimeText: {
    color: "white",
  },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  bookButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalIcon: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  okButton: {
    backgroundColor: "#2a7fba",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  okButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DateTimeForm;