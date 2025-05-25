import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Folder, Edit, Trash2 } from 'lucide-react-native';
import { useAppContext, Folder as FolderType } from '@/contexts/AppContext';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Reanimated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface FolderItemProps {
  folder: FolderType;
  taskCount: number;
  completionCount: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACTION_BUTTON_WIDTH = 80;
const SWIPE_THRESHOLD_PERCENTAGE = 0.25;

export default function FolderItem({ folder, taskCount, completionCount }: FolderItemProps) {
  const router = useRouter();
  const { showModal } = useAppContext();
  
  // Swipe animation values
  const translateX = useSharedValue(0);
  const isSwiping = useSharedValue(false);
  const hasOpened = useSharedValue(false);

  const maxSwipeDistance = ACTION_BUTTON_WIDTH * 2 + 16;
  const swipeThreshold = SCREEN_WIDTH * SWIPE_THRESHOLD_PERCENTAGE;

  const springConfig = {
    damping: 20,
    stiffness: 200,
    mass: 0.8,
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

  const actionButtonAnimatedStyle = (index: number) => useAnimatedStyle(() => {
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
    } else {
      router.push(`/folder/${folder.id}`);
    }
  };
  
  const handleEdit = () => {
    resetSwipe();
    showModal('folder', folder);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDelete = () => {
    resetSwipe();
    showModal('delete-folder', folder);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  
  // Calculate completion percentage
  const completionPercentage = taskCount > 0 
    ? Math.round((completionCount / taskCount) * 100) 
    : 0;
  
  return (
    <View style={styles.container}>
      {/* Action buttons */}
      <View style={[styles.actionsContainer]}>
        <Reanimated.View style={[styles.actionButtonWrapper, actionButtonAnimatedStyle(1)]}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={handleEdit}
          >
            <Edit color="white" size={20} />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
        </Reanimated.View>
        <Reanimated.View style={[styles.actionButtonWrapper, actionButtonAnimatedStyle(0)]}>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Trash2 color="white" size={20} />
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </Reanimated.View>
      </View>

      {/* Main content */}
      <PanGestureHandler onGestureEvent={gestureHandler} activeOffsetX={[-10, 10]}>
        <Reanimated.View style={[styles.rowContent, animatedStyle]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePress}
            className="p-4 rounded-xl bg-background-secondary"
            style={styles.folderContainer}
          >
            <View className="flex-row items-center mb-3">
              <Folder color="#2D88FF" size={24} />
              <Text className="ml-2 text-lg font-['Inter-Medium'] text-foreground flex-1">
                {folder.name}
              </Text>
            </View>
            
            <View className="mt-1">
              <View className="flex-row justify-between mb-2">
                <Text className="text-foreground-secondary text-sm">Progress</Text>
                <Text className="text-foreground-secondary text-sm">{completionPercentage}%</Text>
              </View>
              
              <View className="h-2 bg-background rounded-full overflow-hidden">
                <View 
                  className="h-full bg-accent"
                  style={{ width: `${completionPercentage}%` }}
                />
              </View>
              
              <Text className="mt-2 text-foreground-tertiary text-xs">
                {completionCount} of {taskCount} tasks completed
              </Text>
            </View>
          </TouchableOpacity>
        </Reanimated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 16,
    backgroundColor: '#121212',
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
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
    height: '100%',
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF4444',
  },
  actionText: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginTop: 4,
  },
  rowContent: {
    width: '100%',
    backgroundColor: '#121212',
  },
  folderContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  }
});