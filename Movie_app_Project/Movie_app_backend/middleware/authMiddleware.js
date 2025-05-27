import axios from 'axios';

const AUTH_SERVICE_URL = process.env.AUTH_URL || 'http://localhost:3002';

export const protect = async (req, res, next) => {
    let token;

    // 1. Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token (Bearer <TOKEN>)
            token = req.headers.authorization.split(' ')[1];
            
            // 2. Validate token against external Auth service
            const authResponse = await axios.get(`${AUTH_SERVICE_URL}/api/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 5000 // 5 second timeout
            });
            // 3. If validation successful, attach user to request
            if (authResponse.data && authResponse.data.id) {
                req.user = authResponse.data;
                console.log(req.user);
                next(); // Proceed to the next middleware or route handler
            } else {
                return res.status(401).json({ message: 'Not authorized, invalid user data' });
            }
        } catch (error) {
            // Handle errors from external auth service
            console.error('Authentication error:', error.message);
            
            if (error.response) {
                // Auth service responded with error (401, 403, etc.)
                return res.status(error.response.status).json({ 
                    message: error.response.data?.message || 'Not authorized, token validation failed' 
                });
            } else if (error.code === 'ECONNREFUSED') {
                // Auth service is down
                return res.status(503).json({ message: 'Authentication service unavailable' });
            } else if (error.code === 'ECONNABORTED') {
                // Timeout
                return res.status(504).json({ message: 'Authentication service timeout' });
            } else {
                // Other network or parsing errors
            return res.status(401).json({ message: 'Not authorized, token processing error' });
            }
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
}; 