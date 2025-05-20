import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { CirclePlus as PlusCircle, Folder as FolderIcon } from 'lucide-react-native';
import { colors, typography, spacing } from '../../constants/theme';
import FolderList from '../../components/folder/FolderList';
import FolderModal from '../../components/folder/FolderModal';
import useAlarmStore from '../../store/useAlarmStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Folder as FolderType } from '../../types';

export default function HomeFolderListScreen() {
  const router = useRouter();
  const {
    folders,
    fetchFolders,
    addFolder,
    updateFolder,
    deleteFolder,
    toggleFolderActive,
    isLoadingFolders,
    errorFolders,
  } = useAlarmStore();
  const { isAuthenticated } = useAuthStore();
  
  const [isAddFolderModalVisible, setIsAddFolderModalVisible] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<FolderType | undefined>(undefined);
  
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        console.log("HomeFolderListScreen focused, user authenticated, fetching folders...");
      fetchFolders();
      }
    }, [fetchFolders, isAuthenticated])
  );
  
  useEffect(() => {
    if (isAuthenticated) {
        console.log("HomeFolderListScreen mounted, user authenticated, fetching folders...");
        fetchFolders();
    }
  }, [isAuthenticated, fetchFolders]);
  
  const handleAddFolderPress = () => {
    setFolderToEdit(undefined);
    setIsAddFolderModalVisible(true);
  };
  
  const handleEditFolder = (folder: FolderType) => {
    setFolderToEdit(folder);
    setIsAddFolderModalVisible(true);
  };
  
  const handleDeleteFolder = async (folderId: string | number) => {
    try {
    await deleteFolder(folderId);
    } catch (error) {
      console.error("Failed to delete folder:", error);
      Alert.alert("Error", "Could not delete folder. " + (error instanceof Error ? error.message : ''));
    }
  };
  
  const handleFolderToggle = async (folderId: string | number) => {
    try {
    await toggleFolderActive(folderId);
    } catch (error) {
      console.error("Failed to toggle folder active state:", error);
      Alert.alert("Error", "Could not update folder status. " + (error instanceof Error ? error.message : ''));
    }
  };
  
  const handleFolderPress = (folder: FolderType) => {
    router.push({
      pathname: '/(tabs)/alarm-list',
      params: {
        folderId: folder.id.toString(),
        folderName: folder.name,
        folderRecurrenceDays: folder.recurrence_days ? JSON.stringify(folder.recurrence_days) : JSON.stringify([]),
      },
    });
  };
  
  const handleSaveFolder = async (folderData: Omit<FolderType, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      if (folderToEdit && folderToEdit.id) {
        await updateFolder(folderToEdit.id, folderData); 
    } else {
      await addFolder(folderData);
    }
    setIsAddFolderModalVisible(false);
    setFolderToEdit(undefined);
    } catch (error) {
      console.error("Failed to save folder:", error);
      Alert.alert("Error", "Could not save folder. " + (error instanceof Error ? error.message : ''));
    }
  };
  
  let content;
  if (isLoadingFolders) {
    content = <ActivityIndicator size="large" color={colors.accent.primary} style={styles.centeredMessage} />;
  } else if (errorFolders) {
    content = <Text style={styles.centeredMessage}>Error: {errorFolders}</Text>;
  } else if (folders.length === 0) {
    content = <Text style={styles.centeredMessage}>No alarm folders yet. Tap 'Folder' to create one!</Text>;
  } else {
    content = (
      <FolderList
        folders={folders}
        onFolderPress={handleFolderPress}
        onFolderToggle={handleFolderToggle}
        onFolderEdit={handleEditFolder}
        onFolderDelete={handleDeleteFolder}
      />
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Alarms</Text>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddFolderPress}
          activeOpacity={0.7}
        >
          <FolderIcon size={20} color={colors.accent.primary} />
          <Text style={styles.addButtonText}>Folder</Text>
        </TouchableOpacity>
      </View>
      
      {content}
      
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => router.push('/(tabs)/settings')}
        activeOpacity={0.7}
      >
        <Text style={styles.settingsButtonText}>Settings</Text>
      </TouchableOpacity>
      
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
    paddingTop: spacing.xl + spacing.lg,
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
  centeredMessage: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingHorizontal: spacing.lg,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  }
});