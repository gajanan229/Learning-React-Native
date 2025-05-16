// Type definitions for ChronoFold app

// Day of the week
export type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// Short representation for days
export type DayShort = 'M' | 'T' | 'W' | 'Th' | 'F' | 'S' | 'Su';

// Mapping between day and its short representation
export const dayToShort: Record<Day, DayShort> = {
  monday: 'M',
  tuesday: 'T',
  wednesday: 'W',
  thursday: 'Th',
  friday: 'F',
  saturday: 'S',
  sunday: 'Su',
};

// Days of week array
export const daysOfWeek: Day[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

// Preset types for day selection
export type RecurrencePreset = 'everyday' | 'weekdays' | 'weekends' | 'custom';

// Folder interface
export interface Folder {
  id: string;
  name: string;
  recurrence_days: Day[];
  is_active: boolean; // Master toggle for the folder
  createdAt: number;
  updatedAt: number;
}

// Preset day mappings
export const presetDays: Record<RecurrencePreset, Day[]> = {
  everyday: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  weekends: ['saturday', 'sunday'],
  custom: [],
};

// Sound option for alarms
export interface SoundOption {
  id: string;
  name: string;
  file: string; // Path to sound file
}

// Alarm interface
export interface Alarm {
  id: string;
  folderId: string;
  time: string; // HH:MM format in 24h
  label?: string;
  soundId: string;
  vibration: boolean;
  snooze: boolean;
  snoozeDuration: number; // in minutes
  isTemporary: boolean;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// App settings interface
export interface AppSettings {
  theme: 'dark' | 'light';
  defaultSnoozeDuration: number;
  defaultSoundId: string;
  dndIntegration: boolean;
}

// Navigation parameter types
export type RootStackParamList = {
  HomeFolderList: undefined;
  AlarmList: {
    folderId: string;
    folderName: string;
    folderRecurrenceDays: Day[];
  };
  CreateEditAlarm: {
    alarmDetails?: Alarm;
    currentFolderId: string;
  };
  Settings: undefined;
};