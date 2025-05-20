import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { format, addDays, subDays, isSameDay, getHours, getMinutes } from 'date-fns';
import { Plus } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEvents } from '@/hooks/useEvents';
import Colors from '@/constants/Colors';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { DayViewEvent } from '@/components/calendar/DayViewEvent';
import { FAB } from '@/components/ui/FAB';
import { HOURS } from '@/constants/Calendar';

export default function DayView() {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme];
  const { events } = useEvents();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const scrollViewRef = useRef<ScrollView>(null);
  const opacity = useSharedValue(1);

  const goToPreviousDay = () => {
    opacity.value = withTiming(0, { duration: 150 });
    setTimeout(() => {
      setCurrentDate(prev => subDays(prev, 1));
      opacity.value = withTiming(1, { duration: 150 });
    }, 150);
  };

  const goToNextDay = () => {
    opacity.value = withTiming(0, { duration: 150 });
    setTimeout(() => {
      setCurrentDate(prev => addDays(prev, 1));
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

  const handleTimePress = (hour: number) => {
    const newDate = new Date(currentDate);
    newDate.setHours(hour, 0, 0, 0);
    
    router.push({
      pathname: '/event/create',
      params: {
        startTime: newDate.toISOString(),
      }
    });
  };

  // Filter events for the current day
  const dayEvents = events.filter(event => 
    isSameDay(new Date(event.startTime), currentDate)
  );

  const isToday = isSameDay(currentDate, new Date());

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CalendarHeader
        title={format(currentDate, 'EEEE, MMMM d, yyyy')}
        onPrevious={goToPreviousDay}
        onNext={goToNextDay}
        onToday={goToToday}
      />
      
      <View style={styles.dayHeader}>
        <Text style={[
          styles.dayText, 
          { color: isToday ? colors.accent : colors.text }
        ]}>
          {isToday ? 'Today' : format(currentDate, 'EEEE')}
        </Text>
      </View>
      
      <ScrollView ref={scrollViewRef} style={styles.timelineScrollView}>
        <Animated.View style={[styles.timelineContainer, animatedStyle]}>
          {HOURS.map((hour, hourIndex) => (
            <TouchableOpacity
              key={hourIndex}
              style={styles.hourRow}
              onPress={() => handleTimePress(hourIndex)}
              activeOpacity={0.7}
            >
              <View style={styles.timeColumn}>
                <Text style={[styles.hourText, { color: colors.subtleText }]}>
                  {hour}
                </Text>
              </View>
              
              <View style={styles.timeCell}>
                <View style={styles.hourDivider} />
              </View>
            </TouchableOpacity>
          ))}
          
          {/* Render events */}
          {dayEvents.map((event, index) => {
            const eventDate = new Date(event.startTime);
            const eventEndDate = new Date(event.endTime);
            
            const startHour = getHours(eventDate) + getMinutes(eventDate) / 60;
            const endHour = getHours(eventEndDate) + getMinutes(eventEndDate) / 60;
            const duration = endHour - startHour;
            
            return (
              <DayViewEvent
                key={index}
                event={event}
                top={startHour * 60}
                height={duration * 60}
                onPress={() => router.push({
                  pathname: '/event/[id]',
                  params: { id: event.id }
                })}
              />
            );
          })}
          
          {/* Current time indicator (only show for today) */}
          {isToday && (
            <View style={[
              styles.currentTimeIndicator,
              { 
                top: (getHours(new Date()) + getMinutes(new Date()) / 60) * 60,
                backgroundColor: colors.accent 
              }
            ]}>
              <View style={[styles.currentTimeDot, { backgroundColor: colors.accent }]} />
            </View>
          )}
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
  dayHeader: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  timelineScrollView: {
    flex: 1,
  },
  timelineContainer: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  hourRow: {
    flexDirection: 'row',
    height: 60,
  },
  timeColumn: {
    width: 60,
    alignItems: 'center',
    paddingTop: 8,
  },
  hourText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  timeCell: {
    flex: 1,
    height: 60,
  },
  hourDivider: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#333333',
  },
  currentTimeIndicator: {
    position: 'absolute',
    left: 60,
    right: 0,
    height: 2,
    zIndex: 1,
  },
  currentTimeDot: {
    position: 'absolute',
    left: -8,
    top: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});