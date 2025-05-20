import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { format } from 'date-fns';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { NeumorphicView } from '../ui/NeumorphicView';
import { Event } from '@/hooks/useEvents';

interface WeekViewEventProps {
  event: Event;
  top: number;
  left: number;
  width: number;
  height: number;
  onPress: () => void;
}

export function WeekViewEvent({ 
  event, 
  top, 
  left, 
  width, 
  height, 
  onPress 
}: WeekViewEventProps) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme];
  
  // Calculate if event is too small to show full content
  const isCompact = height < 40;
  
  return (
    <TouchableOpacity
      style={[
        styles.eventContainer,
        {
          top,
          left,
          width: width - 2,
          height: Math.max(25, height),
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <NeumorphicView
        style={[
          styles.event,
          { backgroundColor: event.color }
        ]}
      >
        {isCompact ? (
          <Text 
            style={styles.eventTitleCompact}
            numberOfLines={1}
          >
            {event.title}
          </Text>
        ) : (
          <>
            <Text 
              style={styles.eventTitle}
              numberOfLines={1}
            >
              {event.title}
            </Text>
            
            <Text 
              style={styles.eventTime}
              numberOfLines={1}
            >
              {format(new Date(event.startTime), 'h:mm a')}
            </Text>
          </>
        )}
      </NeumorphicView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  eventContainer: {
    position: 'absolute',
    padding: 1,
    zIndex: 1,
  },
  event: {
    flex: 1,
    padding: 4,
    borderRadius: 4,
    overflow: 'hidden',
    opacity: 0.9,
  },
  eventTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  eventTitleCompact: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
  eventTime: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    opacity: 0.8,
  },
});