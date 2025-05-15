import pool from '../config/db.js';

/**
 * Creates a new folder for a user.
 * @param {object} folderData - Folder data.
 * @param {string | number} folderData.userId - The ID of the user.
 * @param {string} folderData.name - The name of the folder.
 * @param {string[]} folderData.recurrenceDays - Array of strings for recurrence days (e.g., ['monday', 'tuesday']).
 * @param {boolean} [folderData.isActive=true] - Whether the folder is active.
 * @returns {Promise<object>} The newly created folder object.
 * @throws Will throw an error if database query fails.
 */
export const create = async ({ userId, name, recurrenceDays, isActive = true }) => {
    const queryText = `
        INSERT INTO folders (user_id, name, recurrence_days, is_active)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const values = [userId, name, recurrenceDays, isActive];
    try {
        const result = await pool.query(queryText, values);
        return result.rows[0];
    } catch (error) {
        console.error(`Error creating folder for user ${userId}:`, error.stack);
        throw error; // Re-throw the error to be handled by the controller
    }
};

/**
 * Finds all folders for a specific user.
 * @param {string | number} userId - The ID of the user.
 * @returns {Promise<object[]>} An array of folder objects, ordered by creation date (descending).
 * @throws Will throw an error if database query fails.
 */
export const findByUserId = async (userId) => {
    const queryText = `
        SELECT * FROM folders 
        WHERE user_id = $1 
        ORDER BY created_at DESC;
    `;
    try {
        const result = await pool.query(queryText, [userId]);
        return result.rows;
    } catch (error) {
        console.error(`Error finding folders for user ${userId}:`, error.stack);
        throw error;
    }
};

/**
 * Finds a specific folder by its ID and user ID.
 * @param {string | number} folderId - The ID of the folder.
 * @param {string | number} userId - The ID of the user.
 * @returns {Promise<object | null>} The folder object if found and owned by the user, otherwise null.
 * @throws Will throw an error if database query fails.
 */
export const findByIdAndUserId = async (folderId, userId) => {
    const queryText = `
        SELECT * FROM folders 
        WHERE id = $1 AND user_id = $2;
    `;
    try {
        const result = await pool.query(queryText, [folderId, userId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error(`Error finding folder ${folderId} for user ${userId}:`, error.stack);
        throw error;
    }
};

/**
 * Updates a folder for a specific user.
 * @param {string | number} folderId - The ID of the folder to update.
 * @param {string | number} userId - The ID of the user who owns the folder.
 * @param {object} updates - An object containing the fields to update (e.g., { name, recurrenceDays, isActive }).
 * @returns {Promise<object | null>} The updated folder object, or null if not found or not owned.
 * @throws Will throw an error if database query fails or if no fields to update are provided.
 */
export const update = async (folderId, userId, updates) => {
    const { name, recurrenceDays, isActive } = updates;
    const fieldsToUpdate = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
        fieldsToUpdate.push(`name = $${paramCount++}`);
        values.push(name);
    }
    if (recurrenceDays !== undefined) {
        fieldsToUpdate.push(`recurrence_days = $${paramCount++}`);
        values.push(recurrenceDays);
    }
    if (isActive !== undefined) {
        fieldsToUpdate.push(`is_active = $${paramCount++}`);
        values.push(isActive);
    }

    if (fieldsToUpdate.length === 0) {
        const err = new Error('No fields provided to update.');
        console.warn(`Attempted to update folder ${folderId} for user ${userId} with no update fields.`);
        throw err; 
    }

    fieldsToUpdate.push(`updated_at = CURRENT_TIMESTAMP`);

    const queryText = `
        UPDATE folders 
        SET ${fieldsToUpdate.join(', ')} 
        WHERE id = $${paramCount++} AND user_id = $${paramCount++}
        RETURNING *;
    `;
    values.push(folderId, userId);

    try {
        const result = await pool.query(queryText, values);
        return result.rows[0] || null; 
    } catch (error) {
        console.error(`Error updating folder ${folderId} for user ${userId}:`, error.stack);
        throw error;
    }
};

/**
 * Deletes a specific folder by its ID and user ID.
 * @param {string | number} folderId - The ID of the folder to delete.
 * @param {string | number} userId - The ID of the user who owns the folder.
 * @returns {Promise<object | null>} The deleted folder object if found and deleted, otherwise null.
 * @throws Will throw an error if database query fails.
 */
export const deleteByIdAndUserId = async (folderId, userId) => {
    const queryText = `
        DELETE FROM folders 
        WHERE id = $1 AND user_id = $2 
        RETURNING *;
    `;
    try {
        const result = await pool.query(queryText, [folderId, userId]);
        return result.rows[0] || null; 
    } catch (error) {
        console.error(`Error deleting folder ${folderId} for user ${userId}:`, error.stack);
        throw error;
    }
}; 