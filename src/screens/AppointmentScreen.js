import React, { useState } from "react";
import { 
  View, Text, TouchableOpacity, FlatList, Alert, Image, StyleSheet, 
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context"; //
import DropDown from './../components/old_components/DropDown';
import { router } from "expo-router";

const doctorList = [
  { id: "1", name: "Dr. Hamza Tariq", specialty: "Odontology", time: "10:30 AM - 3:30 PM", fee: "1000/-", rating: 4.5, image: { uri: "https://randomuser.me/api/portraits/men/1.jpg" } },
  { id: "2", name: "Dr. Sarah Ahmed", specialty: "Neurology", time: "9:00 AM - 2:00 PM", fee: "1500/-", rating: 4.8, image: { uri: "https://randomuser.me/api/portraits/women/2.jpg" } },
  { id: "3", name: "Dr. Ali Khan", specialty: "Cardiology", time: "11:00 AM - 4:00 PM", fee: "2000/-", rating: 4.7, image: { uri: "https://randomuser.me/api/portraits/men/3.jpg" } },
  { id: "4", name: "Dr. Fatima Riaz", specialty: "Orthopedics", time: "8:00 AM - 1:00 PM", fee: "1800/-", rating: 4.9, image: { uri: "https://randomuser.me/api/portraits/women/4.jpg" } },
  { id: "5", name: "Dr. Fatima Riaz", specialty: "Orthopedics", time: "8:00 AM - 1:00 PM", fee: "1800/-", rating: 4.9, image: { uri: "https://randomuser.me/api/portraits/women/4.jpg" } },
  { id: "6", name: "Dr. Fatima Riaz", specialty: "Orthopedics", time: "8:00 AM - 1:00 PM", fee: "1800/-", rating: 4.9, image: { uri: "https://randomuser.me/api/portraits/women/4.jpg" } },
];

const specialties = [
  { label: "All", value: "All" },
  { label: "Odontology", value: "Odontology" },
  { label: "Neurology", value: "Neurology" },
  { label: "Cardiology", value: "Cardiology" },
  { label: "Orthopedics", value: "Orthopedics" },
];

const AppointmentScreen = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState(null);

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
  const BookDateTime = () =>{
    router.push({
      pathname:"/DateTime"
    });
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2c3e50" barStyle="light-content" />
      
      {/* Dropdown - Fixed at Top */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Book an Appointment</Text>
        <Text style={styles.subHeader}>Select Specialty</Text>
        <DropDown
          inputlabel=""
          inputvalue={selectedSpecialty}
          placeholder="Specialty"
          data={specialties}
          onSelect={(value) => {
            setSelectedSpecialty(value);
            setSelectedDoctor(null);
          }}
        />
      </View>

      {/* Doctor List - Scrollable */}
      <View style={styles.listContainer}>
        <Text style={styles.subHeader}>Available Doctors</Text>
        <FlatList
          data={filteredDoctors}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
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
          contentContainerStyle={{ paddingBottom: 100 }} // Ensures space for button
          style={{ flex: 1 }} // Enables scrolling
        />
      </View>

      {/* Book Button - Fixed at Bottom */}
      <View style={styles.bookButtonContainer}>
        <TouchableOpacity 
          onPress={BookDateTime} 
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    padding: 20,
    backgroundColor: "#fff",
    elevation: 5, 
    zIndex: 1000, 
  },
  header: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#2c3e50",
    textAlign: "center",
  },
  subHeader: { 
    fontSize: 18, 
    fontWeight: "600", 
    marginVertical: 10,
    color: "#34495e",
  },
  listContainer: {
    flex: 1, // Enables scrolling
    paddingHorizontal: 20,
  },
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
  },
  bookButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    elevation: 10,
  },
  bookButton: { 
    padding: 16, 
    backgroundColor: "#27ae60", 
    borderRadius: 10,
  },
  bookText: { 
    textAlign: "center", 
    color: "white", 
    fontSize: 18,
    fontWeight: "600",
  },
});

export default AppointmentScreen;
