import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react-native';
import { colors, typography, spacing } from '../../constants/theme';

export type ToastType = 'error' | 'success' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onDismiss,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Set timeout to dismiss
      timeoutRef.current = setTimeout(() => {
        handleDismiss();
      }, duration) as unknown as NodeJS.Timeout;
    }

    return () => {
      // Clean up timeout on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, duration]);

  const handleDismiss = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      onDismiss();
    });
  };

  if (!visible) return null;

  const getIconAndColor = () => {
    switch (type) {
      case 'error':
        return {
          icon: <AlertCircle size={20} color={colors.text.primary} />,
          backgroundColor: colors.accent.destructive,
        };
      case 'success':
        return {
          icon: <CheckCircle size={20} color={colors.text.primary} />,
          backgroundColor: colors.accent.success,
        };
      case 'info':
      default:
        return {
          icon: <Info size={20} color={colors.text.primary} />,
          backgroundColor: colors.accent.primary,
        };
    }
  };

  const { icon, backgroundColor } = getIconAndColor();

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor },
        { opacity: fadeAnim },
      ]}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
        <X size={16} color={colors.text.primary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  message: {
    flex: 1,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
  },
  closeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
});

export default Toast; 