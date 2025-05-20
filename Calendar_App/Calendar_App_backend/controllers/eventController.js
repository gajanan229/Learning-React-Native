import * as eventModel from '../models/eventModel.js';

/**
 * Creates a new event for the authenticated user.
 */
export const createEventHandler = async (req, res, next) => {
  try {
    const userId = req.user.id; // From protect middleware
    const {
      title, description, startTime, endTime,
      isAllDay, location, color
    } = req.body;

    // Basic validation
    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields (title, startTime, endTime).' });
    }
    // Add more specific validation for date formats, color format, etc., if needed

    const eventData = {
      userId,
      title,
      description,
      startTime,
      endTime,
      isAllDay,
      location,
      color
    };

    const newEvent = await eventModel.createEvent(eventData);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('[EventController] Error in createEventHandler:', error.message);
    next(error); // Pass to default Express error handler or a subsequent one if defined
  }
};

/**
 * Gets all events for the authenticated user, optionally filtered by date.
 */
export const getUserEventsHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query; // Optional query parameters for date range

    const events = await eventModel.findEventsByUserId(userId, { startDate, endDate });
    res.status(200).json(events);
  } catch (error) {
    console.error('[EventController] Error in getUserEventsHandler:', error.message);
    next(error);
  }
};

/**
 * Gets a specific event by its ID for the authenticated user.
 */
export const getEventByIdHandler = async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    const userId = req.user.id;

    if (isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID format.' });
    }

    const event = await eventModel.findEventByIdAndUserId(eventId, userId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found or not owned by user.' });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error('[EventController] Error in getEventByIdHandler:', error.message);
    next(error);
  }
};

/**
 * Updates an existing event for the authenticated user.
 */
export const updateEventHandler = async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    const userId = req.user.id;
    const updates = req.body; // Contains fields to update

    if (isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID format.' });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No update fields provided.' });
    }

    const updatedEvent = await eventModel.updateEvent(eventId, userId, updates);
    if (!updatedEvent) {
      // This implies either the event was not found, not owned, or the update resulted in no change (and model returned null)
      return res.status(404).json({ message: 'Event not found, not owned by user, or no effective update made.' });
    }
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('[EventController] Error in updateEventHandler:', error.message);
    next(error);
  }
};

/**
 * Deletes an event for the authenticated user.
 */
export const deleteEventHandler = async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    const userId = req.user.id;

    if (isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID format.' });
    }

    const deletedEvent = await eventModel.deleteEvent(eventId, userId);

    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found or not owned by user.' });
    }
    
    // Standard practice is to return 200 with a success message and the deleted object, or 204 No Content.
    res.status(200).json({ message: 'Event deleted successfully.', event: deletedEvent });
    // Or, for 204 No Content (client would not expect a body):
    // res.status(204).send(); 
  } catch (error) {
    console.error('[EventController] Error in deleteEventHandler:', error.message);
    next(error);
  }
}; 