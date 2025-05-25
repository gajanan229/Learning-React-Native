import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppContext, Task } from '@/contexts/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ChevronDown, Calendar, AlertCircle } from 'lucide-react-native';
import { format } from 'date-fns';
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function NewTaskScreen() {
  const router = useRouter();
  const { folders, addTask, updateTask, tasks } = useAppContext();
  const params = useLocalSearchParams();
  const taskId = params.id as string | undefined;
  const isEditMode = !!taskId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low' | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Load task data if editing
  useEffect(() => {
    if (isEditMode && taskId) {
      const taskToEdit = tasks.find(t => t.id === taskId);
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || '');
        setSelectedFolderId(taskToEdit.folderId);
        setPriority(taskToEdit.priority);
        setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : undefined);
      }
    }
  }, [isEditMode, taskId, tasks]);

  const handleSave = () => {
    if (!title.trim()) return;
    
    if (isEditMode && taskId) {
      // Update existing task
      updateTask(taskId, {
        title: title.trim(),
        description: description.trim() || undefined,
        folderId: selectedFolderId,
        priority,
        dueDate: dueDate?.toISOString()
      });
    } else {
      // Create new task
      addTask(
        title.trim(), 
        selectedFolderId, 
        description.trim() || undefined, 
        priority, 
        dueDate?.toISOString()
      );
    }
    router.back();
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
          >
            <X color="#EEEEEE" size={24} />
          </TouchableOpacity>
        </View>

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
                  >
                    <X color="#787878" size={18} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={() => setDatePickerVisibility(true)}
                  className="mt-2"
                >
                  <Text className="text-accent text-sm">Change Date</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                className="bg-background-secondary p-4 rounded-xl border border-foreground-tertiary"
                onPress={() => setDatePickerVisibility(true)}
              >
                <View className="flex-row items-center">
                  <Calendar color="#787878" size={20} />
                  <Text className="ml-3 text-foreground-secondary">Set due date</Text>
                  <ChevronDown color="#787878" size={20} style={{ marginLeft: 'auto' }} />
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Folder Selection */}
          <View className="mb-8">
            <Text className="text-foreground-secondary text-sm mb-2">Folder (Optional)</Text>
            <View className="flex-row flex-wrap">
              <TouchableOpacity
                className={`mr-2 mb-2 px-3 py-2 rounded-lg border ${
                  selectedFolderId === undefined 
                    ? 'bg-accent border-accent' 
                    : 'border-foreground-tertiary'
                }`}
                onPress={() => setSelectedFolderId(undefined)}
              >
                <Text className={selectedFolderId === undefined 
                  ? 'text-white' 
                  : 'text-foreground-secondary'
                }>
                  No Folder
                </Text>
              </TouchableOpacity>

              {folders.map(folder => (
                <TouchableOpacity
                  key={folder.id}
                  className={`mr-2 mb-2 px-3 py-2 rounded-lg border ${
                    selectedFolderId === folder.id 
                      ? 'bg-accent border-accent' 
                      : 'border-foreground-tertiary'
                  }`}
                  onPress={() => setSelectedFolderId(folder.id)}
                >
                  <Text className={selectedFolderId === folder.id 
                    ? 'text-white' 
                    : 'text-foreground-secondary'
                  }>
                    {folder.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            className={`py-4 px-6 rounded-xl items-center ${
              title.trim() ? 'bg-accent' : 'bg-foreground-tertiary'
            }`}
            onPress={handleSave}
            disabled={!title.trim()}
          >
            <Text className="text-white font-['Inter-Medium']">
              {isEditMode ? 'Update Task' : 'Add Task'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => setDatePickerVisibility(false)}
          date={dueDate || new Date()}
          minimumDate={new Date()}
        />
      </View>
    </SafeAreaView>
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