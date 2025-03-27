import React, { useState } from "react";
import { 
  View, Text, TouchableOpacity, FlatList, Alert, Image, StyleSheet 
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import DropDown from './../components/old_components/DropDown';
import { router } from "expo-router";
import Header from '../components/Header';

const doctorList = [
  { id: "1", name: "Dr. Hamza Tariq", specialty: "Odontology", time: "10:30 AM - 3:30 PM", fee: "1000/-", rating: 4.5, image: { uri: "https://randomuser.me/api/portraits/men/1.jpg" } },
  { id: "2", name: "Dr. Sarah Ahmed", specialty: "Neurology", time: "9:00 AM - 2:00 PM", fee: "1500/-", rating: 4.8, image: { uri: "https://randomuser.me/api/portraits/women/2.jpg" } },
  { id: "3", name: "Dr. Ali Khan", specialty: "Cardiology", time: "11:00 AM - 4:00 PM", fee: "2000/-", rating: 4.7, image: { uri: "https://randomuser.me/api/portraits/men/3.jpg" } },
  { id: "4", name: "Dr. Roshit", specialty: "Cardiology", time: "11:00 AM - 4:00 PM", fee: "2000/-", rating: 4.7, image: { uri: "https://randomuser.me/api/portraits/men/3.jpg" } },
  { id: "5", name: "Dr. Sovit", specialty: "Cardiology", time: "11:00 AM - 4:00 PM", fee: "2000/-", rating: 4.7, image: { uri: "https://randomuser.me/api/portraits/men/3.jpg" } },
];

const specialties = [
  { label: "All", value: "All" },
  { label: "Odontology", value: "Odontology" },
  { label: "Neurology", value: "Neurology" },
  { label: "Cardiology", value: "Cardiology" },
];

const AppointmentScreen = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const filteredDoctors = selectedSpecialty === "All" 
    ? doctorList 
    : doctorList.filter(doctor => doctor.specialty === selectedSpecialty);

  const BookDateTime = () => {
    if (!selectedDoctor) {
      Alert.alert("No Doctor Selected", "Please select a doctor first.");
      return;
    }

    router.push({
      pathname: "/DateTime",
      params: {
        name: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        image: selectedDoctor.image.uri, 
        time: selectedDoctor.time,
        fee: selectedDoctor.fee,
        rating: selectedDoctor.rating,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2a7fba" barStyle="light-content" />
      
      {/* Replace the old header with your reusable Header component */}
      <Header title="Book an Appointment" />
      
      <View style={styles.contentContainer}>
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
                <Text style={styles.doctorDetails}>⏰ Available: {item.time}</Text>
                <Text style={styles.doctorDetails}>💰 Fee: {item.fee}</Text>
                <Text style={styles.doctorDetails}>⭐ Rating: {item.rating}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

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
              ? `Book Appointment with ${selectedDoctor.name}`
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
    backgroundColor: "#fff" 
  },
  contentContainer: { 
    flex: 1, 
    padding: 20,
    paddingTop: 10 // Reduced top padding since Header is separate
  },
  subHeader: { 
    fontSize: 18, 
    fontWeight: "600", 
    marginVertical: 10 
  },
  doctorCard: { 
    flexDirection: "row", 
    padding: 15, 
    marginBottom: 10, 
    backgroundColor: "#f8f9fa", 
    borderRadius: 12, 
    alignItems: "center",
    borderWidth: 1, 
    borderColor: "#d1d1d1" 
  },
  selectedDoctorCard: { 
    backgroundColor: "#e3f2fd", 
    borderColor: "#2196f3", 
    borderWidth: 2 
  },
  doctorImage: { 
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    marginRight: 15 
  },
  doctorInfo: { 
    flex: 1 
  },
  doctorName: { 
    fontSize: 18, 
    fontWeight: "bold" 
  },
  doctorSpecialty: { 
    fontSize: 14, 
    color: "#555" 
  },
  doctorDetails: { 
    fontSize: 12, 
    color: "#777", 
    marginTop: 2 
  },
  bookButtonContainer: { 
    padding: 20 
  },
  bookButton: { 
    padding: 16, 
    backgroundColor: "#27ae60", 
    borderRadius: 10 
  },
  bookText: { 
    textAlign: "center", 
    color: "white", 
    fontSize: 18, 
    fontWeight: "bold" 
  },
});

export default AppointmentScreen;