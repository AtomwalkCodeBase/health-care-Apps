import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import MiniPlayer from './../../src/components/MiniPlayer';

const musicTracks = [
  {
    id: '1',
    title: 'Mix of the day #3',
    artist: 'Arctic Monkeys',
    artwork: require('./../../assets/images/waveform.png'),
    audioFile: require('./../../assets/music/krishnaFlute.mp3'),
  },
  {
    id: '2',
    title: 'Mix of the day #3',
    artist: 'Arctic Monkeys',
    artwork: require('./../../assets/images/waveform.png'),
    audioFile: require('./../../assets/music/samurai.mp3'),
  },
  {
    id: '3',
    title: 'Mix of the day #3',
    artist: 'Arctic Monkeys',
    artwork: require('./../../assets/images/waveform.png'),
    audioFile: require('./../../assets/music/krishnaFlute.mp3'),
  },
];

export default function MyTasks({ navigation }) {
  const [sound, setSound] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handlePlaybackStatusUpdate = (status) => {
    setIsPlaying(status.isPlaying);
  };

  const playTrack = async (track) => {
    if (sound) {
      await sound.unloadAsync();
    }
    const { sound: newSound } = await Audio.Sound.createAsync(
      track.audioFile,
      { shouldPlay: true },
      handlePlaybackStatusUpdate
    );
    setSound(newSound);
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handlePlayPause = async () => {
    if (!sound) return;
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const renderTrackItem = ({ item }) => (
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
        >
          <Ionicons name="play" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.downloadButton}>
          <MaterialIcons name="file-download" size={24} color="#2a7fba" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#2a7fba" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation && navigation.goBack && navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Tasks</Text>
        <View style={{ width: 24 }} />
      </View>
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
          track={currentTrack}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onNext={() => {
            const currentIndex = musicTracks.findIndex(
              (t) => t.id === currentTrack.id
            );
            const nextIndex = (currentIndex + 1) % musicTracks.length;
            playTrack(musicTracks[nextIndex]);
          }}
          onPrevious={() => {
            const currentIndex = musicTracks.findIndex(
              (t) => t.id === currentTrack.id
            );
            const prevIndex =
              currentIndex === 0 ? musicTracks.length - 1 : currentIndex - 1;
            playTrack(musicTracks[prevIndex]);
          }}
        />
      )}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="home-outline" size={24} color="#333" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, styles.tabItemActive]}>
          <Ionicons name="calendar-outline" size={24} color="#2a7fba" />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>
            My Appointments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="person-outline" size={24} color="#333" />
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', marginTop: 30 },
  header: {
    backgroundColor: '#2a7fba',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 20,
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
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  tabItemActive: { borderTopWidth: 2, borderTopColor: '#2a7fba' },
  tabLabel: { fontSize: 12, marginTop: 4, color: '#666' },
  tabLabelActive: { color: '#2a7fba' },
});
