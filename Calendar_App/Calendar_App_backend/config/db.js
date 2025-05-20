import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Ensure environment variables are loaded

const { Pool } = pg;

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: parseInt(process.env.PG_PORT || '5432', 10),
  // Optional: SSL configuration if your database requires it
  // ssl: {
  //   rejectUnauthorized: false // Or more specific SSL cert handling
  // },
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool; 