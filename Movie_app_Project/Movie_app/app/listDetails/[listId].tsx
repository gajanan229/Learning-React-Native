import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    StyleSheet,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getListDetailsAPI } from '../../services/listService';
import type { UserList, MovieInList, ListWithMoviesResponse, Movie } from '../../interfaces/listTypes';
import MovieCard from '../../components/MovieCard';

const ListDetailsScreen = () => {
    const params = useLocalSearchParams<{ listId: string; listName?: string }>();
    const { listId, listName: initialListName } = params;

    const [listDetails, setListDetails] = useState<UserList | null>(null);
    const [moviesInList, setMoviesInList] = useState<MovieInList[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadListDetails = useCallback(async () => {
        if (!listId) {
            setError("List ID is missing.");
            setIsLoading(false);
            return;
        }

        console.log(`Fetching details for list ID: ${listId}`);
        setIsLoading(true);
        setError(null);

        try {
            const data: ListWithMoviesResponse = await getListDetailsAPI(listId);
            console.log("Fetched list details:", data);
            setListDetails(data.listDetails);
            setMoviesInList(data.movies);
        } catch (err: any) {
            console.error(`Error loading list details for ${listId}:`, err);
            setError("Could not load list details. Please try again.");
            // Optional: More specific error handling based on err.response?.status
            Alert.alert("Error", "Could not load list details.");
        } finally {
            setIsLoading(false);
        }
    }, [listId]);

    useFocusEffect(
        useCallback(() => {
            loadListDetails();
        }, [loadListDetails])
    );

    const renderMovieItem = ({ item }: { item: MovieInList }) => {
        const movieForCard: Movie = {
             id: item.tmdb_id,
             title: item.title,
             poster_path: item.poster_url ?? null, 
             vote_average: item.vote_average, 
             release_date: item.release_date, 
        };

        return <MovieCard {...movieForCard} />;
    };

    return (
        <SafeAreaView className="bg-primary flex-1">
            <Stack.Screen
                options={{
                    title: listDetails?.list_name || initialListName || 'List Details',
                    headerStyle: { backgroundColor: '#1F1F1F' }, 
                    headerTintColor: '#FFFFFF', 
                    headerTitleStyle: { color: '#FFFFFF' },
                }}
            />

            {isLoading && !listDetails && !error ? ( 
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#FF8E00" />
                </View>
            ) : error ? (
                <View className="flex-1 justify-center items-center p-4">
                    <Text className="text-red-500 text-center text-lg mb-4">{error}</Text>
                    <TouchableOpacity onPress={loadListDetails} className="bg-secondary p-3 rounded-lg">
                         <Text className="text-primary font-semibold">Retry</Text>
                     </TouchableOpacity>
                </View>
            ) : listDetails ? (
                <FlatList
                    data={moviesInList}
                    renderItem={renderMovieItem}
                    keyExtractor={(item) => item.tmdb_id.toString()}
                    numColumns={3} 
                    className="px-5"
                    columnWrapperStyle={{
                        justifyContent: 'center',
                        gap: 16, 
                        marginVertical: 8
                    }}
                    ListHeaderComponent={ 
                        <View className="pt-4 mb-2">
                            {listDetails.description ? (
                                <Text className="text-gray-400 text-sm mb-3 px-1">{listDetails.description}</Text>
                            ) : null}
                            <Text className="text-gray-500 text-xs mb-2 px-1">
                                {listDetails.movie_count} {listDetails.movie_count === 1 ? 'item' : 'items'}
                            </Text>
                            {listDetails.list_type === 'custom' && (
                                <View className="flex-row space-x-2 mt-2 px-1 mb-3">
                                    <TouchableOpacity className="bg-gray-600 py-1 px-3 rounded">
                                         <Text className="text-white text-xs">Edit List (Soon)</Text>
                                     </TouchableOpacity>
                                    <TouchableOpacity className="bg-red-700 py-1 px-3 rounded">
                                         <Text className="text-white text-xs">Delete List (Soon)</Text>
                                     </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    }
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center mt-10">
                             <Text className="text-gray-400 text-center p-10">This list is empty.</Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            ) : ( 
                <View className="flex-1 justify-center items-center">
                     <Text className="text-gray-400">List data not available.</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

export default ListDetailsScreen;

// Optional: Add some basic styles if needed, though NativeWind is preferred
// const styles = StyleSheet.create({
//   container: { ... },
//   loadingContainer: { ... },
//   errorContainer: { ... },
//   // ... other styles
// }); 