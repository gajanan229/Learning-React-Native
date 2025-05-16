import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Folder, Day, dayToShort } from '../../types';
import { colors, typography, spacing } from '../../constants/theme';
import Card from '../ui/Card';
import ToggleSwitch from '../ui/ToggleSwitch';
import DayBadge from '../ui/DayBadge';
import useAlarmStore from '../../store/useAlarmStore';

interface FolderCardProps {
  folder: Folder;
  onPress: () => void;
  onToggle: () => void;
}

const FolderCard: React.FC<FolderCardProps> = ({ folder, onPress, onToggle }) => {
  const getActiveAlarmCountByFolder = useAlarmStore(state => state.getActiveAlarmCountByFolder);
  
  const activeAlarmCount = getActiveAlarmCountByFolder(folder.id);
  
  // Get formatted recurrence days
  const getRecurrenceText = (days: Day[]) => {
    if (!days || !Array.isArray(days)) return 'No recurrence';
    if (days.length === 7) return 'Every Day';
    if (days.length === 5 && !days.includes('saturday') && !days.includes('sunday')) {
      return 'Weekdays';
    }
    if (days.length === 2 && days.includes('saturday') && days.includes('sunday')) {
      return 'Weekends';
    }
    return null;
  };
  
  const recurrenceText = getRecurrenceText(folder.recurrence_days);
  
  return (
    <Card>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.container}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.folderName}>{folder.name}</Text>
          
          <View style={styles.recurrenceContainer}>
            {recurrenceText ? (
              <Text style={styles.recurrenceText}>{recurrenceText}</Text>
            ) : (
              folder.recurrence_days.map(day => (
                <DayBadge key={day} day={dayToShort[day]} isActive size="sm" />
              ))
            )}
          </View>
          
          <Text style={styles.alarmCount}>
            {activeAlarmCount === 0
              ? 'No active alarms'
              : `${activeAlarmCount} active alarm${activeAlarmCount !== 1 ? 's' : ''}`}
          </Text>
        </View>
        
        <View style={styles.toggleContainer}>
          <ToggleSwitch value={folder.is_active} onValueChange={onToggle} />
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
    flexShrink: 1,
  },
  folderName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  recurrenceContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
  },
  recurrenceText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  alarmCount: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  toggleContainer: {
    marginLeft: spacing.md,
  },
});

export default FolderCard;