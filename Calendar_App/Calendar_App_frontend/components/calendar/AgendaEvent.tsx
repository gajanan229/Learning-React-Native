import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { format } from 'date-fns';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { NeumorphicView } from '../ui/NeumorphicView';
import { Event } from '@/hooks/useEvents';
import { MapPin, Clock } from 'lucide-react-native';

interface AgendaEventProps {
  event: Event;
  onPress: () => void;
}

export function AgendaEvent({ event, onPress }: AgendaEventProps) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme];
  
  return (
    <TouchableOpacity
      style={styles.eventContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <NeumorphicView style={styles.eventCard}>
        <View style={[styles.eventColor, { backgroundColor: event.color }]} />
        <View style={styles.eventContent}>
          <Text style={[styles.eventTitle, { color: colors.text }]}>
            {event.title}
          </Text>
          
          <View style={styles.eventDetails}>
            {!event.isAllDay && (
              <View style={styles.eventDetail}>
                <Clock size={14} color={colors.subtleText} style={styles.detailIcon} />
                <Text style={[styles.eventTime, { color: colors.subtleText }]}>
                  {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
                </Text>
              </View>
            )}
            
            {event.isAllDay && (
              <View style={styles.eventDetail}>
                <Clock size={14} color={colors.subtleText} style={styles.detailIcon} />
                <Text style={[styles.eventTime, { color: colors.subtleText }]}>
                  All day
                </Text>
              </View>
            )}
            
            {event.location && (
              <View style={styles.eventDetail}>
                <MapPin size={14} color={colors.subtleText} style={styles.detailIcon} />
                <Text 
                  style={[styles.eventLocation, { color: colors.subtleText }]}
                  numberOfLines={1}
                >
                  {event.location}
                </Text>
              </View>
            )}
          </View>
        </View>
      </NeumorphicView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  eventContainer: {
    marginBottom: 12,
  },
  eventCard: {
    flexDirection: 'row',
    paddingVertical: 1,
    paddingHorizontal: 0,
    borderRadius: 8,
    overflow: 'hidden',
    height: 120,
  },
  eventColor: {
    height: 6,
    width: '100%',
  },
  eventContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 6,
  },
  eventDetails: {
    flexDirection: 'column',
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailIcon: {
    marginRight: 6,
  },
  eventTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  eventLocation: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});