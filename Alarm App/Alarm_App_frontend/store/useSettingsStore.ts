import { create } from 'zustand';
import { AppSettings } from '../types';
import { settingsStorage, DEFAULT_SETTINGS } from '../utils/storage';

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  
  // Actions
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  
  // Fetch settings from storage
  fetchSettings: async () => {
    set({ isLoading: true });
    const settings = await settingsStorage.get();
    set({ settings, isLoading: false });
  },
  
  // Update settings
  updateSettings: async (newSettings) => {
    const updatedSettings = { ...get().settings, ...newSettings };
    await settingsStorage.save(updatedSettings);
    set({ settings: updatedSettings });
  },
  
  // Reset settings to defaults
  resetSettings: async () => {
    await settingsStorage.save(DEFAULT_SETTINGS);
    set({ settings: DEFAULT_SETTINGS });
  },
}));

export default useSettingsStore;