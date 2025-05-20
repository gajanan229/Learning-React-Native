import { create } from 'zustand';
import {
  Event,
  CreateEventPayload,
  UpdateEventPayload,
} from '../services/eventService';
import * as eventService from '../services/eventService';

interface EventState {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  // currentEvent: Event | null; // Optional, can be added if needed for specific UI patterns

  // Actions
  fetchEvents: () => Promise<void>;
  addEvent: (eventData: CreateEventPayload) => Promise<Event | void>; // Returns created event or void
  editEvent: (eventId: string, updates: UpdateEventPayload) => Promise<Event | void>; // Returns updated event or void
  removeEvent: (eventId: string) => Promise<void>;

  // Selectors (can also be implemented directly in components if preferred)
  getEventById: (eventId: string) => Event | undefined;
  // getEventsForDate: (date: Date) => Event[]; // Example, implementation depends on date handling
  // getEventsForMonth: (date: Date) => Event[]; // Example
}

export const useEventStore = create<EventState>((set, get) => ({
  // Initial State
  events: [],
  isLoading: false,
  error: null,
  // currentEvent: null,

  // Actions
  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const fetchedEvents = await eventService.getEventsAPI();
      set({ events: fetchedEvents, isLoading: false });
    } catch (err: any) {
      const errorMessage = (err as Error).message || 'Failed to load events';
      set({ error: errorMessage, isLoading: false });
      // No need to throw here, components can react to the error state
    }
  },

  addEvent: async (eventData) => {
    set({ isLoading: true, error: null });
    try {
      const newEvent = await eventService.createEventAPI(eventData);
      set(state => ({
        events: [...state.events, newEvent],
        isLoading: false,
      }));
      return newEvent;
    } catch (err: any) {
      const errorMessage = (err as Error).message || 'Failed to create event';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage); // Re-throw for UI components to handle if needed for forms
    }
  },

  editEvent: async (eventId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedEvent = await eventService.updateEventAPI(eventId, updates);
      set(state => ({
        events: state.events.map(event =>
          event.id === eventId ? updatedEvent : event
        ),
        isLoading: false,
      }));
      return updatedEvent;
    } catch (err: any) {
      const errorMessage = (err as Error).message || 'Failed to update event';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage); // Re-throw for UI components
    }
  },

  removeEvent: async (eventId) => {
    set({ isLoading: true, error: null });
    try {
      await eventService.deleteEventAPI(eventId);
      set(state => ({
        events: state.events.filter(event => event.id !== eventId),
        isLoading: false,
      }));
    } catch (err: any) {
      const errorMessage = (err as Error).message || 'Failed to delete event';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage); // Re-throw for UI components
    }
  },

  // Selectors
  getEventById: (eventId) => {
    return get().events.find(event => event.id === eventId);
  },

  // Example for getEventsForDate (basic implementation, needs robust date comparison)
  // getEventsForDate: (date) => {
  //   const targetDateString = date.toISOString().split('T')[0];
  //   return get().events.filter(event => event.startTime.startsWith(targetDateString));
  // },
}));

// Optional: For easy debugging in development
if (process.env.NODE_ENV === 'development') {
  // (zustand middleware for devtools if you use Redux DevTools)
  // For example, using persist middleware or a custom logger
} 