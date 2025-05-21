import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Switch, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { format, addHours } from 'date-fns';
import { X, ChevronDown, MapPin, Bell, Plus } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEvents } from '@/hooks/useEvents';
import Colors, { EVENT_COLORS } from '@/constants/Colors';
import { NeumorphicView } from '@/components/ui/NeumorphicView';
import { Button } from '@/components/ui/Button';
import { ColorSelector } from '@/components/event/ColorSelector';
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function CreateEventScreen() {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme];
  const { events, addEvent, editEvent, removeEvent } = useEvents();
  const params = useLocalSearchParams();
  const eventId = params.id as string | undefined;
  const isEditMode = !!eventId;
  
  const getInitialStartTime = () => {
    if (params.startTime) return new Date(params.startTime as string);
    return new Date();
  };

  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState(getInitialStartTime());
  const [endTime, setEndTime] = useState(addHours(getInitialStartTime(), 1));
  const [isAllDay, setIsAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(EVENT_COLORS[0]);
  const [reminderTime, setReminderTime] = useState('15 minutes before');
  
  // State for date/time pickers
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  // pickerMode can be used if one modal handles both, but we'll use separate visibility flags for now
  // const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [currentPickerTarget, setCurrentPickerTarget] = useState<'startTime' | 'endTime'>('startTime');
  
  useEffect(() => {
    if (isEditMode && eventId) {
      const eventToEdit = events.find(e => e.id === eventId);
      if (eventToEdit) {
        setTitle(eventToEdit.title);
        setStartTime(new Date(eventToEdit.startTime));
        setEndTime(new Date(eventToEdit.endTime));
        // Set isAllDay and adjust times if needed based on fetched event
        const allDayEvent = eventToEdit.isAllDay;
        setIsAllDay(allDayEvent);
        if (allDayEvent) {
          const startOfDay = new Date(eventToEdit.startTime);
          startOfDay.setHours(0, 0, 0, 0);
          setStartTime(startOfDay);

          const endOfDay = new Date(eventToEdit.startTime); // Base end on start date for single all-day event
          endOfDay.setHours(23, 59, 59, 999);
          setEndTime(endOfDay);
        } else {
          setStartTime(new Date(eventToEdit.startTime));
          setEndTime(new Date(eventToEdit.endTime));
        }
        setLocation(eventToEdit.location || '');
        setDescription(eventToEdit.notes || '');
        setSelectedColor(eventToEdit.color || EVENT_COLORS[0]);
        setReminderTime(eventToEdit.reminderTime || '15 minutes before');
      }
    }
  }, [eventId, isEditMode, events]);
  
  const handleSave = async () => {
    if (!title.trim()) {
      // Show error for empty title
      return;
    }
    
    const eventData = {
      title,
      location,
      description,
      color: selectedColor,
      // reminder_time: reminderTime, // Keep for backend if supported
    };

    try {
      if (isEditMode && eventId) {
        // Edit existing event - now using camelCase
        await editEvent(eventId, {
          ...eventData,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          isAllDay: isAllDay,
        });
      } else {
        // Create new event - using camelCase as fixed earlier
        await addEvent({
          ...eventData,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          isAllDay: isAllDay,
        });
      }
      router.back();
    } catch (error) {
      console.error(isEditMode ? 'Failed to update event:' : 'Failed to save event:', error);
      // TODO: Show error message to user
    }
  };

  const handleDelete = async () => {
    if (isEditMode && eventId) {
      // Consider adding Alert confirmation here
      Alert.alert(
        "Delete Event",
        "Are you sure you want to delete this event? This action cannot be undone.",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Delete",
            onPress: async () => {
              try {
                await removeEvent(eventId);
                router.back(); // Or navigate to a different screen after delete
              } catch (error) {
                console.error('Failed to delete event:', error);
                // TODO: Show error message to user (e.g., Alert.alert error)
                Alert.alert("Error", "Failed to delete event. Please try again.");
              }
            },
            style: "destructive"
          }
        ],
        { cancelable: true }
      );
    }
  };
  
  const showDatePicker = (target: 'startTime' | 'endTime') => {
    setCurrentPickerTarget(target);
    setDatePickerVisibility(true);
  };

  const showTimePicker = (target: 'startTime' | 'endTime') => {
    setCurrentPickerTarget(target);
    setTimePickerVisibility(true);
  };

  const hidePicker = () => {
    setDatePickerVisibility(false);
    setTimePickerVisibility(false);
  };

  const handleDateConfirm = (date: Date) => {
    hidePicker();
    if (currentPickerTarget === 'startTime') {
      // Preserve existing time, update only the date part
      const newStartTime = new Date(startTime);
      newStartTime.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setStartTime(newStartTime);
      // If new start time is after current end time, adjust end time
      if (newStartTime > endTime) {
        setEndTime(addHours(newStartTime, 1));
      }
    } else { // currentPickerTarget === 'endTime'
      // Preserve existing time, update only the date part
      const newEndTime = new Date(endTime);
      newEndTime.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      // Ensure new end time is not before start time
      if (newEndTime < startTime) {
        // Optionally alert user or set to startTime + 1 hour
        setEndTime(addHours(startTime, 1)); 
      } else {
        setEndTime(newEndTime);
      }
    }
  };

  const handleTimeConfirm = (date: Date) => {
    hidePicker();
    // Placeholder for Phase 2 - will update time part of startTime or endTime
    if (currentPickerTarget === 'startTime') {
      const newStartTime = new Date(startTime);
      newStartTime.setHours(date.getHours(), date.getMinutes(), date.getSeconds());
      setStartTime(newStartTime);
      if (newStartTime > endTime) {
        setEndTime(addHours(newStartTime, 1));
      }
    } else { // endTime
      const newEndTime = new Date(endTime);
      newEndTime.setHours(date.getHours(), date.getMinutes(), date.getSeconds());
      if (newEndTime < startTime) {
        setEndTime(addHours(startTime, 1)); // Or alert
      } else {
        setEndTime(newEndTime);
      }
    }
  };
  
  return (
    <BlurView
      intensity={20}
      tint="dark"
      style={styles.container}
    >
      <NeumorphicView style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isEditMode ? 'Edit Event' : 'New Event'}
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
          <View style={styles.formGroup}>
            <TextInput
              style={[styles.titleInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="Event title"
              placeholderTextColor={colors.subtleText}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
          </View>
          
          <View style={styles.formGroup}>
            <View style={styles.switchContainer}>
              <Text style={[styles.switchLabel, { color: colors.text }]}>All-day</Text>
              <Switch
                value={isAllDay}
                onValueChange={(value) => {
                  setIsAllDay(value);
                  if (value) { // Becoming all-day
                    const startOfDay = new Date(startTime);
                    startOfDay.setHours(0, 0, 0, 0);
                    setStartTime(startOfDay);

                    const endOfDay = new Date(startTime); // Base end on start date
                    endOfDay.setHours(23, 59, 59, 999);
                    setEndTime(endOfDay);
                  } else {
                    // Optionally, reset times to current or last known non-all-day times
                    // For now, we'll let them be, user can adjust
                    // Or, set a default like startTime + 1 hour for endTime if they are same
                    if (endTime.getTime() === startTime.getTime()) {
                       setEndTime(addHours(startTime, 1));
                    }
                  }
                }}
                trackColor={{ false: '#3e3e3e', true: '#81b0ff' }}
                thumbColor={isAllDay ? colors.accent : '#f4f3f4'}
              />
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.subtleText }]}>Starts</Text>
            <NeumorphicView style={styles.timeSelectorContainer}>
              <TouchableOpacity onPress={() => showDatePicker('startTime')} style={styles.dateTouchable} activeOpacity={0.7}>
                <Text style={[styles.dateText, { color: colors.text}]}>
                  {format(startTime, 'E, MMM d, yyyy')}
                </Text>
              </TouchableOpacity>
              {!isAllDay && (
                <TouchableOpacity onPress={() => showTimePicker('startTime')} style={styles.timeTouchable} activeOpacity={0.7}>
                  <Text style={[styles.timeText, { color: colors.accent}]}>
                    {format(startTime, 'h:mm a')}
                  </Text>
                </TouchableOpacity>
              )}
              <ChevronDown size={20} color={colors.subtleText} style={styles.chevronIcon} />
            </NeumorphicView>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.subtleText }]}>Ends</Text>
            <NeumorphicView style={styles.timeSelectorContainer}>
              <TouchableOpacity onPress={() => showDatePicker('endTime')} style={styles.dateTouchable} activeOpacity={0.7}>
                <Text style={[styles.dateText, { color: colors.text}]}>
                  {format(endTime, 'E, MMM d, yyyy')}
                </Text>
              </TouchableOpacity>
              {!isAllDay && (
                <TouchableOpacity onPress={() => showTimePicker('endTime')} style={styles.timeTouchable} activeOpacity={0.7}>
                  <Text style={[styles.timeText, { color: colors.accent}]}>
                    {format(endTime, 'h:mm a')}
                  </Text>
                </TouchableOpacity>
              )}
              <ChevronDown size={20} color={colors.subtleText} style={styles.chevronIcon} />
            </NeumorphicView>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.subtleText }]}>Location</Text>
            <NeumorphicView style={styles.inputContainer}>
              <MapPin size={18} color={colors.subtleText} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Add location"
                placeholderTextColor={colors.subtleText}
                value={location}
                onChangeText={setLocation}
              />
            </NeumorphicView>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.subtleText }]}>Alert</Text>
            <NeumorphicView style={styles.alertSelector}>
              <Bell size={18} color={colors.subtleText} style={styles.inputIcon} />
              <Text style={[styles.alertText, { color: colors.text }]}>
                {reminderTime}
              </Text>
              <ChevronDown size={20} color={colors.subtleText} style={styles.chevronIcon} />
            </NeumorphicView>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.subtleText }]}>Color</Text>
            <ColorSelector
              colors={EVENT_COLORS}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.subtleText }]}>Notes</Text>
            <NeumorphicView style={styles.notesContainer}>
              <TextInput
                style={[styles.notesInput, { color: colors.text }]}
                placeholder="Add notes"
                placeholderTextColor={colors.subtleText}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </NeumorphicView>
          </View>
          
          <View style={styles.buttonContainer}>
            <Button 
              title="Cancel" 
              onPress={() => router.back()} 
              variant="secondary"
              style={styles.button}
            />
            <Button 
              title="Save" 
              onPress={handleSave} 
              variant="primary"
              style={styles.button}
              disabled={!title.trim()}
            />
          </View>
          {isEditMode && (
            <View style={styles.deleteButtonContainer}>
              <Button
                title="Delete Event"
                onPress={handleDelete}
                variant="danger"
                style={styles.deleteButton}
              />
            </View>
          )}
        </ScrollView>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={hidePicker}
          date={currentPickerTarget === 'startTime' ? startTime : endTime}
          isDarkModeEnabled={colorScheme === 'dark'}
          minimumDate={currentPickerTarget === 'endTime' ? startTime : undefined}
        />

        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          onConfirm={handleTimeConfirm}
          onCancel={hidePicker}
          date={currentPickerTarget === 'startTime' ? startTime : endTime} // For time, the date part is also needed by picker
          isDarkModeEnabled={colorScheme === 'dark'}
        />

      </NeumorphicView>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexGrow: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  titleInput: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  timeSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    // marginRight: 8, // Handled by padding on touchable
  },
  timeText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  dateTouchable: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4, // Optional: slight rounding for the touchable itself
  },
  timeTouchable: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4, // Optional: slight rounding
    marginLeft: 8, // Space between date and time touchables
  },
  chevronIcon: {
    marginLeft: 'auto',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  alertSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  alertText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    flex: 1,
    marginLeft: 12,
  },
  notesContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  notesInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    marginBottom: 80,
  },
  button: {
    minWidth: 100,
    marginLeft: 12,
  },
  deleteButtonContainer: {
    marginTop: 16,
    paddingHorizontal: 20, // Match form padding if needed
  },
  deleteButton: {
    width: '100%',
  },
});