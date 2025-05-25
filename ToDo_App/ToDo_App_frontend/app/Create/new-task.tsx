import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ChevronDown, Calendar, AlertCircle } from 'lucide-react-native';
import { format } from 'date-fns';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useTasks } from '@/hooks/useTasks';
import { useFolders } from '@/hooks/useFolders';
import { Task } from '@/types/api';

export default function NewTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const taskId = params.id as string | undefined;
  const isEditMode = !!taskId;

  // Use new backend-integrated hooks
  const { 
    tasks,
    createTask, 
    updateTask, 
    getTaskById,
    isLoading: tasksLoading,
    error: tasksError,
    clearError: clearTasksError
  } = useTasks();
  
  const { 
    folders,
    isLoading: foldersLoading,
    error: foldersError,
    clearError: clearFoldersError
  } = useFolders();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low' | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load task data if editing
  useEffect(() => {
    if (isEditMode && taskId) {
      const taskToEdit = getTaskById(taskId);
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || '');
        setSelectedFolderId(taskToEdit.folderId);
        setPriority(taskToEdit.priority);
        setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : undefined);
      }
    }
  }, [isEditMode, taskId, getTaskById]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Task title is required');
      return;
    }
    
    setIsSaving(true);
    clearTasksError();
    clearFoldersError();
    
    try {
      if (isEditMode && taskId) {
        // Update existing task - only include folderId if it has a value
        const updateData: any = {
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          dueDate: dueDate?.toISOString()
        };
        
        if (selectedFolderId !== undefined) {
          updateData.folderId = selectedFolderId;
        }
        
        await updateTask(taskId, updateData);
      } else {
        // Create new task - only include folderId if it has a value
        const createData: any = {
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          dueDate: dueDate?.toISOString()
        };
        
        if (selectedFolderId) {
          createData.folderId = selectedFolderId;
        }
        
        await createTask(createData);
      }
      
    router.back();
    } catch (error: any) {
      console.error('Error saving task:', error);
      Alert.alert(
        'Save Failed', 
        error.response?.data?.message || error.message || 'Failed to save task. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDateConfirm = (date: Date) => {
    setDueDate(date);
    setDatePickerVisibility(false);
  };

  const clearDueDate = () => {
    setDueDate(undefined);
  };

  const getPriorityColor = (priorityLevel: 'high' | 'medium' | 'low') => {
    switch (priorityLevel) {
      case 'high': return '#FF4444';
      case 'medium': return '#FFA500';
      case 'low': return '#4CAF50';
    }
  };

  const getPriorityLabel = (priorityLevel: 'high' | 'medium' | 'low') => {
    switch (priorityLevel) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
    }
  };

  // Loading state for initial data
  if ((tasksLoading || foldersLoading) && folders.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="text-foreground-secondary mt-4">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 pt-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-['Inter-Bold'] text-foreground">
            {isEditMode ? 'Edit Task' : 'New Task'}
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
        {(tasksError || foldersError) && (
          <View className="mb-4 p-4 bg-red-100 rounded-lg border border-red-200">
            <Text className="text-red-800 font-medium mb-1">Error</Text>
            <Text className="text-red-600 text-sm">
              {tasksError || foldersError}
            </Text>
          </View>
        )}

        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Task Input */}
        <View className="mb-6">
            <Text className="text-foreground-secondary text-sm mb-2">Task Title</Text>
          <TextInput
            className="bg-background-secondary p-4 rounded-xl text-foreground"
            style={styles.input}
            placeholder="What do you need to do?"
            placeholderTextColor="#787878"
            value={title}
            onChangeText={setTitle}
              autoFocus={!isEditMode}
              editable={!isSaving}
            />
          </View>

          {/* Description Input */}
          <View className="mb-6">
            <Text className="text-foreground-secondary text-sm mb-2">Description (Optional)</Text>
            <TextInput
              className="bg-background-secondary p-4 rounded-xl text-foreground"
              style={[styles.input, { minHeight: 80 }]}
              placeholder="Add more details about this task..."
              placeholderTextColor="#787878"
              value={description}
              onChangeText={setDescription}
            multiline
              textAlignVertical="top"
              editable={!isSaving}
          />
        </View>

          {/* Priority Selector */}
          <View className="mb-6">
            <Text className="text-foreground-secondary text-sm mb-2">Priority (Optional)</Text>
          <View className="flex-row flex-wrap">
            <TouchableOpacity
                className={`mr-2 mb-2 px-4 py-3 rounded-xl border flex-row items-center ${
                  priority === undefined 
                  ? 'bg-accent border-accent' 
                    : 'border-foreground-tertiary bg-background-secondary'
                }`}
                onPress={() => setPriority(undefined)}
                disabled={isSaving}
              >
                <Text className={priority === undefined 
                  ? 'text-white font-["Inter-Medium"]' 
                  : 'text-foreground-secondary'
                }>
                  No Priority
                </Text>
              </TouchableOpacity>

              {(['high', 'medium', 'low'] as const).map(priorityLevel => (
                <TouchableOpacity
                  key={priorityLevel}
                  className={`mr-2 mb-2 px-4 py-3 rounded-xl border flex-row items-center ${
                    priority === priorityLevel 
                      ? 'border-accent' 
                  : 'border-foreground-tertiary'
              }`}
                  style={priority === priorityLevel ? { backgroundColor: getPriorityColor(priorityLevel) + '20' } : { backgroundColor: '#1A1A1A' }}
                  onPress={() => setPriority(priorityLevel)}
                  disabled={isSaving}
                >
                  <View 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: getPriorityColor(priorityLevel) }}
                  />
                  <Text className={priority === priorityLevel 
                    ? 'text-white font-["Inter-Medium"]' 
                : 'text-foreground-secondary'
              }>
                    {getPriorityLabel(priorityLevel)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Due Date Selector */}
          <View className="mb-6">
            <Text className="text-foreground-secondary text-sm mb-2">Due Date (Optional)</Text>
            
            {dueDate ? (
              <View className="bg-background-secondary p-4 rounded-xl">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <Calendar color="#007AFF" size={20} />
                    <Text className="ml-3 text-foreground font-['Inter-Medium']">
                      {format(dueDate, 'EEEE, MMMM d, yyyy')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={clearDueDate}
                    className="ml-2 p-1"
                    disabled={isSaving}
                  >
                    <X color="#787878" size={18} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  className="mt-3 py-2"
                  onPress={() => setDatePickerVisibility(true)}
                  disabled={isSaving}
                >
                  <Text className="text-accent text-sm">Change Date</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                className="bg-background-secondary p-4 rounded-xl flex-row items-center"
                onPress={() => setDatePickerVisibility(true)}
                disabled={isSaving}
              >
                <Calendar color="#787878" size={20} />
                <Text className="ml-3 text-foreground-secondary">Set due date</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Folder Selector */}
          <View className="mb-6">
            <Text className="text-foreground-secondary text-sm mb-2">Folder (Optional)</Text>
            <View className="bg-background-secondary p-4 rounded-xl">
              <TouchableOpacity
                className={`mb-2 p-3 rounded-lg ${!selectedFolderId ? 'bg-accent' : 'bg-background'}`}
                onPress={() => setSelectedFolderId(undefined)}
                disabled={isSaving}
              >
                <Text className={!selectedFolderId ? 'text-white' : 'text-foreground-secondary'}>
                  No folder (Inbox)
              </Text>
            </TouchableOpacity>

            {folders.map(folder => (
              <TouchableOpacity
                key={folder.id}
                  className={`mb-2 p-3 rounded-lg ${selectedFolderId === folder.id ? 'bg-accent' : 'bg-background'}`}
                onPress={() => setSelectedFolderId(folder.id)}
                  disabled={isSaving}
              >
                  <Text className={selectedFolderId === folder.id ? 'text-white' : 'text-foreground-secondary'}>
                  {folder.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        </ScrollView>

        {/* Save Button */}
        <View className="px-4 pb-8">
        <TouchableOpacity
            className={`p-4 rounded-xl flex-row items-center justify-center ${
              !title.trim() || isSaving ? 'bg-background-secondary' : 'bg-accent'
          }`}
          onPress={handleSave}
            disabled={!title.trim() || isSaving}
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
                !title.trim() ? 'text-foreground-tertiary' : 'text-white'
              }`}>
                {isEditMode ? 'Update Task' : 'Create Task'}
              </Text>
            )}
        </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => setDatePickerVisibility(false)}
          minimumDate={new Date()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    fontFamily: 'Inter-Regular',
  },
});