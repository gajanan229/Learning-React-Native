import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

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

export const BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL //|| 'http://localhost:3001'; // Default to localhost:3001

const apiClient = axios.create({
    baseURL: BACKEND_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request Interceptor for JWT
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Do not attach token to auth routes like /login or /register
        // Check against full path if baseURL is already set in client
        const noAuthRoutes = [
            '/api/auth/login',
            '/api/auth/register'
        ];
        if (config.url && noAuthRoutes.includes(config.url)) {
            return config;
        }

        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

export { apiClient };

export interface BackendTrendingMovie {
    tmdb_id: number;
    title: string;
    poster_url: string;
    weekly_search_count: number;
}

export const fetchTrendingMoviesFromBackend = async (): Promise<TrendingMovie[] | undefined> => {
    try {
        const response = await apiClient.get('/api/movies/trending');
        const data: BackendTrendingMovie[] = response.data;
        return data.map(movie => ({
            title: movie.title,
            poster_url: movie.poster_url,
            count: movie.weekly_search_count,
            movie_id: movie.tmdb_id,
            searchTerm: '',
        }));
    } catch (error) {
        console.error('Error fetching trending movies from backend:', error);
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(`Failed to fetch trending movies: ${error.response.status} ${JSON.stringify(error.response.data)}`);
        }
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
        console.warn('Movie search log skipped: poster_path is missing for movie ID', movieData.tmdb_id);
        return;
    }

    const payload: LogSearchPayload = {
        tmdb_id: movieData.tmdb_id,
        title: movieData.title,
        poster_url: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
        runtime_minutes: movieData.runtime_minutes,
        genres: movieData.genres
    };

    try {
        const response = await apiClient.post('/api/searches', payload);
    } catch (error) {
        console.error('Error in logMovieSearchToBackend (Axios):', error);
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(`Failed to log movie search: ${error.response.status} ${JSON.stringify(error.response.data)}`);
        }
        throw error;
    }
};