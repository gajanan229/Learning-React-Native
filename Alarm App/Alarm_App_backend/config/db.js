import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const pool = new Pool({
    user: process.env.ALARM_DB_USER,
    host: process.env.ALARM_DB_HOST,
    database: process.env.ALARM_DB_DATABASE,
    password: process.env.ALARM_DB_PASSWORD,
    port: parseInt(process.env.ALARM_DB_PORT || '5432', 10),
    ssl: process.env.ALARM_DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
    console.log('Alarm DB: Successfully connected to the database pool.');
});

pool.on('error', (err) => {
    console.error('Alarm DB: Unexpected error on idle client pool', err);
    // process.exit(-1); // Optional: exit if cannot connect to DB, depending on HA requirements
});

// Test the connection
(async () => {
    try {
        const client = await pool.connect();
        console.log('Alarm DB: Test connection successful. Database is ready.');
        client.release();
    } catch (err) {
        console.error('Alarm DB: Failed to connect to the database during initial test:', err.stack);
        // Potentially exit or retry, depending on your application's needs
    }
})();

export default pool; 