import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define the expected structure of params, matching what movies/[id].tsx will send
// Note: All params from useLocalSearchParams are initially strings or string arrays.
export type RateMovieScreenParams = {
    movieId: string; // Will be parsed to number
    movieTitle?: string;
    moviePosterPath?: string;
    movieRuntime?: string; // Will be parsed to number or null
    movieGenres?: string;  // Will be JSON.parsed to string[] or null
    initialWatchedEntry?: string; // Will be JSON.parsed to WatchedMovieEntry or null
};

export default function RateMovieScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<RateMovieScreenParams>();

    // TODO: Parse params (in a useEffect or useMemo if complex)
    // const movieIdNum = params.movieId ? parseInt(params.movieId, 10) : undefined;
    // const runtime = params.movieRuntime ? parseInt(params.movieRuntime, 10) : null;
    // const genres = params.movieGenres ? JSON.parse(params.movieGenres) : null;
    // const initialEntry = params.initialWatchedEntry ? JSON.parse(params.initialWatchedEntry) : null;

    // Placeholder UI - using Tailwind classes for styling
    return (
        <SafeAreaView className="flex-1 bg-primary">
            <View className="flex-row justify-between items-center p-4">
                <Text 
                    className="text-white text-xl font-semibold w-[80%]"
                    numberOfLines={1} 
                    ellipsizeMode="tail"
                >
                    {params.movieTitle || 'Rate Movie'}
                </Text>
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <Text className="text-secondary text-lg">Close</Text>
                     {/* Replace with an icon later if desired */}
                </TouchableOpacity>
            </View>
            
            <ScrollView 
                className="flex-1 p-4"
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                <Text className="text-gray-400 text-center mb-4">
                    Movie ID: {params.movieId}
                </Text>
                
                {/* Section 1: Watched Date (Placeholder) */}
                <View className="mb-6">
                    <Text className="text-white text-lg font-semibold mb-2">Watched Date</Text>
                    <Text className="text-gray-500">[Date selector UI will go here]</Text>
                </View>

                {/* Section 2: Star Rating (Placeholder) */}
                <View className="mb-6">
                    <Text className="text-white text-lg font-semibold mb-2">Your Rating</Text>
                    <Text className="text-gray-500">[Star rating UI will go here]</Text>
                </View>

                {/* Section 3: Review Text (Placeholder) */}
                <View className="mb-6">
                    <Text className="text-white text-lg font-semibold mb-2">Your Review</Text>
                    <Text className="text-gray-500">[Review text input will go here]</Text>
                </View>

                {/* Section 4: Submit Button (Placeholder) */}
                <TouchableOpacity 
                    className="bg-secondary p-4 rounded-lg items-center mt-4"
                    // onPress={handleSubmit} // To be implemented
                >
                    <Text className="text-white text-lg font-semibold">Submit Review</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
} 