import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { isBefore, addDays, parseISO, format } from 'date-fns';
import { Alarm, Folder, Day } from '../types';

// Configure notifications
export const configureNotifications = async (): Promise<void> => {
  // Set notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Request permissions
  if (Platform.OS !== 'web') {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions not granted');
    }
  }
};

// Calculate next occurrence based on folder recurrence
export const getNextOccurrence = (time: string, recurrenceDays: Day[]): Date | null => {
  if (recurrenceDays.length === 0) return null;

  // Current date and time
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);

  // Current day of week (0 = Sunday, 6 = Saturday)
  const currentDayIndex = now.getDay();
  
  // Map our Day type to day indices (0-6)
  const dayIndices: Record<Day, number> = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 0,
  };

  // Convert recurrence days to day indices
  const recurrenceDayIndices = recurrenceDays.map(day => dayIndices[day]);
  
  // Sort day indices to find the next occurrence
  const sortedDayIndices = [...recurrenceDayIndices].sort((a, b) => a - b);
  
  // Find the next day
  let nextDayIndex = sortedDayIndices.find(day => day > currentDayIndex);
  
  // If no day is found, wrap around to the first day of next week
  if (nextDayIndex === undefined) {
    nextDayIndex = sortedDayIndices[0];
  }
  
  // Calculate days to add
  let daysToAdd = nextDayIndex - currentDayIndex;
  if (daysToAdd <= 0) daysToAdd += 7;
  
  // Create the next occurrence date
  const nextOccurrence = new Date(now);
  nextOccurrence.setDate(now.getDate() + daysToAdd);
  nextOccurrence.setHours(hours, minutes, 0, 0);
  
  // If next occurrence is today but the time has already passed, add 7 days
  if (daysToAdd === 0 && isBefore(nextOccurrence, now)) {
    nextOccurrence.setDate(nextOccurrence.getDate() + 7);
  }
  
  return nextOccurrence;
};

// Schedule an alarm notification
export const scheduleAlarm = async (
  alarm: Alarm,
  folder: Folder
): Promise<string | null> => {
  if (!alarm.isActive || !folder.isActive) return null;
  
  // Get next occurrence based on folder recurrence
  const nextOccurrence = getNextOccurrence(alarm.time, folder.recurrenceDays);
  if (!nextOccurrence) return null;
  
  // Cancel existing notification for this alarm
  await cancelAlarm(alarm.id);
  
  // Schedule new notification
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: alarm.label || 'Alarm',
      body: `${folder.name} - ${alarm.time}`,
      sound: true, // We'll use default sound for now
      data: {
        alarmId: alarm.id,
        folderId: folder.id,
        isTemporary: alarm.isTemporary,
        snooze: alarm.snooze,
        snoozeDuration: alarm.snoozeDuration,
      },
    },
    trigger: {
      date: nextOccurrence,
    },
  });
  
  return notificationId;
};

// Cancel an alarm notification
export const cancelAlarm = async (alarmId: string): Promise<void> => {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  
  // Find notifications for this alarm
  const notifications = scheduledNotifications.filter(
    notification => notification.content.data?.alarmId === alarmId
  );
  
  // Cancel each notification
  for (const notification of notifications) {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
  }
};

// Reschedule all alarms
export const rescheduleAllAlarms = async (
  alarms: Alarm[],
  folders: Folder[]
): Promise<void> => {
  // Cancel all existing notifications
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  // Schedule each active alarm
  for (const alarm of alarms) {
    if (alarm.isActive) {
      const folder = folders.find(f => f.id === alarm.folderId);
      if (folder && folder.isActive) {
        await scheduleAlarm(alarm, folder);
      }
    }
  }
};

// Snooze an alarm
export const snoozeAlarm = async (
  alarmId: string,
  snoozeDuration: number
): Promise<string | null> => {
  // Calculate snooze time
  const snoozeDate = new Date(Date.now() + snoozeDuration * 60 * 1000);
  
  // Schedule snooze notification
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Snoozed Alarm',
      body: `Your alarm was snoozed for ${snoozeDuration} minutes`,
      sound: true,
      data: {
        alarmId,
        isSnooze: true,
      },
    },
    trigger: {
      date: snoozeDate,
    },
  });
  
  return notificationId;
};