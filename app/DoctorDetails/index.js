import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Header from "../../src/components/Header";
import { router, useLocalSearchParams } from "expo-router";

const DoctorProfile = () => {
  const item = useLocalSearchParams();

  const handleBack = () => {
    router.back()
  };

  return (
    <ScrollView style={styles.headercontainer}>
      {/* Header */}
      <StatusBar backgroundColor="#2a7fba" barStyle="light-content" />
      <Header title="Doctor Profile" />
    <View style={styles.profileCard}>
      {/* Profile Card */}
      <View>
        <Image
          source={{ uri: item.Image }}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.speciality}>Cardiologist</Text>
      </View>

      {/* Experience, Rating, and Patients Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>12 years</Text>
          <Text style={styles.statLabel}>Experience</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>4.8</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>2500+</Text>
          <Text style={styles.statLabel}>Patients</Text>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.aboutContainer}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          Dr. Thomas Michael is a highly experienced cardiologist with 15+ years
          of expertise in diagnosing and treating heart-related conditions. He
          specializes in managing hypertension, heart disease, and related problems.
        </Text>
      </View>

      {/* Fees & Session Cards */}
      <View style={styles.feesContainer}>
        <View style={styles.feeCard}>
          <Text style={styles.feeValue}>₹300</Text>
          <Text style={styles.feeLabel}>Consultation Fee</Text>
        </View>
        <View style={styles.feeCard}>
          <Text style={styles.feeValue}>30 mins</Text>
          <Text style={styles.feeLabel}>Avg. Session</Text>
        </View>
        <View style={styles.feeCard}>
          <Text style={styles.feeValue}>1500+</Text>
          <Text style={styles.feeLabel}>Attended Patients</Text>
        </View>
      </View>
      </View>

      {/* Continue Button */}
      <TouchableOpacity onPress={handleBack} style={styles.continueButton}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headercontainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    // padding: 18,
    marginTop: 45,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 16,
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 75,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
  },
  speciality: {
    color: "gray",
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  aboutContainer: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 10,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#2c3e50",
  },
  aboutText: {
    color: "gray",
    fontSize: 14,
  },
  feesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  feeCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feeValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  feeLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  continueButton: {
    backgroundColor: "#2a7fba",
    padding: 18,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  continueButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default DoctorProfile;
