import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Plus, AlertCircle } from 'lucide-react-native';
import { colors, typography, spacing } from '../../constants/theme';
import AlarmList from '../../components/alarm/AlarmList';
import DayBadge from '../../components/ui/DayBadge';
import Toast, { ToastType } from '../../components/ui/Toast';
import useAlarmStore from '../../store/useAlarmStore';
import { Day, dayToShort, Alarm } from '../../types';

export default function AlarmListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { folderId, folderName, folderRecurrenceDays } = params;
  
  // Toast notification state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info' as ToastType
  });

  // Track which alarm is being toggled/deleted
  const [actionInProgress, setActionInProgress] = useState<{
    id: string | null;
    action: 'toggle' | 'delete' | null;
  }>({ id: null, action: null });
  
  // Use the updated store actions and state
  const {
    alarms,
    fetchAlarmsForFolder,
    getAlarmsByFolder,
    toggleExistingAlarmActive,
    deleteExistingAlarm,
    isLoadingAlarms,
    errorAlarms,
  } = useAlarmStore();
  
  // Parse recurrence days from params
  const recurrenceDays: Day[] = folderRecurrenceDays
    ? JSON.parse(folderRecurrenceDays as string)
    : [];
  
  // Filter alarms for this folder
  const folderAlarms = getAlarmsByFolder(folderId as string);

  // Reset error state and clear toast when the component unmounts
  useEffect(() => {
    return () => {
      // Clear any error state when component unmounts
      setToast({ visible: false, message: '', type: 'info' });
    };
  }, []);
  
  // Show error toast when errorAlarms changes
  useEffect(() => {
    if (errorAlarms) {
      setToast({
        visible: true,
        message: errorAlarms,
        type: 'error'
      });
      
      // Clear the action in progress if there's an error
      setActionInProgress({ id: null, action: null });
    }
  }, [errorAlarms]);
  
  // Fetch alarms when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchAlarmsForFolder(folderId as string);
    }, [fetchAlarmsForFolder, folderId])
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
  
  // Handle toggle alarm with tracking and feedback
  const handleAlarmToggle = async (alarmId: string) => {
    const alarm = folderAlarms.find(a => a.id === alarmId);
    if (alarm) {
      // Set which alarm is being toggled
      setActionInProgress({ id: alarmId, action: 'toggle' });
      
      try {
        await toggleExistingAlarmActive(alarmId, alarm.isActive, folderId as string);
        
        // Success toast
        setToast({
          visible: true,
          message: `Alarm ${alarm.isActive ? 'disabled' : 'enabled'} successfully`,
          type: 'success'
        });
      } catch (error) {
        // Error handling is now done through the errorAlarms useEffect
      } finally {
        // Clear the action indicator
        setActionInProgress({ id: null, action: null });
      }
    }
  };
  
  // Handle delete alarm with confirmation and tracking
  const handleAlarmDelete = (alarmId: string) => {
    const alarm = folderAlarms.find(a => a.id === alarmId);
    if (!alarm) return;
    
    Alert.alert(
      "Delete Alarm",
      "Are you sure you want to delete this alarm?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: async () => {
            // Set which alarm is being deleted
            setActionInProgress({ id: alarmId, action: 'delete' });
            
            try {
              await deleteExistingAlarm(alarmId, folderId as string);
              
              // Success toast
              setToast({
                visible: true,
                message: "Alarm deleted successfully",
                type: 'success'
              });
            } catch (error) {
              // Error handling is now done through the errorAlarms useEffect
            } finally {
              // Clear the action indicator
              setActionInProgress({ id: null, action: null });
            }
          },
          style: "destructive"
        }
      ]
    );
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
      
      {/* Handle loading state */}
      {isLoadingAlarms && !actionInProgress.id && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text style={styles.loadingText}>Loading alarms...</Text>
        </View>
      )}
      
      {/* Handle error state */}
      {errorAlarms && !isLoadingAlarms && !actionInProgress.id && (
        <View style={styles.errorContainer}>
          <AlertCircle size={24} color={colors.accent.destructive} />
          <Text style={styles.errorText}>{errorAlarms}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchAlarmsForFolder(folderId as string)}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Render alarm list when not in initial loading state */}
      {(!isLoadingAlarms || actionInProgress.id) && !errorAlarms && (
        <AlarmList
          alarms={folderAlarms}
          onAlarmPress={handleAlarmPress}
          onAlarmToggle={handleAlarmToggle}
          onAlarmDelete={handleAlarmDelete}
          actionInProgress={actionInProgress}
        />
      )}
      
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddAlarm}
        activeOpacity={0.7}
      >
        <Plus size={24} color={colors.text.primary} />
      </TouchableOpacity>

      {/* Toast notification for success/error feedback */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ ...toast, visible: false })}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorText: {
    marginTop: spacing.md,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accent.primary,
    borderRadius: 4,
    marginTop: spacing.md,
  },
  retryText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
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