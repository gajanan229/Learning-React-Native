import * as alarmModel from '../models/alarmModel.js';
import * as folderModel from '../models/folderModel.js'; // For folder ownership validation

/**
 * Creates a new alarm within a specific folder.
 * Validates folder ownership before creating the alarm.
 */
export const createAlarmInFolder = async (req, res, next) => {
    try {
        const folderId = parseInt(req.params.folderId, 10);
        const userId = req.user.id; // From protect middleware
        const {
            time, label, soundId, vibration,
            snooze, snoozeDuration, isTemporary, isActive
        } = req.body;

        // Validate folderId format
        if (isNaN(folderId)) {
            return res.status(400).json({ message: 'Invalid folder ID format.' });
        }

        // Basic validation for required alarm fields
        if (!time || !soundId) {
            return res.status(400).json({ message: 'Missing required alarm fields (time, soundId).' });
        }
        // Add more specific validation for time format, soundId existence, etc. if needed

        // Crucial: Verify folder exists and belongs to the user
        const folder = await folderModel.findByIdAndUserId(folderId, userId);
        if (!folder) {
            return res.status(404).json({ message: 'Folder not found or you do not have permission to add alarms to this folder.' });
        }

        // Prepare alarm data, using defaults from model if not provided
        const alarmData = {
            folderId,
            userId, // Important: also store userId on the alarm itself
            time,
            soundId,
        };
        if (label !== undefined) alarmData.label = label;
        if (vibration !== undefined) alarmData.vibration = vibration;
        if (snooze !== undefined) alarmData.snooze = snooze;
        if (snoozeDuration !== undefined) alarmData.snoozeDuration = snoozeDuration;
        if (isTemporary !== undefined) alarmData.isTemporary = isTemporary;
        if (isActive !== undefined) alarmData.isActive = isActive;

        const newAlarm = await alarmModel.create(alarmData);
        res.status(201).json(newAlarm);
    } catch (error) {
        console.error('[AlarmController] Error in createAlarmInFolder:', error.message);
        next(error);
    }
};

/**
 * Gets all alarms within a specific folder for the authenticated user.
 * Validates folder ownership before listing alarms.
 */
export const getAlarmsInFolder = async (req, res, next) => {
    try {
        const folderId = parseInt(req.params.folderId, 10);
        const userId = req.user.id;

        if (isNaN(folderId)) {
            return res.status(400).json({ message: 'Invalid folder ID format.' });
        }

        // Optional but good practice: Verify folder exists and belongs to the user before querying alarms
        const folder = await folderModel.findByIdAndUserId(folderId, userId);
        if (!folder) {
            return res.status(404).json({ message: 'Folder not found or you do not have permission to view its alarms.' });
        }

        const alarms = await alarmModel.findByFolderIdAndUserId(folderId, userId);
        res.status(200).json(alarms);
    } catch (error) {
        console.error('[AlarmController] Error in getAlarmsInFolder:', error.message);
        next(error);
    }
};

/**
 * Gets a specific alarm by its ID for the authenticated user.
 */
export const getAlarmById = async (req, res, next) => {
    try {
        const alarmId = parseInt(req.params.alarmId, 10);
        const userId = req.user.id;

        if (isNaN(alarmId)) {
            return res.status(400).json({ message: 'Invalid alarm ID format.' });
        }

        const alarm = await alarmModel.findByIdAndUserId(alarmId, userId);
        if (!alarm) {
            return res.status(404).json({ message: 'Alarm not found or not owned by user.' });
        }
        res.status(200).json(alarm);
    } catch (error) {
        console.error('[AlarmController] Error in getAlarmById:', error.message);
        next(error);
    }
};

/**
 * Updates an existing alarm for the authenticated user.
 */
export const updateAlarm = async (req, res, next) => {
    try {
        const alarmId = parseInt(req.params.alarmId, 10);
        const userId = req.user.id;
        // Extract all potential fields from body
        const { time, label, soundId, vibration, snooze, snoozeDuration, isTemporary, isActive } = req.body;

        if (isNaN(alarmId)) {
            return res.status(400).json({ message: 'Invalid alarm ID format.' });
        }

        const updates = {};
        // Conditionally add fields to updates object if they are provided in the request body
        if (time !== undefined) updates.time = time;
        if (label !== undefined) updates.label = label;
        if (soundId !== undefined) updates.soundId = soundId;
        if (vibration !== undefined) updates.vibration = vibration;
        if (snooze !== undefined) updates.snooze = snooze;
        if (snoozeDuration !== undefined) updates.snoozeDuration = snoozeDuration;
        if (isTemporary !== undefined) updates.isTemporary = isTemporary;
        if (isActive !== undefined) updates.isActive = isActive;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No update fields provided for alarm.' });
        }

        const updatedAlarm = await alarmModel.update(alarmId, userId, updates);
        if (!updatedAlarm) {
            return res.status(404).json({ message: 'Alarm not found, not owned by user, or no effective update made.' });
        }
        res.status(200).json(updatedAlarm);
    } catch (error) {
        console.error('[AlarmController] Error in updateAlarm:', error.message);
        if (error.message === 'No fields provided to update for alarm.') { // Catch specific error from model
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

/**
 * Deletes an alarm for the authenticated user.
 */
export const deleteAlarm = async (req, res, next) => {
    try {
        const alarmId = parseInt(req.params.alarmId, 10);
        const userId = req.user.id;

        if (isNaN(alarmId)) {
            return res.status(400).json({ message: 'Invalid alarm ID format.' });
        }

        const deletedAlarm = await alarmModel.deleteByIdAndUserId(alarmId, userId);

        if (!deletedAlarm) {
            return res.status(404).json({ message: 'Alarm not found or not owned by user.' });
        }
        
        res.status(200).json({ message: 'Alarm deleted successfully.', deletedAlarm });
        // Alternatively, for a 204 No Content response:
        // res.status(204).send();
    } catch (error) {
        console.error('[AlarmController] Error in deleteAlarm:', error.message);
        next(error);
    }
}; 