import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const formatTime = (millis) => {
  if (!millis || isNaN(millis)) return '0:00';
  const minutes = Math.floor(millis / 60000);
  const seconds = Math.floor((millis % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export default function MiniPlayer({
  track,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  sound,
}) {
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  // Reset progress when sound changes (i.e., when a new song is played)
  useEffect(() => {
    setPosition(0);
    setDuration(0);
  }, [sound]);

  useEffect(() => {
    let interval;
    const updateProgress = async () => {
      if (sound && !isSeeking) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setPosition(status.positionMillis);
          setDuration(status.durationMillis);
        }
      }
    };

    if (isPlaying && sound) {
      interval = setInterval(updateProgress, 500);
      // Immediate update when starting
      updateProgress();
    }
    return () => clearInterval(interval);
  }, [sound, isPlaying, isSeeking]);

  const handleSeek = async (value) => {
    if (sound) {
      await sound.setPositionAsync(value);
      setPosition(value);
    }
    setIsSeeking(false);
  };

  return (
    <View style={styles.miniPlayer}>
      <View style={styles.playerContent}>
        <Image source={track.artwork} style={styles.playerArtwork} />

        <View style={styles.playerInfo}>
          <Text style={styles.playerTitle} numberOfLines={1}>
            {track.title}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration || 1}
            value={position}
            minimumTrackTintColor="#2a7fba"
            maximumTrackTintColor="#e0e0e0"
            thumbTintColor="#2a7fba"
            onSlidingStart={() => setIsSeeking(true)}
            onSlidingComplete={handleSeek}
          />
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        <View style={styles.playerControls}>
          <TouchableOpacity onPress={onPrevious} style={styles.controlButton}>
            <Ionicons name="play-skip-back" size={24} color="#2a7fba" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onPlayPause} style={styles.playPauseButton}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={28}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={onNext} style={styles.controlButton}>
            <Ionicons name="play-skip-forward" size={24} color="#2a7fba" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  miniPlayer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    padding: 12,
  },
  playerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerArtwork: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  playerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  slider: {
    width: '100%',
    height: 30,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  controlButton: {
    padding: 8,
  },
  playPauseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2a7fba',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
});
