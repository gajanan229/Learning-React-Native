import {
    getOverallCounts,
    getTimeBasedStats,
    getGenreBasedStats,
    getRatingBasedStats
} from '../models/profileStatsModel.js';



/**
 * Controller to fetch and aggregate all profile statistics for the authenticated user.
 */
export const getUserProfileStats = async (req, res, next) => {
    try {
        const userId = req.user.id; // Set by the 'protect' middleware

        if (!userId) {
            // This case should ideally be caught by the protect middleware already
            return res.status(401).json({ message: 'Not authorized, no user ID found' });
        }

        // Call all model functions concurrently
        const [
            overallCounts,
            timeBasedStats,
            genreBasedStats,
            ratingBasedStats
        ] = await Promise.all([
            getOverallCounts(userId),
            getTimeBasedStats(userId),
            getGenreBasedStats(userId),
            getRatingBasedStats(userId)
        ]);

        // Construct the final comprehensive JSON response object
        const stats = {
            overallCounts,
            timeBasedStats,
            genreBasedStats,
            ratingBasedStats
        };

        res.status(200).json(stats);

    } catch (error) {
        console.error('Error in profileStatsController getUserProfileStats:', error);
        next(error); // Pass error to the global error handler
    }
};

