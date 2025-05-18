import React, { createContext, useContext, useState, useEffect } from 'react';
import { format, addDays, addHours } from 'date-fns';
import { EVENT_COLORS } from '@/constants/Colors';

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

type EventsContextType = {
  events: Event[];
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
};

// Generate some sample events
const generateSampleEvents = (): Event[] => {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const nextWeek = addDays(today, 7);
  
  return [
    {
      id: '1',
      title: 'Team Meeting',
      startTime: addHours(today, 10).toISOString(),
      endTime: addHours(today, 11).toISOString(),
      isAllDay: false,
      location: 'Conference Room A',
      color: EVENT_COLORS[0],
      reminderTime: '15 minutes before',
    },
    {
      id: '2',
      title: 'Lunch with Alex',
      startTime: addHours(today, 13).toISOString(),
      endTime: addHours(today, 14).toISOString(),
      isAllDay: false,
      location: 'Cafe Downtown',
      color: EVENT_COLORS[1],
      reminderTime: '30 minutes before',
    },
    {
      id: '3',
      title: 'Project Deadline',
      startTime: tomorrow.toISOString(),
      endTime: tomorrow.toISOString(),
      isAllDay: true,
      notes: 'Submit all deliverables by end of day',
      color: EVENT_COLORS[2],
      reminderTime: '1 day before',
    },
    {
      id: '4',
      title: 'Dentist Appointment',
      startTime: addHours(tomorrow, 15).toISOString(),
      endTime: addHours(tomorrow, 16).toISOString(),
      isAllDay: false,
      location: 'City Dental Clinic',
      color: EVENT_COLORS[3],
      reminderTime: '1 hour before',
    },
    {
      id: '5',
      title: 'Vacation',
      startTime: nextWeek.toISOString(),
      endTime: addDays(nextWeek, 5).toISOString(),
      isAllDay: true,
      location: 'Hawaii',
      notes: 'Flight booking confirmation: #ABC123',
      color: EVENT_COLORS[4],
      reminderTime: '2 days before',
    },
  ];
};

const EventsContext = createContext<EventsContextType>({
  events: [],
  addEvent: () => {},
  updateEvent: () => {},
  deleteEvent: () => {},
});

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>(generateSampleEvents());
  
  const addEvent = (event: Event) => {
    setEvents(prevEvents => [...prevEvents, event]);
  };
  
  const updateEvent = (updatedEvent: Event) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  };
  
  const deleteEvent = (id: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
  };
  
  return (
    <EventsContext.Provider value={{ events, addEvent, updateEvent, deleteEvent }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  return useContext(EventsContext);
}