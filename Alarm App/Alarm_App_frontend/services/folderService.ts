import alarmApiClient from './alarmApiClient';

// Placeholder types: Define these accurately in your types directory (e.g., ../types/index.ts or ../types/folder.ts)
// Ensure they match the structure of data from your backend.
export type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Folder {
    id: number; // Or string, depending on your backend ID type
    userId: number; // Or string
    name: string;
    recurrence_days: Day[];
    is_active: boolean;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    // Add any other fields your backend Folder object has
}

interface CreateFolderPayload {
    name: string;
    recurrenceDays: Day[]; // Backend might expect recurrence_days
    isActive?: boolean;
}

// For updates, usually, most fields are optional, and IDs/timestamps are omitted from payload.
type UpdateFolderPayload = Partial<Omit<Folder, 'id' | 'userId' | 'created_at' | 'updated_at'> & { recurrenceDays?: Day[] }>; // Match backend expectations, e.g., recurrenceDays vs recurrence_days

/**
 * Creates a new folder.
 * @param folderData - Data for the new folder.
 * @returns Promise containing the created folder.
 */
export const createFolderAPI = async (folderData: CreateFolderPayload): Promise<Folder> => {
    console.log("folderData.recurrenceDays in createFolderAPI:", folderData.recurrenceDays);
    try {
        // Ensure payload field names match backend expectations
        const payload = {
            name: folderData.name,
            recurrenceDays: folderData.recurrenceDays, // Changed from recurrence_days
            is_active: folderData.isActive === undefined ? true : folderData.isActive,
        };
        const response = await alarmApiClient.post<Folder>('/folders', payload);
        return response.data;
    } catch (error) {
        console.error('Error in createFolderAPI:', error);
        // Consider re-throwing a more specific error or handling based on error type
        throw error;
    }
};

/**
 * Fetches all folders for the authenticated user.
 * @returns Promise containing an array of folders.
 */
export const getFoldersAPI = async (): Promise<Folder[]> => {
    try {
        const response = await alarmApiClient.get<Folder[]>('/folders');
        return response.data;
    } catch (error) {
        console.error('Error in getFoldersAPI:', error);
        throw error;
    }
};

/**
 * Fetches a single folder by its ID.
 * @param folderId - The ID of the folder to fetch.
 * @returns Promise containing the folder data.
 */
export const getFolderByIdAPI = async (folderId: string | number): Promise<Folder> => {
    try {
        const response = await alarmApiClient.get<Folder>(`/folders/${folderId}`);
        return response.data;
    } catch (error) {
        console.error(`Error in getFolderByIdAPI for folder ${folderId}:`, error);
        throw error;
    }
};

/**
 * Updates an existing folder.
 * @param folderId - The ID of the folder to update.
 * @param updates - An object containing the fields to update.
 * @returns Promise containing the updated folder data.
 */
export const updateFolderAPI = async (folderId: string | number, updates: UpdateFolderPayload): Promise<Folder> => {
    try {
        // Transform frontend field names (e.g., recurrenceDays) to backend (e.g., recurrence_days) if necessary
        const payload: { [key: string]: any } = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.recurrenceDays !== undefined) payload.recurrenceDays = updates.recurrenceDays; // Adjust if backend uses recurrenceDays
        if (updates.is_active !== undefined) payload.isActive = updates.is_active;
        console.log("payload in updateFolderAPI:", payload);
        // Do not send id, userId, created_at, updated_at in the update payload typically

        const response = await alarmApiClient.put<Folder>(`/folders/${folderId}`, payload);
        return response.data;
    } catch (error) {
        console.error(`Error in updateFolderAPI for folder ${folderId}:`, error);
        throw error;
    }
};

/**
 * Deletes a folder by its ID.
 * @param folderId - The ID of the folder to delete.
 * @returns Promise indicating success or failure (e.g., void or a message object).
 */
export const deleteFolderAPI = async (folderId: string | number): Promise<{ message: string } | void> => {
    try {
        const response = await alarmApiClient.delete(`/folders/${folderId}`);
        // Backend might return a 204 No Content, or a JSON message like { message: "Folder deleted" }
        if (response.status === 204) {
            return; // Void for 204
        }
        return response.data; // Assumes backend sends a JSON object for other success statuses like 200
    } catch (error) {
        console.error(`Error in deleteFolderAPI for folder ${folderId}:`, error);
        throw error;
    }
}; 