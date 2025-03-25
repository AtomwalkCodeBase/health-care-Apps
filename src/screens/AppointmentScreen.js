import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, ScrollView, Image, StyleSheet, Modal } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { StatusBar } from "expo-status-bar";

const doctorList = [
  {
    id: "1",
    name: "Dr. Hamza Tariq",
    specialty: "Odontology",
    time: "10:30 AM - 3:30 PM",
    fee: "1000/-",
    rating: 4.5,
    image: { uri: "https://randomuser.me/api/portraits/men/1.jpg" },
  },
  {
    id: "2",
    name: "Dr. Sarah Ahmed",
    specialty: "Neurology",
    time: "9:00 AM - 2:00 PM",
    fee: "1500/-",
    rating: 4.8,
    image: { uri: "https://randomuser.me/api/portraits/women/2.jpg" },
  },
  {
    id: "3",
    name: "Dr. Ali Khan",
    specialty: "Cardiology",
    time: "11:00 AM - 4:00 PM",
    fee: "2000/-",
    rating: 4.7,
    image: { uri: "https://randomuser.me/api/portraits/men/3.jpg" },
  },
  {
    id: "4",
    name: "Dr. Fatima Riaz",
    specialty: "Orthopedics",
    time: "8:00 AM - 1:00 PM",
    fee: "1800/-",
    rating: 4.9,
    image: { uri: "https://randomuser.me/api/portraits/women/4.jpg" },
  },
];

const specialties = ["All", "Odontology", "Neurology", "Cardiology", "Orthopedics"];

const AppointmentScreen = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredDoctors = selectedSpecialty === "All" 
    ? doctorList 
    : doctorList.filter(doctor => doctor.specialty === selectedSpecialty);

  const handleBooking = () => {
    if (!selectedDoctor) {
      Alert.alert("No Doctor Selected", "Please select a doctor first.");
      return;
    }
    Alert.alert(
      "Booking Confirmed", 
      `Your appointment with ${selectedDoctor.name} is booked.\n\nSpecialty: ${selectedDoctor.specialty}\nAvailable: ${selectedDoctor.time}\nFee: ${selectedDoctor.fee}`
    );
  };

  const handleSpecialtySelect = (specialty) => {
    setSelectedSpecialty(specialty);
    setSelectedDoctor(null);
    setShowDropdown(false);
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar backgroundColor="#2c3e50" barStyle="light-content" />
      <Text style={styles.header}>Book an Appointment</Text>
      
      <Text style={styles.subHeader}>Select Specialty</Text>
      
      {/* Custom Dropdown Implementation */}
      <TouchableOpacity 
        style={styles.dropdownButton}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <Text style={styles.dropdownButtonText}>{selectedSpecialty}</Text>
        <Text style={styles.dropdownArrow}>{showDropdown ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownOptions}>
            {specialties.map((specialty) => (
              <TouchableOpacity
                key={specialty}
                style={[
                  styles.dropdownOption,
                  selectedSpecialty === specialty && styles.selectedDropdownOption
                ]}
                onPress={() => handleSpecialtySelect(specialty)}
              >
                <Text style={styles.dropdownOptionText}>{specialty}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Text style={styles.subHeader}>Available Doctors</Text>
      <FlatList 
        data={filteredDoctors}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.doctorCard, 
              selectedDoctor?.id === item.id && styles.selectedDoctorCard
            ]}
            onPress={() => setSelectedDoctor(item)}
          >
            <Image source={item.image} style={styles.doctorImage} />
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{item.name}</Text>
              <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
              <Text style={styles.doctorTime}>Available: {item.time}</Text>
              <Text style={styles.doctorFee}>Fee: {item.fee}</Text>
              <Text style={styles.doctorRating}>Rating: {item.rating} ★</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity 
        onPress={handleBooking} 
        style={[
          styles.bookButton,
          !selectedDoctor && { backgroundColor: "#95a5a6" }
        ]}
        disabled={!selectedDoctor}
      >
        <Text style={styles.bookText}>
          {selectedDoctor 
            ? `Book Appointment with Dr. ${selectedDoctor.name.split(" ")[1]}`
            : "Select a Doctor to Book"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 20,
    backgroundColor: "#fff",
  },
  header: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 20,
    color: "#2c3e50",
    textAlign: "center",
  },
  subHeader: { 
    fontSize: 18, 
    fontWeight: "600", 
    marginVertical: 10,
    color: "#34495e",
  },
  // Dropdown styles
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#dfe6e9",
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#2c3e50",
  },
  dropdownArrow: {
    fontSize: 14,
    color: "#2c3e50",
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  dropdownOptions: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 10,
  },
  dropdownOption: {
    padding: 15,
  },
  selectedDropdownOption: {
    backgroundColor: '#e3f2fd',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: "#2c3e50",
  },
  // Doctor card styles
  doctorCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedDoctorCard: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196f3",
    borderWidth: 2,
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
    marginBottom: 3,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 3,
  },
  doctorTime: {
    fontSize: 14,
    color: "#34495e",
    marginBottom: 3,
  },
  doctorFee: {
    fontSize: 14,
    color: "#27ae60",
    marginBottom: 3,
    fontWeight: "600",
  },
  doctorRating: {
    fontSize: 14,
    color: "#f39c12",
  },
  bookButton: { 
    marginTop: 20, 
    padding: 16, 
    backgroundColor: "#27ae60", 
    borderRadius: 10,
    elevation: 3,
  },
  bookText: { 
    textAlign: "center", 
    color: "white", 
    fontSize: 18,
    fontWeight: "600",
  },
});

export default AppointmentScreen;