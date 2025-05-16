import * as folderModel from '../models/folderModel.js';

/**
 * Creates a new folder.
 */
export const createFolder = async (req, res, next) => {
    try {
        const { name, recurrenceDays, isActive } = req.body;
        const userId = req.user.id; // Assuming protect middleware adds req.user

        // Basic Validation
        if (!name) {
            return res.status(400).json({ message: 'Folder name is required.' });
        }
        if (!recurrenceDays || !Array.isArray(recurrenceDays)) {
            return res.status(400).json({ message: 'recurrenceDays must be an array.' });
        }
        // Further validation for contents of recurrenceDays can be added here if needed

        const newFolderData = {
            userId,
            name,
            recurrenceDays,
        };
        if (isActive !== undefined) {
            newFolderData.isActive = isActive;
        }

        const newFolder = await folderModel.create(newFolderData);
        res.status(201).json(newFolder);
    } catch (error) {
        console.error('[FolderController] Error in createFolder:', error.message);
        next(error); // Pass to global error handler
    }
};

/**
 * Gets all folders for the authenticated user.
 */
export const getUserFolders = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const folders = await folderModel.findByUserId(userId);
        res.status(200).json(folders);
    } catch (error) {
        console.error('[FolderController] Error in getUserFolders:', error.message);
        next(error);
    }
};

/**
 * Gets a specific folder by its ID for the authenticated user.
 */
export const getFolderById = async (req, res, next) => {
    try {
        const folderId = parseInt(req.params.id, 10);
        const userId = req.user.id;

        if (isNaN(folderId)) {
            return res.status(400).json({ message: 'Invalid folder ID format.' });
        }

        const folder = await folderModel.findByIdAndUserId(folderId, userId);
        if (!folder) {
            return res.status(404).json({ message: 'Folder not found or not owned by user.' });
        }
        res.status(200).json(folder);
    } catch (error) {
        console.error('[FolderController] Error in getFolderById:', error.message);
        next(error);
    }
};

/**
 * Updates an existing folder for the authenticated user.
 */
export const updateFolder = async (req, res, next) => {
    try {
        const folderId = parseInt(req.params.id, 10);
        const userId = req.user.id;
        const { name, recurrenceDays, isActive } = req.body;

        if (isNaN(folderId)) {
            return res.status(400).json({ message: 'Invalid folder ID format.' });
        }

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (recurrenceDays !== undefined) {
            if (!Array.isArray(recurrenceDays)) {
                return res.status(400).json({ message: 'recurrenceDays must be an array if provided.' });
            }
            updates.recurrenceDays = recurrenceDays;
        }
        if (isActive !== undefined) updates.isActive = isActive;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No update fields provided.' });
        }

        const updatedFolder = await folderModel.update(folderId, userId, updates);
        if (!updatedFolder) {
            // This could be because the folder doesn't exist OR because folderModel.update threw (e.g. no fields)
            // However, folderModel.update now returns null if not found/owned after a valid update attempt.
            return res.status(404).json({ message: 'Folder not found, not owned by user, or no effective update made.' });
        }
        res.status(200).json(updatedFolder);
    } catch (error) {
        console.error('[FolderController] Error in updateFolder:', error.message);
        if (error.message === 'No fields provided to update.') { // Catch specific error from model
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

/**
 * Deletes a folder for the authenticated user.
 */
export const deleteFolder = async (req, res, next) => {
    try {
        const folderId = parseInt(req.params.id, 10);
        const userId = req.user.id;

        if (isNaN(folderId)) {
            return res.status(400).json({ message: 'Invalid folder ID format.' });
        }

        const deletedFolder = await folderModel.deleteByIdAndUserId(folderId, userId);
        if (!deletedFolder) {
            return res.status(404).json({ message: 'Folder not found or not owned by user.' });
        }
        // Successfully deleted
        res.status(200).json({ message: 'Folder deleted successfully.', deletedFolder });
        // Or use 204 No Content if not returning the deleted item
        // res.status(204).send(); 
    } catch (error) {
        console.error('[FolderController] Error in deleteFolder:', error.message);
        next(error);
    }
}; 