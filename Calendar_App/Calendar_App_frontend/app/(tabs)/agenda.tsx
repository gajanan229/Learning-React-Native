import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SectionList } from 'react-native';
import { router } from 'expo-router';
import { format, isSameDay, addDays, isToday, isTomorrow } from 'date-fns';
import { Plus } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEvents } from '@/hooks/useEvents';
import Colors from '@/constants/Colors';
import { AgendaEvent } from '@/components/calendar/AgendaEvent';
import { FAB } from '@/components/ui/FAB';
import { NeumorphicView } from '@/components/ui/NeumorphicView';
import { Search } from 'lucide-react-native';

export default function AgendaView() {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme];
  const { events } = useEvents();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Group events by date
  const groupedEvents = React.useMemo(() => {
    // Create date sections for the next 14 days
    const today = new Date();
    const dates = Array.from({ length: 14 }, (_, i) => addDays(today, i));
    
    const sections = dates.map(date => {
      const dateEvents = events.filter(event => 
        isSameDay(new Date(event.startTime), date)
      );
      
      let title = '';
      if (isToday(date)) {
        title = 'Today';
      } else if (isTomorrow(date)) {
        title = 'Tomorrow';
      } else {
        title = format(date, 'EEEE, MMMM d');
      }
      
      return {
        title,
        data: dateEvents,
        date
      };
    });
    
    // Filter out sections with no events
    return sections.filter(section => section.data.length > 0);
  }, [events]);
  
  const renderSectionHeader = ({ section }: { section: { title: string, data: any[], date: Date } }) => {
    return (
      <NeumorphicView style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {section.title}
        </Text>
        <Text style={[styles.sectionDate, { color: colors.subtleText }]}>
          {format(section.date, 'MMM d, yyyy')}
        </Text>
      </NeumorphicView>
    );
  };
  
  const renderItem = ({ item }: { item: any }) => {
    return (
      <AgendaEvent
        event={item}
        onPress={() => router.push({
          pathname: '/event/[id]',
          params: { id: item.id }
        })}
      />
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Agenda</Text>
        <NeumorphicView style={styles.searchBar}>
          <Search size={20} color={colors.subtleText} />
          <Text style={[styles.searchText, { color: colors.subtleText }]}>
            Search events...
          </Text>
        </NeumorphicView>
      </View>
      
      {groupedEvents.length > 0 ? (
        <SectionList
          sections={groupedEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={true}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.subtleText }]}>
            No upcoming events
          </Text>
        </View>
      )}
      
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  searchText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  sectionHeader: {
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 16,
  },
  sectionDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginLeft: 16,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});