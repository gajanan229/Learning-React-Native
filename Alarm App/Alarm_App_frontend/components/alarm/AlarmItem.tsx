import React, { useCallback } from 'react';
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
  disabled?: boolean;
}

const AlarmItem: React.FC<AlarmItemProps> = ({ 
  alarm, 
  onPress, 
  onToggle,
  disabled = false 
}) => {
  // Format time for display (HH:MM to 12-hour format with AM/PM)
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return format(date, 'hh:mm a');
  };

  // Create a proper handler function for the toggle switch
  const handleToggle = useCallback((value: boolean) => {
    if (!disabled) {
      onToggle();
    }
  }, [disabled, onToggle]);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        disabled && styles.disabledContainer
      ]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
    >
      <View style={styles.timeContainer}>
        <Text style={[
          styles.timeText,
          disabled && styles.disabledText
        ]}>
          {formatTime(alarm.time)}
        </Text>
        
        {alarm.label && (
          <Text style={[
            styles.labelText,
            disabled && styles.disabledText
          ]}>
            {alarm.label}
          </Text>
        )}
        
        {alarm.isTemporary && (
          <View style={styles.temporaryContainer}>
            <Clock size={16} color={disabled ? colors.text.tertiary : colors.text.secondary} />
            <Text style={[
              styles.temporaryText,
              disabled && styles.disabledText
            ]}>
              One-time
            </Text>
          </View>
        )}
      </View>
      
      <ToggleSwitch
        value={alarm.isActive}
        onValueChange={handleToggle}
        disabled={disabled}
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
  disabledContainer: {
    opacity: 0.6,
  },
  timeContainer: {
    flex: 1,
  },
  timeText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
  },
  disabledText: {
    color: colors.text.tertiary,
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