import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";

const dates = [
  { day: "Sun", date: 3 },
  { day: "Mon", date: 4 },
  { day: "Tue", date: 5 },
  { day: "Wed", date: 6 },
  { day: "Thu", date: 7 },
  { day: "Fri", date: 8 },
];

const times = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
];

const AppointmentScreen = () => {
  const [selectedDate, setSelectedDate] = useState(5);
  const [selectedTime, setSelectedTime] = useState("9:00 AM");

  const handleConfirm = () => {
    Alert.alert(
      "Appointment Confirmed",
      `Date: ${selectedDate}, Time: ${selectedTime}`
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Doctor Info */}
      <DoctorInfo />

      {/* Appointment Section */}
      <SectionTitle title="Appointment" />
      <DateSelector
        dates={dates}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Time Selection */}
      <SectionTitle title="Available Time" />
      <TimeSelector
        times={times}
        selectedTime={selectedTime}
        onSelectTime={setSelectedTime}
      />

      {/* Confirm Button */}
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmText}>Confirm</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AppointmentScreen;

// ---------------------- Components ----------------------

const DoctorInfo = () => (
  <View style={styles.doctorContainer}>
    <Image
      source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }}
      style={styles.image}
    />
    <View style={styles.doctorInfo}>
      <Text style={styles.doctorName}>Dr. Ali Uzair</Text>
      <Text style={styles.doctorTitle}>Senior Cardiologist and Surgeon</Text>
      <Text style={styles.doctorHospital}>
        Mirpur Medical College and Hospital
      </Text>
    </View>
  </View>
);

const SectionTitle = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const DateSelector = ({ dates, selectedDate, onSelectDate }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.dateContainer}
  >
    {dates.map(({ day, date }) => {
      const isSelected = selectedDate === date;
      return (
        <TouchableOpacity
          key={date}
          style={[styles.dateBox, isSelected && styles.selectedDateBox]}
          onPress={() => onSelectDate(date)}
        >
          <Text style={styles.dateDay}>{day}</Text>
          <Text
            style={[styles.dateNumber, isSelected && styles.selectedDateText]}
          >
            {date}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);
const TimeSelector = ({ times, selectedTime, onSelectTime }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.timeContainer}
    style={styles.timeScrollContainer}
  >
    {times.map((time) => {
      const isSelected = selectedTime === time;
      return (
        <TouchableOpacity
          key={time}
          style={[styles.timeBox, isSelected && styles.selectedTimeBox]}
          onPress={() => onSelectTime(time)}
        >
          <Text
            style={[styles.timeText, isSelected && styles.selectedTimeText]}
          >
            {time}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

// ---------------------- Styles ----------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  doctorContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  image: {
    width: "100%",
    height: 300,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  doctorInfo: {
    backgroundColor: "#316FEA",
    padding: 16,
    borderRadius: 12,
    marginTop: -20,
    alignItems: "center",
  },
  doctorName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  doctorTitle: {
    color: "#fff",
    fontSize: 14,
    marginTop: 4,
  },
  doctorHospital: {
    color: "#fff",
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: "row",
    gap: 10,
  },
  dateBox: {
    backgroundColor: "#f2f2f2",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    width: 60,
    marginRight: 10,
  },
  selectedDateBox: {
    backgroundColor: "#A4E4EB",
  },
  dateDay: {
    fontSize: 12,
    color: "#333",
  },
  dateNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  selectedDateText: {
    color: "#000",
  },
  timeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginTop: 10,
    marginBottom: 24,
  },
  timeBox: {
    backgroundColor: "#F4F4F4",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    margin: 5,
  },
  selectedTimeBox: {
    backgroundColor: "#F8B26A",
  },
  timeText: {
    color: "#333",
    fontSize: 14,
  },
  selectedTimeText: {
    color: "#fff",
  },
  confirmButton: {
    backgroundColor: "#316FEA",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 40,
  },
  confirmText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  timeScrollContainer: {
    marginTop: 10,
    marginBottom: 24,
  },

  timeContainer: {
    flexDirection: "row",
    gap: 10,
  },
});
