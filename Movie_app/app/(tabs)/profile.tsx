import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native'; // Or useFocusEffect from expo-router if preferred and available
import { fetchUserProfileStatsAPI, UserProfileStatsResponse } from '../../services/profileStatsService';
import SectionTitle from '../../components/profile/SectionTitle';
import StatCard from '../../components/profile/StatCard';
import PeriodStatDisplay from '../../components/profile/PeriodStatDisplay';
import GenreStatItem from '../../components/profile/GenreStatItem';
import MovieListShort from '../../components/profile/MovieListShort';
import RatingDistributionChart from '../../components/profile/RatingDistributionChart';
import { themeColors } from '../../constants/theme';
import SwipeableChartContainer from '../../components/profile/SwipeableChartContainer';

export default function ProfileScreen() {
    const { logout, currentUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();
    
    const [statsData, setStatsData] = useState<UserProfileStatsResponse | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProfileStats = useCallback(async () => {
        if (!isAuthenticated) {
            // This typically shouldn't be hit if your root layout handles auth redirection properly
            // but as a safeguard or if user becomes unauthenticated while on screen:
            setIsLoadingStats(false);
            setError('User not authenticated. Please log in.'); // Optional: or clear stats
            setStatsData(null);
            return;
        }

        setIsLoadingStats(true);
        setError(null);
        try {
            const data = await fetchUserProfileStatsAPI();
            setStatsData(data);
        } catch (err) {
            console.error("Failed to fetch profile stats:", err);
            setError("Could not load your stats. Please try again.");
            setStatsData(null); // Clear any stale data
        } finally {
            setIsLoadingStats(false);
        }
    }, [isAuthenticated]);

    useFocusEffect(
        useCallback(() => {
            loadProfileStats();
        }, [loadProfileStats])
    );

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    onPress: async () => { await logout(); },
                    style: "destructive"
                }
            ]
        );
    };

    if (isLoadingStats) {
        return (
            <SafeAreaView className="flex-1 bg-primary items-center justify-center p-6">
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text className="text-white text-lg mt-4">Loading stats...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-primary">
            <ScrollView 
                className="flex-1 p-4" 
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                <View className="mb-6 items-center">
                    <Text className="text-white text-3xl font-bold mb-1">
                        Profile
                    </Text>
                    {currentUser && (
                        <Text className="text-gray-300 text-base">
                            {currentUser.username || currentUser.email}
                        </Text>
                    )}
                </View>

                {error && (
                    <View className="bg-red-800 p-4 rounded-lg mb-6 items-center">
                        <Text className="text-white text-center mb-3">{error}</Text>
                        <TouchableOpacity
                            className="bg-red-600 rounded-lg py-2 px-6 items-center"
                            onPress={loadProfileStats}
                        >
                            <Text className="text-white text-base font-semibold">Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {!isLoadingStats && !error && !statsData && (
                    <View className="flex-1 items-center justify-center p-6 bg-gray-800 rounded-lg">
                        <Text className="text-white text-lg text-center">
                            No statistics available yet.
                        </Text>
                        <Text className="text-gray-400 text-sm text-center mt-2">
                            Start watching and rating movies to see your stats here!
                        </Text>
                    </View>
                )}

                {statsData && (
                    <View>
                        {/* Overall Counts Section */}
                        <SectionTitle title="Overall Activity" />
                        {statsData.overallCounts ? (
                            <View className="flex-row justify-around mb-4 mx-[-4px]"> 
                                <StatCard
                                    label="Movies Watched"
                                    value={statsData.overallCounts.totalMoviesWatched}
                                />
                                <StatCard
                                    label="Time Watched"
                                    value={statsData.overallCounts.totalHoursWatched.toFixed(1)}
                                    unit=" hrs"
                                />
                            </View>
                        ) : (
                            <View className="p-4 bg-gray-800 rounded-lg items-center mb-4">
                                <Text className="text-gray-400 text-center">No overall activity data yet.</Text>
                            </View>
                        )}

                        {/* Time-Based Stats Section */}
                        <SectionTitle title="Time Insights" />
                        {statsData.timeBasedStats ? (
                            <View className="mb-4">
                                {statsData.timeBasedStats.thisWeek ? (
                                    <PeriodStatDisplay
                                        periodName="This Week"
                                        movies={statsData.timeBasedStats.thisWeek.movies}
                                        hours={statsData.timeBasedStats.thisWeek.hours}
                                    />
                                ) : <Text className="text-gray-500 p-2 text-sm">No data for this week.</Text>}
                                {statsData.timeBasedStats.thisMonth ? (
                                    <PeriodStatDisplay
                                        periodName="This Month"
                                        movies={statsData.timeBasedStats.thisMonth.movies}
                                        hours={statsData.timeBasedStats.thisMonth.hours}
                                    />
                                ) : <Text className="text-gray-500 p-2 text-sm">No data for this month.</Text>}
                                {statsData.timeBasedStats.thisYear ? (
                                    <PeriodStatDisplay
                                        periodName="This Year"
                                        movies={statsData.timeBasedStats.thisYear.movies}
                                        hours={statsData.timeBasedStats.thisYear.hours}
                                    />
                                ) : <Text className="text-gray-500 p-2 text-sm">No data for this year.</Text>}

                                {/* Monthly Activity Swipeable Charts */}
                                <Text className="text-white text-lg font-semibold mt-6 mb-2 px-1">Monthly Breakdown</Text>
                                {statsData.timeBasedStats.byMonth /* && statsData.timeBasedStats.byMonth.length > 0  <-- SwipeableChartContainer handles null/undefined data internally */ ? (
                                    <SwipeableChartContainer
                                        monthlyActivityData={statsData.timeBasedStats.byMonth}
                                    />
                                ) : (
                                    <View className="bg-gray-800 p-3 rounded-md mb-2 mx-1 items-center min-h-[100px] justify-center">
                                        <Text className="text-gray-400 text-center">No monthly activity data available to display charts.</Text>
                                    </View>
                                )}
                                {/* Placeholder for Most Active Periods if data exists */}
                                {/* statsData.timeBasedStats.mostActivePeriods ... */}
                            </View>
                        ) : (
                            <View className="p-4 bg-gray-800 rounded-lg items-center mb-4">
                                <Text className="text-gray-400 text-center">No time-based data yet.</Text>
                            </View>
                        )}

                        {/* Genre-Based Stats Section */}
                        <SectionTitle title="Genre Preferences" />
                        {statsData.genreBasedStats ? (
                            <View className="mb-4">
                                <Text className="text-white text-lg font-semibold mt-1 mb-2 px-1">Top Genres (by movies watched)</Text>
                                {statsData.genreBasedStats.topGenres && statsData.genreBasedStats.topGenres.length > 0 ? (
                                    statsData.genreBasedStats.topGenres.map((genre) => (
                                        <GenreStatItem
                                            key={`${genre.genre}-top`}
                                            genreName={genre.genre}
                                            count={genre.count}
                                            hours={genre.hours}
                                        />
                                    ))
                                ) : (
                                    <View className="bg-gray-800 p-3 rounded-md mb-2 mx-1 items-center">
                                        <Text className="text-gray-400">No top genre data yet.</Text>
                                    </View>
                                )}

                                <Text className="text-white text-lg font-semibold mt-4 mb-2 px-1">Average Rating Per Genre</Text>
                                {statsData.genreBasedStats.averageRatingPerGenre && statsData.genreBasedStats.averageRatingPerGenre.length > 0 ? (
                                    statsData.genreBasedStats.averageRatingPerGenre.map((genre) => (
                                        <GenreStatItem
                                            key={`${genre.genre}-avgRating`}
                                            genreName={genre.genre}
                                            averageRating={genre.averageRating}
                                        />
                                    ))
                                ) : (
                                    <View className="bg-gray-800 p-3 rounded-md mb-2 mx-1 items-center">
                                        <Text className="text-gray-400">No genre rating data. Start rating movies!</Text>
                                    </View>
                                )}
                            </View>
                        ) : (
                            <View className="p-4 bg-gray-800 rounded-lg items-center mb-4">
                                <Text className="text-gray-400 text-center">No genre data yet.</Text>
                            </View>
                        )}

                        {/* Rating-Based Stats Section */}
                        <SectionTitle title="Rating Habits" />
                        {statsData.ratingBasedStats ? (
                            <View className="mb-4">
                                {/* Average Rating Given */}
                                {statsData.ratingBasedStats.averageRatingGiven !== null ? (
                                    <View className="bg-gray-800 p-4 rounded-lg mb-4 items-center">
                                        <Text className="text-gray-400 text-sm">Your Average Rating</Text>
                                        <Text className="text-yellow-400 text-3xl font-bold mt-1">
                                            {statsData.ratingBasedStats.averageRatingGiven.toFixed(1)}
                                            <Text className="text-xl text-gray-400"> / 5.0</Text>
                                        </Text>
                                    </View>
                                ) : (
                                    <View className="bg-gray-800 p-3 rounded-md mb-4 mx-1 items-center">
                                        <Text className="text-gray-400">You haven't rated any movies yet.</Text>
                                    </View>
                                )}

                                {/* Rating Distribution (List View) -> Chart */}
                                <Text className="text-white text-lg font-semibold mt-1 mb-2 px-1">Rating Distribution</Text>
                                {statsData.ratingBasedStats.ratingDistribution && statsData.ratingBasedStats.ratingDistribution.length > 0 ? (
                                    <RatingDistributionChart
                                        data={statsData.ratingBasedStats.ratingDistribution}
                                        chartTitle="Rating Distribution"
                                        // barColorHex={themeColors.light[100]} // Optional: to use a different color
                                    />
                                    // Old list view commented out / to be removed
                                    /*
                                    statsData.ratingBasedStats.ratingDistribution.map((dist) => (
                                        <View key={dist.rating} className="flex-row justify-between items-center bg-gray-800 p-3 rounded-md mb-1 mx-1">
                                            <Text className="text-white text-base">{dist.rating.toFixed(1)} Stars</Text>
                                            <Text className="text-gray-300 text-sm">
                                                {dist.count} {dist.count === 1 ? 'movie' : 'movies'}
                                            </Text>
                                        </View>
                                    ))
                                    */
                                ) : (
                                    <View className="bg-gray-800 p-3 rounded-md mb-2 mx-1 items-center">
                                        <Text className="text-gray-400">No rating distribution data yet.</Text>
                                    </View>
                                )}

                                {/* Highest Rated Movies */}
                                {statsData.ratingBasedStats.highestRatedMovies && statsData.ratingBasedStats.highestRatedMovies.length > 0 && (
                                    <MovieListShort
                                        title="Your Highest Rated"
                                        movies={statsData.ratingBasedStats.highestRatedMovies}
                                    />
                                )}

                                {/* Lowest Rated Movies */}
                                {statsData.ratingBasedStats.lowestRatedMovies && statsData.ratingBasedStats.lowestRatedMovies.length > 0 && (
                                    <MovieListShort
                                        title="Your Lowest Rated"
                                        movies={statsData.ratingBasedStats.lowestRatedMovies}
                                    />
                                )}
                            </View>
                        ) : (
                             <View className="p-4 bg-gray-800 rounded-lg items-center mb-4">
                                <Text className="text-gray-400 text-center">No rating data yet.</Text>
                            </View>
                        )}
                    </View>
                )}

                <View className="mt-10 mb-6 items-center pb-20">
                    <TouchableOpacity
                        className={`bg-red-600 rounded-lg py-3 px-8 w-full max-w-xs items-center ${isAuthLoading ? 'opacity-50' : ''}`}
                        onPress={handleLogout}
                        disabled={isAuthLoading}
                    >
                        <Text className="text-white text-lg font-semibold">Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
