import express from 'express';
import {
    addOrUpdateWatchedMovie,
    getUserWatchedMovies,
    getSpecificWatchedMovie,
    deleteWatchedMovie
} from '../controllers/watchedMovieController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes in this file are protected
router.use(protect);

// POST /api/watched/ - Add or update a watched movie entry
router.post('/', addOrUpdateWatchedMovie);

// GET /api/watched/ - Get all watched movies for the authenticated user
router.get('/', getUserWatchedMovies);

// GET /api/watched/:movieTmdbId - Get a specific watched movie by its TMDB ID
router.get('/:movieTmdbId', getSpecificWatchedMovie);

// DELETE /api/watched/:movieTmdbId - Remove a movie from the watched list
router.delete('/:movieTmdbId', deleteWatchedMovie);

export default router; 