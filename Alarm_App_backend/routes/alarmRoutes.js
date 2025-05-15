import express from 'express';
import {
    getAlarmById,
    updateAlarm,
    deleteAlarm
} from '../controllers/alarmController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes in this file are protected and will require a valid JWT
router.use(protect); // Apply protect middleware to all routes in this router

// Define routes for individual alarm operations
router.get('/:alarmId', getAlarmById);       // GET /api/alarms/:alarmId
router.put('/:alarmId', updateAlarm);         // PUT /api/alarms/:alarmId
router.delete('/:alarmId', deleteAlarm);     // DELETE /api/alarms/:alarmId

export default router; 