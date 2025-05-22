import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/contexts/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

export default function NewFolderScreen() {
  const router = useRouter();
  const { addFolder } = useAppContext();
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    addFolder(name.trim());
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 pt-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-['Inter-Bold'] text-foreground">New Folder</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full"
          >
            <X color="#EEEEEE" size={24} />
          </TouchableOpacity>
        </View>

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
            autoFocus
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className={`py-4 px-6 rounded-xl items-center ${
            name.trim() ? 'bg-accent' : 'bg-foreground-tertiary'
          }`}
          onPress={handleSave}
          disabled={!name.trim()}
        >
          <Text className="text-white font-['Inter-Medium']">Create Folder</Text>
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