import pool from '../config/db.js';

/**
 * Get all tasks for a specific user with optional filters
 * @param {number|string} userId - The user ID
 * @param {Object} filters - Optional filters
 * @param {number|string} filters.folderId - Filter by folder ID
 * @param {boolean} filters.completed - Filter by completion status
 * @param {string} filters.priority - Filter by priority (low, medium, high)
 * @param {string} filters.sortBy - Sort field (created_at, due_date, priority, title)
 * @param {string} filters.sortOrder - Sort order (ASC, DESC)
 * @returns {Array} Array of task objects with folder information
 */
export const getAllTasksByUserId = async (userId, filters = {}) => {
    try {
        let query = `
            SELECT 
                t.id, 
                t.user_id, 
                t.folder_id, 
                t.title, 
                t.description, 
                t.completed, 
                t.priority, 
                t.due_date, 
                t.created_at, 
                t.updated_at,
                f.name as folder_name
            FROM tasks t
            LEFT JOIN todo_folders f ON t.folder_id = f.id
            WHERE t.user_id = $1
        `;
        
        const params = [userId];
        let paramIndex = 2;
        
        // Apply filters
        if (filters.folderId !== undefined) {
            if (filters.folderId === null) {
                query += ' AND t.folder_id IS NULL';
            } else {
                query += ` AND t.folder_id = $${paramIndex}`;
                params.push(filters.folderId);
                paramIndex++;
            }
        }
        
        if (filters.completed !== undefined) {
            query += ` AND t.completed = $${paramIndex}`;
            params.push(filters.completed);
            paramIndex++;
        }
        
        if (filters.priority) {
            query += ` AND t.priority = $${paramIndex}`;
            params.push(filters.priority);
            paramIndex++;
        }
        
        // Apply sorting
        const validSortFields = ['created_at', 'due_date', 'priority', 'title', 'updated_at'];
        const sortBy = validSortFields.includes(filters.sortBy) ? filters.sortBy : 'created_at';
        const sortOrder = filters.sortOrder === 'ASC' ? 'ASC' : 'DESC';
        
        query += ` ORDER BY t.${sortBy} ${sortOrder}`;
        
        const result = await pool.query(query, params);
        return result.rows;
    } catch (error) {
        console.error('Error getting tasks by user ID:', error);
        throw error;
    }
};

/**
 * Get a specific task by ID with user ownership check
 * @param {number|string} taskId - The task ID
 * @param {number|string} userId - The user ID for ownership verification
 * @returns {Object|null} Task object with folder information or null if not found
 */
export const getTaskById = async (taskId, userId) => {
    try {
        const result = await pool.query(
            `SELECT 
                t.id, 
                t.user_id, 
                t.folder_id, 
                t.title, 
                t.description, 
                t.completed, 
                t.priority, 
                t.due_date, 
                t.created_at, 
                t.updated_at,
                f.name as folder_name
            FROM tasks t
            LEFT JOIN todo_folders f ON t.folder_id = f.id
            WHERE t.id = $1 AND t.user_id = $2`,
            [taskId, userId]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error('Error getting task by ID:', error);
        throw error;
    }
};

/**
 * Create a new task
 * @param {Object} taskData - Task data
 * @param {number|string} taskData.userId - The user ID
 * @param {number|string|null} taskData.folderId - The folder ID (optional)
 * @param {string} taskData.title - The task title
 * @param {string} taskData.description - The task description (optional)
 * @param {string} taskData.priority - The task priority (low, medium, high)
 * @param {Date|string} taskData.dueDate - The due date (optional)
 * @returns {Object} Created task object
 */
export const createTask = async ({ userId, folderId, title, description, priority = 'medium', dueDate }) => {
    try {
        const result = await pool.query(
            `INSERT INTO tasks (user_id, folder_id, title, description, priority, due_date) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING id, user_id, folder_id, title, description, completed, priority, due_date, created_at, updated_at`,
            [userId, folderId, title, description, priority, dueDate]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error creating task:', error);
        throw error;
    }
};

/**
 * Update a task
 * @param {number|string} taskId - The task ID
 * @param {number|string} userId - The user ID for ownership verification
 * @param {Object} updateData - Data to update
 * @param {number|string|null} updateData.folderId - New folder ID
 * @param {string} updateData.title - New task title
 * @param {string} updateData.description - New task description
 * @param {boolean} updateData.completed - New completion status
 * @param {string} updateData.priority - New priority (low, medium, high)
 * @param {Date|string} updateData.dueDate - New due date
 * @returns {Object|null} Updated task object or null if not found
 */
export const updateTask = async (taskId, userId, updateData) => {
    try {
        const updateFields = [];
        const params = [];
        let paramIndex = 1;
        
        // Build dynamic update query
        if (updateData.folderId !== undefined) {
            updateFields.push(`folder_id = $${paramIndex}`);
            params.push(updateData.folderId);
            paramIndex++;
        }
        
        if (updateData.title !== undefined) {
            updateFields.push(`title = $${paramIndex}`);
            params.push(updateData.title);
            paramIndex++;
        }
        
        if (updateData.description !== undefined) {
            updateFields.push(`description = $${paramIndex}`);
            params.push(updateData.description);
            paramIndex++;
        }
        
        if (updateData.completed !== undefined) {
            updateFields.push(`completed = $${paramIndex}`);
            params.push(updateData.completed);
            paramIndex++;
        }
        
        if (updateData.priority !== undefined) {
            updateFields.push(`priority = $${paramIndex}`);
            params.push(updateData.priority);
            paramIndex++;
        }
        
        if (updateData.dueDate !== undefined) {
            updateFields.push(`due_date = $${paramIndex}`);
            params.push(updateData.dueDate);
            paramIndex++;
        }
        
        if (updateFields.length === 0) {
            throw new Error('No fields to update');
        }
        
        // Always update the updated_at timestamp
        updateFields.push('updated_at = NOW()');
        
        // Add WHERE conditions
        params.push(taskId, userId);
        
        const query = `
            UPDATE tasks 
            SET ${updateFields.join(', ')} 
            WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
            RETURNING id, user_id, folder_id, title, description, completed, priority, due_date, created_at, updated_at
        `;
        
        const result = await pool.query(query, params);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error('Error updating task:', error);
        throw error;
    }
};

/**
 * Toggle task completion status
 * @param {number|string} taskId - The task ID
 * @param {number|string} userId - The user ID for ownership verification
 * @returns {Object|null} Updated task object or null if not found
 */
export const toggleTaskCompletion = async (taskId, userId) => {
    try {
        const result = await pool.query(
            `UPDATE tasks 
            SET completed = NOT completed, updated_at = NOW() 
            WHERE id = $1 AND user_id = $2 
            RETURNING id, user_id, folder_id, title, description, completed, priority, due_date, created_at, updated_at`,
            [taskId, userId]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error('Error toggling task completion:', error);
        throw error;
    }
};

/**
 * Delete a task
 * @param {number|string} taskId - The task ID
 * @param {number|string} userId - The user ID for ownership verification
 * @returns {boolean} True if deleted, false if not found
 */
export const deleteTask = async (taskId, userId) => {
    try {
        const result = await pool.query(
            `DELETE FROM tasks 
            WHERE id = $1 AND user_id = $2 
            RETURNING id`,
            [taskId, userId]
        );
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
    }
};

/**
 * Get tasks by folder ID
 * @param {number|string} folderId - The folder ID
 * @param {number|string} userId - The user ID for ownership verification
 * @returns {Array} Array of task objects
 */
export const getTasksByFolderId = async (folderId, userId) => {
    try {
        const result = await pool.query(
            `SELECT 
                id, user_id, folder_id, title, description, completed, priority, due_date, created_at, updated_at
            FROM tasks 
            WHERE folder_id = $1 AND user_id = $2
            ORDER BY created_at DESC`,
            [folderId, userId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error getting tasks by folder ID:', error);
        throw error;
    }
};

/**
 * Get task counts grouped by folder for a user
 * @param {number|string} userId - The user ID
 * @returns {Array} Array of objects with folder info and task counts
 */
export const getTaskCountByFolder = async (userId) => {
    try {
        const result = await pool.query(
            `SELECT 
                t.folder_id,
                f.name as folder_name,
                COUNT(*) as total_count,
                COUNT(CASE WHEN t.completed = true THEN 1 END) as completed_count,
                COUNT(CASE WHEN t.completed = false THEN 1 END) as pending_count
            FROM tasks t
            LEFT JOIN todo_folders f ON t.folder_id = f.id
            WHERE t.user_id = $1
            GROUP BY t.folder_id, f.name
            ORDER BY f.name ASC NULLS LAST`,
            [userId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error getting task count by folder:', error);
        throw error;
    }
};

/**
 * Get completed tasks count for a user
 * @param {number|string} userId - The user ID
 * @returns {Object} Object with task statistics
 */
export const getCompletedTasksCount = async (userId) => {
    try {
        const result = await pool.query(
            `SELECT 
                COUNT(*) as total_tasks,
                COUNT(CASE WHEN completed = true THEN 1 END) as completed_tasks,
                COUNT(CASE WHEN completed = false THEN 1 END) as pending_tasks,
                COUNT(CASE WHEN due_date IS NOT NULL AND due_date < NOW() AND completed = false THEN 1 END) as overdue_tasks
            FROM tasks 
            WHERE user_id = $1`,
            [userId]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error getting completed tasks count:', error);
        throw error;
    }
}; 