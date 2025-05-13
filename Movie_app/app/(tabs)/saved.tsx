import React, { useState, useCallback } from 'react';
import {
    View, Text, ActivityIndicator, TouchableOpacity, FlatList, RefreshControl
} from 'react-native'; // Removed ScrollView as FlatList handles scroll
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext'; // Adjust path if needed
import { getAllUserListsAPI } from '../../services/listService'; // Adjust path if needed
import type { UserList } from '../../interfaces/listTypes'; // Adjust path if needed
import { icons } from '@/constants/icons'; // Assuming icons are managed here
import UserListPreview from '../../components/lists/UserListPreview'; // Import the new component
import MovieListShort from '../../components/profile/MovieListShort';

const MyListsScreen = () => {
    const { isAuthenticated } = useAuth();
    // Removed systemLists/customLists separation here, can filter later if needed
    const [userLists, setUserLists] = useState<UserList[]>([]); 
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    const loadUserLists = useCallback(async () => {
        if (!isAuthenticated) {
            setError("Please log in to view your lists.");
            setIsLoading(false);
            setUserLists([]); // Clear lists
            return;
        }
        if (!isRefreshing) setIsLoading(true);
        setError(null);
        try {
            const fetchedLists = await getAllUserListsAPI();
            // Sort system lists first, then custom lists alphabetically
            fetchedLists.sort((a, b) => {
                if (a.list_type !== 'custom' && b.list_type === 'custom') return -1;
                if (a.list_type === 'custom' && b.list_type !== 'custom') return 1;
                if (a.list_type === 'watchlist' && b.list_type === 'favorites') return -1;
                if (a.list_type === 'favorites' && b.list_type === 'watchlist') return 1;
                // For lists of the same type (system or custom), sort by name
                return a.list_name.localeCompare(b.list_name);
            });
            console.log("fetchedLists", fetchedLists);
            setUserLists(fetchedLists);
        } catch (err: any) {
            console.error("Failed to load lists:", err);
            setError(err.message || "Could not load your lists.");
            setUserLists([]);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [isAuthenticated, isRefreshing]);

    useFocusEffect(
        useCallback(() => {
            loadUserLists();
        }, [loadUserLists])
    );

    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        loadUserLists(); // Call load explicitly on refresh activation
    }, [loadUserLists]);

    // Use the new component for rendering each item
    const renderListItem = ({ item }: { item: UserList }) => (
        <UserListPreview list={item} />
    );

    const renderListHeader = () => (
        <View className="px-4 pt-4 pb-2 flex-row justify-between items-center mb-4">
            <Text className="text-white text-2xl font-bold">My Lists</Text>
            <TouchableOpacity
                onPress={() => router.push('/(modals)/createListModal' as any)}
                className="bg-secondary p-2 rounded-full"
                accessibilityLabel="Create New List"
            >
                <Text className="text-white text-xl">+</Text>
                {/* <Image source={icons.plus} className="w-6 h-6" tintColor="#FFFFFF" /> */}
            </TouchableOpacity>
        </View>
    );

    const renderEmptyComponent = () => (
        <View className="items-center mt-20 px-4">
            <Text className="text-gray-400 text-center mb-4">You haven't created any lists yet.</Text>
            <TouchableOpacity
                onPress={() => router.push('/(modals)/createListModal' as any)}
                className="bg-secondary px-4 py-2 rounded"
            >
                <Text className="text-white">Create Your First List</Text>
            </TouchableOpacity>
        </View>
    );

    if (isLoading && !isRefreshing) {
        return (
            <SafeAreaView className="bg-primary flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#FFFFFF" />
            </SafeAreaView>
        );
    }

    if (error && !userLists.length) { // Show error fullscreen only if no data is loaded
        return (
            <SafeAreaView className="bg-primary flex-1 justify-center items-center px-4">
                 {renderListHeader()} {/* Show header even on error */}
                <Text className="text-red-500 text-center mb-4">Error: {error}</Text>
                <TouchableOpacity
                    onPress={loadUserLists}
                    className="bg-secondary px-4 py-2 rounded"
                >
                    <Text className="text-white">Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="bg-primary flex-1">
            
            
            <FlatList
                data={userLists}
                renderItem={renderListItem}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={renderListHeader}
                ListEmptyComponent={renderEmptyComponent} // Use FlatList's built-in empty component
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor="#FFFFFF"
                        colors={["#FFFFFF"]}
                    />
                }
                // Add some padding to the bottom if needed
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </SafeAreaView>
    );
};

export default MyListsScreen;

