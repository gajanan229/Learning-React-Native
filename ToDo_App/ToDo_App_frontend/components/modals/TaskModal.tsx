import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppContext, Task, Folder } from '@/contexts/AppContext';
import BaseModal from './BaseModal';

export default function TaskModal() {
  const { 
    isModalVisible, 
    modalType, 
    currentItem, 
    currentFolderId,
    hideModal, 
    addTask, 
    updateTask,
    folders
  } = useAppContext();
  
  const [title, setTitle] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);
  
  // Determine if the modal should be visible
  const visible = isModalVisible && modalType === 'task';
  
  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      if (currentItem) {
        // Editing existing task
        const task = currentItem as Task;
        setTitle(task.title);
        setSelectedFolderId(task.folderId);
      } else {
        // Creating new task
        setTitle('');
        setSelectedFolderId(currentFolderId);
      }
    }
  }, [visible, currentItem, currentFolderId]);
  
  const handleSave = () => {
    if (!title.trim()) return;
    
    if (currentItem) {
      // Update existing task
      updateTask(currentItem.id, { 
        title: title.trim(),
        folderId: selectedFolderId
      });
    } else {
      // Create new task
      addTask(title.trim(), selectedFolderId);
    }
    
    hideModal();
  };
  
  const handleFolderSelect = (folderId: string | undefined) => {
    setSelectedFolderId(folderId);
  };
  
  return (
    <BaseModal 
      visible={visible} 
      onClose={hideModal}
    >
      <View>
        <Text className="text-xl font-['Inter-Bold'] text-foreground mb-6">
          {currentItem ? 'Edit Task' : 'New Task'}
        </Text>
        
        {/* Task title input */}
        <View className="mb-6">
          <Text className="text-foreground-secondary text-sm mb-2">Task</Text>
          <TextInput
            className="bg-background p-4 rounded-xl text-foreground"
            style={styles.input}
            placeholder="What do you need to do?"
            placeholderTextColor="#787878"
            value={title}
            onChangeText={setTitle}
            autoFocus
            multiline
          />
        </View>
        
        {/* Folder selection */}
        <View className="mb-8">
          <Text className="text-foreground-secondary text-sm mb-2">Folder (Optional)</Text>
          
          <View className="flex-row flex-wrap">
            {/* "No folder" option */}
            <TouchableOpacity
              className={`mr-2 mb-2 px-3 py-2 rounded-lg border ${
                selectedFolderId === undefined 
                  ? 'bg-accent border-accent' 
                  : 'border-foreground-tertiary'
              }`}
              onPress={() => handleFolderSelect(undefined)}
            >
              <Text 
                className={selectedFolderId === undefined 
                  ? 'text-white' 
                  : 'text-foreground-secondary'
                }
              >
                No Folder
              </Text>
            </TouchableOpacity>
            
            {/* Folder options */}
            {folders.map(folder => (
              <TouchableOpacity
                key={folder.id}
                className={`mr-2 mb-2 px-3 py-2 rounded-lg border ${
                  selectedFolderId === folder.id 
                    ? 'bg-accent border-accent' 
                    : 'border-foreground-tertiary'
                }`}
                onPress={() => handleFolderSelect(folder.id)}
              >
                <Text 
                  className={selectedFolderId === folder.id 
                    ? 'text-white' 
                    : 'text-foreground-secondary'
                  }
                >
                  {folder.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Save button */}
        <TouchableOpacity
          className={`py-4 px-6 rounded-xl items-center ${
            title.trim() ? 'bg-accent' : 'bg-foreground-tertiary'
          }`}
          onPress={handleSave}
          disabled={!title.trim()}
        >
          <Text className="text-white font-['Inter-Medium']">
            {currentItem ? 'Update Task' : 'Add Task'}
          </Text>
        </TouchableOpacity>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  input: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  }
});