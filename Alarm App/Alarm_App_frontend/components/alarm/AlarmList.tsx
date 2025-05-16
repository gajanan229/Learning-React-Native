import React from 'react';
import { FlatList, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { Alarm } from '../../types';
import { colors, typography, spacing } from '../../constants/theme';
import AlarmItem from './AlarmItem';
import SwipeableRow from '../ui/SwipeableRow';

interface AlarmListProps {
  alarms: Alarm[];
  onAlarmPress: (alarm: Alarm) => void;
  onAlarmToggle: (alarmId: string) => void;
  onAlarmDelete: (alarmId: string) => void;
  actionInProgress?: {
    id: string | null;
    action: 'toggle' | 'delete' | null;
  };
}

const AlarmList: React.FC<AlarmListProps> = ({
  alarms,
  onAlarmPress,
  onAlarmToggle,
  onAlarmDelete,
  actionInProgress = { id: null, action: null },
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
  const renderAlarm = ({ item }: { item: Alarm }) => {
    const isActionInProgress = actionInProgress.id === item.id;
    
    // Wrap AlarmItem with a loading overlay when being acted upon
    const renderAlarmWithLoadingState = () => (
      <AlarmItem
        alarm={item}
        onPress={() => onAlarmPress(item)}
        onToggle={() => onAlarmToggle(item.id)}
        disabled={isActionInProgress}
      />
    );
    
    // If this alarm has an action in progress, render with loading indicator
    if (isActionInProgress) {
      return (
        <View style={styles.actionInProgressContainer}>
          {renderAlarmWithLoadingState()}
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.accent.primary} />
          </View>
        </View>
      );
    }
    
    // Normal rendering with swipeable row
    return (
      <SwipeableRow
        onDelete={() => onAlarmDelete(item.id)}
        onPress={() => onAlarmPress(item)}
      >
        {renderAlarmWithLoadingState()}
      </SwipeableRow>
    );
  };

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
  actionInProgressContainer: {
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  }
});

export default AlarmList;