import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { colors, typography, spacing } from '../../../constants/theme';
import FolderList from '../../../components/folder/FolderList';
import FolderModal from '../../../components/folder/FolderModal';
import useAlarmStore from '../../../store/useAlarmStore';
import { Folder } from '../../../types';

export default function FoldersSettings() {
  const { folders, fetchFolders, addFolder, updateFolder, deleteFolder, toggleFolderActive } = useAlarmStore();
  
  const [isAddFolderModalVisible, setIsAddFolderModalVisible] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<Folder | undefined>(undefined);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  
  // Fetch folders when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchFolders();
    }, [fetchFolders])
  );
  
  // Open create folder modal
  const handleAddFolder = () => {
    setFolderToEdit(undefined);
    setIsAddFolderModalVisible(true);
  };
  
  // Open edit folder modal
  const handleEditFolder = (folder: Folder) => {
    setFolderToEdit(folder);
    setIsAddFolderModalVisible(true);
  };
  
  // Handle folder deletion
  const handleDeleteFolder = async (folderId: string) => {
    setFolderToDelete(folderId);
    // In a real app, show a confirmation modal here
    await deleteFolder(folderId);
    setFolderToDelete(null);
  };
  
  // Handle folder toggle
  const handleFolderToggle = async (folderId: string) => {
    await toggleFolderActive(folderId);
  };
  
  // Handle folder press (no-op in settings)
  const handleFolderPress = (folder: Folder) => {
    // In settings, tapping a folder should edit it
    handleEditFolder(folder);
  };
  
  // Handle save folder
  const handleSaveFolder = async (folderData: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (folderToEdit) {
      await updateFolder({
        ...folderToEdit,
        ...folderData,
      });
    } else {
      await addFolder(folderData);
    }
    
    setIsAddFolderModalVisible(false);
    setFolderToEdit(undefined);
  };
  
  return (
    <View style={styles.container}>
      <FolderList
        folders={folders}
        onFolderPress={handleFolderPress}
        onFolderToggle={handleFolderToggle}
        onFolderEdit={handleEditFolder}
        onFolderDelete={handleDeleteFolder}
      />
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddFolder}
        activeOpacity={0.7}
      >
        <Plus size={20} color={colors.text.primary} />
        <Text style={styles.addButtonText}>Add New Folder</Text>
      </TouchableOpacity>
      
      {/* Folder Create/Edit Modal */}
      <FolderModal
        visible={isAddFolderModalVisible}
        onClose={() => {
          setIsAddFolderModalVisible(false);
          setFolderToEdit(undefined);
        }}
        onSave={handleSaveFolder}
        folder={folderToEdit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent.primary,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  addButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
});