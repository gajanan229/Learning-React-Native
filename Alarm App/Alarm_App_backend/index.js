import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pool from './config/db.js'; // Import the pool to ensure db.js runs and attempts connection
import folderRoutes from './routes/folderRoutes.js'; // Import folder routes
import alarmRoutes from './routes/alarmRoutes.js'; // Import alarm routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
// For CORS_ORIGIN, you might set this in .env to something like "http://localhost:8081,http://localhost:19006"
// and then parse it if you need a more complex setup.
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin }));
app.use(express.json()); // To parse JSON request bodies

// Mount API routes
app.use('/api/folders', folderRoutes); // Handles /api/folders and /api/folders/:folderId/alarms
app.use('/api/alarms', alarmRoutes);   // Handles /api/alarms/:alarmId

// Basic Test Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        message: 'Alarm App Backend is running!', 
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
    // Avoid logging req.body, req.query, req.params directly in production if they might contain sensitive data.
    // For debugging, you can uncomment them selectively.
    // console.error('Request Body:', JSON.stringify(req.body, null, 2)); 
    // console.error('Request Query:', JSON.stringify(req.query, null, 2));
    // console.error('Request Params:', JSON.stringify(req.params, null, 2));
    console.error('Error Name:', err.name || 'N/A');
    console.error('Error Message:', err.message || 'No message provided.');
    if (process.env.NODE_ENV === 'development' && err.stack) {
        console.error('Error Stack:', err.stack);
    }
    console.error('-------------------- GLOBAL ERROR HANDLER END ----------------------');

    const statusCode = err.statusCode || 500; // Use error's custom statusCode or default to 500
    const responseMessage = err.expose // If err.expose is true, it's a client-safe message
        ? err.message 
        : 'Internal Server Error'; // Generic message for unexposed errors

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message: responseMessage,
        // Optionally, include stack in development mode only and if the error is not intentionally exposed
        ...(process.env.NODE_ENV === 'development' && !err.expose && err.stack && { stack: err.stack }),
    });
});

app.listen(PORT, () => {
    console.log(`Alarm App Backend server running on port ${PORT}`);
    console.log(`CORS enabled for origin: ${corsOrigin}`);
    // Verify database connection by trying a simple query upon server start
    pool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('Alarm DB: Failed to execute simple query on startup:', err.stack);
        } else {
            console.log('Alarm DB: Startup query successful. Current time from DB:', res.rows[0].now);
        }
    });
}); 