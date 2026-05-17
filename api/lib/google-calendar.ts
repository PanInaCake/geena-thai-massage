import { google } from "googleapis";
import { getBookingDateTimeRange } from "./booking-datetime";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";

export type BookingCalendarPayload = {
  id: string;
  name: string;
  email: string;
  package: string;
  booking_date: string;
  booking_time: string;
  notes?: string | null;
};

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
};

function getServiceAccountCredentials(): ServiceAccountCredentials | null {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      const parsed = JSON.parse(json) as ServiceAccountCredentials;
      if (parsed.client_email && parsed.private_key) {
        return parsed;
      }
    } catch {
      return null;
    }
  }

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (clientEmail && privateKey) {
    return { client_email: clientEmail, private_key: privateKey };
  }

  return null;
}

export function isGoogleCalendarConfigured(): boolean {
  return getServiceAccountCredentials() !== null;
}

export async function createBookingCalendarEvent(payload: BookingCalendarPayload): Promise<string> {
  const credentials = getServiceAccountCredentials();
  if (!credentials) {
    throw new Error(
      "Google Calendar is not configured. Set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY.",
    );
  }

  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "geenathaimassage@gmail.com";
  const timeZone = process.env.BOOKING_TIMEZONE ?? "Pacific/Auckland";
  const { startDateTime, endDateTime } = getBookingDateTimeRange(
    payload.booking_date,
    payload.booking_time,
    payload.package,
  );

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [CALENDAR_SCOPE],
  });

  const calendar = google.calendar({ version: "v3", auth });

  const notesBlock = payload.notes?.trim() ? `\n\nNotes:\n${payload.notes.trim()}` : "";

  const response = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: `${payload.name} — ${payload.package}`,
      description: [
        `Booking ID: ${payload.id}`,
        `Customer: ${payload.name}`,
        `Email: ${payload.email}`,
        `Service: ${payload.package}`,
        notesBlock,
      ]
        .filter(Boolean)
        .join("\n"),
      start: {
        dateTime: startDateTime,
        timeZone,
      },
      end: {
        dateTime: endDateTime,
        timeZone,
      },
      extendedProperties: {
        private: {
          bookingId: payload.id,
          source: "geena-thai-massage",
        },
      },
    },
  });

  const eventId = response.data.id;
  if (!eventId) {
    throw new Error("Google Calendar did not return an event id");
  }

  return eventId;
}
