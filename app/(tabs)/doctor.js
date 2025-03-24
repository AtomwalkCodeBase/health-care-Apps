import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

const DoctorProfile = () => {
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleBook = () => {
    Alert.alert("Appointment Booked", "Your appointment has been confirmed.");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Doctor</Text>
          <TouchableOpacity onPress={() => setLiked(!liked)}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={24}
              color={liked ? "red" : "black"}
            />
          </TouchableOpacity>
        </View>

        {/* Profile Image */}
        <Image
          source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }}
          style={styles.profileImage}
        />

        {/* Name and Rating */}
        <View style={styles.nameRatingSection}>
          <Text style={styles.name}>Dr. Ali Uzair</Text>
          <Text style={styles.speciality}>Cardiologist and Surgeon</Text>
          <View style={styles.ratingContainer}>
            <FontAwesome name="star" size={16} color="#FDC500" />
            <Text style={styles.ratingText}>4.9 (96 reviews)</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Ionicons name="person" size={24} color="#3C6FF8" />
            <Text style={styles.statText}>116+</Text>
            <Text style={styles.statLabel}>Patients</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialIcons name="verified" size={24} color="#3C6FF8" />
            <Text style={styles.statText}>3+</Text>
            <Text style={styles.statLabel}>Years</Text>
          </View>
          <View style={styles.statBox}>
            <FontAwesome name="star" size={24} color="#3C6FF8" />
            <Text style={styles.statText}>4.9</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="chatbubble-ellipses" size={24} color="#3C6FF8" />
            <Text style={styles.statText}>90+</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>

        {/* About Me */}
        <View style={styles.aboutContainer}>
          <Text style={styles.aboutHeader}>About Me</Text>
          <Text style={styles.aboutText}>
            {expanded
              ? "Dr. Ali Uzair is a top cardiologist and surgeon at Crist Hospital in London, UK. He has received several awards for his outstanding contributions to the field of cardiovascular medicine. With over 116 patients treated and 90+ reviews, he’s widely respected for his compassionate care and advanced surgical techniques. "
              : "Dr. Ali Uzair is a top cardiologist and surgeon at Crist Hospital in London, UK. He has received several awards for his outstanding contributions "}
            <Text
              style={styles.readMore}
              onPress={() => setExpanded(!expanded)}
            >
              {expanded ? " Show Less" : " Read More..."}
            </Text>
          </Text>
        </View>

        {/* Book Button */}
        <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 50,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  profileImage: {
    width: "80%",
    height: 300,
    alignSelf: "center",
    borderRadius: 16,
    resizeMode: "cover",
  },
  nameRatingSection: {
    marginTop: 12,
    alignItems: "flex-start",
    paddingHorizontal: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  speciality: {
    color: "gray",
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    color: "gray",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  statBox: {
    alignItems: "center",
    width: "22%",
  },
  statText: {
    fontWeight: "bold",
    marginTop: 4,
  },
  statLabel: {
    color: "gray",
    fontSize: 12,
    textAlign: "center",
  },
  aboutContainer: {
    marginTop: 24,
    paddingHorizontal: 4,
  },
  aboutHeader: {
    fontWeight: "bold",
    fontSize: 16,
  },
  aboutText: {
    marginTop: 8,
    color: "gray",
    lineHeight: 20,
  },
  readMore: {
    color: "#3C6FF8",
    fontWeight: "500",
  },
  bookButton: {
    backgroundColor: "#3C6FF8",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default DoctorProfile;
