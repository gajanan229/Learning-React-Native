import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import eventRoutes from './routes/eventRoutes.js'; // Import event routes
import pool from './config/db.js'; // Import the pool for DB connection check

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.CALENDAR_BACKEND_PORT || 3003; // Define a port, ensuring it's different from other backends

// Middleware
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin }));
app.use(express.json()); // To parse JSON request bodies

// Mount API routes
app.use('/api/events', eventRoutes); // Mount event routes

// Basic Test Route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Calendar App Backend is running!',
        timestamp: new Date().toISOString()
    });
});

// Global Error Handler
// This middleware should be defined last, after all other app.use() and routes calls.
app.use((err, req, res, next) => {
    console.error('-------------------- GLOBAL ERROR HANDLER START --------------------');
    console.error('Error Time:', new Date().toISOString());
    console.error('Request Path:', req.path);
    console.error('Request Method:', req.method);
    console.error('Error Name:', err.name || 'N/A');
    console.error('Error Message:', err.message || 'No message provided.');
    if (process.env.NODE_ENV === 'development' && err.stack) {
        console.error('Error Stack:', err.stack);
    }
    console.error('-------------------- GLOBAL ERROR HANDLER END ----------------------');

    const statusCode = err.statusCode || 500;
    const responseMessage = err.expose // If err.expose is true, it's a client-safe message
        ? err.message
        : 'Internal Server Error';

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message: responseMessage,
        ...(process.env.NODE_ENV === 'development' && !err.expose && err.stack && { stack: err.stack }),
    });
});

app.listen(PORT, () => {
    console.log(`Calendar App Backend server running on port ${PORT}`);
    console.log(`CORS enabled for origin: ${corsOrigin}`);
    // Verify database connection by trying a simple query upon server start
    pool.query('SELECT NOW()', (err, dbRes) => {
        if (err) {
            console.error('Calendar DB: Failed to execute simple query on startup:', err.stack);
        } else {
            console.log('Calendar DB: Startup query successful. Current time from DB:', dbRes.rows[0].now);
        }
    });
});

