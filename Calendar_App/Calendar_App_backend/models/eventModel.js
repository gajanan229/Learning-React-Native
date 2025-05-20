import pool from '../config/db.js';

/**
 * Creates a new event in the database.
 * @param {object} eventData - The event data.
 * @param {number} eventData.userId - The ID of the user creating the event.
 * @param {string} eventData.title - The title of the event.
 * @param {string} [eventData.description] - The description of the event.
 * @param {string} eventData.startTime - The start time of the event (ISO string).
 * @param {string} eventData.endTime - The end time of the event (ISO string).
 * @param {boolean} [eventData.isAllDay=false] - Whether the event is all day.
 * @param {string} [eventData.location] - The location of the event.
 * @param {string} [eventData.color] - The color for the event (hex code).
 * @returns {Promise<object>} The created event object.
 */
export const createEvent = async ({ 
    userId, title, description, startTime, endTime, 
    isAllDay = false, location, color 
  }) => {
  try {
    const result = await pool.query(
      'INSERT INTO events (user_id, title, description, start_time, end_time, is_all_day, location, color) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [userId, title, description, startTime, endTime, isAllDay, location, color]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating event in model:', error);
    throw error; // Propagate error to be caught by controller
  }
};

/**
 * Finds all events for a specific user, optionally within a date range.
 * @param {number} userId - The ID of the user.
 * @param {object} [dateRange] - Optional date range.
 * @param {string} [dateRange.startDate] - Start date for filtering (ISO string).
 * @param {string} [dateRange.endDate] - End date for filtering (ISO string).
 * @returns {Promise<Array<object>>} An array of event objects.
 */
export const findEventsByUserId = async (userId, { startDate, endDate } = {}) => {
  try {
    let query = 'SELECT * FROM events WHERE user_id = $1';
    const queryParams = [userId];

    if (startDate && endDate) {
      // Ensure events that overlap with the range are included.
      // This logic considers events that start before the range and end within/after it,
      // events that start within the range, and events that encompass the entire range.
      query += ' AND start_time < $3 AND end_time > $2 ORDER BY start_time ASC';
      queryParams.push(startDate, endDate);
    } else {
      query += ' ORDER BY start_time ASC';
    }

    const result = await pool.query(query, queryParams);
    return result.rows;
  } catch (error) {
    console.error('Error finding events by user ID in model:', error);
    throw error;
  }
};

/**
 * Finds a specific event by its ID and user ID (for ownership check).
 * @param {number} eventId - The ID of the event.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<object|null>} The event object if found and owned by user, otherwise null.
 */
export const findEventByIdAndUserId = async (eventId, userId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM events WHERE id = $1 AND user_id = $2',
      [eventId, userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error finding event by ID and user ID in model:', error);
    throw error;
  }
};

/**
 * Updates an existing event.
 * @param {number} eventId - The ID of the event to update.
 * @param {number} userId - The ID of the user attempting the update (for ownership check).
 * @param {object} updateData - An object containing the fields to update.
 * @returns {Promise<object|null>} The updated event object, or null if not found or not authorized.
 */
export const updateEvent = async (eventId, userId, updateData) => {
  const { title, description, startTime, endTime, isAllDay, location, color } = updateData;
  // Construct SET clause dynamically based on provided fields
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (title !== undefined) { fields.push(`title = $${paramIndex++}`); values.push(title); }
  if (description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(description); }
  if (startTime !== undefined) { fields.push(`start_time = $${paramIndex++}`); values.push(startTime); }
  if (endTime !== undefined) { fields.push(`end_time = $${paramIndex++}`); values.push(endTime); }
  if (isAllDay !== undefined) { fields.push(`is_all_day = $${paramIndex++}`); values.push(isAllDay); }
  if (location !== undefined) { fields.push(`location = $${paramIndex++}`); values.push(location); }
  if (color !== undefined) { fields.push(`color = $${paramIndex++}`); values.push(color); }
  
  fields.push(`updated_at = NOW()`); // Always update updated_at timestamp

  if (fields.length === 1) { // Only updated_at = NOW() means no actual data fields to update
      // Optionally, you could choose to still fetch and return the event if only updated_at is set, 
      // or return an indication that no substantive update occurred.
      // For now, if only updated_at would be set, let's assume we should at least ensure ownership and return the event.
      // Or, more simply, if no actual fields are to be changed from updateData, we could return early.
      if (values.length === 0) {
          return findEventByIdAndUserId(eventId, userId); // No actual fields to update, just return existing
      } 
  }

  const setClause = fields.join(', ');
  values.push(eventId, userId); // For WHERE clause

  const query = `UPDATE events SET ${setClause} WHERE id = $${paramIndex++} AND user_id = $${paramIndex++} RETURNING *`;
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating event in model:', error);
    throw error;
  }
};

/**
 * Deletes an event.
 * @param {number} eventId - The ID of the event to delete.
 * @param {number} userId - The ID of the user attempting the deletion (for ownership check).
 * @returns {Promise<object|null>} The deleted event object, or null if not found or not authorized.
 */
export const deleteEvent = async (eventId, userId) => {
  try {
    const result = await pool.query(
      'DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING *',
      [eventId, userId]
    );
    return result.rows[0] || null; // Returns the deleted row or null if no row matched
  } catch (error) {
    console.error('Error deleting event in model:', error);
    throw error;
  }
}; 