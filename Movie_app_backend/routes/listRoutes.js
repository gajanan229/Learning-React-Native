import express from 'express';
import {
  createList,
  getAllUserLists,
  updateUserList,
  deleteUserList,
  getListDetails,
  addMovieToListController,
  removeMovieFromListController
} from '../controllers/listController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect middleware to all routes in this file
router.use(protect);

// Routes for managing lists themselves
router.post('/', createList); // Create a new list
router.get('/', getAllUserLists); // Get all lists for the logged-in user
router.put('/:listId', updateUserList); // Update a specific list (custom only)
router.delete('/:listId', deleteUserList); // Delete a specific list (custom only)

// Routes for managing items within a specific list
router.get('/:listId', getListDetails); // Get details of a specific list (including movies)
router.post('/:listId/movies', addMovieToListController); // Add a movie to a list
router.delete('/:listId/movies/:movieTmdbId', removeMovieFromListController); // Remove a movie from a list

export default router; 