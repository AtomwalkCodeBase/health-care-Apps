import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

// Services list
const serviceList = [
  { name: "Dentistry", icon: "tooth-outline" },
  { name: "Neurology", icon: "brain" },
  { name: "Cardiology", icon: "heart-pulse" },
  { name: "Orthopedics", icon: "walk" },
  { name: "Dermatology", icon: "face-woman-outline" },
  { name: "Pediatrics", icon: "baby-face-outline" },
  { name: "Radiology", icon: "radiology-box" },
  { name: "Psychiatry", icon: "emoticon-outline" },
  { name: "Ophthalmology", icon: "eye-outline" },
  { name: "Gynecology", icon: "gender-female" },
  { name: "ENT (Otolaryngology)", icon: "ear-hearing" },
  { name: "Gastroenterology", icon: "stomach" },
  { name: "Urology", icon: "water" },
  { name: "Pulmonology", icon: "lungs" },
  { name: "Oncology", icon: "ribbon" },
  { name: "Nephrology", icon: "heart" },
];

// Doctors list
const doctorList = [
  {
    name: "Dr. Hamza Tariq",
    specialty: "Odontology",
    time: "10:30 AM - 3:30 PM",
    fee: "1000/-",
    rating: 4.9,
    image: { uri: "https://randomuser.me/api/portraits/men/1.jpg" },
  },
  {
    name: "Dr. Alina Fatima",
    specialty: "Senior Surgeon",
    time: "10:30 AM - 3:30 PM",
    fee: "1500/-",
    rating: 5.0,
    image: { uri: "https://randomuser.me/api/portraits/women/2.jpg" },
  },
  {
    name: "Dr. John Doe",
    specialty: "Cardiologist",
    time: "9:00 AM - 1:00 PM",
    fee: "500/-",
    rating: 4.8,
    image: { uri: "https://randomuser.me/api/portraits/men/4.jpg" },
  },
];

const HomeScreen = () => {
  const [searchText, setSearchText] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState(doctorList);
  const [filteredServices, setFilteredServices] = useState(serviceList);
  const [isAscending, setIsAscending] = useState(true);

  const handleSearch = (text) => {
    const lowerText = text.toLowerCase();

    const matchedDoctors = doctorList.filter(
      (doc) =>
        doc.name.toLowerCase().includes(lowerText) ||
        doc.specialty.toLowerCase().includes(lowerText)
    );

    const matchedServices = serviceList.filter((service) =>
      service.name.toLowerCase().includes(lowerText)
    );

    const sortedDoctors = [...matchedDoctors].sort((a, b) => {
      if (isAscending) {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

    setFilteredDoctors(sortedDoctors);
    setFilteredServices(matchedServices);
  };

  const toggleSortOrder = () => {
    setIsAscending(!isAscending);
  };

  useEffect(() => {
    handleSearch(searchText);
  }, [searchText, isAscending]);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: "https://randomuser.me/api/portraits/men/4.jpg" }}
          style={styles.profileImage}
        />
        <Text style={styles.greeting}>
          Hello <Text style={styles.userName}>Hamza!</Text>
        </Text>
        <MaterialCommunityIcons
          name="bell-outline"
          size={24}
          color="#000"
          style={styles.notificationIcon}
        />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={22} color="gray" />
        <TextInput
          placeholder="Search doctors or services"
          style={styles.searchInput}
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
        />
        <TouchableOpacity onPress={toggleSortOrder}>
          <MaterialCommunityIcons
            name={
              isAscending
                ? "sort-alphabetical-ascending"
                : "sort-alphabetical-descending"
            }
            size={22}
            color="#000"
            style={styles.filterIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Services */}
      <Text style={styles.sectionTitle}>Services</Text>
      {filteredServices.length === 0 ? (
        <Text style={styles.noResultsText}>No services found</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filteredServices.map((service, index) => (
            <TouchableOpacity key={index} style={styles.serviceCard}>
              <MaterialCommunityIcons
                name={service.icon}
                size={30}
                color="#fff"
              />
              <Text style={styles.serviceText}>{service.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Doctors */}
      <Text style={styles.sectionTitle}>Top Rated Doctors</Text>
      <View style={styles.verticalList}>
        {filteredDoctors.length === 0 ? (
          <Text style={styles.noResultsText}>No doctors found</Text>
        ) : (
          filteredDoctors.map((doctor, index) => (
            <TouchableOpacity key={index} style={styles.doctorCard}>
              <Image source={doctor.image} style={styles.doctorImage} />
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                <Text style={styles.doctorDetails}>
                  ⏰ {doctor.time} | Fee: {doctor.fee}
                </Text>
              </View>
              <Text style={styles.rating}>⭐ {doctor.rating}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  profileImage: {
    borderRadius: 25,
    width: 50,
    height: 50,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    color: "#3B82F6",
  },
  notificationIcon: {
    marginLeft: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filterIcon: {
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 10,
    marginRight: 12,
  },
  serviceText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  verticalList: {
    marginTop: 15,
    marginBottom: 15,
  },
  doctorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  doctorImage: {
    width: 55,
    height: 55,
    borderRadius: 30,
    marginRight: 15,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  doctorSpecialty: {
    color: "gray",
    fontSize: 14,
    marginBottom: 3,
  },
  doctorDetails: {
    fontSize: 13,
    color: "gray",
  },
  rating: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFD700",
  },
  noResultsText: {
    fontSize: 14,
    color: "gray",
    fontStyle: "italic",
    marginVertical: 10,
  },
});

export default HomeScreen;
