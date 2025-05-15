import React from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import { Alarm } from '../../types';
import { colors, typography, spacing } from '../../constants/theme';
import AlarmItem from './AlarmItem';
import SwipeableRow from '../ui/SwipeableRow';

interface AlarmListProps {
  alarms: Alarm[];
  onAlarmPress: (alarm: Alarm) => void;
  onAlarmToggle: (alarmId: string) => void;
  onAlarmDelete: (alarmId: string) => void;
}

const AlarmList: React.FC<AlarmListProps> = ({
  alarms,
  onAlarmPress,
  onAlarmToggle,
  onAlarmDelete,
}) => {
  // Sort alarms by time
  const sortedAlarms = [...alarms].sort((a, b) => {
    // Convert "HH:MM" to minutes for comparison
    const getMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    return getMinutes(a.time) - getMinutes(b.time);
  });

  // Render an empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No alarms in this folder.</Text>
      <Text style={styles.emptySubtitle}>Tap '+' to add one.</Text>
    </View>
  );

  // Render an alarm item
  const renderAlarm = ({ item }: { item: Alarm }) => (
    <SwipeableRow
      onDelete={() => onAlarmDelete(item.id)}
      onPress={() => onAlarmPress(item)}
    >
      <AlarmItem
        alarm={item}
        onPress={() => onAlarmPress(item)}
        onToggle={() => onAlarmToggle(item.id)}
      />
    </SwipeableRow>
  );

  return (
    <FlatList
      data={sortedAlarms}
      renderItem={renderAlarm}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={renderEmptyState}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
});

export default AlarmList;