import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, Check } from 'lucide-react-native';
import { colors, typography, spacing } from '../../constants/theme';
import TimePickerField from '../../components/ui/TimePickerField';
import TextField from '../../components/ui/TextField';
import ToggleSwitch from '../../components/ui/ToggleSwitch';
import Button from '../../components/ui/Button';
import SoundPicker from '../../components/alarm/SoundPicker';
import useAlarmStore from '../../store/useAlarmStore';
import useSoundStore from '../../store/useSoundStore';
import useSettingsStore from '../../store/useSettingsStore';
import { Alarm } from '../../types';

export default function CreateEditAlarmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { alarmId, currentFolderId } = params;
  
  const {
    alarms,
    folders,
    fetchAlarms,
    fetchFolders,
    addAlarm,
    updateAlarm,
  } = useAlarmStore();
  
  const { getSounds, getSoundById } = useSoundStore();
  const { settings, fetchSettings } = useSettingsStore();
  
  // State for alarm form
  const [time, setTime] = useState('08:00');
  const [label, setLabel] = useState('');
  const [soundId, setSoundId] = useState('');
  const [vibration, setVibration] = useState(true);
  const [snooze, setSnooze] = useState(true);
  const [snoozeDuration, setSnoozeDuration] = useState(10);
  const [isTemporary, setIsTemporary] = useState(false);
  const [folder, setFolder] = useState<string>(currentFolderId as string);
  
  // UI state
  const [isSoundPickerVisible, setIsSoundPickerVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Load data
  useEffect(() => {
    fetchAlarms();
    fetchFolders();
    fetchSettings();
    
    // If editing an existing alarm
    if (alarmId) {
      const alarm = alarms.find(a => a.id === alarmId);
      if (alarm) {
        setIsEditing(true);
        setTime(alarm.time);
        setLabel(alarm.label || '');
        setSoundId(alarm.soundId);
        setVibration(alarm.vibration);
        setSnooze(alarm.snooze);
        setSnoozeDuration(alarm.snoozeDuration);
        setIsTemporary(alarm.isTemporary);
        setFolder(alarm.folderId);
      }
    } else {
      // New alarm, set defaults
      setSoundId(settings.defaultSoundId);
      setSnoozeDuration(settings.defaultSnoozeDuration);
    }
  }, [alarmId, alarms, fetchAlarms, fetchFolders, fetchSettings, settings]);
  
  // Get current folder
  const currentFolder = folders.find(f => f.id === folder);
  
  // Get sound name
  const selectedSound = getSoundById(soundId);
  
  // Handle save
  const handleSave = async () => {
    const alarmData: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'> = {
      folderId: folder,
      time,
      label: label.trim() || undefined,
      soundId,
      vibration,
      snooze,
      snoozeDuration,
      isTemporary,
      isActive: true,
    };
    
    if (isEditing && alarmId) {
      const existingAlarm = alarms.find(a => a.id === alarmId);
      if (existingAlarm) {
        await updateAlarm({
          ...existingAlarm,
          ...alarmData,
        });
      }
    } else {
      await addAlarm(alarmData);
    }
    
    router.back();
  };
  
  // Handle sound selection
  const handleSoundSelect = (sound: any) => {
    setSoundId(sound.id);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>{isEditing ? 'Edit Alarm' : 'New Alarm'}</Text>
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Check size={24} color={colors.accent.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Time Picker */}
        <TimePickerField
          value={time}
          onChange={setTime}
        />
        
        {/* Folder */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Folder</Text>
          <View style={styles.fieldValueContainer}>
            <Text style={styles.fieldValue}>{currentFolder?.name || ''}</Text>
            {/* In a real app, add folder selection functionality */}
          </View>
        </View>
        
        {/* Label */}
        <TextField
          label="Label"
          value={label}
          onChangeText={setLabel}
          placeholder="e.g., Wake up call"
        />
        
        {/* Sound */}
        <TouchableOpacity
          style={styles.fieldContainer}
          onPress={() => setIsSoundPickerVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.fieldLabel}>Sound</Text>
          <View style={styles.fieldValueContainer}>
            <Text style={styles.fieldValue}>{selectedSound?.name || 'Default'}</Text>
            <ChevronRight size={20} color={colors.text.secondary} />
          </View>
        </TouchableOpacity>
        
        {/* Vibration */}
        <View style={styles.toggleContainer}>
          <Text style={styles.fieldLabel}>Vibration</Text>
          <ToggleSwitch
            value={vibration}
            onValueChange={setVibration}
          />
        </View>
        
        {/* Snooze */}
        <View style={styles.toggleContainer}>
          <Text style={styles.fieldLabel}>Snooze</Text>
          <ToggleSwitch
            value={snooze}
            onValueChange={setSnooze}
          />
        </View>
        
        {/* Snooze Duration */}
        {snooze && (
          <View style={styles.indentedField}>
            <Text style={styles.fieldLabel}>Snooze Duration</Text>
            <View style={styles.durationSelector}>
              <TouchableOpacity
                style={styles.durationButton}
                onPress={() => setSnoozeDuration(Math.max(1, snoozeDuration - 1))}
                disabled={snoozeDuration <= 1}
              >
                <Text style={styles.durationButtonText}>-</Text>
              </TouchableOpacity>
              
              <Text style={styles.durationText}>{snoozeDuration} minutes</Text>
              
              <TouchableOpacity
                style={styles.durationButton}
                onPress={() => setSnoozeDuration(Math.min(30, snoozeDuration + 1))}
                disabled={snoozeDuration >= 30}
              >
                <Text style={styles.durationButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Temporary Alarm */}
        <View style={styles.checkboxContainer}>
          <View style={styles.checkbox}>
            <ToggleSwitch
              value={isTemporary}
              onValueChange={setIsTemporary}
            />
          </View>
          <View style={styles.checkboxTextContainer}>
            <Text style={styles.checkboxLabel}>One-time alarm</Text>
            <Text style={styles.checkboxDescription}>
              This alarm will be deleted after it is dismissed.
            </Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Sound Picker Modal */}
      <SoundPicker
        visible={isSoundPickerVisible}
        onClose={() => setIsSoundPickerVisible(false)}
        selectedSoundId={soundId}
        onSelect={handleSoundSelect}
      />
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
  headerButton: {
    padding: spacing.xs,
  },
  cancelText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  fieldContainer: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  fieldValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.interactive.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.interactive.secondary,
  },
  fieldValue: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  indentedField: {
    marginLeft: spacing.md,
    marginBottom: spacing.lg,
  },
  durationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.interactive.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.interactive.secondary,
  },
  durationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
  },
  durationText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  checkbox: {
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  checkboxDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
});