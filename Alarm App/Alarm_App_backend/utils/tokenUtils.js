import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables, especially JWT_SECRET

/**
 * Verifies a JWT token.
 * @param {string} token - The JWT token to verify.
 * @returns {object | null} The decoded payload if verification is successful (should contain { user: { id: ... } }), 
 *                          or null if verification fails.
 */
export const verifyToken = (token) => {
    if (!token) {
        return null;
    }
    try {
        // Ensure JWT_SECRET is loaded and is a non-empty string
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET is not defined in environment variables.');
            return null;
        }

        const decoded = jwt.verify(token, secret);
        // Minimal check for expected structure, can be enhanced based on actual payload from Auth Backend
        if (decoded && typeof decoded === 'object' && decoded.user && (typeof decoded.user.id === 'string' || typeof decoded.user.id === 'number')) {
            return decoded;
        } else {
            console.error('Token verification succeeded, but payload structure is unexpected.', decoded);
            return null;
        }
    } catch (error) {
        // Log specific JWT errors for better debugging
        if (error instanceof jwt.TokenExpiredError) {
            console.error('Token verification failed: Token has expired.', error.message);
        } else if (error instanceof jwt.JsonWebTokenError) {
            console.error('Token verification failed: Invalid token or signature.', error.message);
        } else {
            console.error('Token verification failed with an unexpected error:', error.message);
        }
        return null;
    }
}; 