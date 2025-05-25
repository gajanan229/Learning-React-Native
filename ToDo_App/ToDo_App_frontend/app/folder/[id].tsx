import React, { useRef, useCallback } from 'react';
import { View, Text, Animated, ActivityIndicator, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/common/Header';
import TaskList from '@/components/tasks/TaskList';
import ActionButton from '@/components/common/ActionButton';
import BackButton from '@/components/common/BackButton';
import { useTasks } from '@/hooks/useTasks';
import { useFolders } from '@/hooks/useFolders';

export default function FolderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Use new backend-integrated hooks
  const { 
    tasks, 
    isLoading: tasksLoading, 
    error: tasksError,
    refetch: refetchTasks,
    clearError: clearTasksError 
  } = useTasks({ folderId: id ? parseInt(id) : undefined });
  
  const { 
    folders, 
    isLoading: foldersLoading, 
    error: foldersError,
    refetch: refetchFolders,
    clearError: clearFoldersError,
    getFolderById 
  } = useFolders();
  
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
  
  // Find the current folder
  const folder = getFolderById(id || '');
  
  // Get tasks for this folder
  const folderTasks = tasks.filter(task => task.folderId === id);
  const completedTasks = folderTasks.filter(t => t.completed).length;
  
  // Loading state for initial load
  if (isLoading && !folder && folders.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="text-foreground-secondary mt-4">Loading folder...</Text>
      </SafeAreaView>
    );
  }
  
  // Folder not found
  if (!folder && !isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-foreground mb-4">Folder not found</Text>
        <BackButton onPress={() => router.back()} />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header title={folder?.name || 'Folder'} scrollY={scrollY} showBack />
      
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
        {/* Error Display */}
        {hasError && (
          <View className="mb-4 p-4 bg-red-100 rounded-lg border border-red-200">
            <Text className="text-red-800 font-medium mb-1">Error Loading Data</Text>
            <Text className="text-red-600 text-sm">
              {foldersError || tasksError}
            </Text>
            <Text className="text-red-500 text-xs mt-2">
              Pull down to refresh
            </Text>
          </View>
        )}
        
        {/* Folder Header */}
        {folder && (
        <View className="mb-8">
          <Text className="text-3xl font-['Inter-Bold'] text-foreground mb-2">{folder.name}</Text>
          <Text className="text-foreground-secondary font-['Inter-Regular']">
              {isLoading ? 'Loading...' : `${folderTasks.length} tasks • ${completedTasks} completed`}
          </Text>
        </View>
        )}
        
        {/* Loading State for Tasks */}
        {isLoading && folderTasks.length === 0 && (
          <View className="flex-1 justify-center items-center py-12">
            <ActivityIndicator size="large" color="#007AFF" />
            <Text className="text-foreground-secondary mt-4">Loading tasks...</Text>
          </View>
        )}
        
        {/* Tasks List */}
        {!isLoading && (
        <View className="mb-6">
          <TaskList tasks={folderTasks} />
          
            {folderTasks.length === 0 && !hasError && (
            <View className="py-8 items-center">
              <Text className="text-foreground-secondary text-center">No tasks in this folder</Text>
              <Text className="text-foreground-tertiary text-center text-sm mt-1">
                Tap the + button to add a new task
              </Text>
            </View>
          )}
        </View>
        )}
      </Animated.ScrollView>
      
      <ActionButton folderId={id} />
    </SafeAreaView>
  );
}