import * as folderModel from '../models/folderModel.js';

/**
 * Get all folders for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getFolders = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        const folders = await folderModel.getAllFoldersByUserId(userId);
        
        res.json({
            success: true,
            message: 'Folders retrieved successfully',
            data: {
                folders,
                total: folders.length
            }
        });
    } catch (error) {
        console.error('Error in getFolders controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve folders',
            error: error.message
        });
    }
};

/**
 * Create a new folder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const createFolder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name } = req.body;
        
        // Validation
        if (!name || typeof name !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Folder name is required and must be a string',
                error: 'VALIDATION_ERROR'
            });
        }
        
        if (name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Folder name cannot be empty',
                error: 'VALIDATION_ERROR'
            });
        }
        
        if (name.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Folder name cannot exceed 100 characters',
                error: 'VALIDATION_ERROR'
            });
        }
        
        const trimmedName = name.trim();
        
        // Check if folder name is unique
        const isUnique = await folderModel.isFolderNameUnique(trimmedName, userId);
        if (!isUnique) {
            return res.status(409).json({
                success: false,
                message: 'A folder with this name already exists',
                error: 'DUPLICATE_NAME'
            });
        }
        
        const newFolder = await folderModel.createFolder({
            userId,
            name: trimmedName
        });
        
        res.status(201).json({
            success: true,
            message: 'Folder created successfully',
            data: {
                folder: newFolder
            }
        });
    } catch (error) {
        console.error('Error in createFolder controller:', error);
        
        // Handle specific database errors
        if (error.message.includes('already exists')) {
            return res.status(409).json({
                success: false,
                message: error.message,
                error: 'DUPLICATE_NAME'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create folder',
            error: error.message
        });
    }
};

/**
 * Update an existing folder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const updateFolder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const folderId = req.params.id;
        const { name } = req.body;
        
        // Validation
        if (!folderId || isNaN(parseInt(folderId))) {
            return res.status(400).json({
                success: false,
                message: 'Valid folder ID is required',
                error: 'VALIDATION_ERROR'
            });
        }
        
        if (!name || typeof name !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Folder name is required and must be a string',
                error: 'VALIDATION_ERROR'
            });
        }
        
        if (name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Folder name cannot be empty',
                error: 'VALIDATION_ERROR'
            });
        }
        
        if (name.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Folder name cannot exceed 100 characters',
                error: 'VALIDATION_ERROR'
            });
        }
        
        const trimmedName = name.trim();
        
        // Check if folder exists and belongs to user
        const existingFolder = await folderModel.getFolderById(folderId, userId);
        if (!existingFolder) {
            return res.status(404).json({
                success: false,
                message: 'Folder not found or you do not have permission to update it',
                error: 'NOT_FOUND'
            });
        }
        
        // Check if new name is unique (excluding current folder)
        const isUnique = await folderModel.isFolderNameUnique(trimmedName, userId, folderId);
        if (!isUnique) {
            return res.status(409).json({
                success: false,
                message: 'A folder with this name already exists',
                error: 'DUPLICATE_NAME'
            });
        }
        
        const updatedFolder = await folderModel.updateFolder(folderId, userId, {
            name: trimmedName
        });
        
        if (!updatedFolder) {
            return res.status(404).json({
                success: false,
                message: 'Folder not found or could not be updated',
                error: 'UPDATE_FAILED'
            });
        }
        
        res.json({
            success: true,
            message: 'Folder updated successfully',
            data: {
                folder: updatedFolder
            }
        });
    } catch (error) {
        console.error('Error in updateFolder controller:', error);
        
        // Handle specific database errors
        if (error.message.includes('already exists')) {
            return res.status(409).json({
                success: false,
                message: error.message,
                error: 'DUPLICATE_NAME'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to update folder',
            error: error.message
        });
    }
};

/**
 * Delete a folder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const deleteFolder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const folderId = req.params.id;
        
        // Validation
        if (!folderId || isNaN(parseInt(folderId))) {
            return res.status(400).json({
                success: false,
                message: 'Valid folder ID is required',
                error: 'VALIDATION_ERROR'
            });
        }
        
        // Check if folder exists and belongs to user
        const existingFolder = await folderModel.getFolderById(folderId, userId);
        if (!existingFolder) {
            return res.status(404).json({
                success: false,
                message: 'Folder not found or you do not have permission to delete it',
                error: 'NOT_FOUND'
            });
        }
        
        // Get task count before deletion
        const taskCount = await folderModel.getFolderTaskCount(folderId);
        
        const deleted = await folderModel.deleteFolder(folderId, userId);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Folder not found or could not be deleted',
                error: 'DELETE_FAILED'
            });
        }
        
        res.json({
            success: true,
            message: 'Folder deleted successfully',
            data: {
                deletedFolder: existingFolder,
                affectedTasks: parseInt(taskCount.total_count) || 0,
                message: taskCount.total_count > 0 
                    ? `${taskCount.total_count} tasks in this folder have been moved to "No Folder"`
                    : 'No tasks were affected'
            }
        });
    } catch (error) {
        console.error('Error in deleteFolder controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete folder',
            error: error.message
        });
    }
};

/**
 * Get a specific folder by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getFolderById = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const folderId = req.params.id;
        
        // Validation
        if (!folderId || isNaN(parseInt(folderId))) {
            return res.status(400).json({
                success: false,
                message: 'Valid folder ID is required',
                error: 'VALIDATION_ERROR'
            });
        }
        
        const folder = await folderModel.getFolderById(folderId, userId);
        
        if (!folder) {
            return res.status(404).json({
                success: false,
                message: 'Folder not found or you do not have permission to access it',
                error: 'NOT_FOUND'
            });
        }
        
        res.json({
            success: true,
            message: 'Folder retrieved successfully',
            data: {
                folder
            }
        });
    } catch (error) {
        console.error('Error in getFolderById controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve folder',
            error: error.message
        });
    }
}; 