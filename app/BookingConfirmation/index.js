import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "../../src/components/Header";
import { StatusBar } from "expo-status-bar";

const BookingConfirmation = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Format the date to show day, date and year
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const date = new Date();
    const dayName = days[date.getDay()];
    const dateNum = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName}, ${dateNum} ${monthName} ${year}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2a7fba" barStyle="light-content" />
      <Header 
        title="Confirm Booking" 
        showBackButton 
        onBackPress={() => router.back()} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Doctor Information Card */}
        <View style={styles.card}>
          <View style={styles.doctorInfoContainer}>
            <Image source={{ uri: params.image }} style={styles.doctorImage} />
            <View style={styles.doctorTextContainer}>
              <Text style={styles.doctorName}>{params.doctorName}</Text>
              <Text style={styles.specialization}>{params.specialty}</Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#FFA000" />
                <Text style={styles.ratingText}>4.9 (500 reviews)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Booking Details Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Icon name="calendar-today" size={20} color="#2a7fba" />
            </View>
            <View>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailText}>{formatDate(params.date)}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Icon name="access-time" size={20} color="#2a7fba" />
            </View>
            <View>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailText}>{params.time}</Text>
            </View>
          </View>
        </View>

        {/* Payment Summary Card */}
        <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#2a7fba' }]}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Consultation Fee:</Text>
            <Text style={styles.paymentValue}>{params.fee}</Text>
          </View>
          <View style={styles.divider} />
          <View style={[styles.paymentRow, { marginTop: 12 }]}>
            <Text style={[styles.paymentLabel, styles.totalLabel]}>Total Amount:</Text>
            <Text style={[styles.paymentValue, styles.totalValue]}>{params.fee}</Text>
          </View>
        </View>

        {/* Policy Notice */}
        <View style={styles.policyContainer}>
          <Icon name="info" size={18} color="#666" style={styles.infoIcon} />
          <Text style={styles.policyText}>
            By confirming, you agree to our booking policy. Cancellations must be made at least 2 hours before the scheduled time.
          </Text>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <TouchableOpacity 
        style={styles.confirmButton}
        onPress={() => router.push("/BookingSuccess")}
      >
        <Text style={styles.confirmButtonText}>Confirm Booking</Text>
        <Icon name="arrow-forward" size={20} color="white" style={styles.buttonIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingVertical:25,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  doctorInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#2a7fba",
  },
  doctorTextContainer: {
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
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2a7fba",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  iconContainer: {
    backgroundColor: "#E3F2FD",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: "#888",
    marginBottom: 2,
  },
  detailText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#2c3e50",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: "#666",
  },
  paymentValue: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "500",
  },
  totalLabel: {
    fontWeight: "600",
  },
  totalValue: {
    color: "#2a7fba",
    fontWeight: "bold",
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 8,
  },
  policyContainer: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  policyText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
    flex: 1,
  },
  confirmButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#2a7fba",
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});

export default BookingConfirmation;