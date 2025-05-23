import express from 'express';
import { 
    getTasks, 
    createTask, 
    updateTask, 
    toggleTaskCompletion, 
    deleteTask, 
    getTaskById,
    getTaskStats 
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All task routes require authentication
router.use(protect);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for authenticated user with optional filters
 * @access  Private
 * @query   folderId, completed, priority, sortBy, sortOrder
 * @example GET /api/tasks?folderId=1&completed=false&priority=high&sortBy=due_date&sortOrder=ASC
 */
router.get('/', getTasks);

/**
 * @route   GET /api/tasks/stats
 * @desc    Get task statistics for authenticated user
 * @access  Private
 */
router.get('/stats', getTaskStats);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a specific task by ID
 * @access  Private
 */
router.get('/:id', getTaskById);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 * @body    { title: string, description?: string, folderId?: number, priority?: string, dueDate?: string }
 */
router.post('/', createTask);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update an existing task
 * @access  Private
 * @body    { title?: string, description?: string, folderId?: number, completed?: boolean, priority?: string, dueDate?: string }
 */
router.put('/:id', updateTask);

/**
 * @route   PUT /api/tasks/:id/toggle
 * @desc    Toggle task completion status
 * @access  Private
 */
router.put('/:id/toggle', toggleTaskCompletion);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:id', deleteTask);

export default router; 