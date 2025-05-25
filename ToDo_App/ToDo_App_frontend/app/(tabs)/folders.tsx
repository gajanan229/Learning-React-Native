import React, { useRef, useCallback } from 'react';
import { View, Text, Animated, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/common/Header';
import FolderList from '@/components/folders/FolderList';
import ActionButton from '@/components/common/ActionButton';
import { useTasks } from '@/hooks/useTasks';
import { useFolders } from '@/hooks/useFolders';

export default function FoldersScreen() {
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
  
  // Get task counts for each folder
  const getFolderTaskCount = (folderId: string) => {
    return tasks.filter(task => task.folderId === folderId).length;
  };
  
  // Get completion counts for each folder
  const getFolderCompletionCount = (folderId: string) => {
    return tasks.filter(task => task.folderId === folderId && task.completed).length;
  };
  
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header title="Folders" scrollY={scrollY} />
      
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
          <Text className="text-3xl font-['Inter-Bold'] text-foreground mb-2">Folders</Text>
          <Text className="text-foreground-secondary font-['Inter-Regular']">
            Organize your tasks into projects
          </Text>
        </View>
        
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
        
        {/* Loading State */}
        {isLoading && folders.length === 0 && (
          <View className="flex-1 justify-center items-center py-12">
            <ActivityIndicator size="large" color="#007AFF" />
            <Text className="text-foreground-secondary mt-4">Loading your folders...</Text>
          </View>
        )}
        
        {/* Folders List */}
        {!isLoading && (
        <View className="mb-6">
          <FolderList 
            folders={folders} 
            getTaskCount={getFolderTaskCount}
            getCompletionCount={getFolderCompletionCount}
          />
          
            {folders.length === 0 && !hasError && (
            <View className="py-12 items-center">
              <Text className="text-foreground-secondary text-center">No folders yet</Text>
              <Text className="text-foreground-tertiary text-center text-sm mt-1">
                Tap the + button to create a new folder
              </Text>
            </View>
          )}
        </View>
        )}
      </Animated.ScrollView>
      
      <ActionButton mode="folder" />
    </SafeAreaView>
  );
}