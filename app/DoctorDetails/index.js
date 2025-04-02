import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Header from "../../src/components/Header";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const DoctorProfile = () => {
  const item = useLocalSearchParams();

  // Define the stats and fees data
  const statsData = [
    { value: "12 years", label: "Experience" },
    { value: "4.8", label: "Rating" },
    { value: "2500+", label: "Patients" },
  ];
  const feesData = [
    { value: "₹300", label: "Consultation Fee" },
    { value: "₹150", label: "Follow-up Fee" },
    { value: "30 mins", label: "Avg. Session" },
    { value: "95%", label: "Success Rate" },
  ];

  const handleBack = () => {
    router.back();
  };

  // Extract values for the About text
  const experience = statsData.find((stat) => stat.label === "Experience").value;
  const rating = statsData.find((stat) => stat.label === "Rating").value;
  const patients = statsData.find((stat) => stat.label === "Patients").value;
  const successRate = feesData.find((fee) => fee.label === "Success Rate").value;

  return (
    <SafeAreaView style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <StatusBar backgroundColor="#2a7fba" barStyle="light-content" />
          <Header title="Doctor Profile" />
        </View>

        <View style={styles.contentContainer}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <LinearGradient
              colors={["#ffffff", "#f7f9fc"]}
              style={styles.profileGradient}
            >
              <Image
                source={{ uri: item.image }}
                style={styles.profileImage}
              />
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.speciality}>Cardiologist</Text>
            </LinearGradient>
          </View>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            {statsData.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* About Section with Mapped Data */}
          <View style={styles.aboutContainer}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}> 
              {item.name} is a highly experienced cardiologist with{" "}
              <Text style={styles.highlight}>{experience}</Text> of expertise in
              diagnosing and treating heart-related conditions. He has attended
              to over <Text style={styles.highlight}>{patients}</Text>{" "}
              patients, achieving an impressive{" "}
              <Text style={styles.highlight}>{successRate}</Text> success rate.
              His exceptional skills are reflected in his{" ⭐"}
              <Text style={styles.highlight}>{rating}</Text> rating, making him
              a trusted specialist in managing hypertension, heart disease, and
              related problems.
            </Text>
          </View>

          {/* Fees Section with 4 Cards */}
          <View style={styles.feesContainer}>
            {feesData.map((fee, index) => (
              <LinearGradient
                key={index}
                colors={["#ffffff", "#f7f9fc"]}
                style={styles.feeCard}
              >
                <Text style={styles.feeValue}>{fee.value}</Text>
                <Text style={styles.feeLabel}>{fee.label}</Text>
              </LinearGradient>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleBack} style={styles.continueButton}>
          <LinearGradient
            colors={["#2a7fba", "#1e6ca0"]}
            style={styles.buttonGradient}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerContainer: {
    marginTop: 43,
  },
  contentContainer: {
    padding: 16,
  },
  profileCard: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  profileGradient: {
    padding: 24,
    alignItems: "center",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#2a7fba",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e2a44",
    marginTop: 12,
  },
  speciality: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2a7fba",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    textTransform: "uppercase",
  },
  aboutContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 20,
    marginTop: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e2a44",
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 22,
  },
  highlight: {
    fontWeight: "600",
    color: "#2a7fba",
  },
  feesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  feeCard: {
    width: "48%",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom: 12,
  },
  feeValue: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2a7fba",
  },
  feeLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 6,
    textTransform: "uppercase",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  continueButton: {
    borderRadius: 30,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    width: "100%",
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 18,
  },
});

export default DoctorProfile;