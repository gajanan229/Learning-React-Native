require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001; // Use environment variable or default

// Middleware
app.use(cors()); // Enable CORS for all origins (adjust for production)
app.use(express.json()); // Parse JSON request bodies

// Database Connection Pool
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

pool.on('connect', () => {
  console.log('Connected to the database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// --- API Routes ---

// POST /api/searches - Track a search event
app.post('/api/searches', async (req, res, next) => {
  const { tmdb_id, title, poster_url } = req.body;
  

  // Basic validation
  if (typeof tmdb_id !== 'number' || !title || !poster_url) {
    return res.status(400).json({ error: 'Missing or invalid movie data in request body' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Start transaction

    // 1. Upsert movie information
    const upsertMovieQuery = `
      INSERT INTO movies (tmdb_id, title, poster_url)
      VALUES ($1, $2, $3)
      ON CONFLICT (tmdb_id) DO NOTHING;
    `;
    await client.query(upsertMovieQuery, [tmdb_id, title, poster_url]);

    // 2. Log the search event
    const logSearchQuery = `
      INSERT INTO search_events (movie_tmdb_id)
      VALUES ($1);
    `;
    await client.query(logSearchQuery, [tmdb_id]);

    await client.query('COMMIT'); // Commit transaction
    res.status(201).send('Search event logged successfully');

  } catch (error) {
    await client.query('ROLLBACK'); // Rollback transaction on error
    console.error('Error logging search event:', error);
    next(error); // Pass error to the error handling middleware
  } finally {
    client.release(); // Release the client back to the pool
  }
});

// GET /api/movies/trending - Get top 10 trending movies (last 7 days)
app.get('/api/movies/trending', async (req, res, next) => {
  const client = await pool.connect();
  try {
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
    console.log(result.rows);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    next(error); // Pass error to the error handling middleware
  } finally {
    client.release(); // Release the client back to the pool
  }
});

// POST /api/admin/cleanup - Clean up old search events and orphaned movies
app.post('/api/admin/cleanup', async (req, res, next) => {
  // Default to deleting search events older than 14 days.
  // The cron job can override this by sending a 'daysOld' query parameter.
  const daysOldThreshold = 14;

  const client = await pool.connect();
  try {
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
    await client.query('ROLLBACK'); // Rollback transaction on error
    console.error('Error during data cleanup:', error);
    next(error); // Pass error to the general error handler
  } finally {
    client.release(); // Release the client back to the pool
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
