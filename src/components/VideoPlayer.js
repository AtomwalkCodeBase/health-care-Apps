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
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoPosition, setVideoPosition] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [hasFinished, setHasFinished] = useState(false); 
  const videoRef = useRef(null);

  const cleanupVideo = async () => {
    try {
      if (videoRef.current) {
        console.log('Cleaning up video');
        await videoRef.current.stopAsync();
      }
    } catch (error) {
      console.error('Video cleanup error:', error);
    } finally {
      setVideoPlaying(false);
      setVideoPosition(0);
      setVideoDuration(0);
      setHasFinished(false);
    }
  };

  useEffect(() => {
    if (visible && task?.ref_file) {
      setVideoPlaying(true);
    } else {
      cleanupVideo();
    }
    return () => {
      cleanupVideo();
    };
  }, [visible, task]);

  const handleVideoPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      if (!isSeeking) {
        setVideoPlaying(status.isPlaying);
        setVideoPosition(status.positionMillis || 0);
        setVideoDuration(status.durationMillis || 0);
      }

      if (status.didJustFinish && !hasFinished) {
        console.log('Video finished');
        setHasFinished(true);
        cleanupVideo();
        onClose();
      }
    } else if (status.error) {
      Alert.alert('Error', 'Video playback error');
      cleanupVideo();
      onClose();
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
      Alert.alert('Error', 'Play/pause failed');
    }
  };

  const handleVideoSeek = async (value) => {
    if (!videoRef.current) return;
    try {
      setIsSeeking(true);
      await videoRef.current.setPositionAsync(value);
      setVideoPosition(value);
    } catch (error) {
      console.error('Seek failed:', error);
    } finally {
      setIsSeeking(false);
    }
  };

  const handleVideoLoad = (status) => {
    setVideoDuration(status.durationMillis || 0);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        cleanupVideo();
        onClose();
      }}
    >
      <TouchableOpacity style={styles.modalContainer} activeOpacity={1}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={() => {
            cleanupVideo();
            onClose();
          }}>
            <Ionicons name="close-circle" size={35} color="#ff4d4d" />
          </TouchableOpacity>

          {visible && task?.ref_file && (
            <>
              <Video
                ref={videoRef}
                source={{ uri: task.ref_file }}
                style={styles.fullVideo}
                resizeMode="contain"
                isMuted={false}
                shouldPlay={videoPlaying}
                useNativeControls={false}
                onPlaybackStatusUpdate={handleVideoPlaybackStatusUpdate}
                onLoad={handleVideoLoad}
                progressUpdateIntervalMillis={500}
                onError={(error) => {
                  Alert.alert('Error', 'Failed to load video');
                  cleanupVideo();
                  onClose();
                }}
              />
              <View style={styles.videoControls}>
                <TouchableOpacity onPress={handleVideoPlayPause} style={styles.playPauseButton}>
                  <Ionicons name={videoPlaying ? 'pause' : 'play'} size={28} color="#fff" />
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
