import { apiClient } from './api';
import type {
    UserList,
    ListWithMoviesResponse,
    MovieForListPayload
} from '../interfaces/listTypes'; // Adjust path if needed

/**
 * Creates a new list for the authenticated user.
 */
export const createListAPI = async (
    payload: { list_name: string; list_type: UserList['list_type']; description?: string }
): Promise<UserList> => {
    try {
        const response = await apiClient.post<UserList>('/api/lists', payload);
        return response.data;
    } catch (error) {
        console.error('Error creating list:', error);
        throw error; // Re-throw to be handled by the caller
    }
};

/**
 * Fetches all lists belonging to the authenticated user.
 */
export const getAllUserListsAPI = async (): Promise<UserList[]> => {
    try {
        const response = await apiClient.get<UserList[]>('/api/lists');
        return response.data;
    } catch (error) {
        console.error('Error fetching user lists:', error);
        throw error;
    }
};

/**
 * Fetches the details of a specific list, including its movies.
 */
export const getListDetailsAPI = async (listId: string | number): Promise<ListWithMoviesResponse> => {
    try {
        const response = await apiClient.get<ListWithMoviesResponse>(`/api/lists/${listId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching details for list ${listId}:`, error);
        throw error;
    }
};

/**
 * Updates a specific list (custom lists only).
 */
export const updateListAPI = async (
    listId: string | number,
    payload: { list_name?: string; description?: string }
): Promise<UserList> => {
    try {
        const response = await apiClient.put<UserList>(`/api/lists/${listId}`, payload);
        return response.data;
    } catch (error) {
        console.error(`Error updating list ${listId}:`, error);
        throw error;
    }
};

/**
 * Deletes a specific list (custom lists only).
 */
export const deleteListAPI = async (listId: string | number): Promise<void> => {
    try {
        await apiClient.delete(`/api/lists/${listId}`);
        // No data returned on successful 204 delete
    } catch (error) {
        console.error(`Error deleting list ${listId}:`, error);
        throw error;
    }
};

/**
 * Adds a movie to a specific list.
 */
export const addMovieToListAPI = async (
    listId: string | number,
    movieData: MovieForListPayload
): Promise<any> => { // Return type 'any' for now, adjust if needed
    try {
        const response = await apiClient.post<any>(`/api/lists/${listId}/movies`, movieData);
        return response.data; // Backend might return the created list item or a simple message
    } catch (error) {
        console.error(`Error adding movie ${movieData.movie_tmdb_id} to list ${listId}:`, error);
        throw error;
    }
};

/**
 * Removes a movie from a specific list.
 */
export const removeMovieFromListAPI = async (
    listId: string | number,
    movieTmdbId: number | string
): Promise<void> => {
    try {
        await apiClient.delete(`/api/lists/${listId}/movies/${movieTmdbId}`);
        // No data returned on successful 204 delete
    } catch (error) {
        console.error(`Error removing movie ${movieTmdbId} from list ${listId}:`, error);
        throw error;
    }
}; 