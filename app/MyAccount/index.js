import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from './../../src/components/Header';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const MyAccount = () => {
    const router = useRouter();
    
    const menuItems = [
        { 
            icon: 'account-edit', 
            label: 'Edit Profile', 
            color: '#2a7fba', 
            action: () => router.push('/edit-personal-info') 
        },
        { 
            icon: 'alert-box', 
            label: 'Edit Emergency Contact', 
            color: '#ff914d', 
            action: () => router.push('/edit-emergency-contact') 
        },
        { 
            icon: 'email', 
            label: 'Contact Us', 
            color: '#666', 
            action: () => router.push('/contact') 
        },
        { 
            icon: 'file-document-edit', 
            label: 'Terms of Use', 
            color: '#666', 
            action: () => router.push('/terms') 
        },
        { 
            icon: 'shield-lock', 
            label: 'Privacy Policy', 
            color: '#666', 
            action: () => router.push('/privacy') 
        },
        { 
            icon: 'security', 
            label: 'Privacy Choices', 
            color: '#666', 
            action: () => router.push('/privacy-choices') 
        },
        { 
            icon: 'message-alert', 
            label: 'Send App Feedback', 
            color: '#666', 
            action: () => router.push('/feedback') 
        },
        { 
            icon: 'share-variant', 
            label: 'Share App', 
            color: '#666', 
            action: () => router.push('/share') 
        },
    ];

    return (
        <View style={styles.container}>
            <Header title="My Account" showBackButton={true} />
            
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Animated.View 
                    style={styles.mainCard}
                    entering={FadeIn.duration(300)}
                >
                    {menuItems.map((item, index) => (
                        <View key={index}>
                            <TouchableOpacity 
                                style={styles.menuItem} 
                                onPress={item.action}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                                    <MaterialCommunityIcons 
                                        name={item.icon} 
                                        size={22} 
                                        color={item.color} 
                                    />
                                </View>
                                <Text style={styles.menuText}>{item.label}</Text>
                                <MaterialCommunityIcons 
                                    name="chevron-right" 
                                    size={20} 
                                    color="#999" 
                                />
                            </TouchableOpacity>
                            {index !== menuItems.length - 1 && <View style={styles.divider} />}
                        </View>
                    ))}
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
    mainCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        marginHorizontal: 15,
        marginTop: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 20,
    },
});

export default MyAccount;