import { apiClient } from './api';

export interface WatchedMoviePayload {
    movie_tmdb_id: number;
    title: string;
    poster_url: string;
    runtime_minutes?: number | null;
    genres?: string[] | null;
    rating?: number | null;          // 0.5 to 5.0
    watch_date?: string | null;    // 'YYYY-MM-DD'
    review_notes?: string | null;
}

// Define the expected response type for a single watched movie entry (adjust as per your backend)
// This might include fields from both user_watched_movies and the joined movies table.
export interface WatchedMovieEntry extends WatchedMoviePayload { // Extends payload for common fields
    user_id: number;
    logged_at: string; // Or Date
    updated_at: string; // Or Date
    // Potentially more fields like movie title, poster_url if backend joins and returns them distinctly
}

/**
 * Fetches the watched status/details for a specific movie by its TMDB ID for the logged-in user.
 * @param movieTmdbId The TMDB ID of the movie.
 * @returns Promise<WatchedMovieEntry | null> The watched movie entry or null if not found/not watched.
 */
export const getWatchedMovieStatusAPI = async (movieTmdbId: number | string): Promise<WatchedMovieEntry | null> => {
    try {
        const response = await apiClient.get<WatchedMovieEntry>(`/api/watched/${movieTmdbId}`);
        return response.data; // Axios wraps the response in a data object
    } catch (error: any) {
        if (error.isAxiosError && error.response && error.response.status === 404) {
            return null; // Convention: return null if not found
        }
        console.error('Error fetching watched movie status:', error);
        throw error; // Re-throw other errors
    }
};

/**
 * Adds or updates a watched movie entry for the logged-in user.
 * @param payload The data for the watched movie entry.
 * @returns Promise<WatchedMovieEntry> The created or updated watched movie entry.
 */
export const addOrUpdateWatchedMovieAPI = async (payload: WatchedMoviePayload): Promise<WatchedMovieEntry> => {
    try {
        const response = await apiClient.post<WatchedMovieEntry>('/api/watched', payload);
        return response.data;
    } catch (error) {
        console.error('Error adding/updating watched movie:', error);
        throw error;
    }
}; 