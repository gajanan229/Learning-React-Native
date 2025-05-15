import React, { useRef } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Reanimated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { Trash2, Edit } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius, shadows, animations } from '../../constants/theme';

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
  onPress?: () => void;
  rowHeight?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACTION_BUTTON_WIDTH = 80;
const SWIPE_THRESHOLD_PERCENTAGE = 0.25;

const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  onDelete,
  onEdit,
  onPress,
  rowHeight = 120,
}) => {
  const translateX = useSharedValue(0);
  const isSwiping = useSharedValue(false);
  const hasOpened = useSharedValue(false);

  const maxSwipeDistance = (onEdit ? ACTION_BUTTON_WIDTH * 2 : ACTION_BUTTON_WIDTH) + spacing.sm;
  const swipeThreshold = SCREEN_WIDTH * SWIPE_THRESHOLD_PERCENTAGE;

  const springConfig = {
    damping: animations.curves.spring.damping + 5,
    stiffness: animations.curves.spring.stiffness,
    mass: animations.curves.spring.mass * 0.8,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  };

  const triggerHaptic = (opened: boolean) => {
    Haptics.impactAsync(opened ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
      isSwiping.value = true;
    },
    onActive: (event, ctx: any) => {
      let newTranslateX = ctx.startX + event.translationX;
      if (newTranslateX > 0) {
        newTranslateX = interpolate(newTranslateX, [0, SCREEN_WIDTH / 2], [0, SCREEN_WIDTH / 8], Extrapolate.CLAMP);
      } else if (newTranslateX < -maxSwipeDistance) {
        newTranslateX = -maxSwipeDistance - interpolate(Math.abs(newTranslateX) - maxSwipeDistance, [0, ACTION_BUTTON_WIDTH], [0, ACTION_BUTTON_WIDTH / 3], Extrapolate.CLAMP);
      }
      translateX.value = newTranslateX;
    },
    onEnd: (event) => {
      isSwiping.value = false;
      if (translateX.value < -swipeThreshold) {
        translateX.value = withSpring(-maxSwipeDistance, springConfig);
        if (!hasOpened.value) runOnJS(triggerHaptic)(true);
        hasOpened.value = true;
      } else {
        translateX.value = withSpring(0, springConfig);
        if (hasOpened.value) runOnJS(triggerHaptic)(false);
        hasOpened.value = false;
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const actionButtonAnimatedStyle = (index: number, totalActions: number) => useAnimatedStyle(() => {
    const inputRange = [-maxSwipeDistance, -ACTION_BUTTON_WIDTH * index, 0];
    const outputRangeScale = [1, 0.8, 0.5];
    const outputRangeOpacity = [1, 0.7, 0];

    return {
      opacity: interpolate(translateX.value, inputRange, outputRangeOpacity, Extrapolate.CLAMP),
      transform: [
        { scale: interpolate(translateX.value, inputRange, outputRangeScale, Extrapolate.CLAMP) },
      ],
    };
  });

  const resetSwipe = () => {
    translateX.value = withSpring(0, springConfig);
    if (hasOpened.value) triggerHaptic(false);
    hasOpened.value = false;
  };

  const handlePress = () => {
    if (hasOpened.value) {
      resetSwipe();
    } else if (onPress) {
      onPress();
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      resetSwipe();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
      resetSwipe();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const totalActions = (onEdit ? 1 : 0) + (onDelete ? 1 : 0);

  return (
    <View style={[styles.container, { minHeight: rowHeight }]}>
      <View style={[styles.actionsContainer, { height: rowHeight }]}>
        {onEdit && (
          <Reanimated.View style={[styles.actionButtonWrapper, actionButtonAnimatedStyle(onDelete ? 1 : 0, totalActions)]}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton, { height: '100%' }]}
              onPress={handleEdit}
            >
              <Edit color={colors.text.primary} size={typography.fontSize.xl} />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
          </Reanimated.View>
        )}
        {onDelete && (
          <Reanimated.View style={[styles.actionButtonWrapper, actionButtonAnimatedStyle(0, totalActions)]}>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton, { height: '100%' }]}
              onPress={handleDelete}
            >
              <Trash2 color={colors.text.primary} size={typography.fontSize.xl} />
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
          </Reanimated.View>
        )}
      </View>

      <PanGestureHandler onGestureEvent={gestureHandler} activeOffsetX={[-10, 10]}>
        <Reanimated.View style={[styles.rowContent, animatedStyle, { height: rowHeight }]}>
          <TouchableOpacity
            activeOpacity={onPress ? 0.7 : 1}
            onPress={handlePress}
            style={styles.rowContentInner}
          >
            {children}
          </TouchableOpacity>
        </Reanimated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: spacing.sm,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...shadows.md,
    overflow: 'hidden',
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
  },
  actionButtonWrapper: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: ACTION_BUTTON_WIDTH,
    paddingVertical: spacing.md,
  },
  editButton: {
    backgroundColor: colors.accent.edit,
  },
  deleteButton: {
    backgroundColor: colors.accent.destructive,
  },
  actionText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  rowContent: {
    width: '100%',
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
  },
  rowContentInner: {
    width: '100%',
    padding: spacing.md,
  },
});

export default SwipeableRow;