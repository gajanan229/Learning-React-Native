import * as listModel from '../models/listModel.js';
import pool from '../config/db.js'; // Import pool for transactions
// Assume upsertMovie exists, e.g.:
// import { upsertMovie } from '../models/movieModel.js';

// Helper to check for unique constraint violation error (PostgreSQL specific)
const isUniqueConstraintError = (error) => {
  return error.code === '23505'; // PostgreSQL error code for unique_violation
};

/**
 * Create a new movie list.
 */
export const createList = async (req, res, next) => {
  const userId = req.user.id;
  const { list_name: req_list_name, list_type, description } = req.body;

  // Basic validation
  if (!req_list_name && (list_type === 'custom')) {
      return res.status(400).json({ message: 'List name is required for custom lists' });
  }
  if (!['watchlist', 'favorites', 'custom'].includes(list_type)) {
      return res.status(400).json({ message: 'Invalid list type' });
  }

  let list_name = req_list_name;

  try {
    // Handle system list creation constraints
    if (list_type === 'watchlist' || list_type === 'favorites') {
      const existingSystemListId = await listModel.findUserSystemListId(userId, list_type);
      if (existingSystemListId) {
        return res.status(409).json({ message: `User already has a ${list_type} list` });
      }
      // Default names for system lists if not provided (or enforce specific names)
      if (!list_name) {
        list_name = list_type === 'watchlist' ? 'Watchlist' : 'Favorites';
      }
    }

    const listData = { list_name, list_type, description };
    const newList = await listModel.createList(userId, listData);
    res.status(201).json(newList);

  } catch (error) {
    if (isUniqueConstraintError(error) && list_type === 'custom') {
        // This specific error happens if the unique index on (user_id, list_name) WHERE list_type='custom' fails
        res.status(409).json({ message: 'A custom list with this name already exists' });
    } else {
        console.error('Error in createList controller:', error);
        next(error); // Pass other errors to the general error handler
    }
  }
};

/**
 * Get all lists for the authenticated user.
 */
export const getAllUserLists = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const lists = await listModel.findListsByUserId(userId);
    res.status(200).json(lists);
  } catch (error) {
    console.error('Error in getAllUserLists controller:', error);
    next(error);
  }
};

/**
 * Get details for a specific list, including its movies.
 */
export const getListDetails = async (req, res, next) => {
  const userId = req.user.id;
  const { listId } = req.params;

  try {
    const listData = await listModel.getListWithMovies(listId, userId);

    if (!listData) {
      return res.status(404).json({ message: 'List not found or not owned by user' });
    }

    res.status(200).json(listData); // Contains { listDetails, movies }

  } catch (error) {
    console.error('Error in getListDetails controller:', error);
    next(error);
  }
};

/**
 * Update a specific custom list (name or description).
 */
export const updateUserList = async (req, res, next) => {
  const userId = req.user.id;
  const { listId } = req.params;
  const { list_name, description } = req.body;

  // Check if at least one field to update is provided
  if (list_name === undefined && description === undefined) {
    return res.status(400).json({ message: 'No fields provided for update (list_name or description required)' });
  }
  // Basic validation if name is provided
  if (list_name !== undefined && typeof list_name !== 'string' || list_name === ''){
    return res.status(400).json({ message: 'List name must be a non-empty string' });
  }

  try {
    // 1. Check ownership and if the list is of type 'custom'
    const list = await listModel.findListByIdAndUserId(listId, userId);

    if (!list) {
      return res.status(404).json({ message: 'List not found or not owned by user' });
    }

    // --- Verification Start ---
    // Ensure only 'custom' lists can be updated
    if (list.list_type !== 'custom') {
      // Using the message format from the prompt
      return res.status(403).json({ message: `System lists like '${list.list_type}' cannot be updated.` });
    }
    // --- Verification End ---

    // 2. (Optional but recommended) Check for name conflict if list_name is changing
    if (list_name !== undefined && list_name !== list.list_name) {
      // Check if another custom list with the *new* name already exists for this user
      // We can reuse the createList logic's error handling by attempting a pseudo-insert or specific check
      // For simplicity here, we rely on the DB unique constraint during the update
      // A more user-friendly approach would query first: e.g.,
      // const conflictingList = await listModel.findCustomListByName(userId, list_name);
      // if (conflictingList) return res.status(409)... etc.
    }

    // 3. Prepare update data and perform update
    const updateData = {};
    if (list_name !== undefined) {
        updateData.list_name = list_name;
    }
    if (description !== undefined) {
        updateData.description = description; // Allows setting description to null or empty string
    }

    const updatedList = await listModel.updateList(listId, userId, updateData);

    if (!updatedList) {
        // Should not happen if findListByIdAndUserId succeeded, but good practice
        return res.status(404).json({ message: 'List not found during update' });
    }

    res.status(200).json(updatedList);

  } catch (error) {
     if (isUniqueConstraintError(error)) {
        res.status(409).json({ message: 'Another custom list with this name already exists' });
     } else {
        console.error('Error in updateUserList controller:', error);
        next(error);
     }
  }
};

/**
 * Delete a specific custom list.
 */
export const deleteUserList = async (req, res, next) => {
  const userId = req.user.id;
  const { listId } = req.params;

  try {
    // 1. Check ownership and if the list is of type 'custom'
    const list = await listModel.findListByIdAndUserId(listId, userId);

    if (!list) {
      return res.status(404).json({ message: 'List not found or not owned by user' });
    }

    // --- Verification Start ---
    // Ensure only 'custom' lists can be deleted
    if (list.list_type !== 'custom') {
      // Using the message format from the prompt
      return res.status(403).json({ message: `System lists like '${list.list_type}' cannot be deleted.` });
    }
    // --- Verification End ---

    // 2. Perform deletion
    const deletedRowCount = await listModel.deleteList(listId, userId);

    if (deletedRowCount === 0) {
       // Should not happen normally if the check above passed
       console.warn(`Attempted to delete list ${listId} for user ${userId}, but no rows were deleted.`);
       return res.status(404).json({ message: 'List not found during delete operation' });
    }

    res.status(204).send(); // Success, no content

  } catch (error) {
    console.error('Error in deleteUserList controller:', error);
    next(error);
  }
};

/**
 * Add a movie to a specific list.
 * Requires movie details in the body to allow upserting into the movies table.
 * Uses a transaction to ensure atomicity of upserting movie and adding list item.
 */
export const addMovieToListController = async (req, res, next) => {
    const userId = req.user.id;
    const { listId } = req.params;
    const { movie_tmdb_id, title, poster_url, runtime_minutes, genres } = req.body;

    // Validate required movie details for upsert
    if (!movie_tmdb_id || !title || !poster_url) {
        return res.status(400).json({ message: 'Missing required movie data (movie_tmdb_id, title, poster_url)' });
    }
    if (typeof movie_tmdb_id !== 'number') {
        return res.status(400).json({ message: 'Invalid movie_tmdb_id' });
    }

    const client = await pool.connect();

    try {
        // 1. Verify list ownership
        const list = await listModel.findListByIdAndUserId(listId, userId);
        if (!list) {
            client.release(); // Release client before returning
            return res.status(404).json({ message: 'List not found or not owned by user' });
        }

        await client.query('BEGIN');

        // 2. Upsert movie details into the 'movies' table (using the assumed function)
        const movieData = { tmdb_id: movie_tmdb_id, title, poster_url, runtime_minutes, genres };
        // **** IMPORTANT: Replace with actual call to your upsertMovie function ****
        // Example: await upsertMovie(movieData, client);
        // For now, adding a placeholder log:
        console.log(movieData);
        console.log(`Placeholder: Would call upsertMovie for TMDB ID: ${movie_tmdb_id} within transaction.`);
        // You MUST implement and call the actual upsertMovie(movieData, client) here.
        // Ensure your upsertMovie handles ON CONFLICT DO UPDATE correctly.
        const upsertMovieQuery = `
            INSERT INTO movies (tmdb_id, title, poster_url, runtime_minutes, genres)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (tmdb_id) DO UPDATE SET
                title = EXCLUDED.title,          -- Always update title
                poster_url = EXCLUDED.poster_url,  -- Always update poster_url
                runtime_minutes = COALESCE(EXCLUDED.runtime_minutes, movies.runtime_minutes),
                genres = COALESCE(EXCLUDED.genres, movies.genres);
        `;
        const addedMovie =await client.query(upsertMovieQuery, [
            movie_tmdb_id,
            title,
            `https://image.tmdb.org/t/p/w500/${poster_url}`,
            runtime_minutes, 
            genres
        ]);

        // **** End of placeholder section ****

        // 3. Add movie to the list using the model function (does not need client)
        console.log(addedMovie);
        
        const addedItem = await listModel.addMovieToList(listId, movie_tmdb_id, client);
        

        await client.query('COMMIT');

        if (addedItem) {
            // Movie was newly added to the list
            res.status(201).json(addedItem); // Send back the created list item
        } else {
            // Movie was already in the list (ON CONFLICT DO NOTHING)
            res.status(200).json({ message: 'Movie already exists in this list' });
        }

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in addMovieToListController:', error);
        // Handle potential foreign key errors if movie upsert fails or list deleted mid-request
        next(error);
    } finally {
        client.release();
    }
};

/**
 * Remove a movie from a specific list.
 */
export const removeMovieFromListController = async (req, res, next) => {
    const userId = req.user.id;
    const { listId, movieTmdbId: movieTmdbIdStr } = req.params;

    const movieTmdbId = parseInt(movieTmdbIdStr, 10);
    if (isNaN(movieTmdbId)) {
        return res.status(400).json({ message: 'Invalid movie TMDB ID format' });
    }

    try {
        // 1. Verify list ownership
        const list = await listModel.findListByIdAndUserId(listId, userId);
        if (!list) {
            return res.status(404).json({ message: 'List not found or not owned by user' });
        }

        // 2. Attempt to remove the movie from the list
        const deletedRowCount = await listModel.removeMovieFromList(listId, movieTmdbId);

        if (deletedRowCount > 0) {
            res.status(204).send(); // Success, no content
        } else {
            res.status(404).json({ message: 'Movie not found in this list' });
        }

    } catch (error) {
        console.error('Error in removeMovieFromListController:', error);
        next(error);
    }
}; 