import express from 'express';
import {
    createFolder,
    getUserFolders,
    getFolderById,
    updateFolder,
    deleteFolder
} from '../controllers/folderController.js';
import {
    createAlarmInFolder,
    getAlarmsInFolder
} from '../controllers/alarmController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes in this file are protected and will require a valid JWT
router.use(protect); // Apply protect middleware to all routes in this router

// Define CRUD routes for folders
router.post('/', createFolder);       // POST /api/folders
router.get('/', getUserFolders);      // GET /api/folders
router.get('/:id', getFolderById);    // GET /api/folders/:id
router.put('/:id', updateFolder);      // PUT /api/folders/:id
router.delete('/:id', deleteFolder);  // DELETE /api/folders/:id

// Nested routes for alarms within a specific folder
// These are already protected by router.use(protect) at the top of this file
router.post('/:folderId/alarms', createAlarmInFolder); // POST /api/folders/:folderId/alarms
router.get('/:folderId/alarms', getAlarmsInFolder);   // GET /api/folders/:folderId/alarms

export default router; 