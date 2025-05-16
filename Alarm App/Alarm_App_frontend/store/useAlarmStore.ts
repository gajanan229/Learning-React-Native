import { create } from 'zustand';
import { Alarm, Folder, Day } from '../types';
import { alarmStorage } from '../utils/storage';
import * as folderService from '../services/folderService';
import * as alarmService from '../services/alarmService';
import {
  scheduleAlarm,
  cancelAlarm,
  rescheduleAllAlarms,
  snoozeAlarm
} from '../utils/notifications';

// Alias for clarity and mapping between backend and frontend types
type StoreAlarm = Alarm; // Frontend uses camelCase properties
type BackendAlarm = alarmService.Alarm; // Backend uses snake_case properties
type CreateAlarmPayload = alarmService.CreateAlarmPayload;
type UpdateAlarmPayload = alarmService.UpdateAlarmPayload;

// Helper function to convert backend alarm to store alarm format
const mapBackendAlarmToStoreAlarm = (backendAlarm: BackendAlarm): StoreAlarm => {
  return {
    id: String(backendAlarm.id),
    folderId: String(backendAlarm.folder_id),
    time: backendAlarm.time,
    label: backendAlarm.label || '',
    soundId: backendAlarm.sound_id,
    vibration: backendAlarm.vibration,
    snooze: backendAlarm.snooze,
    snoozeDuration: backendAlarm.snooze_duration,
    isTemporary: backendAlarm.is_temporary,
    isActive: backendAlarm.is_active,
    createdAt: new Date(backendAlarm.created_at).getTime(),
    updatedAt: new Date(backendAlarm.updated_at).getTime(),
  };
};

interface AlarmState {
  alarms: StoreAlarm[];
  folders: Folder[];
  isLoadingFolders: boolean;
  isLoadingAlarms: boolean;
  errorFolders: string | null;
  errorAlarms: string | null;
  activeAlarms: number;
  
  // Actions
  fetchAlarmsForFolder: (folderId: string | number) => Promise<void>;
  fetchFolders: () => Promise<void>;
  
  // Folder operations
  addFolder: (folderData: { name: string, recurrenceDays?: Day[], isActive?: boolean }) => Promise<Folder | void>;
  updateFolder: (folderId: string | number, updates: Partial<Omit<Folder, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => Promise<Folder | void>;
  deleteFolder: (folderId: string | number) => Promise<void>;
  toggleFolderActive: (folderId: string | number) => Promise<void>;
  getActiveAlarmCountByFolder: (folderId: string) => number;
  
  // Alarm operations
  createAlarm: (folderId: string | number, alarmData: CreateAlarmPayload) => Promise<StoreAlarm>;
  updateExistingAlarm: (alarmId: string | number, updates: UpdateAlarmPayload) => Promise<StoreAlarm>;
  deleteExistingAlarm: (alarmId: string | number, folderId: string | number) => Promise<void>;
  toggleExistingAlarmActive: (alarmId: string | number, currentIsActive: boolean, folderId: string | number) => Promise<void>;
  getAlarmsByFolder: (folderId: string) => StoreAlarm[];
  dismissTemporaryAlarm: (alarmId: string) => Promise<void>;
  snoozeAlarmById: (alarmId: string, duration: number) => Promise<void>;
}

const useAlarmStore = create<AlarmState>((set, get) => ({
  alarms: [],
  folders: [],
  isLoadingFolders: false,
  isLoadingAlarms: false,
  errorFolders: null,
  errorAlarms: null,
  activeAlarms: 0,
  
  // Fetch data
  fetchAlarmsForFolder: async (folderId) => {
    set({ isLoadingAlarms: true, errorAlarms: null });
    try {
      const fetchedAlarms = await alarmService.getAlarmsInFolderAPI(folderId);
      const storeAlarms = fetchedAlarms.map(mapBackendAlarmToStoreAlarm);
      
      set({ 
        alarms: storeAlarms, 
        isLoadingAlarms: false, 
        activeAlarms: storeAlarms.filter(a => a.isActive).length 
      });
    } catch (error) {
      console.error(`Failed to fetch alarms for folder ${folderId}:`, error);
      const message = error instanceof Error ? error.message : 'Failed to load alarms';
      set({ errorAlarms: message, isLoadingAlarms: false });
      throw error;
    }
  },
  
  fetchFolders: async () => {
    set({ isLoadingFolders: true, errorFolders: null });
    try {
      const fetchedFolders = await folderService.getFoldersAPI();
      set({ folders: fetchedFolders as unknown as Folder[], isLoadingFolders: false });
    } catch (error) {
      console.error("Failed to fetch folders:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load folders';
      set({ errorFolders: errorMessage, isLoadingFolders: false });
    }
  },
  
  // Folder operations
  addFolder: async (folderData) => {
    set({ isLoadingFolders: true, errorFolders: null });
    try {
      const apiPayload: any = {
          name: folderData.name,
          recurrenceDays: folderData.recurrenceDays || [],
      };
      if (folderData.isActive !== undefined) {
        apiPayload.is_active = folderData.isActive;
      }

      const newFolderFromBackend = await folderService.createFolderAPI(apiPayload);
      set(state => ({ folders: [...state.folders, newFolderFromBackend as unknown as Folder], isLoadingFolders: false }));
      return newFolderFromBackend as unknown as Folder;
    } catch (error) {
      console.error("Failed to add folder:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create folder';
      set({ errorFolders: errorMessage, isLoadingFolders: false });
      throw error;
    }
  },
  
  updateFolder: async (folderId, updates) => {
    set({ isLoadingFolders: true, errorFolders: null });
    try {
      const apiPayload: any = {};
      if (updates.name !== undefined) apiPayload.name = updates.name;
      if (updates.recurrence_days !== undefined) apiPayload.recurrenceDays = updates.recurrence_days;
      if (updates.is_active !== undefined) apiPayload.is_active = updates.is_active;
      
      const updatedFolderFromBackend = await folderService.updateFolderAPI(folderId, apiPayload);
      set(state => ({
        folders: state.folders.map(f => f.id === folderId ? (updatedFolderFromBackend as unknown as Folder) : f),
        isLoadingFolders: false
      }));
      
      const { alarms } = get();
      const currentFoldersState = get().folders;
      const folderAlarms = alarms.filter(alarm => alarm.folderId === folderId);
      if (folderAlarms.length > 0) {
        await rescheduleAllAlarms(alarms, currentFoldersState);
      }
      return updatedFolderFromBackend as unknown as Folder;
    } catch (error) {
      console.error("Failed to update folder:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update folder';
      set({ errorFolders: errorMessage, isLoadingFolders: false });
      throw error;
    }
  },
  
  deleteFolder: async (folderId) => {
    set({ isLoadingFolders: true, errorFolders: null });
    try {
      await folderService.deleteFolderAPI(folderId);
      
      // Cancel all notifications for alarms in this folder
      const { alarms } = get();
      const alarmsInDeletedFolder = alarms.filter(alarm => alarm.folderId === folderId);
      for (const alarm of alarmsInDeletedFolder) {
        await cancelAlarm(alarm.id);
      }
      
      set(state => ({
        folders: state.folders.filter(f => f.id !== folderId),
        alarms: state.alarms.filter(a => a.folderId !== folderId),
        isLoadingFolders: false,
        activeAlarms: state.alarms.filter(a => a.folderId !== folderId && a.isActive).length
      }));
      
    } catch (error) {
      console.error("Failed to delete folder:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete folder';
      set({ errorFolders: errorMessage, isLoadingFolders: false });
      throw error;
    }
  },
  
  toggleFolderActive: async (folderId) => {
    const folderToToggle = get().folders.find(f => f.id === folderId);
    if (!folderToToggle) {
      console.error("Folder to toggle not found:", folderId);
      set({ errorFolders: "Folder to toggle not found" });
      return;
    }
    const updates: Partial<Omit<Folder, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> = { is_active: !folderToToggle.is_active };
    await get().updateFolder(folderId, updates);
  },
  
  getActiveAlarmCountByFolder: (folderId) => {
    const { alarms } = get();
    return alarms.filter(alarm => alarm.folderId === folderId && alarm.isActive).length;
  },
  
  // Alarm operations
  createAlarm: async (folderId, alarmData) => {
    set({ isLoadingAlarms: true, errorAlarms: null });
    try {
      const newAlarmFromBackend = await alarmService.createAlarmInFolderAPI(folderId, alarmData);
      const newAlarmTyped = mapBackendAlarmToStoreAlarm(newAlarmFromBackend);
      
      set(state => {
        const updatedAlarms = [...state.alarms, newAlarmTyped];
        return { 
          alarms: updatedAlarms, 
          isLoadingAlarms: false, 
          activeAlarms: updatedAlarms.filter(a => a.isActive).length 
        };
      });
      
      // Schedule notification if alarm is active
      if (newAlarmTyped.isActive) {
        const folder = get().folders.find(f => f.id === folderId);
        if (folder && folder.is_active) {
          await scheduleAlarm(newAlarmTyped, folder);
        }
      }
      
      return newAlarmTyped;
    } catch (error) {
      console.error("Failed to create alarm:", error);
      const message = error instanceof Error ? error.message : 'Failed to create alarm';
      set({ errorAlarms: message, isLoadingAlarms: false });
      throw error;
    }
  },
  
  updateExistingAlarm: async (alarmId, updates) => {
    set({ isLoadingAlarms: true, errorAlarms: null });
    try {
      const updatedAlarmFromBackend = await alarmService.updateAlarmAPI(alarmId, updates);
      const updatedAlarmTyped = mapBackendAlarmToStoreAlarm(updatedAlarmFromBackend);
      
      set(state => {
        const updatedAlarms = state.alarms.map(a => 
          a.id === alarmId.toString() ? updatedAlarmTyped : a
        );
        return { 
          alarms: updatedAlarms, 
          isLoadingAlarms: false, 
          activeAlarms: updatedAlarms.filter(a => a.isActive).length 
        };
      });
      
      // Update notification scheduling
      await cancelAlarm(alarmId.toString());
      if (updatedAlarmTyped.isActive) {
        const folder = get().folders.find(f => f.id === updatedAlarmTyped.folderId);
        if (folder && folder.is_active) {
          await scheduleAlarm(updatedAlarmTyped, folder);
        }
      }
      
      return updatedAlarmTyped;
    } catch (error) {
      console.error(`Failed to update alarm ${alarmId}:`, error);
      const message = error instanceof Error ? error.message : 'Failed to update alarm';
      set({ errorAlarms: message, isLoadingAlarms: false });
      throw error;
    }
  },
  
  deleteExistingAlarm: async (alarmId, folderId) => {
    set({ isLoadingAlarms: true, errorAlarms: null });
    try {
      await alarmService.deleteAlarmAPI(alarmId);
      await cancelAlarm(alarmId.toString());
      
      set(state => {
        const remainingAlarms = state.alarms.filter(a => a.id !== alarmId.toString());
        return { 
          alarms: remainingAlarms, 
          isLoadingAlarms: false, 
          activeAlarms: remainingAlarms.filter(a => a.isActive).length 
        };
      });
    } catch (error) {
      console.error(`Failed to delete alarm ${alarmId}:`, error);
      const message = error instanceof Error ? error.message : 'Failed to delete alarm';
      set({ errorAlarms: message, isLoadingAlarms: false });
      throw error;
    }
  },
  
  toggleExistingAlarmActive: async (alarmId, currentIsActive, folderId) => {
    const alarmToToggle = get().alarms.find(a => a.id === alarmId.toString());
    if (!alarmToToggle) {
      console.error("Alarm to toggle not found:", alarmId);
      set({ errorAlarms: "Alarm to toggle not found" });
      return;
    }
    
    const updates: UpdateAlarmPayload = { is_active: !currentIsActive };
    await get().updateExistingAlarm(alarmId, updates);
  },
  
  getAlarmsByFolder: (folderId) => {
    const { alarms } = get();
    return alarms.filter(alarm => alarm.folderId === folderId);
  },
  
  dismissTemporaryAlarm: async (alarmId) => {
    const { alarms } = get();
    const alarm = alarms.find(a => a.id === alarmId);
    
    if (alarm && alarm.isTemporary) {
      await get().deleteExistingAlarm(alarmId, alarm.folderId);
    }
  },
  
  snoozeAlarmById: async (alarmId, duration) => {
    await snoozeAlarm(alarmId, duration);
  },
}));

export default useAlarmStore;