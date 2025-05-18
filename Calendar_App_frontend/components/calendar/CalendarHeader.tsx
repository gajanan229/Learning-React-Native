import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { NeumorphicView } from '../ui/NeumorphicView';

interface CalendarHeaderProps {
  title: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarHeader({ title, onPrevious, onNext, onToday }: CalendarHeaderProps) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme];
  
  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      
      <View style={styles.controls}>
        <TouchableOpacity onPress={onToday} style={styles.todayButton}>
          <NeumorphicView style={styles.todayButtonInner}>
            <Text style={[styles.todayText, { color: colors.accent }]}>
              Today
            </Text>
          </NeumorphicView>
        </TouchableOpacity>
        
        <View style={styles.navButtons}>
          <TouchableOpacity onPress={onPrevious} style={styles.navButton}>
            <NeumorphicView style={styles.navButtonInner}>
              <ChevronLeft size={20} color={colors.text} />
            </NeumorphicView>
          </TouchableOpacity>
          
          <View style={styles.navSeparator} />
          
          <TouchableOpacity onPress={onNext} style={styles.navButton}>
            <NeumorphicView style={styles.navButtonInner}>
              <ChevronRight size={20} color={colors.text} />
            </NeumorphicView>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayButton: {
    marginRight: 12,
  },
  todayButtonInner: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  todayText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    overflow: 'hidden',
  },
  navButton: {
    width: 36,
    height: 36,
  },
  navButtonInner: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  navSeparator: {
    width: 1,
    height: 20,
    backgroundColor: '#333333',
  },
});