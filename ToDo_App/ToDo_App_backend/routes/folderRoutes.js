import express from 'express';
import { 
    getFolders, 
    createFolder, 
    updateFolder, 
    deleteFolder, 
    getFolderById 
} from '../controllers/folderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All folder routes require authentication
router.use(protect);

/**
 * @route   GET /api/folders
 * @desc    Get all folders for authenticated user
 * @access  Private
 */
router.get('/', getFolders);

/**
 * @route   GET /api/folders/:id
 * @desc    Get a specific folder by ID
 * @access  Private
 */
router.get('/:id', getFolderById);

/**
 * @route   POST /api/folders
 * @desc    Create a new folder
 * @access  Private
 * @body    { name: string }
 */
router.post('/', createFolder);

/**
 * @route   PUT /api/folders/:id
 * @desc    Update an existing folder
 * @access  Private
 * @body    { name: string }
 */
router.put('/:id', updateFolder);

/**
 * @route   DELETE /api/folders/:id
 * @desc    Delete a folder (tasks will be orphaned)
 * @access  Private
 */
router.delete('/:id', deleteFolder);

export default router; 