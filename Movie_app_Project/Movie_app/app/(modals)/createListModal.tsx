import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable, // For dismissing keyboard
    Keyboard // For dismissing keyboard
} from 'react-native';
import { router } from 'expo-router';
import { createListAPI } from '../../services/listService'; // Corrected path
import { SafeAreaView } from 'react-native-safe-area-context';

const CreateListModal = () => {
    const [listName, setListName] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateList = async () => {
        if (listName.trim() === '') {
            setError('List name cannot be empty.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await createListAPI({
                list_name: listName.trim(),
                list_type: 'custom',
                description: description.trim() || undefined // Send undefined if empty
            });
            // Success!
            router.back(); // Close the modal
            // The saved.tsx screen will refetch on focus

        } catch (err: any) {
            console.error("Create list error:", err);
            let errorMessage = "Failed to create list. Please try again.";
            // Check if the error response indicates a conflict (409)
            // Axios errors often have err.response?.status
            if (err.response?.status === 409) {
                errorMessage = "A custom list with this name already exists.";
            }
            setError(errorMessage);
            Alert.alert("Error", errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-primary">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <Pressable className="flex-1 justify-center items-center p-6" onPress={Keyboard.dismiss}>
                    <View className="w-full bg-gray-800 p-6 rounded-xl shadow-lg">
                        <Text className="text-white text-2xl font-bold mb-6 text-center">Create New List</Text>

                        {error && (
                            <Text className="text-red-500 text-center mb-4">{error}</Text>
                        )}

                        <TextInput
                            placeholder="Enter list name"                            
                            placeholderTextColor="#9CA3AF" // gray-400
                            value={listName}
                            onChangeText={setListName}
                            className="bg-gray-700 text-white px-4 py-3 rounded-lg mb-4 border border-gray-600 focus:border-secondary"
                        />

                        <TextInput
                            placeholder="Enter description (optional)"
                            placeholderTextColor="#9CA3AF" // gray-400
                            value={description}
                            onChangeText={setDescription}
                            multiline={true}
                            numberOfLines={3}
                            className="bg-gray-700 text-white px-4 py-3 rounded-lg mb-6 border border-gray-600 focus:border-secondary h-24"
                            textAlignVertical="top"
                        />

                        <View className="flex-row justify-around w-full mt-4">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="bg-gray-600 px-6 py-3 rounded-lg flex-1 mx-2 items-center"
                                disabled={isSubmitting}
                            >
                                <Text className="text-white font-semibold">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleCreateList}
                                className="bg-secondary px-6 py-3 rounded-lg flex-1 mx-2 items-center"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text className="text-primary font-semibold">Create List</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default CreateListModal; 