import * as taskModel from '../models/taskModel.js';
import * as folderModel from '../models/folderModel.js';

/**
 * Get all tasks for the authenticated user with optional filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getTasks = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const filters = {};
        
        // Parse query parameters for filtering
        if (req.query.folderId !== undefined) {
            if (req.query.folderId === 'null' || req.query.folderId === '') {
                filters.folderId = null;
            } else if (!isNaN(parseInt(req.query.folderId))) {
                filters.folderId = parseInt(req.query.folderId);
            }
        }
        
        if (req.query.completed !== undefined) {
            filters.completed = req.query.completed === 'true';
        }
        
        if (req.query.priority && ['low', 'medium', 'high'].includes(req.query.priority)) {
            filters.priority = req.query.priority;
        }
        
        if (req.query.sortBy && ['created_at', 'due_date', 'priority', 'title', 'updated_at'].includes(req.query.sortBy)) {
            filters.sortBy = req.query.sortBy;
        }
        
        if (req.query.sortOrder && ['ASC', 'DESC'].includes(req.query.sortOrder.toUpperCase())) {
            filters.sortOrder = req.query.sortOrder.toUpperCase();
        }
        
        const tasks = await taskModel.getAllTasksByUserId(userId, filters);
        
        res.json({
            success: true,
            message: 'Tasks retrieved successfully',
            data: {
                tasks,
                total: tasks.length,
                filters: filters
            }
        });
    } catch (error) {
        console.error('Error in getTasks controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve tasks',
            error: error.message
        });
    }
};

/**
 * Create a new task
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const createTask = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { folderId, title, description, priority, dueDate } = req.body;
        
        // Validation
        if (!title || typeof title !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Task title is required and must be a string',
                error: 'VALIDATION_ERROR'
            });
        }
        
        if (title.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Task title cannot be empty',
                error: 'VALIDATION_ERROR'
            });
        }
        
        if (title.length > 255) {
            return res.status(400).json({
                success: false,
                message: 'Task title cannot exceed 255 characters',
                error: 'VALIDATION_ERROR'
            });
        }
        
        // Validate priority
        if (priority && !['low', 'medium', 'high'].includes(priority)) {
            return res.status(400).json({
                success: false,
                message: 'Priority must be one of: low, medium, high',
                error: 'VALIDATION_ERROR'
            });
        }
        
        // Validate folder ownership if folderId is provided
        if (folderId !== null && folderId !== undefined) {
            if (isNaN(parseInt(folderId))) {
                return res.status(400).json({
                    success: false,
                    message: 'Folder ID must be a valid number',
                    error: 'VALIDATION_ERROR'
                });
            }
            
            const folder = await folderModel.getFolderById(folderId, userId);
            if (!folder) {
                return res.status(404).json({
                    success: false,
                    message: 'Folder not found or you do not have permission to add tasks to it',
                    error: 'FOLDER_NOT_FOUND'
                });
            }
        }
        
        // Validate due date
        let parsedDueDate = null;
        if (dueDate) {
            parsedDueDate = new Date(dueDate);
            if (isNaN(parsedDueDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Due date must be a valid date',
                    error: 'VALIDATION_ERROR'
                });
            }
        }
        
        const newTask = await taskModel.createTask({
            userId,
            folderId: folderId || null,
            title: title.trim(),
            description: description?.trim() || null,
            priority: priority || 'medium',
            dueDate: parsedDueDate
        });
        
        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: {
                task: newTask
            }
        });
    } catch (error) {
        console.error('Error in createTask controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create task',
            error: error.message
        });
    }
};

/**
 * Update an existing task
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const updateTask = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;
        const { folderId, title, description, completed, priority, dueDate } = req.body;
        
        // Validation
        if (!taskId || isNaN(parseInt(taskId))) {
            return res.status(400).json({
                success: false,
                message: 'Valid task ID is required',
                error: 'VALIDATION_ERROR'
            });
        }
        
        // Check if task exists and belongs to user
        const existingTask = await taskModel.getTaskById(taskId, userId);
        if (!existingTask) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or you do not have permission to update it',
                error: 'NOT_FOUND'
            });
        }
        
        const updateData = {};
        
        // Validate and set title
        if (title !== undefined) {
            if (typeof title !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'Task title must be a string',
                    error: 'VALIDATION_ERROR'
                });
            }
            
            if (title.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Task title cannot be empty',
                    error: 'VALIDATION_ERROR'
                });
            }
            
            if (title.length > 255) {
                return res.status(400).json({
                    success: false,
                    message: 'Task title cannot exceed 255 characters',
                    error: 'VALIDATION_ERROR'
                });
            }
            
            updateData.title = title.trim();
        }
        
        // Validate and set description
        if (description !== undefined) {
            updateData.description = description?.trim() || null;
        }
        
        // Validate and set completed status
        if (completed !== undefined) {
            if (typeof completed !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: 'Completed status must be a boolean',
                    error: 'VALIDATION_ERROR'
                });
            }
            updateData.completed = completed;
        }
        
        // Validate and set priority
        if (priority !== undefined) {
            if (!['low', 'medium', 'high'].includes(priority)) {
                return res.status(400).json({
                    success: false,
                    message: 'Priority must be one of: low, medium, high',
                    error: 'VALIDATION_ERROR'
                });
            }
            updateData.priority = priority;
        }
        
        // Validate and set folder
        if (folderId !== undefined) {
            if (folderId !== null && folderId !== '') {
                if (isNaN(parseInt(folderId))) {
                    return res.status(400).json({
                        success: false,
                        message: 'Folder ID must be a valid number',
                        error: 'VALIDATION_ERROR'
                    });
                }
                
                const folder = await folderModel.getFolderById(folderId, userId);
                if (!folder) {
                    return res.status(404).json({
                        success: false,
                        message: 'Folder not found or you do not have permission to move tasks to it',
                        error: 'FOLDER_NOT_FOUND'
                    });
                }
                updateData.folderId = parseInt(folderId);
            } else {
                updateData.folderId = null;
            }
        }
        
        // Validate and set due date
        if (dueDate !== undefined) {
            if (dueDate === null || dueDate === '') {
                updateData.dueDate = null;
            } else {
                const parsedDueDate = new Date(dueDate);
                if (isNaN(parsedDueDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: 'Due date must be a valid date',
                        error: 'VALIDATION_ERROR'
                    });
                }
                updateData.dueDate = parsedDueDate;
            }
        }
        
        const updatedTask = await taskModel.updateTask(taskId, userId, updateData);
        
        if (!updatedTask) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or could not be updated',
                error: 'UPDATE_FAILED'
            });
        }
        
        res.json({
            success: true,
            message: 'Task updated successfully',
            data: {
                task: updatedTask
            }
        });
    } catch (error) {
        console.error('Error in updateTask controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update task',
            error: error.message
        });
    }
};

/**
 * Toggle task completion status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const toggleTaskCompletion = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;
        
        // Validation
        if (!taskId || isNaN(parseInt(taskId))) {
            return res.status(400).json({
                success: false,
                message: 'Valid task ID is required',
                error: 'VALIDATION_ERROR'
            });
        }
        
        const updatedTask = await taskModel.toggleTaskCompletion(taskId, userId);
        
        if (!updatedTask) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or you do not have permission to update it',
                error: 'NOT_FOUND'
            });
        }
        
        res.json({
            success: true,
            message: `Task marked as ${updatedTask.completed ? 'completed' : 'incomplete'}`,
            data: {
                task: updatedTask
            }
        });
    } catch (error) {
        console.error('Error in toggleTaskCompletion controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle task completion',
            error: error.message
        });
    }
};

/**
 * Delete a task
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const deleteTask = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;
        
        // Validation
        if (!taskId || isNaN(parseInt(taskId))) {
            return res.status(400).json({
                success: false,
                message: 'Valid task ID is required',
                error: 'VALIDATION_ERROR'
            });
        }
        
        // Get task details before deletion
        const existingTask = await taskModel.getTaskById(taskId, userId);
        if (!existingTask) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or you do not have permission to delete it',
                error: 'NOT_FOUND'
            });
        }
        
        const deleted = await taskModel.deleteTask(taskId, userId);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or could not be deleted',
                error: 'DELETE_FAILED'
            });
        }
        
        res.json({
            success: true,
            message: 'Task deleted successfully',
            data: {
                deletedTask: existingTask
            }
        });
    } catch (error) {
        console.error('Error in deleteTask controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete task',
            error: error.message
        });
    }
};

/**
 * Get a specific task by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getTaskById = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;
        
        // Validation
        if (!taskId || isNaN(parseInt(taskId))) {
            return res.status(400).json({
                success: false,
                message: 'Valid task ID is required',
                error: 'VALIDATION_ERROR'
            });
        }
        
        const task = await taskModel.getTaskById(taskId, userId);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or you do not have permission to access it',
                error: 'NOT_FOUND'
            });
        }
        
        res.json({
            success: true,
            message: 'Task retrieved successfully',
            data: {
                task
            }
        });
    } catch (error) {
        console.error('Error in getTaskById controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve task',
            error: error.message
        });
    }
};

/**
 * Get task statistics for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getTaskStats = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        const [taskStats, folderStats] = await Promise.all([
            taskModel.getCompletedTasksCount(userId),
            taskModel.getTaskCountByFolder(userId)
        ]);
        
        res.json({
            success: true,
            message: 'Task statistics retrieved successfully',
            data: {
                overview: taskStats,
                byFolder: folderStats
            }
        });
    } catch (error) {
        console.error('Error in getTaskStats controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve task statistics',
            error: error.message
        });
    }
}; 