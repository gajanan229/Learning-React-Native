import {Image, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet} from 'react-native'
import React, {useEffect, useState, useCallback} from 'react'
import {useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import {fetchMovieDetails} from "@/services/api";
import { icons } from "@/constants/icons";
import {SafeAreaView} from "react-native-safe-area-context";
import { getWatchedMovieStatusAPI, WatchedMoviePayload } from '@/services/watchedMovieService';
import { useAuth } from '@/context/AuthContext';

interface MovieInfoProps {
    label: string;
    value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
    <View className="flex-col items-start justify-center mt-5">
        <Text className="text-light-200 font-normal text-sm">{label}</Text>
        <Text className="text-light-100 font-bold text-sm mt-2">
            {value || "N/A"}
        </Text>
    </View>
);

const MovieDetails = () => {
    const router = useRouter();
    const {id} = useLocalSearchParams();
    const [movie, setMovie] = useState<MovieDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { isAuthenticated } = useAuth();
    const [watchedEntry, setWatchedEntry] = useState<WatchedMoviePayload | null>(null);
    const [isWatchedStatusLoading, setIsWatchedStatusLoading] = useState(true);

    useEffect(() => {
        if (id) {
            setLoading(true);
            fetchMovieDetails(id as string)
                .then(data => {
                    setMovie(data);
                    setError(null);
                })
                .catch(err => {
                    console.error("Failed to fetch movie details:", err);
                    setError(err.message || "Could not load movie details.");
                    setMovie(null);
                })
                .finally(() => setLoading(false));
        } else {
            setError("Movie ID not found.");
            setLoading(false);
        }
    }, [id]);

    useFocusEffect(
        useCallback(() => {
            const fetchStatus = async () => {
                if (isAuthenticated && id) {
                    setIsWatchedStatusLoading(true);
                    try {
                        const status = await getWatchedMovieStatusAPI(id as string);
                        setWatchedEntry(status);
                    } catch (error) {
                        if ((error as any)?.response?.status !== 404) {
                            console.error("Failed to fetch watched status", error);
                        }
                        setWatchedEntry(null);
                    } finally {
                        setIsWatchedStatusLoading(false);
                    }
                } else {
                    setIsWatchedStatusLoading(false);
                    setWatchedEntry(null);
                }
            };
            fetchStatus();
        }, [id, isAuthenticated])
    );

    const handleRateReviewPress = () => {
        if (!movie) return;

        router.push({
            pathname: '/(modals)/rateMovie',
            params: {
                movieId: movie.id.toString(),
                movieTitle: movie.title,
                moviePosterPath: movie.poster_path,
                movieRuntime: movie.runtime?.toString() || '',
                movieGenres: JSON.stringify(movie.genres?.map(g => g.name) || []),
                initialWatchedEntry: JSON.stringify(watchedEntry),
            }
        });
    };

    const handleAddToListPress = () => {
        if (!movie) return;
        router.push({
            pathname: '/(modals)/addToListModal',
            params: {
                movieId: movie.id.toString(),
                movieTitle: movie.title,
                moviePosterPath: movie.poster_path || '',
                movieRuntime: movie.runtime?.toString() || '',
                movieGenres: JSON.stringify(movie.genres?.map(g => g.name) || []),
            }
        });
    };

    if (loading) {
        return <SafeAreaView className="flex-1 bg-primary justify-center items-center"><ActivityIndicator size="large" color="#FFFFFF" /></SafeAreaView>;
    }
    if (error) {
        return <SafeAreaView className="flex-1 bg-primary justify-center items-center"><Text className="text-red-500 text-lg">Error: {error}</Text></SafeAreaView>;
    }
    if (!movie) {
        return <SafeAreaView className="flex-1 bg-primary justify-center items-center"><Text className="text-white text-lg">Movie not found.</Text></SafeAreaView>;
    }

    // Determine button icon for Rate/Review
    let rateReviewIcon = icons.save; // Default to save icon (placeholder for plus)
    let rateReviewIconColor = '#9CA3AF'; // Default to gray

    if (isWatchedStatusLoading) {
        // Placeholder, loading state handled by ActivityIndicator below
    } else if (watchedEntry) {
        rateReviewIcon = icons.checkmarkFilled ;
        rateReviewIconColor = '#22C55E'; // Green
    } else {
        rateReviewIcon = icons.checkmarkOutline;
        rateReviewIconColor = '#9CA3AF'; // Gray
    }

    // Icon for "Add to List" - assuming you have icons.list
    const addToListIconSource = icons.list || icons.save; // Fallback to save icon if list icon is missing

    return (
        <View className="bg-primary flex-1">
            <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
                <View>
                    <Image
                        source={{
                            uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`,
                        }}
                        className="w-full h-[550px]"
                        resizeMode="stretch"
                    />

                    {/*<TouchableOpacity className="absolute bottom-5 right-5 rounded-full size-14 bg-white flex items-center justify-center">*/}
                    {/*    <Image*/}
                    {/*        source={icons.play}*/}
                    {/*        className="w-6 h-7 ml-1"*/}
                    {/*        resizeMode="stretch"*/}
                    {/*    />*/}
                    {/*</TouchableOpacity>*/}
                </View>
                <View className="flex-col items-start justify-center mt-5 px-5">
                    <View className="flex-row justify-between items-center w-full">
                        <Text className="text-white text-2xl font-bold flex-1 mr-2" numberOfLines={2}>{movie.title}</Text>
                        <View className="flex-row items-center"> {/* Container for the two buttons */}
                            {/* Existing Rate/Review Button */}
                            <TouchableOpacity
                                onPress={handleRateReviewPress}
                                className="p-2 bg-black/30 rounded-full" // Removed mr-2, will add ml-2 to the next one
                                disabled={isWatchedStatusLoading}
                            >
                                {isWatchedStatusLoading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Image source={rateReviewIcon} className="w-6 h-6" style={{tintColor: rateReviewIconColor}} />
                                )}
                            </TouchableOpacity>

                            {/* ---> New "Add to List" Button <--- */}
                            <TouchableOpacity
                                onPress={handleAddToListPress}
                                className="p-2 bg-black/30 rounded-full ml-2" // Added ml-2 for spacing
                            >
                                <Image source={addToListIconSource} className="w-6 h-6" style={{tintColor: '#9CA3AF'}} /> {/* Default gray tint */}
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View className="flex-row items-center gap-x-1 mt-2">
                        <Text className="text-light-200 text-sm">
                            {movie?.release_date?.split("-")[0]} •
                        </Text>
                        <Text className="text-light-200 text-sm">{movie?.runtime}m</Text>
                    </View>
                    <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
                        <Image source={icons.star} className="size-4" />

                        <Text className="text-white font-bold text-sm">
                            {Math.round(movie?.vote_average ?? 0)}/10
                        </Text>

                        <Text className="text-light-200 text-sm">
                            ({movie?.vote_count} votes)
                        </Text>
                    </View>
                    <MovieInfo label="Overview" value={movie?.overview} />
                    <MovieInfo label="Genres" value={movie?.genres?.map((g)=> g.name).join(" - ") || 'N/A'} />
                    <View className="flex flex-row justify-between w-1/2">
                        <MovieInfo
                            label="Budget"
                            value={`$${(movie?.budget ?? 0) / 1_000_000} million`}
                        />
                        <MovieInfo
                            label="Revenue"
                            value={`$${Math.round(
                                (movie?.revenue ?? 0) / 1_000_000
                            )} million`}
                        />
                    </View>

                    <MovieInfo
                        label="Production Companies"
                        value={
                            movie?.production_companies?.map((c) => c.name).join(" • ") ||
                            "N/A"
                        }
                    />
                </View>
            </ScrollView>
            <TouchableOpacity
                className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
                onPress={router.back}
            >
                <Image
                    source={icons.arrow}
                    className="size-5 mr-1 mt-0.5 rotate-180"
                    tintColor="#fff"
                />
                <Text className="text-white font-semibold text-base">Go Back</Text>
            </TouchableOpacity>
        </View>
    )
}
export default MovieDetails

