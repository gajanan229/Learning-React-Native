import pool from '../config/db.js';

/**
 * Upserts a user's watched record into the 'user_watched_movies' table.
 * Assumes the corresponding movie already exists in the 'movies' table.
 * Should be called within a transaction managed by the controller.
 * @param {number} userId - The ID of the user.
 * @param {object} watchedData - Data for the watched record.
 * @param {number} watchedData.movie_tmdb_id - Required TMDB ID of the movie.
 * @param {number | null} [watchedData.rating] - Optional rating (0.5-5.0).
 * @param {string | null} [watchedData.watch_date] - Optional watch date (YYYY-MM-DD).
 * @param {string | null} [watchedData.review_notes] - Optional review notes.
 * @param {object} [client] - Optional database client for transaction participation.
 * @returns {Promise<object>} The inserted/updated row from user_watched_movies.
 * @throws {Error} If the database query fails.
 */
export const upsertWatchedMovie = async (userId, watchedData, client) => {
    const {
        movie_tmdb_id,
        rating = null,
        watch_date = null,
        review_notes = null
    } = watchedData;

    if (!movie_tmdb_id) {
        throw new Error('movie_tmdb_id is required.');
    }

    const db = client || pool;

    const upsertWatchedQuery = `
        INSERT INTO user_watched_movies (user_id, movie_tmdb_id, rating, watch_date, review_notes)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, movie_tmdb_id) DO UPDATE SET
            rating = EXCLUDED.rating,
            watch_date = EXCLUDED.watch_date,
            review_notes = EXCLUDED.review_notes,
            updated_at = NOW()
        RETURNING *;
    `;
    const result = await db.query(upsertWatchedQuery, [
        userId,
        movie_tmdb_id,
        rating,
        watch_date,
        review_notes
    ]);

    return result.rows[0];
};

/**
 * Retrieves all watched movies for a given user, joined with movie details.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Array<object>>} An array of watched movie objects.
 */
export const getWatchedMoviesByUser = async (userId) => {
    try {
        const query = `
            SELECT uwm.*, m.title, m.poster_url, m.runtime_minutes, m.genres 
            FROM user_watched_movies uwm 
            JOIN movies m ON uwm.movie_tmdb_id = m.tmdb_id 
            WHERE uwm.user_id = $1 
            ORDER BY uwm.updated_at DESC;
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    } catch (error) {
        console.error('Error in getWatchedMoviesByUser:', error);
        throw error;
    }
};

/**
 * Retrieves a specific watched movie for a user by movie TMDB ID.
 * @param {number} userId - The ID of the user.
 * @param {number} movieTmdbId - The TMDB ID of the movie.
 * @returns {Promise<object | null>} The watched movie object, or null if not found.
 */
export const getWatchedMovieByUserAndTmdbId = async (userId, movieTmdbId) => {
    try {
        const query = `
            SELECT uwm.*, m.title, m.poster_url, m.runtime_minutes, m.genres 
            FROM user_watched_movies uwm 
            JOIN movies m ON uwm.movie_tmdb_id = m.tmdb_id 
            WHERE uwm.user_id = $1 AND uwm.movie_tmdb_id = $2;
        `;
        const result = await pool.query(query, [userId, movieTmdbId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error in getWatchedMovieByUserAndTmdbId:', error);
        throw error;
    }
};

/**
 * Removes a movie from a user's watched list.
 * @param {number} userId - The ID of the user.
 * @param {number} movieTmdbId - The TMDB ID of the movie to remove.
 * @param {object} [client] - Optional database client for transaction participation.
 * @returns {Promise<number>} The number of rows deleted (0 or 1).
 */
export const removeWatchedMovie = async (userId, movieTmdbId, client) => {
    const db = client || pool;

    const query = `
        DELETE FROM user_watched_movies 
        WHERE user_id = $1 AND movie_tmdb_id = $2; 
    `;
    const result = await db.query(query, [userId, movieTmdbId]);
    return result.rowCount;
}; 