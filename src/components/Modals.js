import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';

/**
 * Success Modal Component
 * @param {boolean} visible - Controls modal visibility
 * @param {string} message - Success message to display
 * @param {function} onClose - Function to call when modal is closed
 * @param {string} buttonText - Text for the action button (optional)
 */
export const SuccessModal = ({ visible, message, onClose, buttonText = "OK" }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={[styles.iconContainer, styles.successIconContainer]}>
            <Feather name="check-circle" size={50} color="white" />
          </View>
          
          <Text style={styles.modalTitle}>Success!</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          
          <TouchableOpacity
            style={[styles.modalButton, styles.successButton]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Error Modal Component
 * @param {boolean} visible - Controls modal visibility
 * @param {string} message - Error message to display
 * @param {function} onClose - Function to call when modal is closed
 * @param {string} buttonText - Text for the action button (optional)
 */
export const ErrorModal = ({ visible, message, onClose, onRetry, buttonText = "Close" }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={[styles.iconContainer, styles.errorIconContainer]}>
            <Feather name="alert-circle" size={50} color="white" />
          </View>
          
          <Text style={[styles.modalTitle, styles.errorTitle]}>Error</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          
          <TouchableOpacity
            style={[styles.modalButton, styles.errorButton]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>

         { onRetry && <TouchableOpacity
            style={[styles.modalButton, styles.errorButton]}
            onPress={onRetry}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity> }
        </View>
      </View>
    </Modal>
  );
};

/**
 * Custom Loader Component
 * @param {boolean} visible - Controls loader visibility
 * @param {string} message - Optional message to display with loader
 */
export const Loader = ({ visible, message = "Loading..." }) => {
  // Animation for the pulsating effect
  const pulseAnim = new Animated.Value(1);
  
  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.loaderOverlay}>
      <View style={styles.loaderContainer}>
        <Animated.View
          style={[
            styles.loaderInner,
            {
              transform: [{ scale: pulseAnim }]
            }
          ]}
        >
          <ActivityIndicator color="#FF6B6B" size="large" />
        </Animated.View>
        <Text style={styles.loaderText}>{message}</Text>
      </View>
    </View>
  );
};

// Custom Spinner Loader (Alternative design)
export const SpinnerLoader = ({ visible, message = "Loading..." }) => {
  // Animation for the rotating effect
  const spinAnim = new Animated.Value(0);
  
  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true
        })
      ).start();
    } else {
      spinAnim.setValue(0);
    }
  }, [visible]);

  // Interpolate for full 360 degree rotation
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  if (!visible) return null;

  return (
    <View style={styles.loaderOverlay}>
      <View style={styles.spinnerContainer}>
        <Animated.View
          style={[
            styles.spinner,
            {
              transform: [{ rotate: spin }]
            }
          ]}
        >
          <View style={styles.spinnerAccent} />
        </Animated.View>
        <Text style={styles.loaderText}>{message}</Text>
      </View>
    </View>
  );
};

// Usage examples:
/*
// Success Modal
const [successVisible, setSuccessVisible] = useState(false);
<SuccessModal 
  visible={successVisible} 
  message="Ticket updated successfully!"
  onClose={() => setSuccessVisible(false)}
/>

// Error Modal
const [errorVisible, setErrorVisible] = useState(false);
<ErrorModal 
  visible={errorVisible} 
  message="Failed to update ticket. Please try again."
  onClose={() => setErrorVisible(false)}
/>

// Loader
const [loading, setLoading] = useState(false);
<Loader visible={loading} message="Updating ticket..." />

// Spinner Loader (alternative)
<SpinnerLoader visible={loading} message="Updating ticket..." />
*/

const styles = StyleSheet.create({
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '85%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  successIconContainer: {
    backgroundColor: '#4CD964', // Green
  },
  errorIconContainer: {
    backgroundColor: '#FF6B6B', // Red (your theme color)
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  errorTitle: {
    color: '#FF6B6B',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  successButton: {
    backgroundColor: '#4CD964',
  },
  errorButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // Loader Styles
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loaderContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 140,
  },
  loaderInner: {
    marginBottom: 12,
  },
  loaderText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  
  // Spinner Styles (Alternative loader)
  spinnerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 140,
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerAccent: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderTopColor: '#FF6B6B',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  }
});