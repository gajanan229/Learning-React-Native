import React, { useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '@/contexts/AppContext';
import Header from '@/components/common/Header';
import FolderList from '@/components/folders/FolderList';
import ActionButton from '@/components/common/ActionButton';

export default function FoldersScreen() {
  const { folders, tasks } = useAppContext();
  const scrollY = useRef(new Animated.Value(0)).current;
  
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
        contentContainerClassName="pb-24 pt-4"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Header Section */}
        <View className="mb-8">
          <Text className="text-3xl font-['Inter-Bold'] text-foreground mb-2">Folders</Text>
          <Text className="text-foreground-secondary font-['Inter-Regular']">
            Organize your tasks into projects
          </Text>
        </View>
        
        {/* Folders List */}
        <View className="mb-6">
          <FolderList 
            folders={folders} 
            getTaskCount={getFolderTaskCount}
            getCompletionCount={getFolderCompletionCount}
          />
          
          {folders.length === 0 && (
            <View className="py-12 items-center">
              <Text className="text-foreground-secondary text-center">No folders yet</Text>
              <Text className="text-foreground-tertiary text-center text-sm mt-1">
                Tap the + button to create a new folder
              </Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>
      
      <ActionButton mode="folder" />
    </SafeAreaView>
  );
}