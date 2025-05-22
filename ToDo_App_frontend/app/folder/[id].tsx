import React, { useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '@/contexts/AppContext';
import Header from '@/components/common/Header';
import TaskList from '@/components/tasks/TaskList';
import ActionButton from '@/components/common/ActionButton';
import BackButton from '@/components/common/BackButton';

export default function FolderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { folders, tasks } = useAppContext();
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Find the current folder
  const folder = folders.find(f => f.id === id);
  
  // Get tasks for this folder
  const folderTasks = tasks.filter(task => task.folderId === id);
  const completedTasks = folderTasks.filter(t => t.completed).length;
  
  if (!folder) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-foreground">Folder not found</Text>
        <BackButton onPress={() => router.back()} />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header title={folder.name} scrollY={scrollY} showBack />
      
      <Animated.ScrollView
        className="flex-1 px-4"
        contentContainerClassName="pb-24 pt-4"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Folder Header */}
        <View className="mb-8">
          <Text className="text-3xl font-['Inter-Bold'] text-foreground mb-2">{folder.name}</Text>
          <Text className="text-foreground-secondary font-['Inter-Regular']">
            {folderTasks.length} tasks • {completedTasks} completed
          </Text>
        </View>
        
        {/* Tasks List */}
        <View className="mb-6">
          <TaskList tasks={folderTasks} />
          
          {folderTasks.length === 0 && (
            <View className="py-8 items-center">
              <Text className="text-foreground-secondary text-center">No tasks in this folder</Text>
              <Text className="text-foreground-tertiary text-center text-sm mt-1">
                Tap the + button to add a new task
              </Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>
      
      <ActionButton folderId={id} />
    </SafeAreaView>
  );
}