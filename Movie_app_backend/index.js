import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import pool from './config/db.js'; // Added .js extension
import cors from 'cors';
import authRoutes from './routes/authRoutes.js'; // Import auth routes

const app = express();
const port = process.env.PORT || 3001; // Use environment variable or default

// Middleware
app.use(cors()); // Enable CORS for all origins (adjust for production)
app.use(express.json()); // Parse JSON request bodies

// Mount auth routes
app.use('/api/auth', authRoutes);

// --- API Routes ---

// POST /api/searches - Track a search event
app.post('/api/searches', async (req, res, next) => {
  const { tmdb_id, title, poster_url, runtime_minutes, genres } = req.body;
  

  // Basic validation
  if (typeof tmdb_id !== 'number' || !title || !poster_url) {
    return res.status(400).json({ error: 'Missing or invalid movie data in request body' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN'); // Start transaction

    // 1. Upsert movie information
    const upsertMovieQuery = `
      INSERT INTO movies (tmdb_id, title, poster_url, runtime_minutes, genres)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (tmdb_id) DO NOTHING;
    `;
    await client.query(upsertMovieQuery, [tmdb_id, title, poster_url, runtime_minutes, genres]);

    // 2. Log the search event
    const logSearchQuery = `
      INSERT INTO search_events (movie_tmdb_id)
      VALUES ($1);
    `;
    await client.query(logSearchQuery, [tmdb_id]);

    await client.query('COMMIT'); // Commit transaction
    res.status(201).send('Search event logged successfully');

  } catch (error) {
    if (client) await client.query('ROLLBACK'); // Rollback transaction on error
    console.error('Error logging search event:', error);
    next(error); // Pass error to the error handling middleware
  } finally {
    if (client) client.release(); // Release the client back to the pool
  }
});

// GET /api/movies/trending - Get top 10 trending movies (last 7 days)
app.get('/api/movies/trending', async (req, res, next) => {
  let client;
  try {
    client = await pool.connect();
    const trendingQuery = `
      SELECT
          m.tmdb_id,
          m.title,
          m.poster_url,
          COUNT(se.id) AS weekly_search_count
      FROM
          search_events se
      JOIN
          movies m ON se.movie_tmdb_id = m.tmdb_id
      WHERE
          se.searched_at >= NOW() - INTERVAL '7 days'
      GROUP BY
          m.tmdb_id, m.title, m.poster_url
      ORDER BY
          weekly_search_count DESC
      LIMIT 10;
    `;
    const result = await client.query(trendingQuery);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    next(error); // Pass error to the error handling middleware
  } finally {
    if (client) client.release(); // Release the client back to the pool
  }
});

// POST /api/admin/cleanup - Clean up old search events and orphaned movies
app.post('/api/admin/cleanup', async (req, res, next) => {
  // Default to deleting search events older than 14 days.
  // The cron job can override this by sending a 'daysOld' query parameter.
  const daysOldThreshold = 14;
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN'); // Start transaction

    // 1. Delete search events older than the specified threshold
    const deleteEventsQuery = `
      DELETE FROM search_events
      WHERE searched_at < NOW() - ($1::integer * INTERVAL '1 day');
    `;
    const deleteEventsResult = await client.query(deleteEventsQuery, [daysOldThreshold]);
    const deletedEventsCount = deleteEventsResult.rowCount;

    await client.query('COMMIT'); // Commit transaction

    res.status(200).json({
      message: `Cleanup successful. Processed events older than ${daysOldThreshold} days.`,
      deletedSearchEvents: deletedEventsCount
    });

  } catch (error) {
    if (client) await client.query('ROLLBACK'); // Rollback transaction on error
    console.error('Error during data cleanup:', error);
    next(error); // Pass error to the general error handler
  } finally {
    if (client) client.release(); // Release the client back to the pool
  }
});

// --- Basic Error Handling Middleware ---
// This should be the last middleware added
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack trace
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
