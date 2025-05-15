import React, { useEffect, useState } from 'react';
import {
  View,
  Modal as RNModal,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  avoidKeyboard?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  avoidKeyboard = true,
}) => {
  const [showModal, setShowModal] = useState(visible);
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        useNativeDriver: true,
        duration: 250,
      }).start(() => {
        setShowModal(false);
      });
    }
  }, [visible, slideAnim]);

  const handleBackdropPress = () => {
    onClose();
  };

  // Prevent backdrop press from closing modal when pressing on the modal content
  const handleModalPress = (e: any) => {
    e.stopPropagation();
  };

  const Content = (
    <Animated.View
      style={[
        styles.modalContent,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableWithoutFeedback onPress={handleModalPress}>
        <View style={styles.modalInner}>{children}</View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );

  return (
    <RNModal transparent visible={showModal} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.backdrop}>
          {avoidKeyboard ? (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoid}
            >
              {Content}
            </KeyboardAvoidingView>
          ) : (
            Content
          )}
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoid: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
  },
  modalInner: {
    padding: spacing.lg,
  },
});

export default Modal;