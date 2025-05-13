import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import StarInput from '../../components/StarInput'; // Corrected path
import { addOrUpdateWatchedMovieAPI, WatchedMoviePayload } from '../../services/watchedMovieService'; // Added API service and payload type

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

    // State for parsed movie details that might be needed elsewhere on the screen
    const [parsedMovieId, setParsedMovieId] = useState<number | undefined>();
    const [parsedMovieRuntime, setParsedMovieRuntime] = useState<number | undefined>();
    const [parsedMovieGenres, setParsedMovieGenres] = useState<string[] | undefined>();

    // State for the form fields
    const [selectedWatchDate, setSelectedWatchDate] = useState<string | null>(null);
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [reviewText, setReviewText] = useState<string>('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission loading

    // Helper to format date to YYYY-MM-DD
    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    const todayDateString = formatDate(new Date());

    useEffect(() => {
        if (params.movieId) {
            setParsedMovieId(parseInt(params.movieId, 10));
        }
        if (params.movieRuntime) {
            setParsedMovieRuntime(parseInt(params.movieRuntime, 10));
        }
        if (params.movieGenres) {
            try {
                setParsedMovieGenres(JSON.parse(params.movieGenres));
            } catch (e) {
                console.error("Failed to parse movieGenres:", e);
                setParsedMovieGenres(undefined);
            }
        }

        if (params.initialWatchedEntry) {
            try {
                const parsedInitialWatchedEntry = JSON.parse(params.initialWatchedEntry);
                if (parsedInitialWatchedEntry) {
                    setSelectedRating(parsedInitialWatchedEntry.rating || null);
                    // Ensure date format is YYYY-MM-DD if it comes from DB, or adjust parsing as needed
                    setSelectedWatchDate(parsedInitialWatchedEntry.watch_date || null); 
                    setReviewText(parsedInitialWatchedEntry.review_notes || '');
                }
            } catch (e) {
                console.error("Failed to parse initialWatchedEntry:", e);
                // Reset to defaults if parsing fails
                setSelectedRating(null);
                setSelectedWatchDate(null);
                setReviewText('');
            }
        }
    }, [params.initialWatchedEntry, params.movieId, params.movieRuntime, params.movieGenres]);

    const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios'); // On iOS, manage dismissal, Android dismisses automatically
        if (selectedDate && (event.type === 'set' || Platform.OS === 'ios')) { // event.type check for Android
            setSelectedWatchDate(formatDate(selectedDate));
        }
    };

    const handleSubmit = async () => {
        if (!parsedMovieId) {
            Alert.alert("Error", "Movie ID is missing. Cannot save review.");
            return;
        }
        if (!params.movieTitle || !params.moviePosterPath) {
            Alert.alert("Error", "Movie title or poster is missing. Cannot save review.");
            return;
        }

        setIsSubmitting(true);

        const payload: WatchedMoviePayload = {
            movie_tmdb_id: parsedMovieId,
            title: params.movieTitle,
            poster_url: params.moviePosterPath,
            runtime_minutes: parsedMovieRuntime || null,
            genres: parsedMovieGenres || null,
            rating: selectedRating,
            watch_date: selectedWatchDate,
            review_notes: reviewText.trim() || null,
        };

        try {
            await addOrUpdateWatchedMovieAPI(payload);
            Alert.alert("Success", "Review saved!");
            router.back(); 
        } catch (error) {
            console.error("Failed to save review:", error);
            const errorMessage = (error as any)?.response?.data?.message || (error as Error)?.message || "Failed to save review. Please try again.";
            Alert.alert("Error", errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

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
            
            {/* Temporary display for verification
            <View className="p-4 bg-gray-800 mb-4">
                <Text className="text-white text-xs">Movie Title: {params.movieTitle}</Text>
                <Text className="text-white text-xs">Parsed Movie ID: {parsedMovieId}</Text>
                <Text className="text-white text-xs">Parsed Runtime: {parsedMovieRuntime} mins</Text>
                <Text className="text-white text-xs">Parsed Genres: {parsedMovieGenres?.join(', ')}</Text>
                <Text className="text-white text-xs mt-2">--- Initial Entry Data ---</Text>
                <Text className="text-white text-xs">Date: {selectedWatchDate}</Text>
                <Text className="text-white text-xs">Rating: {selectedRating}</Text>
                <Text className="text-white text-xs">Review: {reviewText}</Text>
            </View> */}
            
            <ScrollView 
                className="flex-1 p-4"
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                
                {/* Section 1: Watched Date */}
                <View className="mb-6">
                    <Text className="text-white text-lg font-semibold mb-3">Watched Date</Text>
                    <View className="flex-row justify-between items-center mb-3">
                        <TouchableOpacity 
                            className={`py-2 px-3 rounded-lg border border-gray-600 ${selectedWatchDate === null ? 'bg-secondary' : 'bg-gray-700'}`}
                            onPress={() => setSelectedWatchDate(null)}
                        >
                            <Text className={`text-sm ${selectedWatchDate === null ? 'text-white' : 'text-gray-400'}`}>No Date</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            className={`py-2 px-3 rounded-lg border border-gray-600 ${selectedWatchDate === todayDateString ? 'bg-secondary' : 'bg-gray-700'}`}
                            onPress={() => setSelectedWatchDate(todayDateString)}
                        >
                            <Text className={`text-sm ${selectedWatchDate === todayDateString ? 'text-white' : 'text-gray-400'}`}>Today</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            className={`py-2 px-3 rounded-lg border border-gray-600 flex-1 ml-2 ${selectedWatchDate && selectedWatchDate !== todayDateString ? 'bg-secondary' : 'bg-gray-700'}`}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text className={`text-sm text-center ${selectedWatchDate && selectedWatchDate !== todayDateString ? 'text-white' : 'text-gray-400'}`}>
                                {selectedWatchDate && selectedWatchDate !== todayDateString && selectedWatchDate !== null 
                                    ? new Date(selectedWatchDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                                    : 'Choose Date'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {selectedWatchDate && (
                        <Text className="text-gray-400 text-xs text-center mb-3">
                            Selected: {new Date(selectedWatchDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </Text>
                    )}
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={new Date(selectedWatchDate || Date.now())}
                        mode="date"
                        display={Platform.OS === 'ios' ? "inline" : "default"} // "inline" or "compact" for iOS, "default" or "spinner" for Android
                        onChange={handleDateChange}
                        maximumDate={new Date()} // Users cannot select a future date
                    />
                )}

                {/* Section 2: Star Rating */}
                <View className="mb-6">
                    <Text className="text-white text-lg font-semibold mb-2">Your Rating</Text>
                    <View className="flex-row items-center mb-2">
                        {[0, 1, 2, 3, 4].map((index) => (
                            <StarInput
                                key={index}
                                starIndex={index}
                                rating={selectedRating || 0}
                                onRate={(newRate: number) => setSelectedRating(newRate)}
                                size={36}
                                color="#FFD700"
                            />
                        ))}
                        {selectedRating !== null && selectedRating !== undefined && (
                            <Text className="text-white text-lg font-semibold ml-3">
                                {Number(selectedRating).toFixed(1)} / 5.0
                            </Text>
                        )}
                    </View>
                    {/* Clear Rating Button */}
                    {selectedRating !== null && (
                         <TouchableOpacity 
                            onPress={() => setSelectedRating(null)} 
                            className="py-1 px-3 rounded-md border border-gray-600 self-start mt-1 bg-gray-700 active:bg-gray-600"
                        >
                            <Text className="text-gray-300 text-xs">Clear Rating</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Section 3: Review Text */}
                <View className="mb-6">
                    <Text className="text-white text-lg font-semibold mb-2">Your Review</Text>
                    <TextInput
                        className="bg-gray-700 text-white p-3 rounded-lg h-32 border border-gray-600 text-base leading-6"
                        placeholder="Write your review... (optional)"
                        placeholderTextColor="#9CA3AF"
                        value={reviewText}
                        onChangeText={setReviewText}
                        multiline={true}
                        textAlignVertical="top" // For Android to align placeholder and text to top
                        editable={!isSubmitting}
                    />
                </View>

                {/* Section 4: Submit Button */}
                <TouchableOpacity 
                    className={`p-4 rounded-lg items-center mt-4 ${isSubmitting ? 'bg-gray-500' : 'bg-secondary active:bg-secondary-dark'}`}
                    onPress={handleSubmit} 
                    disabled={isSubmitting || !parsedMovieId}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text className="text-white text-lg font-semibold">Submit Review</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
} 