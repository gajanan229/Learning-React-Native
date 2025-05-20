import express from 'express';
import {
  createEventHandler,
  getUserEventsHandler,
  getEventByIdHandler,
  updateEventHandler,
  deleteEventHandler
} from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect middleware to all routes in this file
// This ensures only authenticated users can access these event endpoints.
router.use(protect);

// Define routes for event operations
router.post('/', createEventHandler);                     // POST /api/events - Create a new event
router.get('/', getUserEventsHandler);                    // GET /api/events - Get all events for the logged-in user (can add query params for filtering)
router.get('/:eventId', getEventByIdHandler);           // GET /api/events/:eventId - Get a specific event by ID
router.put('/:eventId', updateEventHandler);             // PUT /api/events/:eventId - Update a specific event
router.delete('/:eventId', deleteEventHandler);         // DELETE /api/events/:eventId - Delete a specific event

export default router; 