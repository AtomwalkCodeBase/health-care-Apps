import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const TASK_TYPE_CONFIG = {
  audio: {
    icon: { name: 'musical-notes', library: 'Ionicons', size: 32 },
    hasProgressBar: false,
    primaryField: 'Therapy for',
    primaryFieldKey: 'therapyFor',
    additionalFields: [
      { label: 'Time', key: 'time' },
    ],
  },
  video: {
    icon: { name: 'videocam', library: 'Ionicons', size: 32 },
    hasProgressBar: false,
    primaryField: 'Therapy for',
    primaryFieldKey: 'therapyFor',
    additionalFields: [
      { label: 'Time', key: 'time' },
    ],
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

const TaskCard = ({ task, onPlayPress, onVideoPress, onCompletePress, isToday, isCurrentTrack, isPlaying, isLoading, isUpdating }) => {
  const config = TASK_TYPE_CONFIG[task.type] || TASK_TYPE_CONFIG.default;
  const isAudio = task.type === 'audio';
  const isVideo = task.type === 'video';
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [videoConfirmVisible, setVideoConfirmVisible] = useState(false);
  const [completeConfirmVisible, setCompleteConfirmVisible] = useState(false);

  const renderIcon = () => {
    const { name, library, size } = config.icon;
    if (library === 'Ionicons') {
      return <Ionicons name={name} size={size} color="#2986cc" />;
    } else if (library === 'FontAwesome5') {
      return <FontAwesome5 name={name} size={size} color="#2986cc" />;
    }
    return null;
  };

  // Debug ref_file when opening modal
  useEffect(() => {
    if (imageModalVisible && task.type === 'medicine') {
      console.log('Image Modal Opened:', {
        taskId: task.id,
        ref_file: task.ref_file,
        task_sub_category_name: task.task_sub_category_name,
      });
    }
  }, [imageModalVisible, task]);

  // Validate image URI
  const isValidImageUri = (uri) => {
    if (!uri || typeof uri !== 'string' || uri.trim() === '') return false;
    return uri.match(/\.(png|jpg|jpeg|svg|pvg)$/i) || uri.startsWith('http');
  };

  const handleVideoConfirm = () => {
    setVideoConfirmVisible(false);
    onVideoPress(task);
  };

  const handleCompleteConfirm = () => {
    setCompleteConfirmVisible(true);
    onCompletePress(task);
    setCompleteConfirmVisible(false);
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
                onPress={() => setCompleteConfirmVisible(true)}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.completeButtonText}>Mark Complete</Text>
                )}
              </TouchableOpacity>
            )}
            {task.type === 'medicine' && task.ref_file && task.task_sub_category_name === 'Image' && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setImageModalVisible(true)}
              >
                <Ionicons name="image" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            {isVideo && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setVideoConfirmVisible(true)}
              >
                <Ionicons name="videocam" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            {isAudio && (
              <TouchableOpacity
                style={[styles.iconButton, (isAudio || isVideo) && styles.mediaIconButton]}
                onPress={() => onPlayPress(task)}
                disabled={isLoading && isCurrentTrack}
              >
                <Ionicons
                  name={isPlaying && isCurrentTrack ? 'pause-circle' : 'play-circle'}
                  size={24}
                  color="#fff"
                />
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
            {task.ref_file && isValidImageUri(task.ref_file) ? (
              <Image
                source={{ uri: task.ref_file }}
                style={styles.fullImage}
                resizeMode="contain"
                onError={(error) => {
                  console.error('Image Load Error:', {
                    error: error.nativeEvent.error,
                    uri: task.ref_file,
                    taskId: task.id,
                  });
                  Alert.alert('Error', 'Failed to load image. Please check the image URL.');
                }}
                onLoad={() => console.log('Image Loaded Successfully:', task.ref_file)}
              />
            ) : (
              <Text style={styles.noImageText}>
                {task.ref_file ? 'Invalid or inaccessible image' : 'No image available'}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal for video playback confirmation */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={videoConfirmVisible}
        onRequestClose={() => setVideoConfirmVisible(false)}
      >
        <View style={styles.confirmModalContainer}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalTitle}>Play Video?</Text>
            <Text style={styles.confirmModalText}>
              Do you want to play the video: {task.name}?
            </Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonYes]}
                onPress={handleVideoConfirm}
              >
                <Text style={styles.confirmButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonNo]}
                onPress={() => setVideoConfirmVisible(false)}
              >
                <Text style={styles.confirmButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for task completion confirmation */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={completeConfirmVisible}
        onRequestClose={() => setCompleteConfirmVisible(false)}
      >
        <View style={styles.confirmModalContainer}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalTitle}>Mark Task as Completed?</Text>
            <Text style={styles.confirmModalText}>
              Are you sure you want to mark this task as completed?
            </Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonYes]}
                onPress={() => {
                  handleCompleteConfirm();
                }}
              >
                <Text style={styles.confirmButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonNo]}
                onPress={() => setCompleteConfirmVisible(false)}
              >
                <Text style={styles.confirmButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
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
    alignItems: 'center',
    justifyContent: 'center',
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
  iconButton: {
    backgroundColor: '#6c757d',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaIconButton: {
    padding: 8,
  },
  progressContainer: {
    marginTop: 8,
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: 16,
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
  noImageText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    borderRadius: 20,
    padding: 5,
    zIndex: 1,
  },
  confirmModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2986cc',
    marginBottom: 10,
  },
  confirmModalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  confirmButtonYes: {
    backgroundColor: '#28a745',
  },
  confirmButtonNo: {
    backgroundColor: '#ff4d4d',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TaskCard;