import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Import database configuration (this will test the connection)
import pool from './config/db.js';

// Import authentication middleware
import { protect } from './middleware/authMiddleware.js';

// Import route handlers
import folderRoutes from './routes/folderRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

const app = express();
const PORT = process.env.TODO_BACKEND_PORT || 3002;

// Middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS configuration for ToDo frontend
app.use(cors({
    origin: [
        'http://localhost:3000',  // React Native web
        'http://localhost:19006', // Expo web
        'exp://localhost:19000',  // Expo development
        'http://localhost:8081',  // Metro bundler
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
    next();
});

// Basic health check route
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'ToDo Backend is running',
        timestamp: new Date().toISOString(),
        port: PORT,
        version: '1.0.0'
    });
});

// Database test route
app.get('/db-test', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as current_time');
        client.release();
        
        res.json({
            status: 'Database connected',
            currentTime: result.rows[0].current_time,
            message: 'Database connection successful'
        });
    } catch (err) {
        console.error('Database test error:', err);
        res.status(500).json({
            status: 'Database connection failed',
            error: err.message
        });
    }
});

// Protected route to test authentication middleware
app.get('/auth-test', protect, async (req, res) => {
    try {
        // Get user info from database using the authenticated user ID
        const client = await pool.connect();
        const result = await client.query(
            'SELECT id, email, username, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        client.release();
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'User not found',
                message: 'Authenticated user not found in database'
            });
        }
        
        const user = result.rows[0];
        res.json({
            status: 'Authentication successful',
            message: 'Protected route accessed successfully',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                created_at: user.created_at
            },
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('Auth test error:', err);
        res.status(500).json({
            status: 'Auth test failed',
            error: err.message
        });
    }
});

// API Routes
app.use('/api/folders', folderRoutes);
app.use('/api/tasks', taskRoutes);

// API documentation route
app.get('/api', (req, res) => {
    res.json({
        message: 'ToDo Backend API',
        version: '1.0.0',
        endpoints: {
            folders: {
                'GET /api/folders': 'Get all folders',
                'GET /api/folders/:id': 'Get folder by ID',
                'POST /api/folders': 'Create new folder',
                'PUT /api/folders/:id': 'Update folder',
                'DELETE /api/folders/:id': 'Delete folder'
            },
            tasks: {
                'GET /api/tasks': 'Get all tasks (supports query filters)',
                'GET /api/tasks/stats': 'Get task statistics',
                'GET /api/tasks/:id': 'Get task by ID',
                'POST /api/tasks': 'Create new task',
                'PUT /api/tasks/:id': 'Update task',
                'PUT /api/tasks/:id/toggle': 'Toggle task completion',
                'DELETE /api/tasks/:id': 'Delete task'
            },
            authentication: 'All API routes require Bearer token in Authorization header'
        },
        examples: {
            'Create folder': 'POST /api/folders { "name": "Work" }',
            'Create task': 'POST /api/tasks { "title": "Finish project", "folderId": 1, "priority": "high", "dueDate": "2024-01-15" }',
            'Filter tasks': 'GET /api/tasks?folderId=1&completed=false&priority=high&sortBy=due_date&sortOrder=ASC'
        }
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        availableEndpoints: [
            'GET /api',
            'GET /api/folders',
            'POST /api/folders',
            'GET /api/tasks',
            'POST /api/tasks',
            'GET /api/tasks/stats'
        ]
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
            error: 'INVALID_TOKEN'
        });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired',
            error: 'TOKEN_EXPIRED'
        });
    }
    
    // Database errors
    if (err.code === '23505') {
        return res.status(409).json({
            success: false,
            message: 'Duplicate entry',
            error: 'DUPLICATE_ENTRY'
        });
    }
    
    // Default error
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`ToDo Backend server is running on port ${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}/api`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Database test: http://localhost:${PORT}/db-test`);
    console.log(`Auth test: http://localhost:${PORT}/auth-test (requires Bearer token)`);
    console.log(`Folders API: http://localhost:${PORT}/api/folders`);
    console.log(`Tasks API: http://localhost:${PORT}/api/tasks`);
    console.log(`Task Stats: http://localhost:${PORT}/api/tasks/stats`);
    console.log('');
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('Timestamp:', new Date().toISOString());
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⏹️  Shutting down ToDo Backend server...');
    try {
        await pool.end();
        console.log('✅ Database connections closed');
    } catch (error) {
        console.error('❌ Error closing database connections:', error);
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n⏹️  Received SIGTERM, shutting down gracefully...');
    try {
        await pool.end();
        console.log('✅ Database connections closed');
    } catch (error) {
        console.error('❌ Error closing database connections:', error);
    }
    process.exit(0);
}); 