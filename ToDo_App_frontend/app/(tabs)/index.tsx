import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import TaskList from '@/components/tasks/TaskList';
import { useAppContext } from '@/contexts/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/common/Header';
import ActionButton from '@/components/common/ActionButton';

export default function HomeScreen() {
  const { tasks, folders } = useAppContext();
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Get tasks that don't belong to any folder
  const ungroupedTasks = tasks.filter(task => !task.folderId);
  
  // Header animation based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header title="Tasks" scrollY={scrollY} />
      
      <Animated.ScrollView
        className="flex-1 px-4"
        contentContainerClassName="pb-24 pt-4"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Header Section */}
        <View className="mb-8">
          <Text className="text-3xl font-['Inter-Bold'] text-foreground mb-2">Zenith Task</Text>
          <Text className="text-foreground-secondary font-['Inter-Regular']">
            Your tasks, beautifully organized
          </Text>
        </View>
        
        {/* Task Count Summary */}
        <View className="flex-row justify-between mb-6 bg-background-secondary p-4 rounded-xl">
          <View className="items-center">
            <Text className="text-foreground-secondary text-xs mb-1">All Tasks</Text>
            <Text className="text-foreground text-lg font-['Inter-Bold']">{tasks.length}</Text>
          </View>
          <View className="items-center">
            <Text className="text-foreground-secondary text-xs mb-1">Completed</Text>
            <Text className="text-foreground text-lg font-['Inter-Bold']">
              {tasks.filter(t => t.completed).length}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-foreground-secondary text-xs mb-1">Folders</Text>
            <Text className="text-foreground text-lg font-['Inter-Bold']">{folders.length}</Text>
          </View>
        </View>
        
        {/* Tasks List */}
        <View className="mb-6">
          <Text className="text-foreground font-['Inter-Medium'] text-lg mb-4">My Tasks</Text>
          <TaskList tasks={ungroupedTasks} />
          
          {ungroupedTasks.length === 0 && (
            <View className="py-8 items-center">
              <Text className="text-foreground-secondary text-center">No tasks yet</Text>
              <Text className="text-foreground-tertiary text-center text-sm mt-1">
                Tap the + button to add a new task
              </Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>
      
      <ActionButton/>
    </SafeAreaView>
  );
}