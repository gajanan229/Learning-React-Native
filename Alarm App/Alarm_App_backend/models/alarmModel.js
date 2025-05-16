import pool from '../config/db.js';

/**
 * Creates a new alarm for a user within a specific folder.
 * @param {object} alarmData - Alarm data.
 * @param {string | number} alarmData.folderId - The ID of the folder this alarm belongs to.
 * @param {string | number} alarmData.userId - The ID of the user creating the alarm.
 * @param {string} alarmData.time - The time of the alarm (e.g., '07:30:00').
 * @param {string} [alarmData.label] - Optional label for the alarm.
 * @param {string} alarmData.soundId - Identifier for the alarm sound.
 * @param {boolean} [alarmData.vibration=true] - Whether vibration is enabled.
 * @param {boolean} [alarmData.snooze=false] - Whether snooze is enabled.
 * @param {number} [alarmData.snoozeDuration=5] - Snooze duration in minutes.
 * @param {boolean} [alarmData.isTemporary=false] - Whether the alarm is temporary.
 * @param {boolean} [alarmData.isActive=true] - Whether the alarm is active.
 * @returns {Promise<object>} The newly created alarm object.
 * @throws Will throw an error if database query fails.
 */
export const create = async ({
    folderId, userId, time, label = null, soundId,
    vibration = true, snooze = false, snoozeDuration = 5,
    isTemporary = false, isActive = true
}) => {
    const queryText = `
        INSERT INTO alarms (
            folder_id, user_id, time, label, sound_id, 
            vibration, snooze, snooze_duration, is_temporary, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
    `;
    const values = [
        folderId, userId, time, label, soundId,
        vibration, snooze, snoozeDuration, isTemporary, isActive
    ];
    try {
        const result = await pool.query(queryText, values);
        return result.rows[0];
    } catch (error) {
        console.error(`Error creating alarm for user ${userId} in folder ${folderId}:`, error.stack);
        throw error;
    }
};

/**
 * Finds all alarms for a specific folder and user.
 * @param {string | number} folderId - The ID of the folder.
 * @param {string | number} userId - The ID of the user.
 * @returns {Promise<object[]>} An array of alarm objects, ordered by time (ascending).
 * @throws Will throw an error if database query fails.
 */
export const findByFolderIdAndUserId = async (folderId, userId) => {
    const queryText = `
        SELECT * FROM alarms 
        WHERE folder_id = $1 AND user_id = $2 
        ORDER BY time ASC;
    `;
    try {
        const result = await pool.query(queryText, [folderId, userId]);
        return result.rows;
    } catch (error) {
        console.error(`Error finding alarms for folder ${folderId} and user ${userId}:`, error.stack);
        throw error;
    }
};

/**
 * Finds a specific alarm by its ID and user ID.
 * @param {string | number} alarmId - The ID of the alarm.
 * @param {string | number} userId - The ID of the user.
 * @returns {Promise<object | null>} The alarm object if found and owned by the user, otherwise null.
 * @throws Will throw an error if database query fails.
 */
export const findByIdAndUserId = async (alarmId, userId) => {
    const queryText = `
        SELECT * FROM alarms 
        WHERE id = $1 AND user_id = $2;
    `;
    try {
        const result = await pool.query(queryText, [alarmId, userId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error(`Error finding alarm ${alarmId} for user ${userId}:`, error.stack);
        throw error;
    }
};

/**
 * Updates an alarm for a specific user.
 * @param {string | number} alarmId - The ID of the alarm to update.
 * @param {string | number} userId - The ID of the user who owns the alarm.
 * @param {object} updates - An object containing the fields to update.
 * @returns {Promise<object | null>} The updated alarm object, or null if not found/owned or no update made.
 * @throws Will throw an error if database query fails or if no fields to update are provided.
 */
export const update = async (alarmId, userId, updates) => {
    const {
        time, label, soundId, vibration, snooze,
        snoozeDuration, isTemporary, isActive
    } = updates;

    const fieldsToUpdate = [];
    const values = [];
    let paramCount = 1;

    if (time !== undefined) { fieldsToUpdate.push(`time = $${paramCount++}`); values.push(time); }
    if (label !== undefined) { fieldsToUpdate.push(`label = $${paramCount++}`); values.push(label); }
    if (soundId !== undefined) { fieldsToUpdate.push(`sound_id = $${paramCount++}`); values.push(soundId); }
    if (vibration !== undefined) { fieldsToUpdate.push(`vibration = $${paramCount++}`); values.push(vibration); }
    if (snooze !== undefined) { fieldsToUpdate.push(`snooze = $${paramCount++}`); values.push(snooze); }
    if (snoozeDuration !== undefined) { fieldsToUpdate.push(`snooze_duration = $${paramCount++}`); values.push(snoozeDuration); }
    if (isTemporary !== undefined) { fieldsToUpdate.push(`is_temporary = $${paramCount++}`); values.push(isTemporary); }
    if (isActive !== undefined) { fieldsToUpdate.push(`is_active = $${paramCount++}`); values.push(isActive); }

    if (fieldsToUpdate.length === 0) {
        const err = new Error('No fields provided to update for alarm.');
        console.warn(`Attempted to update alarm ${alarmId} for user ${userId} with no update fields.`);
        throw err;
    }

    fieldsToUpdate.push(`updated_at = CURRENT_TIMESTAMP`);

    const queryText = `
        UPDATE alarms 
        SET ${fieldsToUpdate.join(', ')} 
        WHERE id = $${paramCount++} AND user_id = $${paramCount++}
        RETURNING *;
    `;
    values.push(alarmId, userId);

    try {
        const result = await pool.query(queryText, values);
        return result.rows[0] || null;
    } catch (error) {
        console.error(`Error updating alarm ${alarmId} for user ${userId}:`, error.stack);
        throw error;
    }
};

/**
 * Deletes a specific alarm by its ID and user ID.
 * @param {string | number} alarmId - The ID of the alarm to delete.
 * @param {string | number} userId - The ID of the user who owns the alarm.
 * @returns {Promise<object | null>} The deleted alarm object if found and deleted, otherwise null.
 * @throws Will throw an error if database query fails.
 */
export const deleteByIdAndUserId = async (alarmId, userId) => {
    const queryText = `
        DELETE FROM alarms 
        WHERE id = $1 AND user_id = $2 
        RETURNING *;
    `;
    try {
        const result = await pool.query(queryText, [alarmId, userId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error(`Error deleting alarm ${alarmId} for user ${userId}:`, error.stack);
        throw error;
    }
}; 