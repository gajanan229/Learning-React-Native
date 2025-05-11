import pool from '../config/db.js';

/**
 * Calculates the total number of distinct movies watched and total hours watched by a user.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<object>} An object containing totalMoviesWatched and totalHoursWatched.
 * @throws {Error} If there's an error querying the database.
 */
export const getOverallCounts = async (userId) => {
    let client;
    try {
        client = await pool.connect();

        // Query 1: Total Movies Watched
        const totalMoviesQuery = `
            SELECT COUNT(DISTINCT movie_tmdb_id) AS "totalMoviesWatched"
            FROM user_watched_movies
            WHERE user_id = $1;
        `;
        const totalMoviesResult = await client.query(totalMoviesQuery, [userId]);
        const totalMoviesWatched = parseInt(totalMoviesResult.rows[0]?.totalMoviesWatched || 0, 10);

        // Query 2: Total Hours Watched
        const totalHoursQuery = `
            SELECT COALESCE(SUM(m.runtime_minutes) / 60.0, 0) AS "totalHoursWatched"
            FROM user_watched_movies uwm
            JOIN movies m ON uwm.movie_tmdb_id = m.tmdb_id
            WHERE uwm.user_id = $1 AND m.runtime_minutes IS NOT NULL;
        `;
        const totalHoursResult = await client.query(totalHoursQuery, [userId]);
        // Ensure hours are formatted to a reasonable number of decimal places, e.g., 1 or 2.
        // parseFloat will handle the conversion from string if needed.
        const totalHoursWatched = parseFloat(parseFloat(totalHoursResult.rows[0]?.totalHoursWatched || 0).toFixed(1));


        return {
            totalMoviesWatched,
            totalHoursWatched,
        };
    } catch (error) {
        console.error('Error in getOverallCounts model:', error);
        throw error; // Re-throw the error to be caught by the controller
    } finally {
        if (client) {
            client.release();
        }
    }
};

/**
 * Calculates time-based statistics for a user's watched movies.
 * (This Week, This Month, This Year, and stats for the last 12 active months)
 * @param {number} userId - The ID of the user.
 * @returns {Promise<object>} An object containing time-based statistics.
 * @throws {Error} If there's an error querying the database.
 */
export const getTimeBasedStats = async (userId) => {
    let client;
    try {
        client = await pool.connect();

        // Query for "This Week"
        const thisWeekQuery = `
            SELECT
                COUNT(uwm.movie_tmdb_id) AS movies,
                COALESCE(SUM(m.runtime_minutes) / 60.0, 0) AS hours
            FROM user_watched_movies uwm
            LEFT JOIN movies m ON uwm.movie_tmdb_id = m.tmdb_id AND m.runtime_minutes IS NOT NULL
            WHERE uwm.user_id = $1
              AND uwm.watch_date >= date_trunc('week', CURRENT_DATE)
              AND uwm.watch_date < date_trunc('week', CURRENT_DATE) + INTERVAL '1 week'
              AND uwm.watch_date IS NOT NULL;
        `;
        const thisWeekResult = await client.query(thisWeekQuery, [userId]);
        const thisWeek = {
            movies: parseInt(thisWeekResult.rows[0]?.movies || 0, 10),
            hours: parseFloat(parseFloat(thisWeekResult.rows[0]?.hours || 0).toFixed(1)),
        };

        // Query for "This Month"
        const thisMonthQuery = `
            SELECT
                COUNT(uwm.movie_tmdb_id) AS movies,
                COALESCE(SUM(m.runtime_minutes) / 60.0, 0) AS hours
            FROM user_watched_movies uwm
            LEFT JOIN movies m ON uwm.movie_tmdb_id = m.tmdb_id AND m.runtime_minutes IS NOT NULL
            WHERE uwm.user_id = $1
              AND uwm.watch_date >= date_trunc('month', CURRENT_DATE)
              AND uwm.watch_date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
              AND uwm.watch_date IS NOT NULL;
        `;
        const thisMonthResult = await client.query(thisMonthQuery, [userId]);
        const thisMonth = {
            movies: parseInt(thisMonthResult.rows[0]?.movies || 0, 10),
            hours: parseFloat(parseFloat(thisMonthResult.rows[0]?.hours || 0).toFixed(1)),
        };

        // Query for "This Year"
        const thisYearQuery = `
            SELECT
                COUNT(uwm.movie_tmdb_id) AS movies,
                COALESCE(SUM(m.runtime_minutes) / 60.0, 0) AS hours
            FROM user_watched_movies uwm
            LEFT JOIN movies m ON uwm.movie_tmdb_id = m.tmdb_id AND m.runtime_minutes IS NOT NULL
            WHERE uwm.user_id = $1
              AND uwm.watch_date >= date_trunc('year', CURRENT_DATE)
              AND uwm.watch_date < date_trunc('year', CURRENT_DATE) + INTERVAL '1 year'
              AND uwm.watch_date IS NOT NULL;
        `;
        const thisYearResult = await client.query(thisYearQuery, [userId]);
        const thisYear = {
            movies: parseInt(thisYearResult.rows[0]?.movies || 0, 10),
            hours: parseFloat(parseFloat(thisYearResult.rows[0]?.hours || 0).toFixed(1)),
        };

        // Query for "By Specific Months" (last 12 months with watch activity)
        const byMonthQuery = `
            SELECT
                to_char(date_trunc('month', uwm.watch_date), 'YYYY-MM') AS month,
                COUNT(uwm.movie_tmdb_id) AS movies,
                COALESCE(SUM(m.runtime_minutes) / 60.0, 0) AS hours
            FROM user_watched_movies uwm
            LEFT JOIN movies m ON uwm.movie_tmdb_id = m.tmdb_id AND m.runtime_minutes IS NOT NULL
            WHERE uwm.user_id = $1 AND uwm.watch_date IS NOT NULL
              AND uwm.watch_date >= date_trunc('month', CURRENT_DATE) - INTERVAL '11 months'
            GROUP BY date_trunc('month', uwm.watch_date)
            ORDER BY date_trunc('month', uwm.watch_date) DESC;
        `;
        const byMonthResult = await client.query(byMonthQuery, [userId]);
        const byMonth = byMonthResult.rows.map(row => ({
            month: row.month,
            movies: parseInt(row.movies, 10),
            hours: parseFloat(parseFloat(row.hours).toFixed(1)),
        }));

        return {
            thisWeek,
            thisMonth,
            thisYear,
            byMonth,
            // mostActivePeriods: {} // Deferred for now
        };

    } catch (error) {
        console.error('Error in getTimeBasedStats model:', error);
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
};

/**
 * Calculates genre-based statistics for a user's watched movies.
 * (Top 5 genres by movie count & hours, average rating per genre)
 * @param {number} userId - The ID of the user.
 * @returns {Promise<object>} An object containing genre-based statistics.
 * @throws {Error} If there's an error querying the database.
 */
export const getGenreBasedStats = async (userId) => {
    let client;
    try {
        client = await pool.connect();

        // Query for "Top Genres"
        const topGenresQuery = `
            SELECT
                g.genre,
                COUNT(DISTINCT uwm.movie_tmdb_id) AS "count",
                COALESCE(SUM(DISTINCT m.runtime_minutes) / 60.0, 0) AS "hours"
            FROM user_watched_movies uwm
            JOIN movies m ON uwm.movie_tmdb_id = m.tmdb_id
            CROSS JOIN LATERAL unnest(m.genres) AS g(genre)
            WHERE uwm.user_id = $1 AND m.genres IS NOT NULL AND array_length(m.genres, 1) > 0
            GROUP BY g.genre
            ORDER BY "count" DESC, "hours" DESC, g.genre ASC
            LIMIT 5;
        `;
        const topGenresResult = await client.query(topGenresQuery, [userId]);
        const topGenres = topGenresResult.rows.map(row => ({
            genre: row.genre,
            count: parseInt(row.count, 10),
            hours: parseFloat(parseFloat(row.hours).toFixed(1)),
        }));

        // Query for "Average Rating Per Genre"
        const avgRatingPerGenreQuery = `
            SELECT
                g.genre,
                ROUND(AVG(uwm.rating), 2) AS "averageRating"
            FROM user_watched_movies uwm
            JOIN movies m ON uwm.movie_tmdb_id = m.tmdb_id
            CROSS JOIN LATERAL unnest(m.genres) AS g(genre)
            WHERE uwm.user_id = $1 AND uwm.rating IS NOT NULL AND m.genres IS NOT NULL AND array_length(m.genres, 1) > 0
            GROUP BY g.genre
            HAVING COUNT(uwm.rating) > 0
            ORDER BY "averageRating" DESC, g.genre ASC;
        `;
        const avgRatingPerGenreResult = await client.query(avgRatingPerGenreQuery, [userId]);
        const averageRatingPerGenre = avgRatingPerGenreResult.rows.map(row => ({
            genre: row.genre,
            averageRating: parseFloat(row.averageRating), // Already rounded in SQL, just parse
        }));

        return {
            topGenres,
            averageRatingPerGenre,
        };

    } catch (error) {
        console.error('Error in getGenreBasedStats model:', error);
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
};

/**
 * Calculates rating-based statistics for a user's watched movies.
 * (Average rating given, rating distribution, highest/lowest N rated movies)
 * @param {number} userId - The ID of the user.
 * @returns {Promise<object>} An object containing rating-based statistics.
 * @throws {Error} If there's an error querying the database.
 */
export const getRatingBasedStats = async (userId) => {
    let client;
    const limit = 5; // For top N highest/lowest rated movies

    try {
        client = await pool.connect();

        // Query for "Average Rating Given"
        const avgRatingQuery = `
            SELECT ROUND(AVG(rating), 2) AS "averageRatingGiven"
            FROM user_watched_movies
            WHERE user_id = $1 AND rating IS NOT NULL;
        `;
        const avgRatingResult = await client.query(avgRatingQuery, [userId]);
        const averageRatingGiven = avgRatingResult.rows[0]?.averageRatingGiven !== null 
            ? parseFloat(avgRatingResult.rows[0]?.averageRatingGiven)
            : null;

        // Query for "Rating Distribution"
        const ratingDistQuery = `
            SELECT
                rating,
                COUNT(movie_tmdb_id) AS "count"
            FROM user_watched_movies
            WHERE user_id = $1 AND rating IS NOT NULL
            GROUP BY rating
            ORDER BY rating DESC;
        `;
        const ratingDistResult = await client.query(ratingDistQuery, [userId]);
        const ratingDistribution = ratingDistResult.rows.map(row => ({
            rating: parseFloat(row.rating),
            count: parseInt(row.count, 10),
        }));

        // Query for "Highest Rated Movies"
        const highestRatedQuery = `
            SELECT
                uwm.movie_tmdb_id,
                m.title,
                m.poster_url,
                uwm.rating AS "user_rating"
            FROM user_watched_movies uwm
            JOIN movies m ON uwm.movie_tmdb_id = m.tmdb_id
            WHERE uwm.user_id = $1 AND uwm.rating IS NOT NULL
            ORDER BY uwm.rating DESC, uwm.updated_at DESC, m.title ASC
            LIMIT $2;
        `;
        const highestRatedResult = await client.query(highestRatedQuery, [userId, limit]);
        const highestRatedMovies = highestRatedResult.rows.map(row => ({
            tmdb_id: row.movie_tmdb_id,
            title: row.title,
            poster_url: row.poster_url,
            user_rating: parseFloat(row.user_rating),
        }));

        // Query for "Lowest Rated Movies"
        const lowestRatedQuery = `
            SELECT
                uwm.movie_tmdb_id,
                m.title,
                m.poster_url,
                uwm.rating AS "user_rating"
            FROM user_watched_movies uwm
            JOIN movies m ON uwm.movie_tmdb_id = m.tmdb_id
            WHERE uwm.user_id = $1 AND uwm.rating IS NOT NULL
            ORDER BY uwm.rating ASC, uwm.updated_at DESC, m.title ASC
            LIMIT $2;
        `;
        const lowestRatedResult = await client.query(lowestRatedQuery, [userId, limit]);
        const lowestRatedMovies = lowestRatedResult.rows.map(row => ({
            tmdb_id: row.movie_tmdb_id,
            title: row.title,
            poster_url: row.poster_url,
            user_rating: parseFloat(row.user_rating),
        }));

        return {
            averageRatingGiven,
            ratingDistribution,
            highestRatedMovies,
            lowestRatedMovies,
        };

    } catch (error) {
        console.error('Error in getRatingBasedStats model:', error);
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
};

