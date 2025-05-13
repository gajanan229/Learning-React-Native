import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { RatedMovieSummary } from '@/services/profileStatsService'; // Import the type

interface MovieListShortProps {
    title: string;
    movies: RatedMovieSummary[];
}

const MovieListShort: React.FC<MovieListShortProps> = ({ title, movies }) => {
    const router = useRouter();

    if (!movies || movies.length === 0) {
        return (
            <View className="my-3">
                <Text className="text-white text-lg font-semibold mb-2 px-1">{title}</Text>
                <View className="bg-gray-800 p-3 rounded-md items-center">
                    <Text className="text-gray-400">No movies to display in this list yet.</Text>
                </View>
            </View>
        );
    }

    return (
        <View className="my-3">
            <Text className="text-white text-lg font-semibold mb-3 px-1">{title}</Text>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 1 }}>
                {movies.map((movie) => (
                    <TouchableOpacity
                        key={movie.tmdb_id}
                        className="bg-gray-800 rounded-lg overflow-hidden w-32 mr-3 active:bg-gray-700"
                        onPress={() => router.push(`/movies/${movie.tmdb_id}`)}
                    >
                        <Image
                            source={{ uri: movie.poster_url || 'https://via.placeholder.com/128x192.png?text=No+Image' }}
                            className="w-full h-48"
                            resizeMode="cover"
                        />
                        <View className="p-2">
                            <Text className="text-white text-xs font-semibold mb-1" numberOfLines={2} ellipsizeMode="tail">
                                {movie.title}
                            </Text>
                            <Text className="text-yellow-400 text-xs">
                                Rated: {movie.user_rating.toFixed(1)}/5
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

export default MovieListShort; 