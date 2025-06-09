import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import Header from "../components/Header";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCustomerDocListView } from "./../services/productServices";
import R1 from "../../assets/images/R1.png";
import R2 from "../../assets/images/R2.png";
import R3 from "../../assets/images/R3.png";
import R4 from "../../assets/images/R4.png";

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 80) / 2; // Adjusted for better spacing when centered

const REPORT_TYPES = [
  { key: "RX-001", label: "Prescription", image: R4 },
  { key: "LAB-001", label: "Lab Reports", image: R1 },
  { key: "RAD-RPT-001", label: "Radiology Reports", image: R2 },
  { key: "DS-001", label: "Discharge Summary", image: R3 },
  { key: "RAD-IMG-001", label: "Radiology Images", image: R2 },
];

const ReportMain = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableTypes, setAvailableTypes] = useState([]);

  const fetchReportTypes = async () => {
    try {
      setError(null);
      const Customer_id = await AsyncStorage.getItem("Customer_id");
      if (!Customer_id) throw new Error("Customer ID not found");

      const response = await getCustomerDocListView(Customer_id);
      if (response && response.data) {
        const uniqueCodes = [...new Set(response.data.map((item) => item.document_code))];
        console.log("Available document codes from API:", uniqueCodes);
        const available = REPORT_TYPES.filter((type) => uniqueCodes.includes(type.key));
        setAvailableTypes(available);
      } else {
        setError("No reports found");
        setAvailableTypes([]);
      }
    } catch (err) {
      console.error("Error fetching report types:", err);
      setError("Failed to load data. Please try again.");
      setAvailableTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportTypes();
  }, []);

  const handleTypePress = (documentCode) => {
    console.log("Navigating to ReportScreen with documentCode:", documentCode);
    router.push({
      pathname: "/Reports",
      params: { documentCode },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#2a7fba" style="light" />
        <Header title="My Reports" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2a7fba" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2a7fba" style="light" />
      <Header title="My Reports" showBackButton={true} />
      <View style={styles.content}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchReportTypes}>
              <Text style={styles.buttonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : availableTypes.length === 0 ? (
          <View style={styles.noReportsContainer}>
            <Text style={styles.noReportsText}>No Reports Available</Text>
            <Text style={styles.noReportsSubText}>Add your first report to get started!</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {availableTypes.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={styles.card}
                onPress={() => handleTypePress(type.key)}
                activeOpacity={0.8}
              >
                <Image source={type.image} style={styles.cardImage} />
                <Text style={styles.cardText}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 30,
  },
  content: {
    flex: 1,
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
    paddingHorizontal: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center", // Center cards in the row
    alignItems: "center", // Center cards vertically within the row
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: "#f5f9fc",
    borderRadius: 12,
    margin: 10, // Add margin for spacing between cards
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    padding: 20,
  },
  cardImage: {
    width: 54,
    height: 54,
    marginBottom: 10,
    resizeMode: "contain",
  },
  cardText: {
    color: "#2986cc",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    color: "#ff0000",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#2a7fba",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  noReportsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  noReportsText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
    textAlign: "center",
  },
  noReportsSubText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default ReportMain;