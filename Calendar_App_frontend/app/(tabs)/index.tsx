import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay, addMonths, subMonths } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEvents } from '@/hooks/useEvents';
import Colors from '@/constants/Colors';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { NeumorphicView } from '@/components/ui/NeumorphicView';
import { EventIndicator } from '@/components/calendar/EventIndicator';
import { FAB } from '@/components/ui/FAB';
import { DailyEvents } from '@/components/calendar/DailyEvents';
import { WEEKDAYS } from '@/constants/Calendar';

export default function MonthView() {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme];
  const { events } = useEvents();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const opacity = useSharedValue(1);
  
  const goToPreviousMonth = useCallback(() => {
    opacity.value = withTiming(0, { duration: 150 });
    setTimeout(() => {
      setCurrentDate(prev => subMonths(prev, 1));
      opacity.value = withTiming(1, { duration: 150 });
    }, 150);
  }, []);

  const goToNextMonth = useCallback(() => {
    opacity.value = withTiming(0, { duration: 150 });
    setTimeout(() => {
      setCurrentDate(prev => addMonths(prev, 1));
      opacity.value = withTiming(1, { duration: 150 });
    }, 150);
  }, []);

  const goToToday = useCallback(() => {
    opacity.value = withTiming(0, { duration: 150 });
    setTimeout(() => {
      setCurrentDate(new Date());
      setSelectedDate(new Date());
      opacity.value = withTiming(1, { duration: 150 });
    }, 150);
  }, []);

  const handleDatePress = (date: Date) => {
    setSelectedDate(date);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const renderCalendarDay = ({ item: date }: { item: Date }) => {
    const isToday = isSameDay(date, new Date());
    const isSelected = isSameDay(date, selectedDate);
    const isCurrentMonth = isSameMonth(date, currentDate);
    
    // Get events for this date
    const dateEvents = events.filter(event => isSameDay(new Date(event.startTime), date));
    
    return (
      <TouchableOpacity
        style={[
          styles.dayCell,
          !isCurrentMonth && styles.outsideMonthDay,
        ]}
        onPress={() => handleDatePress(date)}
        activeOpacity={0.7}
      >
        <NeumorphicView 
          style={[
            styles.dayCellInner,
            isToday && styles.todayCell,
            isSelected && styles.selectedCell,
            !isCurrentMonth && styles.outsideMonthCell,
          ]}
          lightShadowColor={isSelected ? colors.accentLight : undefined}
          darkShadowColor={isSelected ? colors.accentDark : undefined}
          isPressed={isSelected}
        >
          <Text style={[
            styles.dayText,
            isCurrentMonth ? styles.currentMonthText : styles.otherMonthText,
            isToday && styles.todayText,
            isSelected && styles.selectedText,
          ]}>
            {format(date, 'd')}
          </Text>
          
          <View style={styles.eventIndicators}>
            {dateEvents.slice(0, 3).map((event, index) => (
              <EventIndicator key={index} color={event.color} />
            ))}
            {dateEvents.length > 3 && (
              <Text style={styles.moreEventsText}>+{dateEvents.length - 3}</Text>
            )}
          </View>
        </NeumorphicView>
      </TouchableOpacity>
    );
  };

  // Generate the days to display
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  
  // Get the first day of the grid (can be from the previous month)
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(firstDayOfMonth.getDate() - getDay(firstDayOfMonth));
  
  // Ensure we always have 6 weeks displayed
  const endDate = new Date(lastDayOfMonth);
  const daysToAdd = 42 - eachDayOfInterval({ start: startDate, end: lastDayOfMonth }).length;
  endDate.setDate(lastDayOfMonth.getDate() + daysToAdd);
  
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CalendarHeader
        title={format(currentDate, 'MMMM yyyy')}
        onPrevious={goToPreviousMonth}
        onNext={goToNextMonth}
        onToday={goToToday}
      />
      
      <Animated.View style={[styles.calendarContainer, animatedStyle]}>
        <View style={styles.weekdayHeader}>
          {WEEKDAYS.map((day, index) => (
            <Text key={index} style={[styles.weekdayText, { color: colors.subtleText }]}>
              {day}
            </Text>
          ))}
        </View>
        
        <FlatList
          data={allDays}
          renderItem={renderCalendarDay}
          keyExtractor={(item) => item.toISOString()}
          numColumns={7}
          scrollEnabled={false}
        />
      </Animated.View>
      
      <DailyEvents date={selectedDate} />
      
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
  calendarContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    margin: 1,
  },
  dayCellInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 2,
  },
  dayText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  currentMonthText: {
    color: '#FFFFFF',
  },
  otherMonthText: {
    color: '#666666',
  },
  todayCell: {
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  todayText: {
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
  },
  selectedCell: {
    backgroundColor: '#1E293B',
  },
  selectedText: {
    color: '#3B82F6',
    fontFamily: 'Inter-SemiBold',
  },
  outsideMonthDay: {
    opacity: 0.5,
  },
  outsideMonthCell: {
    backgroundColor: 'transparent',
  },
  eventIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 2,
  },
  moreEventsText: {
    fontSize: 8,
    color: '#999999',
    marginLeft: 2,
  },
});