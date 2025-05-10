import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext'; // Adjust path if necessary
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { logout, currentUser, isLoading } = useAuth();

    const handleLogout = async () => {
        // Optional: Ask for confirmation before logging out
        Alert.alert(
            "Logout",
            "Are you sure you want to log out?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    onPress: async () => {
                        await logout();
                        // Navigation to login screen is handled by RootLayout reacting to auth state change
                    },
                    style: "destructive"
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-primary p-6">
            <View className="flex-1 items-center justify-center">
                <Text className="text-white text-2xl font-bold mb-4">
                    Profile
                </Text>
                {currentUser && (
                    <Text className="text-gray-300 text-lg mb-8">
                        Logged in as: {currentUser.email}
                    </Text>
                )}
                <TouchableOpacity
                    className={`bg-red-600 rounded-lg p-4 w-full max-w-xs items-center ${isLoading ? 'opacity-50' : ''}`}
                    onPress={handleLogout}
                    disabled={isLoading}
                >
                    <Text className="text-white text-lg font-semibold">Logout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
