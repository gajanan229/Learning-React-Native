import pool from '../config/db.js';

/**
 * Creates a new movie list for a user.
 * @param {number} userId - The ID of the user creating the list.
 * @param {object} listData - Data for the new list.
 * @param {string} listData.list_name - The name of the list.
 * @param {'watchlist'|'favorites'|'custom'} listData.list_type - The type of the list.
 * @param {string|null} [listData.description] - Optional description for the list.
 * @returns {Promise<object>} The newly created list object.
 * @throws {Error} If the database query fails (e.g., unique constraint violation).
 */
export const createList = async (userId, listData) => {
  const { list_name, list_type, description } = listData;
  const query = `
    INSERT INTO user_lists (user_id, list_name, list_type, description)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [userId, list_name, list_type, description || null];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error(`Error creating list for user ${userId}:`, error);
    // Re-throw the error to be handled by the controller,
    // potentially indicating a unique constraint violation (e.g., duplicate custom list name)
    throw error;
  }
};

/**
 * Finds all lists belonging to a specific user, including the count of movies in each list.
 * @param {number} userId - The ID of the user whose lists are being fetched.
 * @returns {Promise<Array<object>>} An array of list objects, each including a 'movie_count'.
 * @throws {Error} If the database query fails.
 */
export const findListsByUserId = async (userId) => {
  const query = `
    SELECT
        ul.id,
        ul.user_id,
        ul.list_name,
        ul.list_type,
        ul.description,
        ul.created_at,
        ul.updated_at,
        COUNT(uli.movie_tmdb_id)::int AS movie_count -- Cast to integer
    FROM user_lists ul
    LEFT JOIN user_list_items uli ON ul.id = uli.list_id
    WHERE ul.user_id = $1
    GROUP BY ul.id -- Grouping by the primary key is sufficient in PostgreSQL >= 9.1
    ORDER BY
        CASE ul.list_type
            WHEN 'watchlist' THEN 1
            WHEN 'favorites' THEN 2
            WHEN 'custom' THEN 3
            ELSE 4
        END,
        ul.list_name ASC;
  `;
  try {
    const result = await pool.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error(`Error finding lists for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Finds the ID of a system list ('watchlist' or 'favorites') for a specific user.
 * @param {number} userId - The user's ID.
 * @param {'watchlist'|'favorites'} listType - The type of system list to find.
 * @returns {Promise<number|null>} The list ID if found, otherwise null.
 * @throws {Error} If the database query fails.
 */
export const findUserSystemListId = async (userId, listType) => {
  const query = `
    SELECT id FROM user_lists WHERE user_id = $1 AND list_type = $2;
  `;
  try {
    const result = await pool.query(query, [userId, listType]);
    return result.rows[0]?.id || null; // Return the id or null if not found
  } catch (error) {
    console.error(`Error finding system list '${listType}' for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Finds a specific list by its ID and verifies ownership by user ID.
 * @param {number} listId - The ID of the list to find.
 * @param {number} userId - The ID of the user expected to own the list.
 * @returns {Promise<object|null>} The list object if found and owned by the user, otherwise null.
 * @throws {Error} If the database query fails.
 */
export const findListByIdAndUserId = async (listId, userId) => {
  const query = `
    SELECT * FROM user_lists WHERE id = $1 AND user_id = $2;
  `;
  try {
    const result = await pool.query(query, [listId, userId]);
    return result.rows[0] || null; // Return the list object or null
  } catch (error) {
    console.error(`Error finding list ${listId} for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Finds a specific list by its ID, verifies ownership, and retrieves its details along with associated movie details.
 * Avoids N+1 query problem by fetching movies in a separate JOIN query after verifying list ownership.
 * @param {number} listId - The ID of the list to fetch.
 * @param {number} userId - The ID of the user requesting the list.
 * @returns {Promise<{listDetails: object, movies: Array<object>}|null>} An object containing list details and an array of movie objects, or null if the list is not found or not owned by the user.
 * @throws {Error} If any database query fails.
 */
export const getListWithMovies = async (listId, userId) => {
  try {
    // 1. Check Ownership and get list details
    const listDetails = await findListByIdAndUserId(listId, userId);

    if (!listDetails) {
      // List not found or doesn't belong to the user
      return null;
    }

    // 2. Fetch Movies associated with the list if ownership is confirmed
    const moviesQuery = `
      SELECT
          uli.added_at,
          m.tmdb_id,
          m.title,
          m.poster_url,
          m.runtime_minutes,
          m.genres
          -- Add any other movie fields needed by the frontend ListDetails page
      FROM user_list_items uli
      JOIN movies m ON uli.movie_tmdb_id = m.tmdb_id
      WHERE uli.list_id = $1
      ORDER BY uli.added_at DESC;
    `;
    const moviesResult = await pool.query(moviesQuery, [listId]);
    const movies = moviesResult.rows;

    // 3. Combine Results
    return { listDetails, movies };

  } catch (error) {
    console.error(`Error getting list details with movies for list ${listId}, user ${userId}:`, error);
    throw error;
  }
};

/**
 * Updates the details (name, description) of a specific list owned by a user.
 * Only 'custom' lists should typically be updated this way (enforced by controller).
 * @param {number} listId - The ID of the list to update.
 * @param {number} userId - The ID of the user who owns the list.
 * @param {object} updateData - An object containing the fields to update.
 * @param {string} [updateData.list_name] - The new name for the list.
 * @param {string} [updateData.description] - The new description for the list.
 * @returns {Promise<object|null>} The updated list object, or null if the list was not found or not owned by the user.
 * @throws {Error} If the database query fails (e.g., unique constraint violation on name).
 */
export const updateList = async (listId, userId, updateData) => {
  const { list_name, description } = updateData;
  const setClauses = [];
  const values = [];
  let valueIndex = 1;

  if (list_name !== undefined) {
    setClauses.push(`list_name = $${valueIndex++}`);
    values.push(list_name);
  }
  if (description !== undefined) {
    // Allow setting description to null or a string
    setClauses.push(`description = $${valueIndex++}`);
    values.push(description);
  }

  // If no fields to update were provided, return null or throw error?
  // For now, let it proceed - it will just update the timestamp.
  // Consider adding a check here if required.

  setClauses.push(`updated_at = NOW()`);

  const query = `
    UPDATE user_lists
    SET ${setClauses.join(', ')}
    WHERE id = $${valueIndex++} AND user_id = $${valueIndex++}
    RETURNING *;
  `;

  values.push(listId, userId);

  try {
    const result = await pool.query(query, values);
    return result.rows[0] || null; // Return updated list or null if not found/owned
  } catch (error) {
    console.error(`Error updating list ${listId} for user ${userId}:`, error);
    // Handle potential unique constraint violation for list_name
    throw error;
  }
};

/**
 * Deletes a specific list owned by a user.
 * Only 'custom' lists should typically be deleted this way (enforced by controller).
 * Associated list items are deleted via CASCADE constraint.
 * @param {number} listId - The ID of the list to delete.
 * @param {number} userId - The ID of the user who owns the list.
 * @returns {Promise<number>} The number of rows deleted (0 or 1).
 * @throws {Error} If the database query fails.
 */
export const deleteList = async (listId, userId) => {
  const query = `
    DELETE FROM user_lists WHERE id = $1 AND user_id = $2;
  `;
  try {
    const result = await pool.query(query, [listId, userId]);
    return result.rowCount; // 1 if deleted, 0 if not found/owned
  } catch (error) {
    console.error(`Error deleting list ${listId} for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Adds a movie to a specific list.
 * Assumes list ownership has already been verified by the controller.
 * Handles conflicts gracefully if the movie is already in the list.
 * @param {number} listId - The ID of the list to add the movie to.
 * @param {number} movieTmdbId - The TMDB ID of the movie to add.
 * @returns {Promise<object|null>} The newly added list item object if insertion occurred, null if the movie was already in the list.
 * @throws {Error} If the database query fails (e.g., foreign key constraint).
 */
export const addMovieToList = async (listId, movieTmdbId, client) => {
  const query = `
    INSERT INTO user_list_items (list_id, movie_tmdb_id)
    VALUES ($1, $2)
    ON CONFLICT (list_id, movie_tmdb_id) DO NOTHING
    RETURNING *;
  `;
  try {
    const db = client || pool;
    const result = await db.query(query, [listId, movieTmdbId]);
    return result.rows[0] || null; // Return inserted row or null on conflict
  } catch (error) {
    // Potential errors: FK violation if listId or movieTmdbId doesn't exist
    console.error(`Error adding movie ${movieTmdbId} to list ${listId}:`, error);
    throw error;
  }
};

/**
 * Removes a movie from a specific list.
 * Assumes list ownership has already been verified by the controller.
 * @param {number} listId - The ID of the list to remove the movie from.
 * @param {number} movieTmdbId - The TMDB ID of the movie to remove.
 * @returns {Promise<number>} The number of rows deleted (0 or 1).
 * @throws {Error} If the database query fails.
 */
export const removeMovieFromList = async (listId, movieTmdbId) => {
  const query = `
    DELETE FROM user_list_items WHERE list_id = $1 AND movie_tmdb_id = $2;
  `;
  try {
    const result = await pool.query(query, [listId, movieTmdbId]);
    return result.rowCount; // 1 if removed, 0 if not found
  } catch (error) {
    console.error(`Error removing movie ${movieTmdbId} from list ${listId}:`, error);
    throw error;
  }
}; 