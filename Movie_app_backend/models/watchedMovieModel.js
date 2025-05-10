import pool from '../config/db.js';

/**
 * Upserts movie information into the 'movies' table and then upserts a user's watched record
 * into the 'user_watched_movies' table within a single transaction.
 * @param {number} userId - The ID of the user.
 * @param {object} movieData - Data for the movie and the watched record.
 * @param {number} movieData.movie_tmdb_id - Required TMDB ID of the movie.
 * @param {string} movieData.title - Required title of the movie.
 * @param {string} movieData.poster_url - Required poster URL of the movie.
 * @param {number | null} [movieData.runtime_minutes] - Optional runtime in minutes.
 * @param {string[] | null} [movieData.genres] - Optional array of genre strings.
 * @param {number | null} [movieData.rating] - Optional rating (0.5-5.0).
 * @param {string | null} [movieData.watch_date] - Optional watch date (YYYY-MM-DD).
 * @param {string | null} [movieData.review_notes] - Optional review notes.
 * @returns {Promise<object>} The inserted/updated row from user_watched_movies.
 */
export const upsertWatchedMovie = async (userId, movieData) => {
    const { 
        movie_tmdb_id,
        title,
        poster_url,
        runtime_minutes = null, // Default to null if not provided
        genres = null,          // Default to null if not provided
        rating = null,
        watch_date = null,
        review_notes = null
    } = movieData;

    if (!movie_tmdb_id || !title || !poster_url) {
        throw new Error('movie_tmdb_id, title, and poster_url are required.');
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Step 1: Upsert movie into 'movies' table
        // If runtime_minutes or genres are provided as undefined by caller, they become null here.
        // If they are null, COALESCE will keep the existing value in the DB if the movie exists.
        const upsertMovieQuery = `
            INSERT INTO movies (tmdb_id, title, poster_url, runtime_minutes, genres)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (tmdb_id) DO UPDATE SET
                title = EXCLUDED.title,          -- Always update title
                poster_url = EXCLUDED.poster_url,  -- Always update poster_url
                runtime_minutes = COALESCE(EXCLUDED.runtime_minutes, movies.runtime_minutes),
                genres = COALESCE(EXCLUDED.genres, movies.genres);
        `;
        await client.query(upsertMovieQuery, [
            movie_tmdb_id,
            title,
            poster_url,
            runtime_minutes, 
            genres
        ]);

        // Step 2: Upsert into 'user_watched_movies' table
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
        const result = await client.query(upsertWatchedQuery, [
            userId,
            movie_tmdb_id,
            rating,
            watch_date,
            review_notes
        ]);

        await client.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in upsertWatchedMovie:', error);
        throw error;
    } finally {
        client.release();
    }
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
 * @returns {Promise<object | null>} The deleted row, or null if nothing was deleted.
 */
export const removeWatchedMovie = async (userId, movieTmdbId) => {
    try {
        const query = `
            DELETE FROM user_watched_movies 
            WHERE user_id = $1 AND movie_tmdb_id = $2 
            RETURNING *;
        `;
        const result = await pool.query(query, [userId, movieTmdbId]);
        return result.rows[0] || null; // Return the deleted row or null
    } catch (error) {
        console.error('Error in removeWatchedMovie:', error);
        throw error;
    }
}; 