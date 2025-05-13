// Basic movie structure for display within lists
export interface MovieInList {
    tmdb_id: number;
    title: string;
    poster_url: string;
    runtime_minutes?: number | null;
    genres?: string[] | null; // Assuming genres are stored as an array of strings
    added_at: string; // ISO date string when added to the list
    // Add other essential movie fields you might display, like release_date or vote_average
    release_date?: string;
    vote_average?: number;
}

// For payloads when adding a movie to a list, matching backend expectation
export interface MovieForListPayload {
    movie_tmdb_id: number;
    title: string;
    poster_url: string; // Relative path from TMDB
    runtime_minutes?: number | null;
    genres?: string[] | null;
}

export interface UserList {
    id: number;
    user_id: number;
    list_name: string;
    list_type: 'watchlist' | 'favorites' | 'custom';
    description?: string | null;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    movie_count: number;
    // Optional: For optimized previews, backend might send a few movie posters directly
    // preview_movies?: Pick<MovieInList, 'tmdb_id' | 'poster_url'>[];
}

// For the response when fetching list details with its movies
export interface ListWithMoviesResponse {
    listDetails: UserList;
    movies: MovieInList[];
}

// General Movie type, e.g., for MovieCard or search results
export interface Movie {
    id: number;
    title: string;
    poster_path: string | null; // TMDB poster_path can be null
    backdrop_path?: string | null;
    overview?: string;
    release_date?: string; // YYYY-MM-DD
    vote_average?: number;
    vote_count?: number;
    adult?: boolean;
    genre_ids?: number[];
    original_language?: string;
    original_title?: string;
    popularity?: number;
    video?: boolean;
    // Add any other fields you commonly use from TMDB API
} 