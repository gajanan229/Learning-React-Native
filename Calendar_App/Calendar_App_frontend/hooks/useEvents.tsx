import React, { createContext, useContext, useState, useEffect } from 'react';
import { format, addDays, addHours } from 'date-fns';
import { EVENT_COLORS } from '@/constants/Colors';
import { useEventStore } from '../store/useEventStore'; // Import the Zustand store hook

export type Event = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  location?: string;
  notes?: string;
  color: string;
  reminderTime?: string;
};

// Remove the context type as we are using Zustand store
// type EventsContextType = {
//   events: Event[];
//   addEvent: (event: Event) => void;
//   updateEvent: (event: Event) => void;
//   deleteEvent: (id: string) => void;
// };

// Remove sample events generation
// const generateSampleEvents = (): Event[] => {
// ... existing code ...
// };

// Remove the context creation
// const EventsContext = createContext<EventsContextType>({
//   events: generateSampleEvents(),
//   addEvent: () => {},
//   updateEvent: () => {},
//   deleteEvent: () => {},
// });

// Remove the EventsProvider component
// export function EventsProvider({ children }: { children: React.ReactNode }) {
// ... existing code ...
// }

export function useEvents() {
  // Get state and actions from the Zustand store
  const { events, fetchEvents, addEvent, editEvent, removeEvent } = useEventStore();

  // Fetch events when the component mounts
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]); // Depend on fetchEvents to re-run if the function reference changes
  
  // Return the events state and the actions from the store
  return { events, addEvent, editEvent, removeEvent };
  // return useContext(EventsContext);
}