import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { CirclePlus as PlusCircle, Folder } from 'lucide-react-native';
import { colors, typography, spacing } from '../../constants/theme';
import FolderList from '../../components/folder/FolderList';
import FolderModal from '../../components/folder/FolderModal';
import useAlarmStore from '../../store/useAlarmStore';
import { Folder as FolderType } from '../../types';

export default function HomeFolderListScreen() {
  const router = useRouter();
  const { folders, fetchFolders, addFolder, updateFolder, deleteFolder, toggleFolderActive } = useAlarmStore();
  
  const [isAddFolderModalVisible, setIsAddFolderModalVisible] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<FolderType | undefined>(undefined);
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
  const handleEditFolder = (folder: FolderType) => {
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
  
  // Handle folder press (navigate to alarms)
  const handleFolderPress = (folder: FolderType) => {
    router.push({
      pathname: '/(tabs)/alarm-list',
      params: {
        folderId: folder.id,
        folderName: folder.name,
        folderRecurrenceDays: JSON.stringify(folder.recurrenceDays),
      },
    });
  };
  
  // Handle save folder
  const handleSaveFolder = async (folderData: Omit<FolderType, 'id' | 'createdAt' | 'updatedAt'>) => {
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
      <View style={styles.header}>
        <Text style={styles.title}>My Alarms</Text>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddFolder}
          activeOpacity={0.7}
        >
          <Folder size={20} color={colors.accent.primary} />
          <Text style={styles.addButtonText}>Folder</Text>
        </TouchableOpacity>
      </View>
      
      <FolderList
        folders={folders}
        onFolderPress={handleFolderPress}
        onFolderToggle={handleFolderToggle}
        onFolderEdit={handleEditFolder}
        onFolderDelete={handleDeleteFolder}
      />
      
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => router.push('/(tabs)/settings')}
        activeOpacity={0.7}
      >
        <Text style={styles.settingsButtonText}>Settings</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + spacing.lg, // Account for status bar
    paddingBottom: spacing.md,
    backgroundColor: colors.background.primary,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize['2xl'],
    color: colors.text.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  addButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.accent.primary,
    marginLeft: spacing.xs,
  },
  settingsButton: {
    alignSelf: 'center',
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  settingsButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
});