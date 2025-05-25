import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { CircleCheck as CheckCircle, Circle, Trash2, Edit, Calendar, AlertCircle } from 'lucide-react-native';
import { Task } from '@/types/api';
import { useTasks } from '@/hooks/useTasks';
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
import { useRouter } from 'expo-router';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import * as Haptics from 'expo-haptics';

interface TaskItemProps {
  task: Task;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACTION_BUTTON_WIDTH = 80;
const SWIPE_THRESHOLD_PERCENTAGE = 0.25;

export default function TaskItem({ task }: TaskItemProps) {
  const { toggleTask, deleteTask } = useTasks();
  const router = useRouter();
  const checkAnim = useRef(new Animated.Value(task.completed ? 1 : 0)).current;
  
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

  // Update animation if task completion changes
  useEffect(() => {
    Animated.timing(checkAnim, {
      toValue: task.completed ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [task.completed]);

  // Animation values for completion
  const textOpacity = checkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.6],
  });
  
  const strikeWidth = checkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

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
  
  const handleToggle = () => {
    if (hasOpened.value) {
      resetSwipe();
    } else {
    toggleTask(task.id);
    }
  };

  const handleEdit = () => {
    resetSwipe();
    router.push(`/Create/new-task?id=${task.id}`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  
  const handleDelete = () => {
    resetSwipe();
    setTimeout(() => {
      deleteTask(task.id);
    }, 300);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return '#FF4444';
      case 'medium': return '#FFA500';
      case 'low': return '#4CAF50';
    }
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const isDueDateOverdue = (dueDate: string) => {
    return isPast(new Date(dueDate)) && !isToday(new Date(dueDate));
  };
  
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
            onPress={handleToggle}
            className="py-4 px-4 rounded-xl bg-background-secondary flex-row items-start"
        style={styles.taskContainer}
      >
            <TouchableOpacity 
              onPress={handleToggle} 
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="mt-1"
            >
          {task.completed ? (
            <CheckCircle color="#2D88FF" size={24} />
          ) : (
            <Circle color="#787878" size={24} />
          )}
        </TouchableOpacity>
        
        <View className="flex-1 ml-3">
              <View className="relative">
          <Animated.Text 
                  className="text-foreground font-['Inter-Medium'] text-base leading-5"
            style={{ opacity: textOpacity }}
            numberOfLines={2}
          >
            {task.title}
          </Animated.Text>
          
          {/* Animated strikethrough line */}
          <Animated.View 
            style={[
              styles.strikethrough, 
              { width: strikeWidth }
            ]}
          />
              </View>

              {/* Description */}
              {task.description && (
                <Animated.Text 
                  className="text-foreground-secondary text-sm mt-1 leading-4"
                  style={{ opacity: textOpacity }}
                  numberOfLines={2}
                >
                  {task.description}
                </Animated.Text>
              )}

              {/* Priority and Due Date Row */}
              {(task.priority || task.dueDate) && (
                <View className="flex-row items-center mt-2 flex-wrap">
                  {/* Priority */}
                  {task.priority && (
                    <View className="flex-row items-center mr-4 mb-1">
                      <View 
                        className="w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                      />
                      <Text 
                        className="text-xs font-['Inter-Medium']"
                        style={{ color: getPriorityColor(task.priority) }}
                      >
                        {task.priority.toUpperCase()}
                      </Text>
                    </View>
                  )}

                  {/* Due Date */}
                  {task.dueDate && (
                    <View className="flex-row items-center mb-1">
                      <Calendar 
                        color={isDueDateOverdue(task.dueDate) ? '#FF4444' : '#787878'} 
                        size={12} 
                      />
                      <Text 
                        className="text-xs ml-1 font-['Inter-Medium']"
                        style={{ 
                          color: isDueDateOverdue(task.dueDate) ? '#FF4444' : '#787878'
                        }}
                      >
                        {formatDueDate(task.dueDate)}
                      </Text>
                    </View>
                  )}
                </View>
              )}
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
    marginBottom: 12,
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
  taskContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  strikethrough: {
    position: 'absolute',
    height: 1.5,
    backgroundColor: '#2D88FF',
    top: '50%',
    left: 0,
  }
});