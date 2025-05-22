import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const formatTime = (millis) => {
  if (!millis || isNaN(millis)) return '0:00';
  const minutes = Math.floor(millis / 60000);
  const seconds = Math.floor((millis % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export default function VideoPlayer({ task, visible, onClose }) {
  const [video, setVideo] = useState(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoPosition, setVideoPosition] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const videoRef = useRef(null);

  const cleanupVideo = async () => {
    try {
      if (videoRef.current) {
        await videoRef.current.stopAsync();
        await videoRef.current.unloadAsync();
        videoRef.current = null;
        setVideo(null);
        setVideoPlaying(false);
        setVideoPosition(0);
        setVideoDuration(0);
      }
    } catch (error) {
      console.error('Video cleanup error:', error);
    }
  };

  useEffect(() => {
    let interval;
    const updateProgress = async () => {
      if (videoRef.current && videoPlaying && !isSeeking) {
        try {
          const status = await videoRef.current.getStatusAsync();
          if (status.isLoaded) {
            setVideoPosition(status.positionMillis || 0);
            setVideoDuration(status.durationMillis || 0);
          }
        } catch (error) {
          console.error('Video progress update error:', error);
        }
      }
    };

    if (videoPlaying && video) {
      interval = setInterval(updateProgress, 500); // Matches MiniPlayer's interval
      updateProgress();
    }
    return () => clearInterval(interval);
  }, [video, videoPlaying, isSeeking]);

  useEffect(() => {
    if (visible && task?.ref_file) {
      const loadVideo = async () => {
        try {
          await cleanupVideo();
          const newVideo = new Video({
            source: { uri: task.ref_file },
            shouldPlay: true,
            progressUpdateIntervalMillis: 500,
            onPlaybackStatusUpdate: handleVideoPlaybackStatusUpdate,
          });
          videoRef.current = newVideo;
          setVideo(newVideo);
          setVideoPlaying(true);
        } catch (error) {
          console.error('Video load error:', error);
          Alert.alert('Error', 'Failed to load video');
          onClose();
        }
      };
      loadVideo();
    } else {
      cleanupVideo();
    }
    return () => cleanupVideo();
  }, [visible, task]);

  const handleVideoPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setVideoPlaying(status.isPlaying);
      if (status.didJustFinish) {
        cleanupVideo();
        onClose();
      }
    }
  };

  const handleVideoPlayPause = async () => {
    if (!videoRef.current) return;
    try {
      if (videoPlaying) {
        await videoRef.current.pauseAsync();
        setVideoPlaying(false);
      } else {
        await videoRef.current.playAsync();
        setVideoPlaying(true);
      }
    } catch (error) {
      console.error('Video play/pause error:', error);
      Alert.alert('Error', 'Failed to play/pause video');
    }
  };

  const handleVideoSeek = async (value) => {
    if (!videoRef.current) return;
    try {
      console.log('Seeking video to:', value);
      await videoRef.current.setPositionAsync(value);
      setVideoPosition(value);
      setIsSeeking(false);
      console.log('Seek completed');
    } catch (error) {
      console.error('Video seek error:', error);
      setIsSeeking(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalContainer}
        activeOpacity={1}
        // onPress={onClose}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close-circle" size={40} color="#ff4d4d" />
          </TouchableOpacity>
          {video && (
            <>
              <Video
                ref={videoRef}
                source={{ uri: task.ref_file }}
                style={styles.fullVideo}
                resizeMode="contain"
                isMuted={false}
                shouldPlay={videoPlaying}
                useNativeControls={false}
                onError={(error) => {
                  console.error('Video error:', error);
                  Alert.alert('Error', 'Failed to load video');
                  onClose();
                }}
              />
              <View style={styles.videoControls}>
                <TouchableOpacity
                  onPress={handleVideoPlayPause}
                  style={styles.playPauseButton}
                >
                  <Ionicons
                    name={videoPlaying ? 'pause' : 'play'}
                    size={28}
                    color="#fff"
                  />
                </TouchableOpacity>
                <Slider
                  style={styles.videoSlider}
                  minimumValue={0}
                  maximumValue={videoDuration || 1}
                  value={videoPosition}
                  minimumTrackTintColor="#2a7fba"
                  maximumTrackTintColor="#e0e0e0"
                  thumbTintColor="#2a7fba"
                  onSlidingStart={() => setIsSeeking(true)}
                  onSlidingComplete={handleVideoSeek}
                />
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>{formatTime(videoPosition)}</Text>
                  <Text style={styles.timeText}>{formatTime(videoDuration)}</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '70%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullVideo: {
    width: '100%',
    height: '80%',
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 5,
    zIndex: 1,
  },
  videoControls: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  playPauseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2a7fba',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  videoSlider: {
    width: '100%',
    height: 30,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
});