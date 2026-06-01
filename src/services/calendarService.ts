import { convertCalendarEventsToBlockedSlots, type CalendarEvent } from "@/lib/bookingAvailability";

/**
 * Fetch Google Calendar events for a specific date from the backend API.
 * The backend handles authentication and API calls to Google Calendar.
 */
export async function fetchCalendarEventsForDate(dateStr: string): Promise<CalendarEvent[]> {
  try {
    const response = await fetch("/api/calendar-events", {
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
    
    // Filter events for the selected date
    const selectedDate = new Date(dateStr);
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    
    return (data.events || [])
      .filter((event: any) => {
        const eventDate = new Date(event.start).toISOString().split('T')[0];
        return eventDate === selectedDateStr;
      })
      .map((event: any) => ({
        start: new Date(event.start),
        end: new Date(event.end),
      }));
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
