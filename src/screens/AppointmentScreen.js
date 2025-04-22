import React, { useEffect, useState } from "react";
import { 
  View, Text, TouchableOpacity, FlatList, Alert, Image, StyleSheet 
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Header from '../components/Header';
import { getequipmentlistview } from "../services/productServices";

const AppointmentScreen = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorList, setDoctorList] = useState([]);
  const [specialties, setSpecialties] = useState([{ label: "All", value: "All" }]);

  useEffect(() => {
    getequipmentlistview()
      .then((res) => {
        console.log("API Response:", res.data);
        setDoctorList(res.data || []);
      })
      .catch((error) => console.error("equipment list load failed:", error));
  }, []);

  useEffect(() => {
    if (doctorList.length > 0) {
      const uniqueSpecialties = [...new Set(doctorList.map(doctor => doctor.equipment_type))];
      const specialtyOptions = uniqueSpecialties.map(specialty => ({
        label: specialty,
        value: specialty
      }));
      setSpecialties([{ label: "All", value: "All" }, ...specialtyOptions]);
    }
  }, [doctorList]);

  const filteredDoctors = selectedSpecialty === "All" 
    ? doctorList 
    : doctorList.filter(doctor => doctor.equipment_type === selectedSpecialty);

  const BookDateTime = () => {
    if (!selectedDoctor) {
      Alert.alert("No Doctor Selected", "Please select a doctor first.");
      return;
    }

    router.push({
      pathname: "/DateTime",
      params: {
        id: selectedDoctor.id,
        name: selectedDoctor.name,
        specialty: selectedDoctor.equipment_type,
        image: selectedDoctor.image,
        startTime: selectedDoctor.start_time,
        minUsagePeriod: selectedDoctor.min_usage_period,
        maxUsagePeriod: selectedDoctor.max_usage_period,
        unitOfUsage: selectedDoctor.unit_of_usage,
        numSlots: selectedDoctor.no_of_slots,
        maxSlotTime: selectedDoctor.max_slot_time,
      },
    });
  };

  const renderSpecialtyCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.specialtyCard,
        selectedSpecialty === item.value && styles.selectedSpecialtyCard
      ]}
      onPress={() => {
        setSelectedSpecialty(item.value);
        setSelectedDoctor(null);
      }}
    >
      <Text 
        style={[
          styles.specialtyText,
          selectedSpecialty === item.value && styles.selectedSpecialtyText
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2a7fba" barStyle="light-content" />
      
      <Header title="Book an Appointment" />
      
      <View style={styles.contentContainer}>
        <Text style={styles.subHeader}>Select Specialty</Text>
        <View style={styles.specialtyContainer}>
          <FlatList
            data={specialties}
            renderItem={renderSpecialtyCard}
            keyExtractor={(item) => item.value}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.specialtyListContent}
          />
        </View>

        <Text style={styles.availableDoctorsHeader}>Available Doctors</Text>
        <FlatList
          data={filteredDoctors}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.doctorCard, 
                selectedDoctor?.id === item.id && styles.selectedDoctorCard
              ]}
              onPress={() => setSelectedDoctor(item)}
            >
              <Image source={{uri: item.image}} style={styles.doctorImage} />
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{item.name}</Text>
                <Text style={styles.doctorSpecialty}>{item.equipment_type}</Text>
                <Text style={styles.doctorDetails}>⏰ Start: {item.start_time}</Text>
                <Text style={styles.doctorDetails}>⏱️ Duration: {item.min_usage_period} {item.unit_of_usage}</Text>
                <Text style={styles.doctorDetails}>🎰 Slots: {item.no_of_slots}</Text>
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
    paddingHorizontal: 20, 
    paddingTop: 10 
  },
  subHeader: { 
    fontSize: 18, 
    fontWeight: "600", 
    marginBottom: 5
  },
  specialtyContainer: {
    marginBottom: 10,
  },
  specialtyListContent: {
    paddingVertical: 3,
  },
  specialtyCard: {
    width: 120,
    height: 40,
    paddingHorizontal: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#d1d1d1",
    justifyContent: "center",
    alignItems: "center"
  },
  selectedSpecialtyCard: {
    backgroundColor: "#2a7fba",
    borderColor: "#1976d2"
  },
  specialtyText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    textAlign: "center"
  },
  selectedSpecialtyText: {
    color: "#fff",
    fontWeight: "600"
  },
  availableDoctorsHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
    marginTop: 10,
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