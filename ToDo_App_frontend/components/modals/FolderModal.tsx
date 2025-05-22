import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppContext, Folder } from '@/contexts/AppContext';
import BaseModal from './BaseModal';

export default function FolderModal() {
  const { 
    isModalVisible, 
    modalType, 
    currentItem,
    hideModal, 
    addFolder,
    updateFolder,
    showModal
  } = useAppContext();
  
  const [name, setName] = useState('');
  
  // Determine if the modal should be visible
  const visible = isModalVisible && modalType === 'folder';
  
  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      if (currentItem) {
        // Editing existing folder
        const folder = currentItem as Folder;
        setName(folder.name);
      } else {
        // Creating new folder
        setName('');
      }
    }
  }, [visible, currentItem]);
  
  const handleSave = () => {
    if (!name.trim()) return;
    
    if (currentItem) {
      // Update existing folder
      updateFolder(currentItem.id, name.trim());
    } else {
      // Create new folder
      addFolder(name.trim());
    }
    
    hideModal();
  };
  
  const handleDelete = () => {
    if (currentItem) {
      hideModal();
      
      // Show delete confirmation modal
      showModal('delete-folder', currentItem);
    }
  };
  
  return (
    <BaseModal 
      visible={visible} 
      onClose={hideModal}
    >
      <View>
        <Text className="text-xl font-['Inter-Bold'] text-foreground mb-6">
          {currentItem ? 'Edit Folder' : 'New Folder'}
        </Text>
        
        {/* Folder name input */}
        <View className="mb-8">
          <Text className="text-foreground-secondary text-sm mb-2">Folder Name</Text>
          <TextInput
            className="bg-background p-4 rounded-xl text-foreground"
            style={styles.input}
            placeholder="Enter folder name"
            placeholderTextColor="#787878"
            value={name}
            onChangeText={setName}
            autoFocus
          />
        </View>
        
        {/* Action buttons */}
        <View className="flex-row">
          {/* Delete button (only for editing) */}
          {currentItem && (
            <TouchableOpacity
              className="flex-1 py-4 px-6 rounded-xl items-center bg-error mr-2"
              onPress={handleDelete}
            >
              <Text className="text-white font-['Inter-Medium']">Delete</Text>
            </TouchableOpacity>
          )}
          
          {/* Save button */}
          <TouchableOpacity
            className={`flex-1 py-4 px-6 rounded-xl items-center ${
              name.trim() ? 'bg-accent' : 'bg-foreground-tertiary'
            }`}
            onPress={handleSave}
            disabled={!name.trim()}
          >
            <Text className="text-white font-['Inter-Medium']">
              {currentItem ? 'Update Folder' : 'Create Folder'}
            </Text>
          </TouchableOpacity>
        </View>
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