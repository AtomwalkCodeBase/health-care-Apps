import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

const DateTimeForm = () => {
  const params = useLocalSearchParams();
  const doctor = {
    name: params.name,
    specialty: params.specialty,
    image: params.image,
    time: params.time,
    fee: params.fee,
    rating: params.rating,
  };

  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [remarks, setRemarks] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const formatDate = (date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleSubmit = () => {
    Alert.alert(
      "Appointment Confirmed",
      `Your appointment with ${doctor.name} is booked on ${formatDate(date)} from ${formatTime(startTime)} to ${formatTime(endTime)}.`,
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Book an Appointment</Text>

      {/* Doctor Profile Section */}
      <View style={styles.profileContainer}>
        <Image source={{ uri: doctor.image }} style={styles.doctorImage} />
        <View>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.specialization}>{doctor.specialty}</Text>
        </View>
      </View>

      {/* Booking Date */}
      <Text style={styles.label}>Booking Date*</Text>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.inputText}>{formatDate(date)}</Text>
        <Icon name="calendar-today" size={20} color="#333" />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      {/* Time From */}
      <Text style={styles.label}>Time From*</Text>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setShowStartTimePicker(true)}
      >
        <Text style={styles.inputText}>{formatTime(startTime)}</Text>
        <Icon name="schedule" size={20} color="#333" />
      </TouchableOpacity>
      {showStartTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowStartTimePicker(false);
            if (selectedTime) setStartTime(selectedTime);
          }}
        />
      )}

      {/* Time To */}
      <Text style={styles.label}>Time To*</Text>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setShowEndTimePicker(true)}
      >
        <Text style={styles.inputText}>{formatTime(endTime)}</Text>
        <Icon name="schedule" size={20} color="#333" />
      </TouchableOpacity>
      {showEndTimePicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowEndTimePicker(false);
            if (selectedTime) setEndTime(selectedTime);
          }}
        />
      )}

      {/* Remarks */}
      <Text style={styles.label}>Health issue*</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Enter your issue..."
        multiline
        value={remarks}
        onChangeText={setRemarks}
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Icon name="check-circle" size={30} color="#fff" style={{ marginRight: 10 }} />
        <Text style={styles.buttonText}>Confirm Booking</Text>
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
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    marginBottom: 10,
  },
  doctorImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 15,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  specialization: {
    fontSize: 14,
    color: "#666",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2c3e50",
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 14,
    marginTop: 5,
    backgroundColor: "#f9f9f9",
  },
  inputText: {
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    height: 120,
    textAlignVertical: "top",
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DateTimeForm;
