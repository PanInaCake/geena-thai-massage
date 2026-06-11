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
    console.log(`[Calendar Service] Events received for ${dateStr}:`, data.events);
    
    if (!data.events || !Array.isArray(data.events)) {
      return [];
    }

    return data.events.map((event: any) => {
      const startStr = typeof event.start === 'string' ? event.start : '';
      const endStr = typeof event.end === 'string' ? event.end : '';

      // Extract literal year, month, day, hour, and minute straight from the string text
      const startMatch = startStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
      const endMatch = endStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);

      if (startMatch && endMatch) {
        const [_, sy, sm, sd, sh, smin] = startMatch.map(Number);
        const [_, ey, em, ed, eh, emin] = endMatch.map(Number);

        // Build Date objects using explicit wall-clock values.
        // This guarantees .getHours() returns exactly what Google Calendar says,
        // eliminating any client device timezone or seasonal DST discrepancies.
        return {
          start: new Date(sy, sm - 1, sd, sh, smin),
          end: new Date(ey, em - 1, ed, eh, emin),
        };
      }

      // Fallback if the string formatting deviates
      return {
        start: new Date(event.start),
        end: new Date(event.end),
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