import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import { X, CreditCard as Edit2, Trash2, MapPin, Calendar, Clock, Bell } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEvents } from '@/hooks/useEvents';
import Colors from '@/constants/Colors';
import { NeumorphicView } from '@/components/ui/NeumorphicView';
import { Button } from '@/components/ui/Button';

export default function EventDetailsScreen() {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme];
  const { id } = useLocalSearchParams();
  const { events, removeEvent } = useEvents();
  
  const event = events.find(e => e.id === id);
  
  if (!event) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.text }]}>
          Event not found
        </Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()} 
          variant="primary"
        />
      </View>
    );
  }
  
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);
  
  const handleDelete = () => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => {
            removeEvent(event.id);
            router.back();
          },
          style: "destructive"
        }
      ]
    );
  };
  
  const handleEdit = () => {
    // Navigate to edit screen (not implemented in this MVP)
    if (event && event.id) {
      router.push({ pathname: '/event/create', params: { id: event.id } });
    } else {
      // Fallback or error handling if event or event.id is somehow not available
      console.warn('Cannot edit event: event data is missing.');
      router.back();
    }
  };
  
  return (
    <BlurView
      intensity={20}
      tint="dark"
      style={styles.container}
    >
      <NeumorphicView style={styles.modalContainer}>
        <View 
          style={[
            styles.headerBanner, 
            { backgroundColor: event.color }
          ]}
        />
        
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <NeumorphicView style={styles.iconButton}>
            <X size={20} color={colors.text} />
          </NeumorphicView>
        </TouchableOpacity>
        
        <ScrollView style={styles.scrollContent}>
          <Text style={[styles.eventTitle, { color: colors.text }]}>
            {event.title}
          </Text>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Calendar size={20} color={colors.accent} style={styles.detailIcon} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                {format(startTime, 'EEEE, MMMM d, yyyy')}
              </Text>
            </View>
            
            {!event.isAllDay && (
              <View style={styles.detailRow}>
                <Clock size={20} color={colors.accent} style={styles.detailIcon} />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                </Text>
              </View>
            )}
            
            {event.isAllDay && (
              <View style={styles.detailRow}>
                <Clock size={20} color={colors.accent} style={styles.detailIcon} />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  All day
                </Text>
              </View>
            )}
            
            {event.location && (
              <View style={styles.detailRow}>
                <MapPin size={20} color={colors.accent} style={styles.detailIcon} />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  {event.location}
                </Text>
              </View>
            )}
            
            {event.reminderTime && (
              <View style={styles.detailRow}>
                <Bell size={20} color={colors.accent} style={styles.detailIcon} />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  {event.reminderTime}
                </Text>
              </View>
            )}
          </View>
          
          {event.notes && (
            <View style={styles.notesContainer}>
              <Text style={[styles.notesLabel, { color: colors.subtleText }]}>
                Notes
              </Text>
              <NeumorphicView style={styles.notesContent}>
                <Text style={[styles.notesText, { color: colors.text }]}>
                  {event.notes}
                </Text>
              </NeumorphicView>
            </View>
          )}
          
          <View style={styles.actionsContainer}>
            <Button
              title="Edit"
              onPress={handleEdit}
              variant="secondary"
              leftIcon={<Edit2 size={16} color={colors.text} />}
              style={styles.actionButton}
            />
            <Button
              title="Delete"
              onPress={handleDelete}
              variant="danger"
              leftIcon={<Trash2 size={16} color="#fff" />}
              style={styles.actionButton}
            />
          </View>
        </ScrollView>
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
  headerBanner: {
    height: 16,
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  eventTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 20,
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIcon: {
    marginRight: 16,
  },
  detailText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  notesContent: {
    padding: 16,
    borderRadius: 8,
  },
  notesText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  notFoundText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    marginBottom: 20,
  },
});