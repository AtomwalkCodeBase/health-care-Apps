import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Alert,
  Image,
  Modal,
  BackHandler,
  AppState,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import moment from 'moment';
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import { getusertasklistview, updateTaskStatus } from '../services/productServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import MiniPlayer from '../components/MiniPlayer';
import VideoPlayer from '../components/VideoPlayer';

const TAB_OPTIONS = [
  { key: 'today', label: 'Today' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'next3', label: 'Next 3' },
  { key: 'past', label: 'Past' },
];

const getDateKey = (dateString) => {
  const today = moment().startOf('day');
  const taskDate = moment(dateString, 'YYYY-MM-DD').startOf('day');
  const diff = taskDate.diff(today, 'days');
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff > 1 && diff <= 3) return 'next3';
  if (diff < 0) return 'past';
  return null;
};

const TASK_TYPE_CONFIG = {
  audio: {
    icon: { name: 'musical-notes', library: 'Ionicons', size: 32 },
    hasProgressBar: false,
    primaryField: 'Therapy for',
    primaryFieldKey: 'therapyFor',
  },
  video: {
    icon: { name: 'videocam', library: 'Ionicons', size: 32 },
    hasProgressBar: false,
    primaryField: 'Therapy for',
    primaryFieldKey: 'therapyFor',
  },
  medicine: {
    icon: { name: 'pills', library: 'FontAwesome5', size: 28 },
    hasProgressBar: false,
    primaryField: 'Medicine for',
    primaryFieldKey: 'therapyFor',
    additionalFields: [
      { label: 'Dose', key: 'dose' },
      { label: 'Time', key: 'time' },
    ],
  },
  default: {
    icon: { name: 'help-circle', library: 'Ionicons', size: 32 },
    hasProgressBar: false,
    primaryField: 'Details',
    primaryFieldKey: 'therapyFor',
  },
};

// --- API: Mark as completed ---
const markTaskAsCompleted = async (taskId, customerId) => {
  try {
    await updateTaskStatus(taskId, customerId, 'Completed');
    await new Promise((res) => setTimeout(res, 500));
    return { success: true };
  } catch (error) {
    throw new Error('Failed to mark task as completed');
  }
};

const TaskCard = ({ task, onPlayPress, onVideoPress, onCompletePress, isToday, isCurrentTrack, isPlaying, isLoading }) => {
  const config = TASK_TYPE_CONFIG[task.type] || TASK_TYPE_CONFIG.default;
  const isAudio = task.type === 'audio';
  const isVideo = task.type === 'video';
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const renderIcon = () => {
    const { name, library, size } = config.icon;
    if (library === 'Ionicons') {
      return <Ionicons name={name} size={size} color="#2986cc" />;
    } else if (library === 'FontAwesome5') {
      return <FontAwesome5 name={name} size={size} color="#2986cc" />;
    }
    return null;
  };

  return (
    <View style={[styles.card, isAudio && styles.audioCard, isVideo && styles.videoCard]}>
      <View style={styles.cardIconWrap}>{renderIcon()}</View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{task.name}</Text>
        <Text style={styles.cardSubtitle}>
          {config.primaryField}: {task[config.primaryFieldKey] || 'N/A'}
        </Text>
        {config.additionalFields?.map((field) => (
          <Text key={field.key} style={styles.cardSubtitle}>
            {field.label}: {task[field.key] || 'N/A'}
          </Text>
        ))}
        {config.hasProgressBar && (
          <View style={styles.progressContainer}>
            <Slider
              style={styles.progressBar}
              minimumValue={0}
              maximumValue={100}
              value={0}
              minimumTrackTintColor="#2986cc"
              maximumTrackTintColor="#e5e5e5"
              thumbTintColor="#2a7fba"
              disabled
            />
          </View>
        )}
      </View>
      <View style={[styles.cardActions, (isAudio || isVideo) && styles.mediaCardActions]}>
        {isToday && (
          <>
            {task.completed ? (
              <View style={[styles.completeButton, styles.completeButtonDone, (isAudio || isVideo) && styles.mediaCompleteButton]}>
                <Text style={styles.completeButtonText}>Completed</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.completeButton, (isAudio || isVideo) && styles.mediaCompleteButton]}
                onPress={() => onCompletePress(task.id)}
              >
                <Text style={styles.completeButtonText}>Mark Complete</Text>
              </TouchableOpacity>
            )}
            {task.type === 'medicine' && task.ref_file && (
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => setImageModalVisible(true)}
              >
                <Text style={styles.viewButtonText}>View</Text>
              </TouchableOpacity>
            )}
            {isVideo && (
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => onVideoPress(task)}
              >
                <Text style={styles.viewButtonText}>Play Video</Text>
              </TouchableOpacity>
            )}
            {isAudio && (
              <TouchableOpacity
                style={[styles.viewButton, (isAudio || isVideo) && styles.mediaCompleteButton]}
                onPress={() => onPlayPress(task)}
                disabled={isLoading && isCurrentTrack}
              >
                <Text style={styles.viewButtonText}>
                  {isPlaying && isCurrentTrack ? 'Pause Audio' : 'Play Audio'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* Modal for full-screen image view */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={imageModalVisible}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setImageModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setImageModalVisible(false)}
            >
              <Ionicons name="close-circle" size={30} color="#ff4d4d" />
            </TouchableOpacity>
            {task.ref_file && (
              <Image
                source={{ uri: task.ref_file }}
                style={styles.fullImage}
                resizeMode="contain"
                onError={() => Alert.alert('Error', 'Failed to load image.')}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default function PatientTasks() {
  const [selectedTab, setSelectedTab] = useState('today');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({ visible: false, message: '' });
  const [sound, setSound] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoTask, setVideoTask] = useState(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const seekingRef = useRef(false);
  const soundRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const router = useRouter();

  // Initialize audio session
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('Audio mode setup error:', error);
      }
    };
    setupAudio();
  }, []);

  // Cleanup audio resources
  const cleanupAudio = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setSound(null);
        setCurrentTrack(null);
        setIsPlaying(false);
        setPosition(0);
        setDuration(0);
        setLoadingId(null);
      }
    } catch (error) {
      console.error('Audio cleanup error:', error);
    }
  };

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (
        appStateRef.current.match(/active/) &&
        nextAppState === 'background' &&
        soundRef.current
      ) {
        soundRef.current.pauseAsync().catch((error) => {
          console.error('Background pause error:', error);
        });
        setIsPlaying(false);
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleBack = async () => {
    await cleanupAudio();
    router.back();
  };

  useEffect(() => {
    const backAction = () => {
      handleBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => {
      backHandler.remove();
      cleanupAudio();
    };
  }, []);

  const mapApiTaskToAppTask = (apiTask) => {
    let type = apiTask.task_category_name?.toLowerCase() || 'default';
    let hasMedia = false;

    if (type === 'ticket' || !TASK_TYPE_CONFIG[type]) {
      if (apiTask.ref_file) {
        if (apiTask.ref_file.includes('.mp3')) {
          type = 'audio';
          hasMedia = true;
        } else if (apiTask.ref_file.includes('.mp4')) {
          type = 'video';
          hasMedia = true;
        } else {
          type = 'medicine';
        }
      } else {
        type = 'medicine';
      }
    }

    const formattedDate = moment(apiTask.task_date, 'DD-MM-YYYY').format('YYYY-MM-DD');

    let dose = 'N/A';
    let time = 'N/A';
    if (!hasMedia && apiTask.remarks) {
      const remarksParts = apiTask.remarks.split(' at ');
      if (remarksParts.length === 2) {
        dose = remarksParts[0];
        time = remarksParts[1];
      } else {
        dose = apiTask.remarks || 'N/A';
      }
    }

    return {
      id: apiTask.id,
      type,
      name: apiTask.name,
      therapyFor: apiTask.remarks || 'N/A',
      ref_file: apiTask.ref_file || undefined,
      date: formattedDate,
      time: hasMedia ? undefined : time,
      completed: (apiTask.task_status || '').toLowerCase() === 'completed',
      dose,
      ...Object.keys(apiTask).reduce((acc, key) => {
        if (!['id', 'task_type', 'name', 'remarks', 'ref_file', 'task_date', 'task_status'].includes(key)) {
          acc[key] = apiTask[key];
        }
        return acc;
      }, {}),
    };
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const customerId = await AsyncStorage.getItem('Customer_id');
      if (!customerId) throw new Error('Customer ID not found');
      const res = await getusertasklistview('ALL', customerId);
      const mappedTasks = (res.data || []).map(mapApiTaskToAppTask);
      setTasks(mappedTasks);
      return mappedTasks;
    } catch (error) {
      console.error('Fetch tasks error:', error);
      setError({ visible: true, message: 'Failed to load tasks. Please try again.' });
      setTasks([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handlePlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        cleanupAudio();
      } else if (!seekingRef.current) {
        setPosition(status.positionMillis || 0);
        setDuration(status.durationMillis || 0);
      }
    }
  };

  const handlePlayPress = async (task) => {
    try {
      if (currentTrack?.id === task.id && soundRef.current) {
        if (isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
        return;
      }

      setLoadingId(task.id);

      await cleanupAudio();

      const { sound } = await Audio.Sound.createAsync(
        { uri: task.ref_file },
        { shouldPlay: true, progressUpdateIntervalMillis: 500 },
        handlePlaybackStatusUpdate
      );

      soundRef.current = sound;
      setSound(sound);
      setCurrentTrack(task);
      setIsPlaying(true);
    } catch (error) {
      console.error('Playback error:', error);
      setError({ visible: true, message: 'Failed to play audio' });
    } finally {
      setLoadingId(null);
    }
  };

  const handleVideoPress = async (task) => {
    try {
      // Check and pause audio if playing
      if (soundRef.current) {
        console.log('Attempting to pause audio...');
        const status = await soundRef.current.getStatusAsync();
        console.log('Audio status:', status);
        if (status.isLoaded && status.isPlaying) {
          console.log('Pausing audio...');
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
          console.log('Audio paused successfully');
        }
        // Fallback: Stop and unload if pause fails or state is uncertain
        if (status.isLoaded && status.isPlaying) {
          console.log('Fallback: Stopping and unloading audio...');
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
          setSound(null);
          setCurrentTrack(null);
          setIsPlaying(false);
          setPosition(0);
          setDuration(0);
          console.log('Audio stopped and unloaded');
        }
      } else {
        console.log('No audio instance found');
      }
      // Proceed to open video player
      setVideoTask(task);
      setVideoModalVisible(true);
      console.log('Video modal opened for task:', task.id);
    } catch (error) {
      console.error('Error in handleVideoPress:', error);
      Alert.alert('Error', 'Failed to start video playback: ' + error.message);
    }
  };

  const handleVideoClose = () => {
    setVideoTask(null);
    setVideoModalVisible(false);
  };

  const handlePlayPause = async () => {
    if (!soundRef.current) return;
    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Play/Pause error:', error);
      setError({ visible: true, message: 'Failed to play/pause audio' });
    }
  };

  const handleSeek = async (value) => {
    if (!soundRef.current) return;
    try {
      seekingRef.current = true;
      setPosition(value);
      await soundRef.current.setPositionAsync(value);
    } catch (error) {
      console.error('Seek error:', error);
    } finally {
      seekingRef.current = false;
    }
  };

  const handleNext = () => {
    if (!currentTrack) return;
    const currentIndex = tasks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tasks.length;
    const nextTask = tasks[nextIndex];
    if (nextTask.type === 'audio') {
      handlePlayPress(nextTask);
    }
  };

  const handlePrevious = () => {
    if (!currentTrack) return;
    const currentIndex = tasks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? tasks.length - 1 : currentIndex - 1;
    const prevTask = tasks[prevIndex];
    if (prevTask.type === 'audio') {
      handlePlayPress(prevTask);
    }
  };

  const handleCompletePress = async (taskId) => {
    try {
      const customerId = await AsyncStorage.getItem('Customer_id');
      await markTaskAsCompleted(taskId, customerId);
      await fetchTasks();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark task as completed. Please try again.');
    }
  };

  const filteredTasks = tasks.filter(
    (task) => getDateKey(task.date) === selectedTab
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2a7fba" barStyle="light-content" />
      <Header title="My Tasks" onBack={handleBack} />

      <View style={styles.tabBar}>
        {TAB_OPTIONS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedTab === tab.key && styles.tabActive]}
            onPress={() => setSelectedTab(tab.key)}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.tabText, selectedTab === tab.key && styles.tabTextActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error.visible && (
        <Text style={styles.errorText}>{error.message}</Text>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#2986cc" style={styles.loader} />
      ) : filteredTasks.length === 0 ? (
        <Text style={styles.noTaskText}>No tasks for this period.</Text>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          contentContainerStyle={styles.taskList}
          data={filteredTasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPlayPress={handlePlayPress}
              onVideoPress={handleVideoPress}
              onCompletePress={handleCompletePress}
              isToday={selectedTab === 'today'}
              isCurrentTrack={currentTrack?.id === item.id}
              isPlaying={isPlaying && currentTrack?.id === item.id}
              isLoading={loadingId === item.id}
            />
          )}
        />
      )}

      {currentTrack && currentTrack.type === 'audio' && (
        <MiniPlayer
          sound={sound}
          track={{
            ...currentTrack,
            title: currentTrack.name || 'Audio Task',
            artist: `Therapy: ${currentTrack.therapyFor || 'N/A'}`,
            artwork: require('../../assets/images/waveform.png'),
          }}
          isPlaying={isPlaying}
          position={position}
          duration={duration}
          onSeek={handleSeek}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}

      {videoTask && (
        <VideoPlayer
          task={videoTask}
          visible={videoModalVisible}
          onClose={handleVideoClose}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafd', marginTop: 30 },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: '#2986cc',
  },
  tabText: {
    color: '#2986cc',
    fontWeight: '600',
    fontSize: 16,
  },
  tabTextActive: {
    color: '#fff',
  },
  taskList: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    minHeight: 100,
  },
  audioCard: {
    minHeight: 110,
    paddingVertical: 10,
  },
  videoCard: {
    minHeight: 110,
    paddingVertical: 10,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5f1fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2986cc',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  mediaCardActions: {
    justifyContent: 'space-between',
    height: 'auto',
  },
  completeButton: {
    backgroundColor: '#2a7fba',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  mediaCompleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  completeButtonDone: {
    backgroundColor: '#28a745',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  viewButton: {
    backgroundColor: '#6c757d',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 8,
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: 16,
  },
  noTaskText: {
    marginTop: 40,
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
  },
  errorText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#ff4d4d',
    fontSize: 16,
  },
  loader: {
    marginTop: 40,
  },
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
  fullImage: {
    width: '100%',
    height: '100%',
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
});