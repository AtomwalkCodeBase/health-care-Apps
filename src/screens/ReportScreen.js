import React, { useEffect, useState } from "react";
import { 
  View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView 
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Icon from 'react-native-vector-icons/MaterialIcons'; // Using Material Icons for bottom nav
import Header from '../components/Header';

const ReportsScreen = () => {
  const [reports, setReports] = useState({
    lab: 0,
    radiology: 0,
    discharge: 0,
    prescription: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch reports from API (mocked for now, replace with your API endpoint)
  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Replace this with your actual API endpoint
        // const response = await fetch('https://your-api-endpoint/reports');
        // const data = await response.json();

        // Mock API response
        const data = {
          lab: 3,
          radiology: 1,
          discharge: 2,
          prescription: 5,
        };

        setReports(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Data for the report cards
  const reportData = [
    { id: '1', title: 'Lab Reports', count: reports.lab },
    { id: '2', title: 'Radiology Reports', count: reports.radiology },
    { id: '3', title: 'Discharge Summary', count: reports.discharge },
    { id: '4', title: 'Prescription', count: reports.prescription },
  ];

  // Render each report card
  const renderReportCard = ({ item }) => (
    <TouchableOpacity style={styles.reportCard}>
      <Text style={styles.reportTitle}>{item.title}</Text>
      <Text style={styles.reportSubtitle}>
        {item.count} {item.count === 1 ? 'report' : 'reports'} available
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2a7fba" barStyle="light-content" />
      
      <Header title="My Reports" />
      
      <View style={styles.contentContainer}>
        <Text style={styles.subHeader}>Your Reports</Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading reports...</Text>
        ) : (
          <FlatList
            data={reportData}
            renderItem={renderReportCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home" size={24} color="#6B7280" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="description" size={24} color="#2a7fba" />
          <Text style={[styles.navText, { color: '#2a7fba' }]}>My Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="person" size={24} color="#6B7280" />
          <Text style={styles.navText}>Profile</Text>
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
  listContent: {
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  reportCard: {
    width: '48%', // Adjust for 2 columns
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d1d1",
    alignItems: "center",
    justifyContent: "center",
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 5,
  },
  reportSubtitle: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
  },
  loadingText: {
    textAlign: "center",
    color: "#777",
    fontSize: 16,
  },
  bottomNav: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#d1d1d1",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    marginTop: 4,
    fontSize: 12,
    color: "#6B7280",
  },
});

export default ReportsScreen;