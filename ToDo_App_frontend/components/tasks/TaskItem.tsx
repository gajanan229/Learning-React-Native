import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { CircleCheck as CheckCircle, Circle, Trash2 } from 'lucide-react-native';
import { useAppContext, Task } from '@/contexts/AppContext';
import { Swipeable } from 'react-native-gesture-handler';

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  const { toggleTask, deleteTask, showModal } = useAppContext();
  const swipeableRef = useRef<Swipeable>(null);
  const checkAnim = useRef(new Animated.Value(task.completed ? 1 : 0)).current;

  // Update animation if task completion changes
  useEffect(() => {
    Animated.timing(checkAnim, {
      toValue: task.completed ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [task.completed]);

  // Animation values
  const textOpacity = checkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.6],
  });
  
  const strikeWidth = checkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });
  
  const handleToggle = () => {
    toggleTask(task.id);
  };

  const handleEdit = () => {
    showModal('task', task);
  };
  
  const handleDelete = () => {
    // Close swipeable after animation
    swipeableRef.current?.close();
    
    // Slight delay to allow swipe animation to finish
    setTimeout(() => {
      deleteTask(task.id);
    }, 300);
  };
  
  // Render right actions for swipe gesture
  const renderRightActions = (progress: any) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [100, 0],
    });
    
    return (
      <Animated.View 
        style={[
          { transform: [{ translateX: trans }] },
          { width: 80, backgroundColor: '#F44336' }
        ]}
      >
        <TouchableOpacity 
          className="flex-1 items-center justify-center"
          onPress={handleDelete}
        >
          <Trash2 color="#FFFFFF" size={24} />
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleEdit}
        className="mb-3 py-4 px-4 rounded-xl bg-background-secondary flex-row items-center"
        style={styles.taskContainer}
      >
        <TouchableOpacity onPress={handleToggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          {task.completed ? (
            <CheckCircle color="#2D88FF" size={24} />
          ) : (
            <Circle color="#787878" size={24} />
          )}
        </TouchableOpacity>
        
        <View className="flex-1 ml-3">
          <Animated.Text 
            className="text-foreground font-['Inter-Medium']"
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
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
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