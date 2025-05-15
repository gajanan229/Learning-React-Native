import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { colors, typography, spacing } from '../../constants/theme';
import AlarmList from '../../components/alarm/AlarmList';
import DayBadge from '../../components/ui/DayBadge';
import useAlarmStore from '../../store/useAlarmStore';
import { Day, dayToShort, Alarm } from '../../types';

export default function AlarmListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { folderId, folderName, folderRecurrenceDays } = params;
  
  const {
    alarms,
    fetchAlarms,
    getAlarmsByFolder,
    toggleAlarmActive,
    deleteAlarm,
  } = useAlarmStore();
  
  // Parse recurrence days from params
  const recurrenceDays: Day[] = folderRecurrenceDays
    ? JSON.parse(folderRecurrenceDays as string)
    : [];
  
  // Filter alarms for this folder
  const folderAlarms = getAlarmsByFolder(folderId as string);
  
  // Fetch alarms when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchAlarms();
    }, [fetchAlarms])
  );
  
  // Handle alarm press (edit)
  const handleAlarmPress = (alarm: Alarm) => {
    router.push({
      pathname: '/(tabs)/create-edit-alarm',
      params: {
        alarmId: alarm.id,
        currentFolderId: folderId as string,
      },
    });
  };
  
  // Handle add alarm
  const handleAddAlarm = () => {
    router.push({
      pathname: '/(tabs)/create-edit-alarm',
      params: {
        currentFolderId: folderId as string,
      },
    });
  };
  
  // Handle toggle alarm
  const handleAlarmToggle = (alarmId: string) => {
    toggleAlarmActive(alarmId);
  };
  
  // Handle delete alarm
  const handleAlarmDelete = (alarmId: string) => {
    // In a real app, show a confirmation modal here
    deleteAlarm(alarmId);
  };
  
  // Format recurrence days for display
  const getRecurrenceText = (days: Day[]) => {
    if (days.length === 7) return 'Every Day';
    if (days.length === 5 && !days.includes('saturday') && !days.includes('sunday')) {
      return 'Weekdays';
    }
    if (days.length === 2 && days.includes('saturday') && days.includes('sunday')) {
      return 'Weekends';
    }
    return null;
  };
  
  const recurrenceText = getRecurrenceText(recurrenceDays);
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        
        <Text style={styles.title}>{folderName}</Text>
        
        <View style={styles.headerRight} />
      </View>
      
      <View style={styles.recurrenceContainer}>
        {recurrenceText ? (
          <Text style={styles.recurrenceText}>{recurrenceText}</Text>
        ) : (
          recurrenceDays.map(day => (
            <DayBadge key={day} day={dayToShort[day]} isActive size="sm" />
          ))
        )}
      </View>
      
      <AlarmList
        alarms={folderAlarms}
        onAlarmPress={handleAlarmPress}
        onAlarmToggle={handleAlarmToggle}
        onAlarmDelete={handleAlarmDelete}
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddAlarm}
        activeOpacity={0.7}
      >
        <Plus size={24} color={colors.text.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + spacing.lg, // Account for status bar
    paddingBottom: spacing.md,
    backgroundColor: colors.background.primary,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
  },
  headerRight: {
    width: 40, // For balanced layout
  },
  recurrenceContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.interactive.secondary,
  },
  recurrenceText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});