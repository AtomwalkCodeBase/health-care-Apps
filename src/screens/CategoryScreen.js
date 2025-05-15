import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 60) / 2;

import Header from './../components/Header';
import LabImg from '../../assets/images/R1.png';
import MedicineImg from '../../assets/images/R2.png';
import DietImg from '../../assets/images/R3.png';
import ExerciseImg from '../../assets/images/R4.png';

const categories = [
  { label: 'Audio', image: LabImg, route: '/AudioTask' },
  { label: 'Medicine', image: MedicineImg, route: '/MedicineTask' },
  { label: 'Diet/Nutrition', image: DietImg, route: '/DietTask' },
  { label: 'Exercise', image: ExerciseImg, route: '/ExerciseTask' },
];

const CategoryTask = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2a7fba" style="light" />
      <Header title="My Tasks" showBackButton={true} />

      {/* Category Grid */}
      <View style={styles.grid}>
        {categories.map((cat, idx) => (
          <TouchableOpacity
            style={styles.card}
            key={idx}
            activeOpacity={0.8}
            onPress={() => router.push(cat.route)}
          >
            <Image source={cat.image} style={styles.cardImage} />
            <Text style={styles.cardText}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 40
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2986cc',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  backBtn: {
    marginRight: 10,
    paddingVertical: 8,
    paddingRight: 8,
  },
  backArrow: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 32,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: 60,
    height: 60,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  cardText: {
    color: '#2986cc',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CategoryTask;
