import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
} from "react-native";
import Header from "./../components/Header";
import { StatusBar } from "expo-status-bar";
import { getCustomerDocListView } from "./../services/productServices";
import * as Linking from "expo-linking";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";

const REPORT_TYPES = [
  { key: "all", label: "All Types" },
  { key: "RX-001", label: "Prescription" },
  { key: "LAB-001", label: "Lab Report" },
  { key: "RAD-RPT-001", label: "Radiology Report" },
  { key: "DS-001", label: "Discharge Summary" },
  { key: "RAD-IMG-001", label: "Radiology Images" },
];

const ReportScreen = () => {
  const { documentCode } = useLocalSearchParams();
  console.log("Received documentCode in ReportScreen:", documentCode);

  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState(documentCode || "all");
  const [availableTypes, setAvailableTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  const fetchReports = async () => {
    try {
      setError(null);
      const Customer_id = await AsyncStorage.getItem("Customer_id");
      if (!Customer_id) throw new Error("Customer ID not found");
      const response = await getCustomerDocListView(Customer_id);
      if (response && response.data) {
        const mappedReports = response.data.map((item) => ({
          id: item.id,
          title: item.document_name,
          date: item.valid_from_date,
          document_file: item.document_file,
          document_code: item.document_code,
          valid_to_date: item.valid_to_date,
          description: item.remarks || "No remarks provided",
        }));
        setReports(mappedReports);
        setFilteredReports(mappedReports);

        const uniqueCodes = [...new Set(mappedReports.map((report) => report.document_code))];
        const available = REPORT_TYPES.filter(
          (type) => type.key === "all" || uniqueCodes.includes(type.key)
        );
        setAvailableTypes(available);
      } else {
        setError("No data received from server");
        setAvailableTypes([REPORT_TYPES[0]]);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to fetch reports. Please try again later.");
      setAvailableTypes([REPORT_TYPES[0]]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (documentCode && REPORT_TYPES.some((type) => type.key === documentCode)) {
      setSelectedType(documentCode);
    } else {
      setSelectedType("all");
    }
  }, [documentCode]);

  useEffect(() => {
    let filtered = reports;

    if (selectedType !== "all") {
      filtered = filtered.filter((report) => report.document_code === selectedType);
      // console.log("Filtered reports for selectedType:", selectedType, filtered);
    }

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((report) =>
        report.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  }, [searchQuery, selectedType, reports]);

  const onRefresh = () => {
    setRefreshing(true);
    setSearchQuery("");
    setSelectedType("all");
    fetchReports();
  };

  const handleViewReport = async (documentFile) => {
    if (!documentFile || typeof documentFile !== "string") {
      Alert.alert("Error", "Invalid document URL.");
      return;
    }

    try {
      const supported = await Linking.canOpenURL(documentFile);
      if (!supported) {
        Alert.alert("Error", "This document type cannot be opened on your device.");
        return;
      }

      await Linking.openURL(documentFile);
    } catch (err) {
      console.error("Error opening document:", err);
      Alert.alert(
        "Error",
        "Failed to open the document. Please ensure you have a compatible app installed (e.g., a PDF viewer or image viewer)."
      );
    }
  };

  const toggleDescription = (reportId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [reportId]: !prev[reportId],
    }));
  };

  const renderReport = ({ item }) => {
    const isExpanded = expandedDescriptions[item.id] || false;
    const shouldTruncate = item.description.length > 100 && !isExpanded; // Truncate if description is longer than 100 characters

    return (
      <View style={styles.reportCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.reportTitle}>{item.title}</Text>
          <Text style={styles.reportDetail}>
            Type: {REPORT_TYPES.find((type) => type.key === item.document_code)?.label || "Unknown"}
          </Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.reportDate}>Valid From: {item.date}</Text>
          <Text style={styles.reportDetail}>Valid To: {item.valid_to_date}</Text>
          <Text
            style={styles.reportDescription}
            numberOfLines={shouldTruncate ? 2 : undefined}
            ellipsizeMode={shouldTruncate ? "tail" : undefined}
          >
            {item.description}
          </Text>
          {item.description.length > 100 && (
            <TouchableOpacity
              style={styles.readMoreButton}
              onPress={() => toggleDescription(item.id)}
            >
              <Text style={styles.readMoreText}>
                {isExpanded ? "Read Less" : "Read More"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => handleViewReport(item.document_file)}
        >
          <Text style={styles.viewButtonText}>View Report</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTypeCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.typeCard,
        selectedType === item.key && styles.typeCardActive,
      ]}
      onPress={() => setSelectedType(item.key)}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.typeCardText,
          selectedType === item.key && styles.typeCardTextActive,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
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
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={availableTypes}
          renderItem={renderTypeCard}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeCardContainer}
        />
      </View>
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color="#777"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search reports by name..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
      </View>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchReports}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredReports.length === 0 ? (
        <View style={styles.content}>
          <Text style={styles.title}>
            {searchQuery || selectedType !== "all" ? "No Matching Reports" : "No Reports Found"}
          </Text>
          <Text style={styles.subtitle}>
            {searchQuery || selectedType !== "all"
              ? "Try a different search term or filter."
              : "Add your first lab report!"}
          </Text>
          {!(searchQuery || selectedType !== "all") && (
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>ADD A REPORT</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          renderItem={renderReport}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 30,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  typeCardContainer: {
    paddingVertical: 5,
  },
  typeCard: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#e5e5e5",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#d1d1d1",
  },
  typeCardActive: {
    backgroundColor: "#2a7fba",
    borderColor: "#2a7fba",
  },
  typeCardText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
  },
  typeCardTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  searchIcon: {
    position: "absolute",
    left: 28,
    top: 22,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 12,
    paddingLeft: 40,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
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
  listContainer: {
    padding: 16,
  },
  reportCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    paddingBottom: 10,
    marginBottom: 10,
  },
  cardBody: {
    marginBottom: 12,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 6,
  },
  reportDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  reportDescription: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  reportDetail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  readMoreButton: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
  readMoreText: {
    color: "#2a7fba",
    fontSize: 14,
    fontWeight: "600",
  },
  viewButton: {
    backgroundColor: "#2a7fba",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2a7fba",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ReportScreen;