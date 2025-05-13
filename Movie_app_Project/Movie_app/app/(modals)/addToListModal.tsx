import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, FlatList, Alert } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAllUserListsAPI, addMovieToListAPI } from '../../services/listService'; // Adjusted path for services
import { UserList, MovieForListPayload } from '../../interfaces/listTypes'; // Adjusted path for interfaces
import { useAuth } from '../../context/AuthContext'; // Adjusted path for AuthContext

export type AddToListModalParams = {
    movieId: string;
    movieTitle: string;
    moviePosterPath: string;
    movieRuntime?: string;
    movieGenres?: string;
};

export default function AddToListModalScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<AddToListModalParams>();
    const { isAuthenticated } = useAuth();

    const [isLoadingLists, setIsLoadingLists] = useState(false);
    const [userLists, setUserLists] = useState<UserList[]>([]);
    const [errorFetchingLists, setErrorFetchingLists] = useState<string | null>(null);
    const [isAddingToListId, setIsAddingToListId] = useState<number | null>(null);

    const fetchLists = useCallback(async () => {
        if (!isAuthenticated) {
            setErrorFetchingLists("Please log in to view and add to your lists.");
            setIsLoadingLists(false);
            setUserLists([]);
            return;
        }
        setIsLoadingLists(true);
        setErrorFetchingLists(null);
        try {
            const data = await getAllUserListsAPI();
            setUserLists(data);
        } catch (err) {
            console.error("Failed to load lists in modal:", err);
            setErrorFetchingLists((err as Error).message || "Could not load your lists.");
            setUserLists([]);
        } finally {
            setIsLoadingLists(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        // console.log("AddToListModal mounted with params:", params);
        fetchLists();
    }, [fetchLists]); // Removed params from dependency array as they don't change post-mount for this effect

    const handleAddMovieToSpecificList = async (listId: number) => {
        if (!params.movieId || !params.movieTitle || !params.moviePosterPath) {
            Alert.alert("Error", "Movie details are missing. Cannot add to list.");
            return;
        }
        setIsAddingToListId(listId);
        try {
            const movieIdNum = parseInt(params.movieId, 10);
            const runtimeNum = params.movieRuntime && params.movieRuntime !== 'undefined' && params.movieRuntime !== 'null' ? parseInt(params.movieRuntime, 10) : undefined;
            const genresArray = params.movieGenres && params.movieGenres !== 'undefined' ? JSON.parse(params.movieGenres) : undefined;

            const payload: MovieForListPayload = {
              movie_tmdb_id: movieIdNum,
              title: params.movieTitle,
              poster_url: params.moviePosterPath, // Assuming this is the relative path
              runtime_minutes: runtimeNum,
              genres: genresArray,
            };

            await addMovieToListAPI(listId, payload);
            Alert.alert("Success", `'${params.movieTitle}' added to the selected list.`);
            // Optionally, refetch lists to update movie_count or provide other UI feedback
            // fetchLists(); 
        } catch (error: any) {
            console.error("Failed to add movie to list:", error);
            let errorMessage = "Failed to add movie to list. Please try again.";
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message; 
            }
            Alert.alert("Error", errorMessage);
        } finally {
            setIsAddingToListId(null);
        }
    };

    const renderListItem = ({ item: list }: { item: UserList }) => (
        <TouchableOpacity
            onPress={() => handleAddMovieToSpecificList(list.id)}
            disabled={isAddingToListId === list.id || isLoadingLists}
            className="w-full bg-dark-200 p-4 rounded-lg mb-3 flex-row justify-between items-center"
        >
            <View className="flex-1 mr-2">
                <Text className="text-white text-lg font-semibold">{list.list_name}</Text>
                <Text className="text-gray-400 text-sm mt-1">{list.movie_count} movies</Text>
            </View>
            {isAddingToListId === list.id && <ActivityIndicator color="#FFFFFF" size="small" />}
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-primary pt-5">
            <View className="flex-row justify-between items-center px-4 pb-3 border-b border-gray-700">
                <Text className="text-white text-xl font-semibold flex-1 mr-2" numberOfLines={1} ellipsizeMode="tail">
                    Add "{params.movieTitle || 'Movie'}" to a list
                </Text>
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <Text className="text-accent text-lg font-medium">Close</Text>
                </TouchableOpacity>
            </View>

            {isLoadingLists && !errorFetchingLists ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
            ) : errorFetchingLists ? (
                <View className="flex-1 justify-center items-center px-4">
                    <Text className="text-red-500 text-center mb-4">{errorFetchingLists}</Text>
                    <TouchableOpacity onPress={fetchLists} className="bg-secondary px-4 py-2 rounded-md">
                        <Text className="text-white">Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={userLists}
                    renderItem={renderListItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop:16, paddingBottom: 70, flexGrow: 1 }}
                    ListEmptyComponent={() => (
                        <View className="flex-1 justify-center items-center">
                            <Text className="text-gray-400 text-center text-base">
                                You have no lists yet.
                            </Text>
                            <Text className="text-gray-400 text-center text-base mt-1">
                                Create one from the 'My Lists' tab!
                            </Text>
                        </View>
                    )}
                />
            )}

            {/* Placeholder for "Create New List & Add" button at the bottom */}
            {/* <View className="p-4 border-t border-gray-700 fixed bottom-0 left-0 right-0 bg-primary">
                <TouchableOpacity className="bg-secondary py-3 rounded-lg">
                    <Text className="text-white text-center font-semibold">Create New List & Add</Text>
                </TouchableOpacity>
            </View> */}
        </View>
    );
} 