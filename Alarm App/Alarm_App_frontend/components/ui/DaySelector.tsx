import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Button from './Button';
import DayBadge from './DayBadge';
import { dayToShort, daysOfWeek, Day, RecurrencePreset, presetDays } from '../../types';
import { colors, typography, spacing } from '../../constants/theme';

interface DaySelectorProps {
  selectedDays: Day[];
  onDayToggle: (day: Day) => void;
  onPresetSelect: (preset: RecurrencePreset) => void;
  currentPreset: RecurrencePreset;
}

const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDays,
  onDayToggle,
  onPresetSelect,
  currentPreset,
}) => {
  // Render preset buttons
  const renderPresetButtons = () => {
    const presets: { label: string; value: RecurrencePreset }[] = [
      { label: 'Every Day', value: 'everyday' },
      { label: 'Weekdays', value: 'weekdays' },
      { label: 'Weekends', value: 'weekends' },
    ];

    return (
      <View style={styles.presetContainer}>
        {presets.map((preset) => (
          <Button
            key={preset.value}
            title={preset.label}
            variant={currentPreset === preset.value ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => onPresetSelect(preset.value)}
            style={styles.presetButton}
          />
        ))}
      </View>
    );
  };

  // Check if a day is selected
  const isDaySelected = (day: Day) => selectedDays.includes(day);

  // Render day toggles
  const renderDayToggles = () => {
    return (
      <View style={styles.daysContainer}>
        {daysOfWeek.map((day) => (
          <DayBadge
            key={day}
            day={dayToShort[day]}
            isActive={isDaySelected(day)}
            onPress={() => onDayToggle(day)}
            size="lg"
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Repeat on</Text>
      {renderPresetButtons()}
      {renderDayToggles()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  presetContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  presetButton: {
    marginRight: spacing.sm,
    flex: 1,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default DaySelector;