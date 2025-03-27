import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useLocalSearchParams } from "expo-router";
import Header from '../components/Header';
import { StatusBar } from "expo-status-bar";
import CustomModal from '../components/CustomModal';
import Modal from "react-native-modal";


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
  const [isModalVisible, setModalVisible] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

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
    setModalVisible(true);
  };

  const handleConfirmation = () => {
    setBookingConfirmed(true);
    setModalVisible(false);
  };

  return (
    <View style={styles.headercontainer}>
      <StatusBar backgroundColor="#2a7fba" barStyle="light-content" />
      <Header title="Book an Appointment" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.profileContainer}>
          <Image source={{ uri: doctor.image }} style={styles.doctorImage} />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.specialization}>{doctor.specialty}</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
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

          <Text style={styles.label}>Health issue*</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter your issue..."
            multiline
            value={remarks}
            onChangeText={setRemarks}
          />
        </View>
      </ScrollView>

      <View edges={['bottom']} style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Icon name="check-circle" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Confirm Booking</Text>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <CustomModal 
        isModalVisible={isModalVisible}
        onpressyes={handleConfirmation}
        onpresno={() => setModalVisible(false)}
        cancelclick={false}
        movetocancel={null}
      />
      
      {/* Success Modal */}
      <Modal isVisible={bookingConfirmed} animationIn="fadeIn" animationOut="fadeOut">
        <View style={styles.modalContent}>
          <Icon name="check-circle" size={60} color="#4CAF50" style={styles.modalIcon} />
          <Text style={styles.modalTitle}>Appointment Confirmed!</Text>
          <Text style={styles.modalText}>
            Your appointment with {doctor.name} is booked on {formatDate(date)} from {formatTime(startTime)} to {formatTime(endTime)}.
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
  headercontainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 30,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginBottom: 20,
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  specialization: {
    fontSize: 14,
    color: "#666",
  },
  formContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  inputText: {
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: "top",
    backgroundColor: "#f9f9f9",
    fontSize: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#2a7fba",
    padding: 16,
    marginTop: 5,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  modalIcon: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2c3e50",
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#555",
  },
  okButton: {
    backgroundColor: "#2a7fba",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  okButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DateTimeForm;