import { apiClient } from './api';

// Define the structure for individual stats within the response

// Overall Counts
interface OverallCounts {
    totalMoviesWatched: number;
    totalHoursWatched: number;
}

// Time-Based Stats
interface TimePeriodStat {
    movies: number;
    hours: number;
}

interface MonthlyStat {
    month: string; // e.g., "2023-10"
    movies: number;
    hours: number;
}

interface MostActivePeriods { // Assuming these might be added later, structure can be flexible
    busiestDayOfWeek?: string | null;
    busiestMonth?: string | null;
}

interface TimeBasedStats {
    thisWeek: TimePeriodStat;
    thisMonth: TimePeriodStat;
    thisYear: TimePeriodStat;
    byMonth: MonthlyStat[];
    mostActivePeriods?: MostActivePeriods; // Optional based on backend implementation
}

// Genre-Based Stats
interface TopGenreStat {
    genre: string;
    count: number;
    hours: number;
}

interface AvgRatingPerGenreStat {
    genre: string;
    averageRating: number;
}

interface GenreBasedStats {
    topGenres: TopGenreStat[];
    averageRatingPerGenre: AvgRatingPerGenreStat[];
}

// Rating-Based Stats
interface RatingDistributionPoint {
    rating: number;
    count: number;
}

export interface RatedMovieSummary {
    tmdb_id: number;
    title: string;
    poster_url: string;
    user_rating: number;
}

interface RatingBasedStats {
    averageRatingGiven: number | null; // Can be null if no ratings
    ratingDistribution: RatingDistributionPoint[];
    highestRatedMovies: RatedMovieSummary[];
    lowestRatedMovies: RatedMovieSummary[];
}

// Main response interface
export interface UserProfileStatsResponse {
    overallCounts: OverallCounts;
    timeBasedStats: TimeBasedStats;
    genreBasedStats: GenreBasedStats;
    ratingBasedStats: RatingBasedStats;
}

/**
 * Fetches the comprehensive profile statistics for the authenticated user.
 * @returns {Promise<UserProfileStatsResponse>} The user's profile statistics.
 */
export const fetchUserProfileStatsAPI = async (): Promise<UserProfileStatsResponse> => {
    try {
        const response = await apiClient.get<UserProfileStatsResponse>('/api/profile/stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile stats:', error);
        // Consider re-throwing a more specific error or handling it as needed by the caller
        throw error;
    }
}; 