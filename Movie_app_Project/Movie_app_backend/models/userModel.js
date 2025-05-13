import pool from '../config/db.js';

export const createUser = async ({ email, passwordHash, username }) => {
    try {
        const result = await pool.query(
            'INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id, email, username, created_at',
            [email, passwordHash, username]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error creating user:', error);
        throw error; // Re-throw the error to be handled by the controller
    }
};

export const findUserByEmail = async (email) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error finding user by email:', error);
        throw error;
    }
};

export const findUserById = async (id) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error finding user by id:', error);
        throw error;
    }
}; 