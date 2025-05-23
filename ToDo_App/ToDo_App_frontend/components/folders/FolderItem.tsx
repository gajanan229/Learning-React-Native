import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Folder, CreditCard as Edit } from 'lucide-react-native';
import { useAppContext, Folder as FolderType } from '@/contexts/AppContext';

interface FolderItemProps {
  folder: FolderType;
  taskCount: number;
  completionCount: number;
}

export default function FolderItem({ folder, taskCount, completionCount }: FolderItemProps) {
  const router = useRouter();
  const { showModal } = useAppContext();
  
  const handlePress = () => {
    router.push(`/folder/${folder.id}`);
  };
  
  const handleEdit = () => {
    showModal('folder', folder);
  };
  
  // Calculate completion percentage
  const completionPercentage = taskCount > 0 
    ? Math.round((completionCount / taskCount) * 100) 
    : 0;
  
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      className="mb-4 p-4 rounded-xl bg-background-secondary"
      style={styles.folderContainer}
    >
      <View className="flex-row items-center mb-3">
        <Folder color="#2D88FF" size={24} />
        <Text className="ml-2 text-lg font-['Inter-Medium'] text-foreground flex-1">
          {folder.name}
        </Text>
        
        <TouchableOpacity
          className="p-2 rounded-full"
          onPress={handleEdit}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Edit color="#787878" size={18} />
        </TouchableOpacity>
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
  );
}

const styles = StyleSheet.create({
  folderContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  }
});