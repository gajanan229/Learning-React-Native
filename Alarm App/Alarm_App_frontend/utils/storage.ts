import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, Folder, AppSettings } from '../types';

// Storage keys
const STORAGE_KEYS = {
  FOLDERS: 'chronofold_folders',
  ALARMS: 'chronofold_alarms',
  SETTINGS: 'chronofold_settings',
};

// Default app settings
export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  defaultSnoozeDuration: 10,
  defaultSoundId: 'default',
  dndIntegration: false,
};

// Folder storage operations
export const folderStorage = {
  // Get all folders
  getAll: async (): Promise<Folder[]> => {
    try {
      const foldersJson = await AsyncStorage.getItem(STORAGE_KEYS.FOLDERS);
      return foldersJson ? JSON.parse(foldersJson) : [];
    } catch (error) {
      console.error('Error getting folders:', error);
      return [];
    }
  },

  // Save all folders
  saveAll: async (folders: Folder[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
    } catch (error) {
      console.error('Error saving folders:', error);
    }
  },

  // Get a folder by ID
  getById: async (id: string): Promise<Folder | null> => {
    try {
      const folders = await folderStorage.getAll();
      return folders.find((folder) => folder.id === id) || null;
    } catch (error) {
      console.error('Error getting folder by ID:', error);
      return null;
    }
  },
};

// Alarm storage operations
export const alarmStorage = {
  // Get all alarms
  getAll: async (): Promise<Alarm[]> => {
    try {
      const alarmsJson = await AsyncStorage.getItem(STORAGE_KEYS.ALARMS);
      return alarmsJson ? JSON.parse(alarmsJson) : [];
    } catch (error) {
      console.error('Error getting alarms:', error);
      return [];
    }
  },

  // Save all alarms
  saveAll: async (alarms: Alarm[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(alarms));
    } catch (error) {
      console.error('Error saving alarms:', error);
    }
  },

  // Get alarms by folder ID
  getByFolderId: async (folderId: string): Promise<Alarm[]> => {
    try {
      const alarms = await alarmStorage.getAll();
      return alarms.filter((alarm) => alarm.folderId === folderId);
    } catch (error) {
      console.error('Error getting alarms by folder ID:', error);
      return [];
    }
  },

  // Get an alarm by ID
  getById: async (id: string): Promise<Alarm | null> => {
    try {
      const alarms = await alarmStorage.getAll();
      return alarms.find((alarm) => alarm.id === id) || null;
    } catch (error) {
      console.error('Error getting alarm by ID:', error);
      return null;
    }
  },
};

// Settings storage operations
export const settingsStorage = {
  // Get all settings
  get: async (): Promise<AppSettings> => {
    try {
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settingsJson
        ? { ...DEFAULT_SETTINGS, ...JSON.parse(settingsJson) }
        : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error getting settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  // Save settings
  save: async (settings: AppSettings): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },
};

// Initialize storage with default data if not exists
export const initializeStorage = async (): Promise<void> => {
  try {
    // Check if folders exist
    const foldersJson = await AsyncStorage.getItem(STORAGE_KEYS.FOLDERS);
    if (!foldersJson) {
      await AsyncStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify([]));
    }

    // Check if alarms exist
    const alarmsJson = await AsyncStorage.getItem(STORAGE_KEYS.ALARMS);
    if (!alarmsJson) {
      await AsyncStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify([]));
    }

    // Check if settings exist
    const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!settingsJson) {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};