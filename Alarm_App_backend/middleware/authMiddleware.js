import { verifyToken } from '../utils/tokenUtils.js';

/**
 * Middleware to protect routes by verifying JWT token.
 * Extracts token from Authorization header, verifies it, and attaches user ID to req.user.
 * Sends 401 Unauthorized if token is missing, invalid, or verification fails.
 */
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        try {
            // Get token from header (e.g., "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
            token = req.headers.authorization.split(' ')[1];

            if (!token) {
                // This case should ideally be caught by the initial check but good for robustness
                return res.status(401).json({ message: 'Not authorized, no token provided after Bearer' });
            }

            const decoded = verifyToken(token);

            if (!decoded) {
                // verifyToken already logs the specific error (e.g., expired, invalid signature)
                return res.status(401).json({ message: 'Not authorized, token verification failed' });
            }

            // Ensure the decoded payload has the expected user.id structure
            // The check for `decoded.user && decoded.user.id` is already in verifyToken, 
            // but an explicit check here ensures clarity on what `req.user` will contain.
            if (decoded.user && (typeof decoded.user.id === 'string' || typeof decoded.user.id === 'number')) {
                req.user = { id: decoded.user.id }; // Attach user ID to the request object
                next(); // Proceed to the next middleware or route handler
            } else {
                // This case means verifyToken returned a payload, but it was malformed for our needs.
                console.error('Authenticated token has unexpected payload structure for user ID.', decoded);
                return res.status(401).json({ message: 'Not authorized, token payload invalid' });
            }

        } catch (error) {
            // This catch block is for unexpected errors during token processing itself,
            // not typically for jwt.verify errors as verifyToken handles those and returns null.
            console.error('Error in authentication middleware:', error);
            return res.status(401).json({ message: 'Not authorized, token processing error' });
        }
    } else {
        // No Authorization header or not starting with Bearer
        return res.status(401).json({ message: 'Not authorized, no Bearer token' });
    }
}; 