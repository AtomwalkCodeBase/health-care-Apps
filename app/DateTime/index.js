import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context"; //


// Sample booked appointments (in a real app, this would come from a backend)
const initialBookings = {
  "2025-03-25": ["09:00 AM", "02:00 PM"],
  "2025-03-26": ["11:00 AM"],
};

const AppointmentForm = () => {
  const [date, setDate] = useState(new Date()); // Default to today
  const [time, setTime] = useState(new Date()); // Default to current time
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [bookings, setBookings] = useState(initialBookings);

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Format time to HH:MM AM/PM
  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert to 12-hour format
    return `${String(hours).padStart(2, "0")}:${minutes} ${period}`;
  };

  // Check if the slot is already booked
  const isTimeBooked = (dateStr, timeStr) => {
    return bookings[dateStr]?.includes(timeStr) || false;
  };

  // Handle date selection
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios"); // Keep open on iOS until dismissed
    setDate(currentDate);
  };

  // Handle time selection
  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === "ios"); // Keep open on iOS until dismissed
    setTime(currentTime);
  };

  // Handle form submission
  const handleSubmit = () => {
    const dateStr = formatDate(date);
    const timeStr = formatTime(time);

    if (isTimeBooked(dateStr, timeStr)) {
      Alert.alert(
        "Slot Unavailable",
        `The appointment on ${dateStr} at ${timeStr} is already booked.`
      );
      return;
    }

    // Book the appointment
    setBookings((prev) => ({
      ...prev,
      [dateStr]: [...(prev[dateStr] || []), timeStr],
    }));

    Alert.alert("Success", `Appointment booked for ${dateStr} at ${timeStr}`);

    // Reset to default (optional, can be removed if you want to keep selections)
    setDate(new Date());
    setTime(new Date());
  };

  return (
    <SafeAreaView style={styles.container}>
  

      <Text style={styles.title}>Book an Appointment</Text>

      {/* Date Selection */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Select Date</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.pickerButtonText}>{formatDate(date)}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()} // Restrict to today or future dates
          />
        )}
      </View>

      {/* Time Selection */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Select Time</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.pickerButtonText}>{formatTime(time)}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={onTimeChange}
            is24Hour={false} // Use 12-hour format with AM/PM
          />
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Book Appointment</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
  pickerButtonText: {
    fontSize: 16,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AppointmentForm;