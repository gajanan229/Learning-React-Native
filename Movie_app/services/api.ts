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

const BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3001'; // Default to localhost:3001

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
            ...movie,
            movie_id: movie.tmdb_id,
        }));
    } catch (error) {
        console.error('Error fetching trending movies from backend:', error);
        throw error;
    }
};