import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // To ensure JWT_SECRET is loaded from .env

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
    process.exit(1); // Exit if JWT_SECRET is not set
}

export const generateToken = (userId) => {
    const payload = {
        user: {
            id: userId,
        },
    };

    try {
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }); // Example: 7 day expiration
        return token;
    } catch (error) {
        console.error('Error generating token:', error);
        throw error;
    }
};

export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        // console.error('Error verifying token:', error.message); // Log specific error for debugging if needed
        // Depending on how you want to handle errors, you might return null or throw specific error types
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return null; // Or throw a custom AuthenticationError
        }
        throw error; // Re-throw other unexpected errors
    }
}; 