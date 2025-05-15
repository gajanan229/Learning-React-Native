import { create } from 'zustand';
import { Alarm, Folder } from '../types';
import { alarmStorage, folderStorage } from '../utils/storage';
import {
  scheduleAlarm,
  cancelAlarm,
  rescheduleAllAlarms,
  snoozeAlarm
} from '../utils/notifications';

interface AlarmState {
  alarms: Alarm[];
  folders: Folder[];
  isLoading: boolean;
  activeAlarms: number;
  
  // Actions
  fetchAlarms: () => Promise<void>;
  fetchFolders: () => Promise<void>;
  
  // Folder operations
  addFolder: (folder: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateFolder: (folder: Folder) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  toggleFolderActive: (folderId: string) => Promise<void>;
  getActiveAlarmCountByFolder: (folderId: string) => number;
  
  // Alarm operations
  addAlarm: (alarm: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateAlarm: (alarm: Alarm) => Promise<void>;
  deleteAlarm: (alarmId: string) => Promise<void>;
  toggleAlarmActive: (alarmId: string) => Promise<void>;
  getAlarmsByFolder: (folderId: string) => Alarm[];
  dismissTemporaryAlarm: (alarmId: string) => Promise<void>;
  snoozeAlarmById: (alarmId: string, duration: number) => Promise<void>;
}

const useAlarmStore = create<AlarmState>((set, get) => ({
  alarms: [],
  folders: [],
  isLoading: false,
  activeAlarms: 0,
  
  // Fetch data from storage
  fetchAlarms: async () => {
    set({ isLoading: true });
    const alarms = await alarmStorage.getAll();
    set({
      alarms,
      isLoading: false,
      activeAlarms: alarms.filter(a => a.isActive).length
    });
  },
  
  fetchFolders: async () => {
    set({ isLoading: true });
    const folders = await folderStorage.getAll();
    set({ folders, isLoading: false });
  },
  
  // Folder operations
  addFolder: async (folderData) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      ...folderData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    const updatedFolders = [...get().folders, newFolder];
    await folderStorage.saveAll(updatedFolders);
    set({ folders: updatedFolders });
    
    return newFolder.id;
  },
  
  updateFolder: async (updatedFolder) => {
    const { folders, alarms } = get();
    
    // Update folder
    const updatedFolders = folders.map(folder => 
      folder.id === updatedFolder.id
        ? { ...updatedFolder, updatedAt: Date.now() }
        : folder
    );
    
    await folderStorage.saveAll(updatedFolders);
    set({ folders: updatedFolders });
    
    // Reschedule alarms if needed
    const folderAlarms = alarms.filter(alarm => alarm.folderId === updatedFolder.id);
    if (folderAlarms.length > 0) {
      await rescheduleAllAlarms(alarms, updatedFolders);
    }
  },
  
  deleteFolder: async (folderId) => {
    const { folders, alarms } = get();
    
    // Delete folder
    const updatedFolders = folders.filter(folder => folder.id !== folderId);
    await folderStorage.saveAll(updatedFolders);
    
    // Delete alarms in folder
    const updatedAlarms = alarms.filter(alarm => alarm.folderId !== folderId);
    await alarmStorage.saveAll(updatedAlarms);
    
    // Cancel notifications for deleted alarms
    const deletedAlarms = alarms.filter(alarm => alarm.folderId === folderId);
    for (const alarm of deletedAlarms) {
      await cancelAlarm(alarm.id);
    }
    
    set({
      folders: updatedFolders,
      alarms: updatedAlarms,
      activeAlarms: updatedAlarms.filter(a => a.isActive).length
    });
  },
  
  toggleFolderActive: async (folderId) => {
    const { folders, alarms } = get();
    
    // Toggle folder active status
    const updatedFolders = folders.map(folder =>
      folder.id === folderId
        ? { ...folder, isActive: !folder.isActive, updatedAt: Date.now() }
        : folder
    );
    
    await folderStorage.saveAll(updatedFolders);
    set({ folders: updatedFolders });
    
    // Reschedule alarms
    await rescheduleAllAlarms(alarms, updatedFolders);
  },
  
  getActiveAlarmCountByFolder: (folderId) => {
    const { alarms } = get();
    return alarms.filter(alarm => alarm.folderId === folderId && alarm.isActive).length;
  },
  
  // Alarm operations
  addAlarm: async (alarmData) => {
    const { alarms, folders } = get();
    
    const newAlarm: Alarm = {
      id: Date.now().toString(),
      ...alarmData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    const updatedAlarms = [...alarms, newAlarm];
    await alarmStorage.saveAll(updatedAlarms);
    
    // Schedule alarm notification
    if (newAlarm.isActive) {
      const folder = folders.find(f => f.id === newAlarm.folderId);
      if (folder && folder.isActive) {
        await scheduleAlarm(newAlarm, folder);
      }
    }
    
    set({
      alarms: updatedAlarms,
      activeAlarms: updatedAlarms.filter(a => a.isActive).length
    });
    
    return newAlarm.id;
  },
  
  updateAlarm: async (updatedAlarm) => {
    const { alarms, folders } = get();
    
    // Update alarm
    const updatedAlarms = alarms.map(alarm =>
      alarm.id === updatedAlarm.id
        ? { ...updatedAlarm, updatedAt: Date.now() }
        : alarm
    );
    
    await alarmStorage.saveAll(updatedAlarms);
    
    // Reschedule alarm
    await cancelAlarm(updatedAlarm.id);
    
    if (updatedAlarm.isActive) {
      const folder = folders.find(f => f.id === updatedAlarm.folderId);
      if (folder && folder.isActive) {
        await scheduleAlarm(updatedAlarm, folder);
      }
    }
    
    set({
      alarms: updatedAlarms,
      activeAlarms: updatedAlarms.filter(a => a.isActive).length
    });
  },
  
  deleteAlarm: async (alarmId) => {
    const { alarms } = get();
    
    // Cancel notification
    await cancelAlarm(alarmId);
    
    // Delete alarm
    const updatedAlarms = alarms.filter(alarm => alarm.id !== alarmId);
    await alarmStorage.saveAll(updatedAlarms);
    
    set({
      alarms: updatedAlarms,
      activeAlarms: updatedAlarms.filter(a => a.isActive).length
    });
  },
  
  toggleAlarmActive: async (alarmId) => {
    const { alarms, folders } = get();
    
    // Toggle alarm active status
    const updatedAlarms = alarms.map(alarm =>
      alarm.id === alarmId
        ? { ...alarm, isActive: !alarm.isActive, updatedAt: Date.now() }
        : alarm
    );
    
    await alarmStorage.saveAll(updatedAlarms);
    
    // Update alarm notification
    const updatedAlarm = updatedAlarms.find(a => a.id === alarmId);
    if (updatedAlarm) {
      await cancelAlarm(alarmId);
      
      if (updatedAlarm.isActive) {
        const folder = folders.find(f => f.id === updatedAlarm.folderId);
        if (folder && folder.isActive) {
          await scheduleAlarm(updatedAlarm, folder);
        }
      }
    }
    
    set({
      alarms: updatedAlarms,
      activeAlarms: updatedAlarms.filter(a => a.isActive).length
    });
  },
  
  getAlarmsByFolder: (folderId) => {
    const { alarms } = get();
    return alarms.filter(alarm => alarm.folderId === folderId);
  },
  
  dismissTemporaryAlarm: async (alarmId) => {
    const { alarms } = get();
    const alarm = alarms.find(a => a.id === alarmId);
    
    if (alarm && alarm.isTemporary) {
      await get().deleteAlarm(alarmId);
    }
  },
  
  snoozeAlarmById: async (alarmId, duration) => {
    await snoozeAlarm(alarmId, duration);
  },
}));

export default useAlarmStore;