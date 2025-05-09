export const TMBD_CONFIG = {
    baseUrl: 'https://api.themoviedb.org/3',
    API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
    headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + process.env.EXPO_PUBLIC_MOVIE_API_KEY,
    }
}

export const fetchMovies = async ({query}: {query: string}) => {
    const endpoint = query
        ? `${TMBD_CONFIG.baseUrl}/search/movie?query=${encodeURIComponent(query)}`
        : `${TMBD_CONFIG.baseUrl}/discover/movie?sort_by=popularity.desc`;
    const response = await fetch(endpoint, {
        method: 'GET',
        headers: TMBD_CONFIG.headers,
    });
    if (!response.ok) {
        // @ts-ignore
        throw new Error('Failed to fetch movies', response.statusText);
    }

    const data = await response.json();
    return data.results;
}

export const fetchMovieDetails = async (movieID: string): Promise<MovieDetails> => {
    try {
        const response = await fetch(`${TMBD_CONFIG.baseUrl}/movie/${movieID}?api_key=${TMBD_CONFIG.API_KEY}`, {
            method: 'GET',
            headers: TMBD_CONFIG.headers,
        });
        if (!response.ok) {
            throw new Error('failed to fetch movie details');
        }

        const data = await response.json();
        return data;
    } catch (error){
        console.error(error);
        throw error;
    }
}

const BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL //|| 'http://localhost:3001'; // Default to localhost:3001

export interface BackendTrendingMovie {
    tmdb_id: number;
    title: string;
    poster_url: string;
    weekly_search_count: number;
}

export const fetchTrendingMoviesFromBackend = async (): Promise<TrendingMovie[] | undefined> => {
    try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/movies/trending`);
        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Failed to fetch trending movies from backend: ${response.status} ${errorData}`);
        }
        const data: BackendTrendingMovie[] = await response.json();
        // fix return for TrendingMovie
        return data.map(movie => ({
            title: movie.title,
            poster_url: movie.poster_url,
            count: movie.weekly_search_count,
            movie_id: movie.tmdb_id,
            searchTerm: '',
        }));
    } catch (error) {
        console.error('Error fetching trending movies from backend:', error);
        throw error;
    }
};

export interface LogSearchPayload {
    tmdb_id: number;
    title: string;
    poster_url: string;
    runtime_minutes: number;
    genres: Array<string>;
}

export const logMovieSearchToBackend = async (movieData: { tmdb_id: number; title: string; poster_path: string | null; runtime_minutes: number; genres: Array<string>; }): Promise<void> => {
    if (!movieData.poster_path) {
        // The backend movies table requires a non-null poster_url.
        // If poster_path is null, we cannot construct a valid poster_url.
        console.warn('Movie search log skipped: poster_path is missing for movie ID', movieData.tmdb_id);
        // Optionally, throw an error if this case should be handled more strictly by the caller.
        // throw new Error('Cannot log movie search: poster_path is missing.');
        return; // Or throw an error
    }

    const payload: LogSearchPayload = {
        tmdb_id: movieData.tmdb_id,
        title: movieData.title,
        poster_url: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`, // Construct full URL
        runtime_minutes: movieData.runtime_minutes,
        genres: movieData.genres
    };

    try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/searches`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any other headers like Authorization if your backend requires them
            },
            body: JSON.stringify(payload),
        });


        if (!response.ok) {
            const errorData = await response.text();
            // Log the error internally, but re-throw to allow the caller to potentially handle it (e.g., UI feedback)
            console.error(`Backend error logging search: ${response.status}`, errorData);
            throw new Error(`Failed to log movie search to backend: ${response.status} ${errorData}`);
        }
        // console.log('Movie search logged successfully to backend for TMDB ID:', movieData.tmdb_id);
    } catch (error) {
        // Log network errors or errors from the !response.ok block
        console.error('Error in logMovieSearchToBackend:', error);
        throw error; // Re-throw to allow caller to handle
    }
};