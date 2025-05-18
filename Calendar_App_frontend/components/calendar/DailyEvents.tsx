import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { format, isSameDay } from 'date-fns';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEvents } from '@/hooks/useEvents';
import Colors from '@/constants/Colors';
import { NeumorphicView } from '../ui/NeumorphicView';
import { MapPin, Clock } from 'lucide-react-native';

interface DailyEventsProps {
  date: Date;
}

export function DailyEvents({ date }: DailyEventsProps) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme];
  const { events } = useEvents();
  
  // Filter events for the selected date
  const dailyEvents = events.filter(event => 
    isSameDay(new Date(event.startTime), date)
  );
  
  const renderEvent = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        onPress={() => router.push({
          pathname: '/event/[id]',
          params: { id: item.id }
        })}
        activeOpacity={0.7}
        style={styles.eventItem}
      >
        <NeumorphicView style={styles.eventCard}>
          <View style={[styles.eventColor, { backgroundColor: item.color }]} />
          <View style={styles.eventContent}>
            <Text style={[styles.eventTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            
            <View style={styles.eventDetails}>
              {!item.isAllDay && (
                <View style={styles.eventDetail}>
                  <Clock size={14} color={colors.subtleText} style={styles.detailIcon} />
                  <Text style={[styles.eventTime, { color: colors.subtleText }]}>
                    {format(new Date(item.startTime), 'h:mm a')} - {format(new Date(item.endTime), 'h:mm a')}
                  </Text>
                </View>
              )}
              
              {item.isAllDay && (
                <View style={styles.eventDetail}>
                  <Clock size={14} color={colors.subtleText} style={styles.detailIcon} />
                  <Text style={[styles.eventTime, { color: colors.subtleText }]}>
                    All day
                  </Text>
                </View>
              )}
              
              {item.location && (
                <View style={styles.eventDetail}>
                  <MapPin size={14} color={colors.subtleText} style={styles.detailIcon} />
                  <Text 
                    style={[styles.eventLocation, { color: colors.subtleText }]}
                    numberOfLines={1}
                  >
                    {item.location}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </NeumorphicView>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {format(date, 'EEEE, MMMM d')}
      </Text>
      
      {dailyEvents.length > 0 ? (
        <FlatList
          data={dailyEvents}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.eventsList}
        />
      ) : (
        <NeumorphicView style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.subtleText }]}>
            No events for this day
          </Text>
        </NeumorphicView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  eventsList: {
    paddingBottom: 20,
  },
  eventItem: {
    marginBottom: 12,
  },
  eventCard: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderRadius: 8,
    overflow: 'hidden',
  },
  eventColor: {
    width: 6,
    height: '100%',
  },
  eventContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
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
  emptyContainer: {
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
});