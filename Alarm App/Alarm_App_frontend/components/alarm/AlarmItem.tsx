import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock } from 'lucide-react-native';
import { format } from 'date-fns';
import { Alarm } from '../../types';
import { colors, typography, spacing } from '../../constants/theme';
import ToggleSwitch from '../ui/ToggleSwitch';

interface AlarmItemProps {
  alarm: Alarm;
  onPress: () => void;
  onToggle: () => void;
}

const AlarmItem: React.FC<AlarmItemProps> = ({ alarm, onPress, onToggle }) => {
  // Format time for display (HH:MM to 12-hour format with AM/PM)
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return format(date, 'hh:mm a');
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(alarm.time)}</Text>
        
        {alarm.label && (
          <Text style={styles.labelText}>{alarm.label}</Text>
        )}
        
        {alarm.isTemporary && (
          <View style={styles.temporaryContainer}>
            <Clock size={16} color={colors.text.secondary} />
            <Text style={styles.temporaryText}>One-time</Text>
          </View>
        )}
      </View>
      
      <ToggleSwitch
        value={alarm.isActive}
        onValueChange={onToggle}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.interactive.secondary,
  },
  timeContainer: {
    flex: 1,
  },
  timeText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
  },
  labelText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  temporaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  temporaryText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
});

export default AlarmItem;