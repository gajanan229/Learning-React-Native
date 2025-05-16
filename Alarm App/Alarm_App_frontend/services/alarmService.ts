import alarmApiClient from './alarmApiClient';

// Placeholder Type: Define this accurately in your types directory (e.g., ../types/index.ts or ../types/alarm.ts)
// Ensure it matches the structure of data from your backend.
export interface Alarm {
    id: number; // Or string
    folder_id: number; // Or string
    user_id: number; // Or string
    time: string; // e.g., "HH:MM:SS"
    label?: string | null;
    sound_id: string;
    vibration: boolean;
    snooze: boolean;
    snooze_duration: number; // in minutes
    is_temporary: boolean;
    is_active: boolean;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    // Add any other fields your backend Alarm object has
}

// Payload for creating a new alarm. Note: folderId is part of the URL, userId comes from JWT.
export interface CreateAlarmPayload {
    time: string;
    label?: string | null;
    soundId: string;        // Should match backend: sound_id
    vibration?: boolean;
    snooze?: boolean;
    snoozeDuration?: number; // Should match backend: snooze_duration
    isTemporary?: boolean;   // Should match backend: is_temporary
    isActive?: boolean;      // Should match backend: is_active
}

// For updates, all fields are optional. Backend fields are used for consistency in payload.
export type UpdateAlarmPayload = Partial<{
    time: string;
    label?: string | null;
    sound_id: string;
    vibration: boolean;
    snooze: boolean;
    snooze_duration: number;
    is_temporary: boolean;
    is_active: boolean;
}>;


/**
 * Creates a new alarm within a specific folder.
 * @param folderId - The ID of the folder.
 * @param alarmData - Data for the new alarm.
 * @returns Promise containing the created alarm.
 */
export const createAlarmInFolderAPI = async (folderId: string | number, alarmData: CreateAlarmPayload): Promise<Alarm> => {
    try {
        // Map frontend field names to backend field names if they differ
        const payload = {
            time: alarmData.time,
            label: alarmData.label,
            soundId: alarmData.soundId, // Renamed from soundId
            vibration: alarmData.vibration,
            snooze: alarmData.snooze,
            snooze_duration: alarmData.snoozeDuration, // Renamed from snoozeDuration
            is_temporary: alarmData.isTemporary,     // Renamed from isTemporary
            is_active: alarmData.isActive,         // Renamed from isActive
        };
        console.log('payload', payload);
        const response = await alarmApiClient.post<Alarm>(`/folders/${folderId}/alarms`, payload);
        return response.data;
    } catch (error) {
        console.error(`Error in createAlarmInFolderAPI for folder ${folderId}:`, error);
        throw error;
    }
};

/**
 * Fetches all alarms for a specific folder.
 * @param folderId - The ID of the folder.
 * @returns Promise containing an array of alarms.
 */
export const getAlarmsInFolderAPI = async (folderId: string | number): Promise<Alarm[]> => {
    try {
        const response = await alarmApiClient.get<Alarm[]>(`/folders/${folderId}/alarms`);
        return response.data;
    } catch (error) {
        console.error(`Error in getAlarmsInFolderAPI for folder ${folderId}:`, error);
        throw error;
    }
};

/**
 * Fetches a single alarm by its ID.
 * @param alarmId - The ID of the alarm.
 * @returns Promise containing the alarm data.
 */
export const getAlarmByIdAPI = async (alarmId: string | number): Promise<Alarm> => {
    try {
        const response = await alarmApiClient.get<Alarm>(`/alarms/${alarmId}`);
        return response.data;
    } catch (error) {
        console.error(`Error in getAlarmByIdAPI for alarm ${alarmId}:`, error);
        throw error;
    }
};

/**
 * Updates an existing alarm.
 * @param alarmId - The ID of the alarm to update.
 * @param updates - An object containing the fields to update.
 * @returns Promise containing the updated alarm data.
 */
export const updateAlarmAPI = async (alarmId: string | number, updates: UpdateAlarmPayload): Promise<Alarm> => {
    try {
        // The 'updates' payload should already use backend-compatible field names (e.g., sound_id)
        // as defined in UpdateAlarmPayload if transformations are needed.
        console.log('updates', updates.is_active);
        const payload: { [key: string]: any } = {};
        if (updates.time !== undefined) payload.time = updates.time;
        if (updates.label !== undefined) payload.label = updates.label;
        if (updates.sound_id !== undefined) payload.soundId = updates.sound_id;
        if (updates.vibration !== undefined) payload.vibration = updates.vibration;
        if (updates.snooze !== undefined) payload.snooze = updates.snooze;
        if (updates.snooze_duration !== undefined) payload.snoozeDuration = updates.snooze_duration;
        if (updates.is_temporary !== undefined) payload.isTemporary = updates.is_temporary;
        if (updates.is_active !== undefined) payload.isActive = updates.is_active;
        const response = await alarmApiClient.put<Alarm>(`/alarms/${alarmId}`, payload);
        return response.data;
    } catch (error) {
        console.error(`Error in updateAlarmAPI for alarm ${alarmId}:`, error);
        throw error;
    }
};

/**
 * Deletes an alarm by its ID.
 * @param alarmId - The ID of the alarm to delete.
 * @returns Promise indicating success (e.g., void or a message object).
 */
export const deleteAlarmAPI = async (alarmId: string | number): Promise<{ message: string } | void> => {
    try {
        const response = await alarmApiClient.delete(`/alarms/${alarmId}`);
        if (response.status === 204) {
            return; // Void for 204 No Content
        }
        return response.data; // Assumes backend sends a JSON object for other success statuses (e.g., 200 with a message)
    } catch (error) {
        console.error(`Error in deleteAlarmAPI for alarm ${alarmId}:`, error);
        throw error;
    }
}; 