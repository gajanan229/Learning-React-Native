import pool from '../config/db.js';

/**
 * Get all folders for a specific user
 * @param {number|string} userId - The user ID
 * @returns {Array} Array of folder objects
 */
export const getAllFoldersByUserId = async (userId) => {
    try {
        const result = await pool.query(
            `SELECT 
                f.id, 
                f.user_id, 
                f.name, 
                f.created_at, 
                f.updated_at,
                COUNT(t.id) as task_count,
                COUNT(CASE WHEN t.completed = true THEN 1 END) as completed_count
            FROM todo_folders f
            LEFT JOIN tasks t ON f.id = t.folder_id
            WHERE f.user_id = $1
            GROUP BY f.id, f.user_id, f.name, f.created_at, f.updated_at
            ORDER BY f.created_at ASC`,
            [userId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error getting folders by user ID:', error);
        throw error;
    }
};

/**
 * Get a specific folder by ID with user ownership check
 * @param {number|string} folderId - The folder ID
 * @param {number|string} userId - The user ID for ownership verification
 * @returns {Object|null} Folder object or null if not found
 */
export const getFolderById = async (folderId, userId) => {
    try {
        const result = await pool.query(
            `SELECT 
                f.id, 
                f.user_id, 
                f.name, 
                f.created_at, 
                f.updated_at,
                COUNT(t.id) as task_count,
                COUNT(CASE WHEN t.completed = true THEN 1 END) as completed_count
            FROM todo_folders f
            LEFT JOIN tasks t ON f.id = t.folder_id
            WHERE f.id = $1 AND f.user_id = $2
            GROUP BY f.id, f.user_id, f.name, f.created_at, f.updated_at`,
            [folderId, userId]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error('Error getting folder by ID:', error);
        throw error;
    }
};

/**
 * Create a new folder
 * @param {Object} folderData - Folder data
 * @param {number|string} folderData.userId - The user ID
 * @param {string} folderData.name - The folder name
 * @returns {Object} Created folder object
 */
export const createFolder = async ({ userId, name }) => {
    try {
        const result = await pool.query(
            `INSERT INTO todo_folders (user_id, name) 
            VALUES ($1, $2) 
            RETURNING id, user_id, name, created_at, updated_at`,
            [userId, name]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error creating folder:', error);
        // Check for unique constraint violation
        if (error.code === '23505') {
            throw new Error('A folder with this name already exists');
        }
        throw error;
    }
};

/**
 * Update a folder
 * @param {number|string} folderId - The folder ID
 * @param {number|string} userId - The user ID for ownership verification
 * @param {Object} updateData - Data to update
 * @param {string} updateData.name - New folder name
 * @returns {Object|null} Updated folder object or null if not found
 */
export const updateFolder = async (folderId, userId, { name }) => {
    try {
        const result = await pool.query(
            `UPDATE todo_folders 
            SET name = $1, updated_at = NOW() 
            WHERE id = $2 AND user_id = $3 
            RETURNING id, user_id, name, created_at, updated_at`,
            [name, folderId, userId]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error('Error updating folder:', error);
        // Check for unique constraint violation
        if (error.code === '23505') {
            throw new Error('A folder with this name already exists');
        }
        throw error;
    }
};

/**
 * Delete a folder (tasks in folder will have folder_id set to NULL)
 * @param {number|string} folderId - The folder ID
 * @param {number|string} userId - The user ID for ownership verification
 * @returns {boolean} True if deleted, false if not found
 */
export const deleteFolder = async (folderId, userId) => {
    try {
        const result = await pool.query(
            `DELETE FROM todo_folders 
            WHERE id = $1 AND user_id = $2 
            RETURNING id`,
            [folderId, userId]
        );
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error deleting folder:', error);
        throw error;
    }
};

/**
 * Get task count for a specific folder
 * @param {number|string} folderId - The folder ID
 * @returns {Object} Object with total and completed task counts
 */
export const getFolderTaskCount = async (folderId) => {
    try {
        const result = await pool.query(
            `SELECT 
                COUNT(*) as total_count,
                COUNT(CASE WHEN completed = true THEN 1 END) as completed_count
            FROM tasks 
            WHERE folder_id = $1`,
            [folderId]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error getting folder task count:', error);
        throw error;
    }
};

/**
 * Check if a folder name is unique for a user
 * @param {string} name - The folder name
 * @param {number|string} userId - The user ID
 * @param {number|string} excludeFolderId - Optional folder ID to exclude from check (for updates)
 * @returns {boolean} True if name is unique, false otherwise
 */
export const isFolderNameUnique = async (name, userId, excludeFolderId = null) => {
    try {
        let query = 'SELECT id FROM todo_folders WHERE user_id = $1 AND name = $2';
        let params = [userId, name];
        
        if (excludeFolderId) {
            query += ' AND id != $3';
            params.push(excludeFolderId);
        }
        
        const result = await pool.query(query, params);
        return result.rows.length === 0;
    } catch (error) {
        console.error('Error checking folder name uniqueness:', error);
        throw error;
    }
}; 