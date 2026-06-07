import { google } from "googleapis";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";

type ServiceAccountCredentials = { client_email: string; private_key: string };

function getServiceAccountCredentials(): ServiceAccountCredentials | null {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      const parsed = JSON.parse(json) as ServiceAccountCredentials;
      if (parsed.client_email && parsed.private_key) return parsed;
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

async function fetchCalendarEvents(dateStr: string): Promise<Array<{ start: string; end: string }>> {
  const credentials = getServiceAccountCredentials();
  if (!credentials) {
    console.warn("Google Calendar not configured, returning empty events");
    return [];
  }

  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "geenathaimassage@gmail.com";
  const timeZone = process.env.BOOKING_TIMEZONE ?? "Pacific/Auckland";

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [CALENDAR_SCOPE],
  });

  const calendar = google.calendar({ version: "v3", auth });

  try {
    // Parse the date string (yyyy-MM-dd) and set time bounds for that day
    const [year, month, day] = dateStr.split("-").map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59);

    const response = await calendar.events.list({
      calendarId,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      timeZone,
    });

    const events = response.data.items ?? [];

    // Filter out declined events and all-day events, return only time-bounded events
    return events
      .filter(
        (event) =>
          event.start?.dateTime && // Must have a specific time (not all-day)
          event.end?.dateTime && // Must have an end time
          (!event.organizer?.self || event.status !== "declined") // Exclude declined events
      )
      .map((event) => ({
        start: event.start!.dateTime!,
        end: event.end!.dateTime!,
      }));
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Get date from query parameter (format: yyyy-MM-dd)
    const { date } = req.query;
    if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: "Invalid date format. Use yyyy-MM-dd" });
    }

    const events = await fetchCalendarEvents(date);

    return res.status(200).json({ events, date });
  } catch (error) {
    console.error("Calendar events API error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch calendar events",
    });
  }
}
