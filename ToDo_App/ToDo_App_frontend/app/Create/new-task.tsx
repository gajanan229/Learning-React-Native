import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/contexts/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

export default function NewTaskScreen() {
  const router = useRouter();
  const { folders, addTask } = useAppContext();
  const [title, setTitle] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);

  const handleSave = () => {
    if (!title.trim()) return;
    addTask(title.trim(), selectedFolderId);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 pt-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-['Inter-Bold'] text-foreground">New Task</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full"
          >
            <X color="#EEEEEE" size={24} />
          </TouchableOpacity>
        </View>

        {/* Task Input */}
        <View className="mb-6">
          <Text className="text-foreground-secondary text-sm mb-2">Task</Text>
          <TextInput
            className="bg-background-secondary p-4 rounded-xl text-foreground"
            style={styles.input}
            placeholder="What do you need to do?"
            placeholderTextColor="#787878"
            value={title}
            onChangeText={setTitle}
            autoFocus
            multiline
          />
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
          <Text className="text-white font-['Inter-Medium']">Add Task</Text>
        </TouchableOpacity>
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