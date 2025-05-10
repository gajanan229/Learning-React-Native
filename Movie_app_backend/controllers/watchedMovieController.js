import {
    upsertWatchedMovie,
    getWatchedMoviesByUser,
    getWatchedMovieByUserAndTmdbId,
    removeWatchedMovie
} from '../models/watchedMovieModel.js';

const isValidRating = (rating) => {
    if (rating === null || typeof rating === 'undefined') return true; // Rating is optional
    const numRating = Number(rating);
    return !isNaN(numRating) && numRating >= 0.5 && numRating <= 5.0 && (numRating * 10) % 5 === 0;
};

const isValidDate = (dateString) => {
    if (dateString === null || typeof dateString === 'undefined') return true; // Optional
    return !isNaN(new Date(dateString).getTime());
};

export const addOrUpdateWatchedMovie = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const movieData = req.body;

        const { movie_tmdb_id, title, poster_url, rating, watch_date } = movieData;

        if (!movie_tmdb_id || !title || !poster_url) {
            return res.status(400).json({ message: 'Movie TMDB ID, title, and poster URL are required.' });
        }
        if (!isValidRating(rating)) {
            return res.status(400).json({ message: 'Rating must be between 0.5 and 5.0, in 0.5 increments.' });
        }
        if (watch_date && !isValidDate(watch_date)) {
            return res.status(400).json({ message: 'Invalid watch_date format.' });
        }

        const result = await upsertWatchedMovie(userId, movieData);
        // Check if the record was updated or created by comparing created_at and updated_at
        // This is a heuristic; a more robust way might be to check if a previous record existed.
        if (result.created_at.getTime() === result.updated_at.getTime() && Math.abs(new Date(result.created_at).getTime() - Date.now()) < 2000) {
            // If created_at and updated_at are very close to each other and to now, assume it was just created.
             res.status(201).json(result);
        } else {
             res.status(200).json(result);
        }
    } catch (error) {
        next(error);
    }
};

export const getUserWatchedMovies = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const movies = await getWatchedMoviesByUser(userId);
        res.status(200).json(movies);
    } catch (error) {
        next(error);
    }
};

export const getSpecificWatchedMovie = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const movieTmdbId = parseInt(req.params.movieTmdbId, 10);
        if (isNaN(movieTmdbId)) {
            return res.status(400).json({ message: 'Invalid movie TMDB ID format.' });
        }

        const movie = await getWatchedMovieByUserAndTmdbId(userId, movieTmdbId);
        if (movie) {
            res.status(200).json(movie);
        } else {
            res.status(404).json({ message: 'Watched movie not found.' });
        }
    } catch (error) {
        next(error);
    }
};

export const deleteWatchedMovie = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const movieTmdbId = parseInt(req.params.movieTmdbId, 10);
        if (isNaN(movieTmdbId)) {
            return res.status(400).json({ message: 'Invalid movie TMDB ID format.' });
        }

        const deletedMovie = await removeWatchedMovie(userId, movieTmdbId);
        if (deletedMovie) {
            res.status(200).json({ message: 'Watched movie removed successfully.', deletedMovie });
            // Or res.status(204).send(); if you prefer no content on successful delete
        } else {
            res.status(404).json({ message: 'Watched movie not found or already removed.' });
        }
    } catch (error) {
        next(error);
    }
}; 