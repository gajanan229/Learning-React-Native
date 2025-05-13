import { verifyToken } from '../utils/tokenUtils.js';
import { findUserById } from '../models/userModel.js';

export const protect = async (req, res, next) => {
    let token;

    // 1. Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token (Bearer <TOKEN>)
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify token
            const decoded = verifyToken(token);

            if (!decoded || !decoded.user || !decoded.user.id) {
                return res.status(401).json({ message: 'Not authorized, token failed (invalid payload)' });
            }

            // 3. (Optional but recommended) Get user from DB and attach to req object
            // We use decoded.user.id because that's how we structured the payload in generateToken
            const user = await findUserById(decoded.user.id);

            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Remove password_hash before attaching to req.user
            const { password_hash, ...userWithoutPassword } = user;
            req.user = userWithoutPassword;

            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            // Handle errors from verifyToken (e.g., expired, malformed) or findUserById
            console.error('Authentication error:', error);
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                 return res.status(401).json({ message: 'Not authorized, token failed (verification error)' });
            }
            // For other errors, pass to the global error handler or send a generic message
            return res.status(401).json({ message: 'Not authorized, token processing error' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
}; 