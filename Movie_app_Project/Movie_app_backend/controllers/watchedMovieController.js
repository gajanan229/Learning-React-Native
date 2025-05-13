import {
    upsertWatchedMovie,
    getWatchedMoviesByUser,
    getWatchedMovieByUserAndTmdbId,
    removeWatchedMovie
} from '../models/watchedMovieModel.js';
import * as listModel from '../models/listModel.js';
import pool from '../config/db.js';

const isValidRating = (rating) => {
    if (rating === null || typeof rating === 'undefined') return true; // Rating is optional
    const numRating = Number(rating);
    return !isNaN(numRating) && numRating >= 0.5 && numRating <= 5.0 && (numRating * 10) % 5 === 0;
};

const isValidDate = (dateString) => {
    if (dateString === null || typeof dateString === 'undefined') return true; // Optional
    return !isNaN(new Date(dateString).getTime());
};

async function upsertMovie(movieData, client) {
    const { tmdb_id, title, poster_url, runtime_minutes, genres } = movieData;
    const query = `
        INSERT INTO movies (tmdb_id, title, poster_url, runtime_minutes, genres)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (tmdb_id) DO UPDATE SET
            title = EXCLUDED.title,
            poster_url = EXCLUDED.poster_url,
            runtime_minutes = EXCLUDED.runtime_minutes,
            genres = EXCLUDED.genres
        RETURNING tmdb_id;
    `;
    const values = [tmdb_id, title, poster_url, runtime_minutes, genres];
    const db = client || pool;
    const result = await db.query(query, values);
    return result.rows[0];
}

export const addOrUpdateWatchedMovie = async (req, res, next) => {
    const userId = req.user.id;
    const { movie_tmdb_id, title, poster_url, runtime_minutes, genres, rating, watch_date, review_notes } = req.body;
    
    if (!movie_tmdb_id || typeof movie_tmdb_id !== 'number' || !title || !poster_url) {
        return res.status(400).json({ message: 'Missing or invalid required fields (movie_tmdb_id, title, poster_url)' });
    }
    if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
        return res.status(400).json({ message: 'Rating must be a number between 0 and 5' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const movieData = { tmdb_id: movie_tmdb_id, title, poster_url, runtime_minutes, genres };
        await upsertMovie(movieData, client);

        const watchedData = { movie_tmdb_id, rating, watch_date, review_notes };
        const watchedEntry = await upsertWatchedMovie(userId, watchedData, client);

        try {
            const watchlistId = await listModel.findUserSystemListId(userId, 'watchlist');
            if (watchlistId) {
                await listModel.removeMovieFromList(watchlistId, movie_tmdb_id, client);
                console.log(`Auto-removed movie ${movie_tmdb_id} from watchlist ${watchlistId} for user ${userId}`);
            }
        } catch (removeError) {
            console.error(`Error auto-removing movie ${movie_tmdb_id} from watchlist for user ${userId}:`, removeError);
        }

        await client.query('COMMIT');
        res.status(200).json(watchedEntry);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in addOrUpdateWatchedMovie controller:', error);
        next(error);
    } finally {
        client.release();
    }
};

export const getUserWatchedMovies = async (req, res, next) => {
    const userId = req.user.id;
    try {
        const watchedMovies = await getWatchedMoviesByUser(userId);
        res.status(200).json(watchedMovies);
    } catch (error) {
        console.error('Error fetching user watched movies:', error);
        next(error);
    }
};

export const getSpecificWatchedMovie = async (req, res, next) => {
    const userId = req.user.id;
    const movieTmdbId = parseInt(req.params.movieTmdbId, 10);

    if (isNaN(movieTmdbId)) {
        return res.status(400).json({ message: 'Invalid movie TMDB ID format' });
    }

    try {
        const watchedEntry = await getWatchedMovieByUserAndTmdbId(userId, movieTmdbId);
        if (!watchedEntry) {
            return res.status(404).json({ message: 'Watched entry not found for this movie' });
        }
        res.status(200).json(watchedEntry);
    } catch (error) {
        console.error('Error fetching specific watched movie:', error);
        next(error);
    }
};

export const deleteWatchedMovie = async (req, res, next) => {
    const userId = req.user.id;
    const movieTmdbId = parseInt(req.params.movieTmdbId, 10);

    if (isNaN(movieTmdbId)) {
        return res.status(400).json({ message: 'Invalid movie TMDB ID format' });
    }

    try {
        const deletedRowCount = await removeWatchedMovie(userId, movieTmdbId);
        if (deletedRowCount === 0) {
            return res.status(404).json({ message: 'Watched entry not found, cannot remove' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error removing watched movie:', error);
        next(error);
    }
}; 