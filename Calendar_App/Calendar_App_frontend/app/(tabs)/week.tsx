import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, getHours, getMinutes } from 'date-fns';
import { Plus } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEvents } from '@/hooks/useEvents';
import Colors from '@/constants/Colors';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { WeekViewEvent } from '@/components/calendar/WeekViewEvent';
import { NeumorphicView } from '@/components/ui/NeumorphicView';
import { FAB } from '@/components/ui/FAB';
import { HOURS } from '@/constants/Calendar';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 60) / 7;

export default function WeekView() {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme];
  const { events } = useEvents();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const scrollViewRef = useRef<ScrollView>(null);
  const opacity = useSharedValue(1);
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const goToPreviousWeek = () => {
    opacity.value = withTiming(0, { duration: 150 });
    setTimeout(() => {
      setCurrentDate(prev => subWeeks(prev, 1));
      opacity.value = withTiming(1, { duration: 150 });
    }, 150);
  };

  const goToNextWeek = () => {
    opacity.value = withTiming(0, { duration: 150 });
    setTimeout(() => {
      setCurrentDate(prev => addWeeks(prev, 1));
      opacity.value = withTiming(1, { duration: 150 });
    }, 150);
  };

  const goToToday = () => {
    opacity.value = withTiming(0, { duration: 150 });
    setTimeout(() => {
      setCurrentDate(new Date());
      opacity.value = withTiming(1, { duration: 150 });
      
      // Scroll to current time
      const currentHour = getHours(new Date());
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, (currentHour - 2) * 60),
        animated: true,
      });
    }, 150);
  };

  React.useEffect(() => {
    // Scroll to current time on initial render
    setTimeout(() => {
      const currentHour = getHours(new Date());
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, (currentHour - 2) * 60),
        animated: true,
      });
    }, 500);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const handleTimePress = (day: Date, hour: number) => {
    const newDate = new Date(day);
    newDate.setHours(hour, 0, 0, 0);
    
    router.push({
      pathname: '/event/create',
      params: {
        startTime: newDate.toISOString(),
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CalendarHeader
        title={`${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`}
        onPrevious={goToPreviousWeek}
        onNext={goToNextWeek}
        onToday={goToToday}
      />
      
      <View style={styles.weekdayHeader}>
        <View style={styles.timeColumn} />
        {days.map((day, index) => {
          const isToday = isSameDay(day, new Date());
          return (
            <NeumorphicView
              key={index}
              style={[
                styles.dayColumn,
                { width: COLUMN_WIDTH },
                isToday && styles.todayColumn
              ]}
              isPressed={isToday}
            >
              <Text style={[styles.dayText, { color: colors.text }]}>
                {format(day, 'EEE')}
              </Text>
              <Text 
                style={[
                  styles.dateText, 
                  { color: isToday ? colors.accent : colors.text }
                ]}
              >
                {format(day, 'd')}
              </Text>
            </NeumorphicView>
          );
        })}
      </View>
      
      <ScrollView ref={scrollViewRef} style={styles.timelineScrollView}>
        <Animated.View style={[styles.timelineContainer, animatedStyle]}>
          {HOURS.map((hour, hourIndex) => (
            <View key={hourIndex} style={styles.hourRow}>
              <View style={styles.timeColumn}>
                <Text style={[styles.hourText, { color: colors.subtleText }]}>
                  {hour}
                </Text>
              </View>
              
              {days.map((day, dayIndex) => (
                <TouchableOpacity
                  key={dayIndex}
                  style={[
                    styles.timeCell,
                    { width: COLUMN_WIDTH }
                  ]}
                  onPress={() => handleTimePress(day, hourIndex)}
                  activeOpacity={0.7}
                >
                  <View style={styles.hourDivider} />
                </TouchableOpacity>
              ))}
            </View>
          ))}
          
          {/* Render events */}
          {events.map((event, index) => {
            const eventDate = new Date(event.startTime);
            const eventEndDate = new Date(event.endTime);
            
            // Check if event is in the current week
            if (
              eventDate >= weekStart && 
              eventDate <= weekEnd
            ) {
              const dayIndex = days.findIndex(day => 
                isSameDay(day, eventDate)
              );
              
              if (dayIndex !== -1) {
                const startHour = getHours(eventDate) + getMinutes(eventDate) / 60;
                const endHour = getHours(eventEndDate) + getMinutes(eventEndDate) / 60;
                const duration = endHour - startHour;
                
                return (
                  <WeekViewEvent
                    key={index}
                    event={event}
                    left={60 + dayIndex * COLUMN_WIDTH}
                    top={startHour * 60}
                    width={COLUMN_WIDTH}
                    height={duration * 60}
                    onPress={() => router.push({
                      pathname: '/event/[id]',
                      params: { id: event.id }
                    })}
                  />
                );
              }
            }
            return null;
          })}
          
        </Animated.View>
      </ScrollView>
      
      <FAB
        icon={<Plus size={24} color="#FFF" />}
        onPress={() => router.push('/event/create')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  weekdayHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  timeColumn: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  todayColumn: {
    backgroundColor: '#1E293B',
  },
  dayText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginTop: 2,
  },
  timelineScrollView: {
    flex: 1,
  },
  timelineContainer: {
    paddingBottom: 20,
  },
  hourRow: {
    flexDirection: 'row',
    height: 60,
  },
  hourText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  timeCell: {
    height: 60,
    borderLeftWidth: 1,
    borderLeftColor: '#333333',
  },
  hourDivider: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#333333',
  },
});