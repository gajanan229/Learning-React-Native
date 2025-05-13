import express from 'express';
import { getUserProfileStats } from '../controllers/profileStatsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Define the GET /stats route
// This route is protected and will use the getUserProfileStats controller function.
router.get('/stats', protect, getUserProfileStats);

export default router; 