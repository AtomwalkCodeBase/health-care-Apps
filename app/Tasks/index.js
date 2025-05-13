import React, { useState, useEffect } from 'react';
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
import { Audio } from 'expo-av';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MiniPlayer from './../../src/components/MiniPlayer';

const musicTracks = [
  {
    id: '1',
    title: 'Krishna Flute',
    artist: 'krishna',
    artwork: require('./../../assets/images/waveform.png'),
    audioFile: require('./../../assets/music/krishnaFlute.mp3'),
  },
  {
    id: '2',
    title: 'Samurai Flute',
    artist: 'Samurai',
    artwork: require('./../../assets/images/waveform.png'),
    audioFile: require('./../../assets/music/samurai.mp3'),
  },
  {
    id: '3',
    title: 'Zindagi Do Pal Ki',
    artist: 'K.K',
    artwork: require('./../../assets/images/waveform.png'),
    audioFile: require('./../../assets/music/zindagi.mp3'),
  },
];

export default function MyTasks() {
  const [sound, setSound] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const router = useRouter();

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
  };

  // --- FIXED LOGIC HERE ---
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
        track.audioFile,
        { shouldPlay: true },
        handlePlaybackStatusUpdate
      );

      setSound(newSound);
      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (error) {
      console.error('Playback error:', error);
    } finally {
      setLoadingId(null);
    }
  };
  // --- END FIXED LOGIC ---

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
        <Image source={item.artwork} style={styles.trackArtwork} />
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle}>{item.title}</Text>
          <Text style={styles.trackArtist}>{item.artist}</Text>
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
        <FlatList
          data={musicTracks}
          keyExtractor={(item) => item.id}
          renderItem={renderTrackItem}
          contentContainerStyle={styles.tracksList}
        />
      </View>

      {currentTrack && (
        <MiniPlayer
          sound={sound}
          track={currentTrack}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onNext={() => {
            const currentIndex = musicTracks.findIndex(t => t.id === currentTrack.id);
            const nextIndex = (currentIndex + 1) % musicTracks.length;
            playTrack(musicTracks[nextIndex]);
          }}
          onPrevious={() => {
            const currentIndex = musicTracks.findIndex(t => t.id === currentTrack.id);
            const prevIndex = currentIndex === 0 ? musicTracks.length - 1 : currentIndex - 1;
            playTrack(musicTracks[prevIndex]);
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
});
