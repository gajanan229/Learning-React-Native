import {
    createUser,
    findUserByEmail
} from '../models/userModel.js';
import { createList } from '../models/listModel.js';
import {
    hashPassword,
    comparePassword
} from '../utils/hashUtils.js';
import {
    generateToken
} from '../utils/tokenUtils.js';

export const register = async (req, res, next) => {
    const { email, password, username } = req.body;

    // 1. Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    // Add more robust email validation if needed here

    try {
        // 2. Check for existing user
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use.' });
        }

        // 3. Hash password
        const passwordHash = await hashPassword(password);

        // 4. Create user
        // Ensure username is passed correctly, even if it's optional and might be null/undefined
        const newUser = await createUser({ email, passwordHash, username: username || null });

        // ---> Add this section: Create Default Lists <---
        try {
            // Create default Watchlist
            await createList(newUser.id, { 
                list_name: 'Watchlist', 
                list_type: 'watchlist', 
                description: 'Movies you plan to watch.' 
            });
            // Create default Favorites
            await createList(newUser.id, { 
                list_name: 'Favorites', 
                list_type: 'favorites', 
                description: 'Your all-time favorite movies.' 
            });
            console.log(`Default lists created successfully for user ${newUser.id}`);
        } catch (listError) {
            // Log the error but do not fail the registration process
            console.error(`Failed to create default lists for user ${newUser.id}:`, listError);
            // Do not throw or call next() - registration should still succeed
        }
        // ---> End of added section <---

        // 5. Generate token
        const token = generateToken(newUser.id);

        // 6. Respond
        res.status(201).json({
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
                createdAt: newUser.created_at // Assuming created_at is returned by createUser
            }
        });

    } catch (error) {
        // Pass error to the global error handler
        next(error);
    }
};

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    // 1. Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // 2. Find user
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' }); // User not found
        }

        // 3. Compare password
        const isMatch = await comparePassword(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' }); // Password doesn't match
        }

        // 4. Generate token
        const token = generateToken(user.id);

        // 5. Respond
        res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                // Include other relevant user fields if needed
            }
        });

    } catch (error) {
        // Pass error to the global error handler
        next(error);
    }
};

export const getMe = async (req, res, next) => {
    // If protect middleware ran successfully, req.user should be populated.
    // The authMiddleware already fetches the user and excludes the password_hash.
    try {
        // req.user is already prepared by the protect middleware
        // It contains the user object without the password_hash
        if (!req.user) {
            // This case should ideally be caught by the protect middleware already
            // but as a safeguard:
            return res.status(401).json({ message: 'Not authorized, user data not found in request' });
        }
        res.status(200).json(req.user); // Send the user object directly
    } catch (error) {
        console.error('Error in getMe controller:', error);
        next(error);
    }
}; 