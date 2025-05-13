import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator
} from 'react-native';
import type { UserList, MovieInList } from '../../interfaces/listTypes'; // Adjust path if needed
import { router } from 'expo-router';
import { getListDetailsAPI } from '../../services/listService'; // Added
// import { icons } from '@/constants/icons'; // Uncomment when you have icons

interface UserListPreviewProps {
    list: UserList;
}

// Basic Skeleton Loader for movie posters
const MoviePosterSkeleton = () => (
    <View className="w-24 h-36 bg-gray-700 rounded-md mr-2" />
);

const UserListPreview: React.FC<UserListPreviewProps> = ({ list }) => {
    const [previewMovies, setPreviewMovies] = useState<MovieInList[]>([]);
    const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false); // Start false, set true only if fetching
    const [previewError, setPreviewError] = useState<string | null>(null);

    const fetchPreviewMovies = useCallback(async () => {
        if (list.movie_count === 0) {
            setPreviewMovies([]);
            setIsLoadingPreview(false);
            return;
        }

        setIsLoadingPreview(true);
        setPreviewError(null);
        try {
            const data = await getListDetailsAPI(list.id);
            setPreviewMovies(data.movies.slice(0, 7)); // Take top 7 for preview
        } catch (error) {
            console.error(`Error fetching preview movies for list ${list.id}:`, error);
            setPreviewError("Couldn't load movie previews.");
            setPreviewMovies([]); // Clear movies on error
        } finally {
            setIsLoadingPreview(false);
        }
    }, [list.id, list.movie_count]);

    useEffect(() => {
        fetchPreviewMovies();
    }, [fetchPreviewMovies]);

    return (
        <View className="mb-6 p-4 bg-gray-800 rounded-lg shadow-md mx-4">
            {/* Header Section */}
            <View className="flex-row justify-between items-center mb-1">
                <Text className="text-white text-xl font-bold flex-shrink mr-2" numberOfLines={1} ellipsizeMode="tail">
                    {list.list_name}
                </Text>
                {list.list_type === 'custom' && (
                    <TouchableOpacity
                        onPress={() => {/* TODO: Implement Edit/Delete options */}}
                        className="p-1"
                        accessibilityLabel="List options"
                    >
                        <Text className="text-white text-xl">...</Text>
                        {/* <Image source={icons.ellipsis} className="w-5 h-5" tintColor="#FFF" /> */}
                    </TouchableOpacity>
                )}
            </View>

            <Text className="text-gray-400 text-sm mb-3">
                {list.movie_count} {list.movie_count === 1 ? 'movie' : 'movies'}
            </Text>

            {/* Horizontal Movie Poster Scroll */}
            {list.movie_count > 0 ? (
                isLoadingPreview ? (
                    <View className="mt-2 -mx-1 py-1 flex-row">
                        {/* Show a few skeleton loaders */} 
                        {Array.from({ length: Math.min(list.movie_count, 5) }).map((_, index) => (
                            <MoviePosterSkeleton key={`skeleton-${list.id}-${index}`} />
                        ))}
                    </View>
                ) : previewError ? (
                    <Text className="text-red-500 italic my-4">{previewError}</Text>
                ) : previewMovies.length > 0 ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mt-2 -mx-1 py-1" // Negative margin to align items with padding of parent
                        contentContainerStyle={{ paddingHorizontal: 4 }} // Added padding for scroll content
                    >
                        {previewMovies.map((movie) => (
                            <TouchableOpacity
                                key={movie.tmdb_id}
                                className="w-24 h-36 bg-gray-700 rounded-md mr-2 active:bg-gray-600 overflow-hidden"
                                onPress={() => router.push(`/movies/${movie.tmdb_id}` as any)}
                            >
                                <Image
                                    source={{ uri: movie.poster_url }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                ) : (
                    // This case might occur if fetch completed but returned no movies, 
                    // though list.movie_count > 0 was initially true.
                    <Text className="text-gray-500 italic my-4">No previews available for this list.</Text>
                )
            ) : (
                <Text className="text-gray-500 italic my-4">This list is empty.</Text>
            )}

            {/* "View All" Button */}
            <TouchableOpacity
                className="mt-4 self-start bg-secondary-200 active:bg-secondary-100 px-4 py-2 rounded-md shadow"
                onPress={() => router.push({ pathname: `/listDetails/${list.id}`, params: { listName: list.list_name } } as any)}
                accessibilityLabel={`View all movies in ${list.list_name}`}
            >
                <Text className="text-primary font-semibold">View All</Text>
            </TouchableOpacity>
        </View>
    );
};

export default UserListPreview; 