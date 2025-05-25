import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useFolders } from '@/hooks/useFolders';

export default function NewFolderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const folderId = params.id as string | undefined;
  const isEditMode = !!folderId;

  // Use new backend-integrated hooks
  const { 
    createFolder, 
    updateFolder, 
    getFolderById,
    isLoading: foldersLoading,
    error: foldersError,
    clearError: clearFoldersError
  } = useFolders();

  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load folder data if editing
  useEffect(() => {
    if (isEditMode && folderId) {
      const folderToEdit = getFolderById(folderId);
      if (folderToEdit) {
        setName(folderToEdit.name);
      }
    }
  }, [isEditMode, folderId, getFolderById]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Folder name is required');
      return;
    }
    
    setIsSaving(true);
    clearFoldersError();
    
    try {
      if (isEditMode && folderId) {
        // Update existing folder
        await updateFolder(folderId, {
          name: name.trim()
        });
      } else {
        // Create new folder
        await createFolder({
          name: name.trim()
        });
      }
      
    router.back();
    } catch (error: any) {
      console.error('Error saving folder:', error);
      Alert.alert(
        'Save Failed', 
        error.response?.data?.message || error.message || 'Failed to save folder. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state for initial data (only needed in edit mode)
  if (isEditMode && foldersLoading && !name) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="text-foreground-secondary mt-4">Loading folder...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 pt-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-['Inter-Bold'] text-foreground">
            {isEditMode ? 'Edit Folder' : 'New Folder'}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full"
            disabled={isSaving}
          >
            <X color="#EEEEEE" size={24} />
          </TouchableOpacity>
        </View>

        {/* Error Display */}
        {foldersError && (
          <View className="mb-4 p-4 bg-red-100 rounded-lg border border-red-200">
            <Text className="text-red-800 font-medium mb-1">Error</Text>
            <Text className="text-red-600 text-sm">
              {foldersError}
            </Text>
          </View>
        )}

        {/* Folder Name Input */}
        <View className="mb-8">
          <Text className="text-foreground-secondary text-sm mb-2">Folder Name</Text>
          <TextInput
            className="bg-background-secondary p-4 rounded-xl text-foreground"
            style={styles.input}
            placeholder="Enter folder name"
            placeholderTextColor="#787878"
            value={name}
            onChangeText={setName}
            autoFocus={!isEditMode}
            editable={!isSaving}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className={`p-4 rounded-xl flex-row items-center justify-center ${
            !name.trim() || isSaving ? 'bg-background-secondary' : 'bg-accent'
          }`}
          onPress={handleSave}
          disabled={!name.trim() || isSaving}
        >
          {isSaving ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text className="text-white font-['Inter-Medium'] ml-2">
                {isEditMode ? 'Updating...' : 'Creating...'}
              </Text>
            </>
          ) : (
            <Text className={`font-['Inter-Medium'] ${
              !name.trim() ? 'text-foreground-tertiary' : 'text-white'
            }`}>
              {isEditMode ? 'Update Folder' : 'Create Folder'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    fontFamily: 'Inter-Regular',
  },
});