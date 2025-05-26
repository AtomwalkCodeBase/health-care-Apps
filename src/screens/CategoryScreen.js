import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Alert,
  AppState,
  BackHandler,
} from 'react-native';
import { Audio } from 'expo-av';
import moment from 'moment';
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import { getusertasklistview, updateTask } from '../services/productServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MiniPlayer from '../components/MiniPlayer';
import VideoPlayer from '../components/VideoPlayer';
import TaskCard from '../components/TaskCards';
import TASK_TYPE_CONFIG from '../components/TaskCards';

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

// --- API: Mark as completed ---
const markTaskAsCompleted = async (task, customerId) => {
  try {
    if (!task?.id) {
      throw new Error('Missing task ID');
    }

    const task_data = {
      curr_user: customerId || '',
      id: task.id,
      name: task.name || 'Unnamed Task',
      remarks: task.therapyFor || task.remarks || '',
      start_time: null, // No start_time in current task data
      task_date: task.date ? moment(task.date, 'YYYY-MM-DD').format('DD-MM-YYYY') : moment().format('DD-MM-YYYY'),
      task_type: task.type ? task.type.toUpperCase() : 'GENERAL',
    };

    console.log('Marking task as completed:', { task_data, is_completed: 'Y' });

    const response = await updateTask(task_data, 'Y');
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Task marked as completed successfully:', { taskId: task.id, response });
    return { success: true };
  } catch (error) {
    console.error('Failed to mark task as completed:', error);
    throw error;
  }
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
  const [isUpdating, setIsUpdating] = useState(false);
  const seekingRef = useRef(false);
  const soundRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const router = useRouter();

  // Debug videoModalVisible changes
  useEffect(() => {
    console.log('[PatientTasks] videoModalVisible changed:', videoModalVisible);
  }, [videoModalVisible]);

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
      if (apiTask.task_sub_category_name) {
        if (apiTask.task_sub_category_name === 'Audio') {
          type = 'audio';
          hasMedia = true;
        } else if (apiTask.task_sub_category_name === 'Video') {
          type = 'video';
          hasMedia = true;
        } else if (apiTask.task_sub_category_name === 'Image') {
          type = 'medicine';
        }
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

    // Debug task details for image tasks
    if (type === 'medicine' && apiTask.task_sub_category_name === 'Image') {
      console.log('Image Task Mapped:', {
        id: apiTask.id,
        ref_file: apiTask.ref_file,
        task_sub_category_name: apiTask.task_sub_category_name,
        name: apiTask.name,
        remarks: apiTask.remarks,
        task_date: apiTask.task_date,
        task_status: apiTask.task_status,
      });
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
      task_sub_category_name: apiTask.task_sub_category_name,
      ...Object.keys(apiTask).reduce((acc, key) => {
        if (!['id', 'task_type', 'name', 'remarks', 'ref_file', 'task_date', 'task_status', 'task_sub_category_name'].includes(key)) {
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
      console.log('Fetched Tasks:', res.data);
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
      console.log('[PatientTasks] Opening video:', { taskId: task.id, ref_file: task.ref_file });
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        }
        if (status.isLoaded && status.isPlaying) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
          setSound(null);
          setCurrentTrack(null);
          setIsPlaying(false);
          setPosition(0);
          setDuration(0);
        }
      }
      setVideoTask(task);
      setVideoModalVisible(true);
    } catch (error) {
      console.error('[PatientTasks] Video press error:', error);
      Alert.alert('Error', 'Failed to start video playback: ' + error.message);
    }
  };

  const handleVideoClose = useCallback(() => {
    console.log('[PatientTasks] handleVideoClose called');
    setVideoTask(null);
    setVideoModalVisible(false);
  }, []);

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

  const handleCompletePress = async (task) => {
    try {
      setIsUpdating(true);
      const customerId = await AsyncStorage.getItem('Customer_id');
      if (!customerId) throw new Error('Customer ID not found');
      if (!task?.id) throw new Error('Missing task ID');

      await markTaskAsCompleted(task, customerId);
      await fetchTasks();
      console.log('Task completion processed for taskId:', task.id);
    } catch (error) {
      console.error('Error in handleCompletePress:', error);
      Alert.alert('Error', error.message || 'Failed to mark task as completed. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredTasks = tasks.filter(
    (task) => getDateKey(task.date) === selectedTab
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2a7fba" barStyle="light-content" />
      <Header title="My Tasks" onBack={handleBack} />

      <View style={styles.contentContainer}>
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
                isUpdating={isUpdating}
              />
            )}
          />
        )}
      </View>

      {currentTrack && currentTrack.type === 'audio' && (
        <View style={styles.miniPlayerContainer}>
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
          />
        </View>
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafd',
    marginTop: 30,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 80,
  },
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
    paddingBottom: 20,
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
  miniPlayerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    zIndex: 10,
  },
});