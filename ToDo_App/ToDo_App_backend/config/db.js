import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

// Test the connection and log status
pool.on('connect', () => {
    console.log('ToDo Backend: Connected to the PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('ToDo Backend: Unexpected error on idle client', err);
    process.exit(-1);
});

// Test connection on startup
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('ToDo Backend: Database connection test successful');
        
        // Test if required tables exist
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('users', 'todo_folders', 'tasks')
        `);
        
        const tables = result.rows.map(row => row.table_name);
        console.log('ToDo Backend: Available tables:', tables);
        
        if (tables.includes('users') && tables.includes('todo_folders') && tables.includes('tasks')) {
            console.log('ToDo Backend: All required tables are present');
        } else {
            console.warn('ToDo Backend: Some required tables are missing:', 
                ['users', 'todo_folders', 'tasks'].filter(t => !tables.includes(t)));
        }
        
        client.release();
    } catch (err) {
        console.error('ToDo Backend: Database connection test failed:', err.message);
        throw err;
    }
};

// Call test connection
testConnection().catch(err => {
    console.error('ToDo Backend: Failed to connect to database:', err.message);
    process.exit(1);
});

export default pool; 