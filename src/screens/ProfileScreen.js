import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { AppContext } from '../../context/AppContext';
import { getProfileInfo } from '../services/authServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut, SlideInLeft } from 'react-native-reanimated';

const ProfileScreen = () => {
    const { logout } = useContext(AppContext);
    const [profile, setProfile] = useState({});
    const [isManager, setIsManager] = useState(false);
    const [userPin, setUserPin] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUserPin = async () => {
            const storedPin = await AsyncStorage.getItem('userPin');
            setUserPin(storedPin);
        };
        fetchUserPin();
    }, []);

    useEffect(() => {
        getProfileInfo().then((res) => {
            setProfile(res.data);
            setIsManager(res.data?.user_group?.is_manager || false);
        });
    }, []);

    const handlePressPassword = () => {
        router.push({ pathname: 'ResetPassword' });
    };

    return (
        <View style={styles.container}>
            <Header title="Profile" showBackButton={true} />
            
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Profile Header */}
                <Animated.View 
                    style={styles.profileHeader}
                    entering={FadeIn.duration(500)}
                >
                    <Animated.View 
                        style={styles.avatarContainer}
                        entering={FadeIn.duration(700)}
                    >
                        <Image 
                            source={{ uri: profile?.image || 'https://via.placeholder.com/150' }} 
                            style={styles.profileImage} 
                        />
                    </Animated.View>
                    <Animated.Text 
                        style={styles.userName}
                        entering={FadeIn.duration(600)}
                    >
                        {profile?.emp_data?.name}
                    </Animated.Text>
                    
                    {/* Manager Status */}
                    <Animated.View 
                        style={styles.managerContainer}
                        entering={SlideInLeft.delay(300)}
                    >
                        <Text style={styles.managerText}>Is Manager:</Text>
                        <MaterialCommunityIcons
                            name={isManager ? "check-circle" : "cancel"}
                            size={20}
                            color={isManager ? "#2a7fba" : "#d9534f"}
                        />
                    </Animated.View>
                    
                    {/* Stats Row */}
                    <View style={styles.statsContainer}>
                        <Animated.View 
                            style={styles.statItem}
                            entering={SlideInLeft.delay(400)}
                        >
                            <Text style={styles.statValue}>{profile?.age || '--'}</Text>
                            <Text style={styles.statLabel}>Age</Text>
                        </Animated.View>
                        <Animated.View 
                            style={styles.statItem}
                            entering={SlideInLeft.delay(450)}
                        >
                            <Text style={styles.statValue}>{profile?.gender || '--'}</Text>
                            <Text style={styles.statLabel}>Gender</Text>
                        </Animated.View>
                        <Animated.View 
                            style={styles.statItem}
                            entering={SlideInLeft.delay(500)}
                        >
                            <Text style={styles.statValue}>{profile?.blood_group || '--'}</Text>
                            <Text style={styles.statLabel}>Blood</Text>
                        </Animated.View>
                    </View>
                </Animated.View>

                {/* Main Card */}
                <Animated.View 
                    style={styles.mainCard}
                    entering={FadeIn.delay(300)}
                >
                    {/* Personal Information Section */}
                    <View style={styles.cardSection}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="account-circle" size={20} color="#2a7fba" />
                            <Text style={styles.sectionTitle}>Personal Information</Text>
                        </View>
                        
                        <Animated.View 
                            style={styles.infoRow}
                            entering={SlideInLeft.delay(400)}
                        >
                            <Text style={styles.infoLabel}>User ID</Text>
                            <Text style={styles.infoValue}>{profile?.emp_data?.emp_id || 'Not specified'}</Text>
                        </Animated.View>
                        <Animated.View 
                            style={styles.infoRow}
                            entering={SlideInLeft.delay(500)}
                        >
                            <Text style={styles.infoLabel}>Address</Text>
                            <Text style={styles.infoValue}>{profile?.address || 'Not specified'}</Text>
                        </Animated.View>
                        <Animated.View 
                            style={styles.infoRow}
                            entering={SlideInLeft.delay(550)}
                        >
                            <Text style={styles.infoLabel}>Phone</Text>
                            <Text style={styles.infoValue}>{profile?.mobile_number || 'Not specified'}</Text>
                        </Animated.View>
                    </View>

                    {/* Emergency Contact Section */}
                    <View style={styles.cardSection}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="alert-circle" size={20} color="#ffc433" />
                            <Text style={styles.sectionTitle}>Emergency Contact</Text>
                        </View>
                        
                        <Animated.View 
                            style={styles.infoRow}
                            entering={SlideInLeft.delay(600)}
                        >
                            <Text style={styles.infoLabel}>Name</Text>
                            <Text style={styles.infoValue}>{profile?.emergency_contact?.name || 'Not specified'}</Text>
                        </Animated.View>
                        <Animated.View 
                            style={styles.infoRow}
                            entering={SlideInLeft.delay(650)}
                        >
                            <Text style={styles.infoLabel}>Phone</Text>
                            <Text style={styles.infoValue}>{profile?.emergency_contact?.phone || 'Not specified'}</Text>
                        </Animated.View>
                        <Animated.View 
                            style={styles.infoRow}
                            entering={SlideInLeft.delay(650)}
                        >
                            <Text style={styles.infoLabel}>Relationship</Text>
                            <Text style={styles.infoValue}>{profile?.emergency_contact?.relationship || 'Not specified'}</Text>
                        </Animated.View>
                    </View>

                    {/* Action Items */}
                    <View style={styles.cardSection}>
                        {/* Set/Update Pin moved to the top of action items */}
                        <TouchableOpacity 
                            style={styles.actionItem}
                            onPress={handlePressPassword}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#e6f2ff' }]}>
                                <MaterialCommunityIcons name="lock" size={20} color="#4d88ff" />
                            </View>
                            <Text style={[styles.actionText, { color: '#4d88ff' }]}>
                                {userPin ? "Update Your Pin" : "Set Your Pin"}
                            </Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
                        </TouchableOpacity>
                        
                        <View style={styles.divider} />
                        
                        <TouchableOpacity style={styles.actionItem}>
                            <View style={styles.actionIcon}>
                                <MaterialCommunityIcons name="cog" size={20} color="#555" />
                            </View>
                            <Text style={styles.actionText}>Settings</Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
                        </TouchableOpacity>
                        
                        <View style={styles.divider} />
                        
                        <TouchableOpacity 
                            style={styles.actionItem} 
                            onPress={logout}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#ffebee' }]}>
                                <MaterialCommunityIcons name="logout" size={20} color="#d9534f" />
                            </View>
                            <Text style={[styles.actionText, { color: '#d9534f' }]}>Log Out</Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#f5f7fa',
  },
  scrollContainer: {
      paddingBottom: 30,
  },
  profileHeader: {
      alignItems: 'center',
      paddingVertical: 25,
      backgroundColor: '#fff',
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
  },
  avatarContainer: {
      backgroundColor: '#e0f7fa',
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
      borderWidth: 3,
      borderColor: '#2a7fba',
  },
  profileImage: {
      width: 110,
      height: 110,
      borderRadius: 55,
  },
  userName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 10,
  },
  managerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
  },
  managerText: {
      fontSize: 16,
      color: '#333',
      marginRight: 10,
  },
  statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '80%',
  },
  statItem: {
      alignItems: 'center',
      padding: 10,
      backgroundColor: '#f0f8ff',
      borderRadius: 10,
      width: '30%',
  },
  statValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#2a7fba',
  },
  statLabel: {
      fontSize: 14,
      color: '#666',
      marginTop: 5,
  },
  mainCard: {
      backgroundColor: '#fff',
      borderRadius: 15,
      marginHorizontal: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
      overflow: 'hidden',
  },
  cardSection: {
      paddingHorizontal: 20,
      paddingVertical: 15,
  },
  sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
      marginLeft: 10,
  },
  infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
      fontSize: 16,
      color: '#666',
  },
  infoValue: {
      fontSize: 16,
      color: '#333',
      fontWeight: '500',
      textAlign: 'right',
      flex: 1,
      paddingLeft: 10,
  },
  actionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
  },
  actionIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
  },
  actionText: {
      fontSize: 16,
      color: '#333',
      flex: 1,
  },
  divider: {
      height: 1,
      backgroundColor: '#f0f0f0',
      marginVertical: 5,
  },
});

export default ProfileScreen;