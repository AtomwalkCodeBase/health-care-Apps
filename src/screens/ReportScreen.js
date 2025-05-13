import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
import Header from './../components/Header';
import { StatusBar } from 'expo-status-bar';
import R1 from '../../assets/images/R1.png';
import R2 from '../../assets/images/R2.png';
import R3 from '../../assets/images/R3.png';
import R4 from '../../assets/images/R4.png';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 60) / 2;

const Report = () => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2a7fba" style="light" />
      <Header title="My Reports" showBackButton={true} />

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card}>
          <Image source={R4} style={styles.cardImage} />
          <Text style={styles.cardText}>Prescription</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card}>
          <Image source={R1} style={styles.cardImage} />
          <Text style={styles.cardText}>Lab Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card}>
          <Image source={R2} style={styles.cardImage} />
          <Text style={styles.cardText}>Radiology Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card}>
          <Image source={R3} style={styles.cardImage} />
          <Text style={styles.cardText}>Discharge summary</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 40, 
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 200,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: '#f5f9fc',
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
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
    resizeMode: 'contain',
  },
  cardText: {
    color: '#2986cc',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default Report;
