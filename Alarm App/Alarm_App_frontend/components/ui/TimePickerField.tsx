import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { colors, typography, spacing, borderRadius, shadows, animations } from '../../constants/theme';
import { ChevronDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface TimePickerFieldProps {
  value: string; // HH:MM format
  onChange: (time: string) => void;
  label?: string;
}

const TimePickerField: React.FC<TimePickerFieldProps> = ({
  value,
  onChange,
  label,
}) => {
  const [show, setShow] = useState(false);
  
  const getTimeAsDate = () => {
    const date = new Date();
    if (value) {
      const [hours, minutes] = value.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        date.setHours(hours);
        date.setMinutes(minutes);
      } else {
        // Default to current time if value is invalid
        console.warn(`Invalid time value provided to TimePickerField: ${value}`);
      }
    }
    return date;
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    
    if (event.type === 'set' && selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      onChange(`${hours}:${minutes}`);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (event.type === 'dismissed' && Platform.OS === 'ios') {
      // Handle cancel on iOS if needed
      setShow(false);
    }
  };

  const formatDisplayTime = () => {
    if (!value) return 'Select Time';
    
    try {
      const date = getTimeAsDate();
      return format(date, 'h:mm a');
    } catch (error) {
      console.warn(`Error formatting time: ${value}`, error);
      return 'Invalid Time';
    }
  };

  const openPicker = () => {
    setShow(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Custom web time picker
  const WebTimePicker = () => (
    <input
      type="time"
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      style={{
        backgroundColor: colors.interactive.primary,
        border: `1px solid ${colors.interactive.secondary}`,
        borderRadius: borderRadius.md,
        color: colors.text.primary,
        padding: spacing.md,
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.medium,
        width: '100%',
        cursor: 'pointer',
        appearance: 'none',
        boxSizing: 'border-box',
        lineHeight: typography.lineHeight.normal,
      }}
    />
  );

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      {Platform.OS === 'web' ? (
        <WebTimePicker />
      ) : (
        <>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={openPicker}
            activeOpacity={0.7}
          >
            <Text style={styles.timeText}>{formatDisplayTime()}</Text>
            <ChevronDown size={typography.fontSize.xl} color={colors.text.secondary} />
          </TouchableOpacity>
          
          {show && (
            <DateTimePicker
              value={getTimeAsDate()}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              minuteInterval={1}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  pickerButton: {
    backgroundColor: colors.interactive.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.interactive.secondary,
    ...shadows.md,
  },
  timeText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
  },
});

export default TimePickerField;