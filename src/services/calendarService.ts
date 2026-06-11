import { convertCalendarEventsToBlockedSlots, type CalendarEvent } from "@/lib/bookingAvailability";

/**
 * Fetch Google Calendar events for a specific date from the backend API.
 * The backend handles authentication and API calls to Google Calendar.
 */
export async function fetchCalendarEventsForDate(dateStr: string): Promise<CalendarEvent[]> {
  try {
    const response = await fetch(`/api/calendar-events?date=${dateStr}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch calendar events:", response.statusText);
      return [];
    }

    const data = await response.json();
    
    // ADDED: Console log to inspect exactly what is coming back from the Google Calendar API
    console.log(`[Calendar Service] Events received for ${dateStr}:`, data.events);
    
    if (!data.events || !Array.isArray(data.events)) {
      return [];
    }

    return data.events.map((event: any) => {
      // FIX: Extract only the "YYYY-MM-DDTHH:mm:ss" part from the timestamp string (characters 0 to 19).
      // By removing the timezone offset (like +12:00 or Z), the browser parses it as standard "wall-clock" time.
      // This prevents slots from shifting around depending on the user's local device timezone.
      const startLocalStr = typeof event.start === 'string' ? event.start.substring(0, 19) : event.start;
      const endLocalStr = typeof event.end === 'string' ? event.end.substring(0, 19) : event.end;
      
      return {
        start: new Date(startLocalStr),
        end: new Date(endLocalStr),
      };
    });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }
}

/**
 * Get calendar-blocked slots for a date (combines calendar events with blocked slot format).
 */
export async function getCalendarBlockedSlots(dateStr: string) {
  const calendarEvents = await fetchCalendarEventsForDate(dateStr);
  return convertCalendarEventsToBlockedSlots(calendarEvents);
}