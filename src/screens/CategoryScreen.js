import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Alert
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import moment from 'moment';
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import { getusertasklistview, updateTaskStatus } from '../services/productServices'; // <-- Use your real API
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';

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
    icon: { name: 'musical-notes', library: 'Ionicons', size: 40 },
    hasProgressBar: true,
    primaryField: 'Therapy for',
    primaryFieldKey: 'therapyFor',
  },
  video: {
    icon: { name: 'videocam', library: 'Ionicons', size: 40 },
    hasProgressBar: true,
    primaryField: 'Therapy for',
    primaryFieldKey: 'therapyFor',
  },
  medicine: {
    icon: { name: 'pills', library: 'FontAwesome5', size: 36 },
    hasProgressBar: false,
    primaryField: 'Medicine for',
    primaryFieldKey: 'therapyFor',
    additionalFields: [
      { label: 'Dose', key: 'dose' },
      { label: 'Time', key: 'time' },
    ],
  },
  default: {
    icon: { name: 'help-circle', library: 'Ionicons', size: 40 },
    hasProgressBar: false,
    primaryField: 'Details',
    primaryFieldKey: 'therapyFor',
  },
};

// --- API: Mark as completed ---
const markTaskAsCompleted = async (taskId, customerId) => {
  try {
    // Use your real API call here. Example:
    // await updateTaskStatus(taskId, customerId, 'Completed');
    // Simulated delay for demonstration:
    await new Promise(res => setTimeout(res, 500));
    return { success: true };
  } catch (error) {
    throw new Error('Failed to mark task as completed');
  }
};

const TaskCard = ({ task, onPlayPress, onCompletePress, isToday }) => {
  const config = TASK_TYPE_CONFIG[task.type] || TASK_TYPE_CONFIG.default;

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
    <View style={styles.card}>
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
      <View style={styles.cardActions}>
        {config.hasProgressBar && (
          <TouchableOpacity style={styles.cardAction} onPress={() => onPlayPress(task)}>
            <Ionicons name="play-circle" size={36} color="#2a7fba" />
          </TouchableOpacity>
        )}
        {isToday && (
          task.completed ? (
            <View style={[styles.completeButton, styles.completeButtonDone]}>
              <Text style={styles.completeButtonText}>Completed</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => onCompletePress(task.id)}
            >
              <Text style={styles.completeButtonText}>Mark Complete</Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
};

export default function PatientTasks() {
  const [selectedTab, setSelectedTab] = useState('today');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({ visible: false, message: '' });

  const router = useRouter();

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

    // CRUCIAL: Map backend's task_status to completed boolean
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

  const handleCompletePress = async (taskId) => {
    try {
      const customerId = await AsyncStorage.getItem('Customer_id');
      await markTaskAsCompleted(taskId, customerId);
      await fetchTasks(); // Always re-fetch from backend after marking as complete
    } catch (error) {
      Alert.alert('Error', 'Failed to mark task as completed. Please try again.');
    }
  };

  const handlePlayPress = (task) => {
    Alert.alert(`Play ${task.type} task`, task.name);
  };

  const filteredTasks = tasks.filter(
    (task) => getDateKey(task.date) === selectedTab
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2a7fba" barStyle="light-content" />
      <Header title="My Tasks" />

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
          data={filteredTasks}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.taskList}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPlayPress={handlePlayPress}
              onCompletePress={handleCompletePress}
              isToday={selectedTab === 'today'}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', marginTop: 30 },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#e5f1fa',
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
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7fafd',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    minHeight: 120,
  },
  cardIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e5f1fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2986cc',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
  },
  cardAction: {
    marginBottom: 12,
  },
  completeButton: {
    backgroundColor: '#2a7fba',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  completeButtonDone: {
    backgroundColor: '#28a745',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 12,
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: 20,
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
});