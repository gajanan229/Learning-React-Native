import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { format } from 'date-fns';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { NeumorphicView } from '../ui/NeumorphicView';
import { Event } from '@/hooks/useEvents';
import { MapPin, Clock } from 'lucide-react-native';

interface DayViewEventProps {
  event: Event;
  top: number;
  height: number;
  onPress: () => void;
}

export function DayViewEvent({ 
  event, 
  top, 
  height, 
  onPress 
}: DayViewEventProps) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme];
  
  // Calculate if event is too small to show full content
  const isCompact = height < 70;
  
  return (
    <TouchableOpacity
      style={[
        styles.eventContainer,
        {
          top,
          height: Math.max(40, height),
          right: 16,
          left: 80,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <NeumorphicView style={styles.event}>
        <View style={[styles.eventColor, { backgroundColor: event.color }]} />
        <View style={styles.eventContent}>
          <Text 
            style={[styles.eventTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {event.title}
          </Text>
          
          {!isCompact && (
            <View style={styles.eventDetails}>
              {!event.isAllDay && (
                <View style={styles.eventDetail}>
                  <Clock size={12} color={colors.subtleText} style={styles.detailIcon} />
                  <Text style={[styles.eventTime, { color: colors.subtleText }]}>
                    {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
                  </Text>
                </View>
              )}
              
              {event.location && (
                <View style={styles.eventDetail}>
                  <MapPin size={12} color={colors.subtleText} style={styles.detailIcon} />
                  <Text 
                    style={[styles.eventLocation, { color: colors.subtleText }]}
                    numberOfLines={1}
                  >
                    {event.location}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </NeumorphicView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  eventContainer: {
    position: 'absolute',
    padding: 2,
    zIndex: 1,
  },
  event: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 6,
    overflow: 'hidden',
    height: 120,
  },
  eventColor: {
    height: 5,
    width: '100%',
  },
  eventContent: {
    flex: 1,
    padding: 8,
  },
  eventTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  eventDetails: {
    marginTop: 4,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  detailIcon: {
    marginRight: 4,
  },
  eventTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  eventLocation: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});