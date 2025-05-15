import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getusertasklistview } from '../../src/services/productServices';
import { useRouter } from 'expo-router';
import MiniPlayer from '../../src/components/MiniPlayer';

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({ visible: false, message: '' });
  const [sound, setSound] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const router = useRouter();

  // Get customer ID from AsyncStorage
  const getCustomerId = async () => {
    const customerId = await AsyncStorage.getItem('Customer_id');
    return customerId ? parseInt(customerId, 10) : null;
  };

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const customerId = await getCustomerId();
      const res = await getusertasklistview('ALL', 46);
      // Filter tasks to only include audio files
      const audioTasks = res.data.filter(task => 
        task.ref_file && (
          task.ref_file.toLowerCase().includes('.mp3') ||
          task.ref_file.toLowerCase().endsWith('.wav') ||
          task.ref_file.toLowerCase().endsWith('.m4a')
        )
      );
      setTasks(audioTasks);
    } catch (err) {
      console.error('Failed to fetch tasks:', err.message);
      setError({ visible: true, message: 'Failed to load tasks' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handle hardware back button
  useEffect(() => {
    const backAction = () => {
      handleBack();
      return true; // Prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [sound]);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.stopAsync();
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handlePlaybackStatusUpdate = (status) => {
    setIsPlaying(status.isPlaying);
    if (status.didJustFinish) {
      setCurrentTrack(null);
    }
  };

  const playTrack = async (track) => {
    try {
      // If clicking the same track that's currently loaded
      if (currentTrack?.id === track.id && sound) {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
        return;
      }

      setLoadingId(track.id);

      // Stop previous sound if exists
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      // Load new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.ref_file },
        { shouldPlay: true },
        handlePlaybackStatusUpdate
      );

      setSound(newSound);
      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (error) {
      console.error('Playback error:', error);
      setError({ visible: true, message: 'Failed to play audio' });
    } finally {
      setLoadingId(null);
    }
  };

  const handlePlayPause = async () => {
    if (!sound) return;
    isPlaying ? await sound.pauseAsync() : await sound.playAsync();
  };

  const handleBack = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setCurrentTrack(null);
      setIsPlaying(false);
    }
    router.back();
  };

  const renderTrackItem = ({ item }) => {
    const isCurrent = currentTrack?.id === item.id;
    const isLoading = loadingId === item.id;

    return (
      <View style={styles.trackItem}>
        <Image 
          source={require('./../../assets/images/waveform.png')} 
          style={styles.trackArtwork} 
        />
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle}>{item.task_type || 'Audio Task'}</Text>
          <Text style={styles.trackArtist}>Singer: {item.customer.name}</Text>
        </View>
        <View style={styles.trackControls}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => playTrack(item)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : isCurrent ? (
              <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="white" />
            ) : (
              <Ionicons name="play" size={24} color="white" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.downloadButton}>
            <MaterialIcons name="file-download" size={24} color="#2a7fba" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2a7fba" />
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Tasks</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Listen this!</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2a7fba" />
          </View>
        ) : error.visible ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error.message}</Text>
          </View>
        ) : tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No audio tasks available.</Text>
          </View>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTrackItem}
            contentContainerStyle={styles.tracksList}
          />
        )}
      </View>

      {currentTrack && (
        <MiniPlayer
          sound={sound}
          track={{
            ...currentTrack,
            title: currentTrack.task_type || 'Audio Task',
            artist: `Customer ID: ${currentTrack.customer.id}`,
            artwork: require('./../../assets/images/waveform.png'),
          }}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onNext={() => {
            const currentIndex = tasks.findIndex(t => t.id === currentTrack.id);
            const nextIndex = (currentIndex + 1) % tasks.length;
            playTrack(tasks[nextIndex]);
          }}
          onPrevious={() => {
            const currentIndex = tasks.findIndex(t => t.id === currentTrack.id);
            const prevIndex = currentIndex === 0 ? tasks.length - 1 : currentIndex - 1;
            playTrack(tasks[prevIndex]);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerSafeArea: {
    backgroundColor: '#2a7fba',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 20,
    backgroundColor: '#2a7fba',
  },
  backButton: { padding: 4 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '600' },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  tracksList: { paddingBottom: 16 },
  trackItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  trackArtwork: { width: 48, height: 48, borderRadius: 6, backgroundColor: '#000' },
  trackInfo: { flex: 1, marginLeft: 12 },
  trackTitle: { fontSize: 16, fontWeight: '600' },
  trackArtist: { fontSize: 14, color: '#666', marginTop: 2 },
  trackControls: { flexDirection: 'row', alignItems: 'center' },
  playButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#2a7fba',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  downloadButton: { padding: 4 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});