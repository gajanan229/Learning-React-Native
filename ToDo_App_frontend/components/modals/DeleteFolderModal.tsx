import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAppContext, Folder } from '@/contexts/AppContext';
import BaseModal from './BaseModal';
import { TriangleAlert as AlertTriangle } from 'lucide-react-native';

export default function DeleteFolderModal() {
  const { 
    isModalVisible, 
    modalType, 
    currentItem,
    hideModal,
    deleteFolder
  } = useAppContext();
  
  // Determine if the modal should be visible
  const visible = isModalVisible && modalType === 'delete-folder';
  
  // Get folder information
  const folder = currentItem as Folder | null;
  
  const handleDeleteWithTasks = () => {
    if (folder) {
      deleteFolder(folder.id, 'delete');
      hideModal();
    }
  };
  
  const handleDeleteKeepTasks = () => {
    if (folder) {
      deleteFolder(folder.id, 'keep');
      hideModal();
    }
  };
  
  if (!folder) return null;
  
  return (
    <BaseModal 
      visible={visible} 
      onClose={hideModal}
    >
      <View className="items-center">
        <AlertTriangle color="#F44336" size={40} className="mb-4" />
        
        <Text className="text-xl font-['Inter-Bold'] text-foreground mb-2 text-center">
          Delete Folder
        </Text>
        
        <Text className="text-foreground-secondary mb-6 text-center">
          What would you like to do with the tasks in "{folder.name}"?
        </Text>
        
        {/* Delete options */}
        <View className="w-full mb-3">
          <TouchableOpacity
            className="w-full py-4 px-6 rounded-xl items-center bg-background mb-3"
            onPress={handleDeleteKeepTasks}
          >
            <Text className="text-foreground font-['Inter-Medium']">
              Keep Tasks (Move to Ungrouped)
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="w-full py-4 px-6 rounded-xl items-center bg-error"
            onPress={handleDeleteWithTasks}
          >
            <Text className="text-white font-['Inter-Medium']">
              Delete Folder and All Tasks
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Cancel button */}
        <TouchableOpacity
          className="mt-2"
          onPress={hideModal}
        >
          <Text className="text-foreground-secondary">Cancel</Text>
        </TouchableOpacity>
      </View>
    </BaseModal>
  );
}