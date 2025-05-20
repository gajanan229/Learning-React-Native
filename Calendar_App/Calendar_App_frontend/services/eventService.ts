import calendarApiClient from './calendarApiClient';

// Matches the structure of an event object from the backend
export interface BackendEvent {
  id: number; // Assuming backend uses numeric IDs
  user_id: number; // Assuming this comes from the backend
  title: string;
  start_time: string; // ISO date string
  end_time: string;   // ISO date string
  is_all_day: boolean;
  location?: string | null;
  notes?: string | null;
  color?: string | null; // Assuming color is optional and nullable from backend
  // reminder_time?: string; // Add if backend supports this
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

// Event type for use within the Zustand store and UI components
// Based on the existing Event type in hooks/useEvents.tsx
export interface Event {
  id: string; // Frontend uses string IDs
  title: string;
  startTime: string; // ISO date string
  endTime: string;   // ISO date string
  isAllDay: boolean;
  location?: string;
  notes?: string;
  color: string; // In UI, color is likely non-optional, defaulting if backend is null
  reminderTime?: string; // From useEvents.tsx, needs consideration for backend integration
  // userId?: string; // Consider if needed directly on the frontend event object
  // createdAt?: string; // Consider if needed
  // updatedAt?: string; // Consider if needed
}

// Payload for creating a new event
// Maps frontend camelCase to backend snake_case where necessary for the API call
export interface CreateEventPayload {
  title: string;
  start_time: string; // Matches backend
  end_time: string;   // Matches backend
  is_all_day?: boolean;
  location?: string;
  notes?: string;
  color?: string;
  // reminder_time?: string; // Add if backend supports this
}

// Payload for updating an existing event
// All fields are optional. Backend fields (snake_case) are used for consistency if mapping.
export type UpdateEventPayload = Partial<{
  title?: string;
  start_time?: string;
  end_time?: string;
  is_all_day?: boolean;
  location?: string;
  notes?: string;
  color?: string;
  // reminder_time?: string; // Add if backend supports this
}>;

// Utility function to map backend event to store/UI event
const mapBackendEventToStoreEvent = (backendEvent: BackendEvent): Event => {
  return {
    id: String(backendEvent.id),
    title: backendEvent.title,
    startTime: backendEvent.start_time,
    endTime: backendEvent.end_time,
    isAllDay: backendEvent.is_all_day,
    location: backendEvent.location || undefined, // Handle null from backend
    notes: backendEvent.notes || undefined,       // Handle null from backend
    color: backendEvent.color || '#007AFF', // Default color if backend sends null/undefined
    // reminderTime: backendEvent.reminder_time || undefined, // Uncomment and adjust if backend has this
    // Consider mapping user_id, created_at, updated_at if needed in the UI Event type
  };
};

/**
 * Fetches all events for the authenticated user.
 */
export const getEventsAPI = async (): Promise<Event[]> => {
  try {
    const response = await calendarApiClient.get<BackendEvent[]>('/events');
    return response.data.map(mapBackendEventToStoreEvent);
  } catch (error) {
    console.error('Error in getEventsAPI:', error);
    // Consider re-throwing a more specific error or handling based on error type
    throw error;
  }
};

/**
 * Fetches a single event by its ID.
 */
export const getEventByIdAPI = async (eventId: string): Promise<Event> => {
    try {
        const response = await calendarApiClient.get<BackendEvent>(`/events/${eventId}`);
        return mapBackendEventToStoreEvent(response.data);
    } catch (error) {
        console.error(`Error in getEventByIdAPI for event ${eventId}:`, error);
        throw error;
    }
};

/**
 * Creates a new event.
 * The payload should already match backend expectations (e.g., snake_case for relevant fields).
 */
export const createEventAPI = async (eventData: CreateEventPayload): Promise<Event> => {
  try {
    // The CreateEventPayload is already defined with snake_case for time fields.
    // If other fields needed mapping, it would be done here or ensured by the payload type.
    const response = await calendarApiClient.post<BackendEvent>('/events', eventData);
    return mapBackendEventToStoreEvent(response.data);
  } catch (error) {
    console.error('Error in createEventAPI:', error);
    throw error;
  }
};

/**
 * Updates an existing event.
 * The updates payload should match backend field name expectations.
 */
export const updateEventAPI = async (eventId: string, updates: UpdateEventPayload): Promise<Event> => {
  try {
    // The UpdateEventPayload is defined with optional snake_case fields.
    // Ensure the payload sent to the backend uses correct field names.
    const response = await calendarApiClient.put<BackendEvent>(`/events/${eventId}`, updates);
    return mapBackendEventToStoreEvent(response.data);
  } catch (error) {
    console.error(`Error in updateEventAPI for event ${eventId}:`, error);
    throw error;
  }
};

/**
 * Deletes an event by its ID.
 */
export const deleteEventAPI = async (eventId: string): Promise<void> => {
  try {
    const response = await calendarApiClient.delete(`/events/${eventId}`);
    // Backend might return 204 No Content or a success message.
    // If it's 204, response.data might be undefined or empty.
    if (response.status === 204) {
      return;
    }
    // If backend sends a JSON response for other success statuses (e.g., { message: "Event deleted" })
    // you might handle response.data here if necessary.
  } catch (error) {
    console.error(`Error in deleteEventAPI for event ${eventId}:`, error);
    throw error;
  }
}; 