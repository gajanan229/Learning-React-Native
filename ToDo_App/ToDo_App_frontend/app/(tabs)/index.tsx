import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, ActivityIndicator, RefreshControl } from 'react-native';
import TaskList from '@/components/tasks/TaskList';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/common/Header';
import ActionButton from '@/components/common/ActionButton';
import { useTasks } from '@/hooks/useTasks';
import { useFolders } from '@/hooks/useFolders';

export default function HomeScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Use new backend-integrated hooks
  const { 
    tasks, 
    isLoading: tasksLoading, 
    error: tasksError, 
    refetch: refetchTasks,
    clearError: clearTasksError 
  } = useTasks();
  
  const { 
    folders, 
    isLoading: foldersLoading, 
    error: foldersError,
    refetch: refetchFolders,
    clearError: clearFoldersError 
  } = useFolders();
  
  // Get tasks that don't belong to any folder
  const ungroupedTasks = tasks.filter(task => !task.folderId);
  
  // Combined loading state
  const isLoading = tasksLoading || foldersLoading;
  const hasError = tasksError || foldersError;
  
  // Handle pull to refresh
  const onRefresh = useCallback(async () => {
    clearTasksError();
    clearFoldersError();
    try {
      await Promise.all([refetchTasks(), refetchFolders()]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, [refetchTasks, refetchFolders, clearTasksError, clearFoldersError]);
  
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
        contentContainerStyle={{ paddingBottom: 96, paddingTop: 16 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            colors={['#007AFF']}
          />
        }
      >
        {/* Header Section */}
        <View className="mb-8">
          <Text className="text-3xl font-['Inter-Bold'] text-foreground mb-2">Zenith Task</Text>
          <Text className="text-foreground-secondary font-['Inter-Regular']">
            Your tasks, beautifully organized
          </Text>
        </View>
        
        {/* Error Display */}
        {hasError && (
          <View className="mb-4 p-4 bg-red-100 rounded-lg border border-red-200">
            <Text className="text-red-800 font-medium mb-1">Error Loading Data</Text>
            <Text className="text-red-600 text-sm">
              {tasksError || foldersError}
            </Text>
            <Text className="text-red-500 text-xs mt-2">
              Pull down to refresh
            </Text>
          </View>
        )}
        
        {/* Loading State */}
        {isLoading && tasks.length === 0 && (
          <View className="flex-1 justify-center items-center py-12">
            <ActivityIndicator size="large" color="#007AFF" />
            <Text className="text-foreground-secondary mt-4">Loading your tasks...</Text>
          </View>
        )}
        
        {/* Task Count Summary */}
        <View className="flex-row justify-between mb-6 bg-background-secondary p-4 rounded-xl">
          <View className="items-center">
            <Text className="text-foreground-secondary text-xs mb-1">All Tasks</Text>
            <Text className="text-foreground text-lg font-['Inter-Bold']">
              {isLoading ? '...' : tasks.length}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-foreground-secondary text-xs mb-1">Completed</Text>
            <Text className="text-foreground text-lg font-['Inter-Bold']">
              {isLoading ? '...' : tasks.filter(t => t.completed).length}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-foreground-secondary text-xs mb-1">Folders</Text>
            <Text className="text-foreground text-lg font-['Inter-Bold']">
              {isLoading ? '...' : folders.length}
            </Text>
          </View>
        </View>
        
        {/* Tasks List */}
        {!isLoading && (
        <View className="mb-6">
          <Text className="text-foreground font-['Inter-Medium'] text-lg mb-4">My Tasks</Text>
          <TaskList tasks={ungroupedTasks} />
          
            {ungroupedTasks.length === 0 && !hasError && (
            <View className="py-8 items-center">
              <Text className="text-foreground-secondary text-center">No tasks yet</Text>
              <Text className="text-foreground-tertiary text-center text-sm mt-1">
                Tap the + button to add a new task
              </Text>
            </View>
          )}
        </View>
        )}
      </Animated.ScrollView>
      
      <ActionButton/>
    </SafeAreaView>
  );
}