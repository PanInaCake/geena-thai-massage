import * as nodemailer from "nodemailer";
import { google } from "googleapis";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const DEFAULT_TO = "geenathaimassage@gmail.com";
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";

const LEGACY_BOOKING_TIME_MINUTES: Record<string, number> = {
  "9am": 9 * 60,
  "10am": 10 * 60,
  "11am": 11 * 60,
  "12pm": 12 * 60,
  "1pm": 13 * 60,
  "2pm": 14 * 60,
  "3pm": 15 * 60,
  "4pm": 16 * 60,
  "5pm": 17 * 60,
};

function parseBookingTimeToMinutes(time: string): number | null {
  if (/^\d{2}:\d{2}$/.test(time)) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }
  const legacy = LEGACY_BOOKING_TIME_MINUTES[time.toLowerCase()];
  return legacy ?? null;
}

function parseDurationFromPackage(packageSummary: string): number {
  const match = packageSummary.match(/\((\d+)\s*min\)/i);
  return match ? Number(match[1]) : 60;
}

function getBookingDateTimeRange(bookingDate: string, bookingTime: string, packageSummary: string) {
  const startMinutes = parseBookingTimeToMinutes(bookingTime);
  if (startMinutes === null) {
    throw new Error(`Invalid booking time: ${bookingTime}`);
  }
  const durationMinutes = parseDurationFromPackage(packageSummary);
  const endMinutes = startMinutes + durationMinutes;
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const startHours = Math.floor(startMinutes / 60);
  const startMins = startMinutes % 60;
  const endHours = Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;
  return {
    startDateTime: `${bookingDate}T${pad2(startHours)}:${pad2(startMins)}:00`,
    endDateTime: `${bookingDate}T${pad2(endHours)}:${pad2(endMins)}:00`,
  };
}

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

function isGoogleCalendarConfigured(): boolean {
  return getServiceAccountCredentials() !== null;
}

async function createBookingCalendarEvent(payload: {
  id: string;
  name: string;
  email: string;
  package: string;
  booking_date: string;
  booking_time: string;
  notes?: string | null;
}): Promise<string> {
  const credentials = getServiceAccountCredentials();
  if (!credentials) {
    throw new Error("Google Calendar is not configured.");
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
      start: { dateTime: startDateTime, timeZone },
      end: { dateTime: endDateTime, timeZone },
      extendedProperties: {
        private: { bookingId: payload.id, source: "geena-thai-massage" },
      },
    },
  });

  const eventId = response.data.id;
  if (!eventId) throw new Error("Google Calendar did not return an event id");
  return eventId;
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

type BookingEmailPayload = {
  id: string;
  name: string;
  email: string;
  package: string;
  booking_date: string; // yyyy-MM-dd
  booking_time: string; // e.g. 9am
  created_at?: string;
  notes?: string | null;
  package_price?: string | null;
  receipt_base64?: string | null;
  receipt_filename?: string | null;
  receipt_content_type?: string | null;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("=== BOOKING EMAIL FUNCTION START ===");

  try {
    console.log("Request method:", req.method);

    if (req.method !== "POST") {
      console.log("Invalid method");
      return res.status(405).end();
    }

    console.log("Raw body:", req.body);

    const payload = req.body as Partial<BookingEmailPayload>;
    const to = process.env.BOOKING_EMAIL_TO ?? DEFAULT_TO;

    console.log("Parsed payload:", payload);
    console.log("Email will be sent to:", to);

    if (
      !payload?.id ||
      !payload?.name ||
      !payload?.email ||
      !payload?.package ||
      !payload?.booking_date ||
      !payload?.booking_time
    ) {
      console.log("Missing required fields");
      return res.status(400).json({ error: "Missing required booking fields" });
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPortRaw = process.env.SMTP_PORT;
    const smtpPort = smtpPortRaw ? Number(smtpPortRaw) : undefined;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    console.log("ENV VARIABLES CHECK:", {
      smtpHost,
      smtpPortRaw,
      smtpPortParsed: smtpPort,
      smtpUserExists: !!smtpUser,
      smtpPassExists: !!smtpPass,
    });

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      console.log("SMTP CONFIG MISSING");
      return res.status(500).json({
        error: "SMTP is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.",
      });
    }

    const fromDisplay = process.env.BOOKING_EMAIL_FROM_DISPLAY ?? "Geena Thai Massage";
    const fromEmail = process.env.BOOKING_EMAIL_FROM ?? smtpUser;
    const replyTo = process.env.BOOKING_REPLY_TO ?? payload.email;

    console.log("Email meta:", {
      fromDisplay,
      fromEmail,
      replyTo,
    });

    const subject = `New Booking: ${payload.package} - ${payload.booking_date} ${payload.booking_time}`;

    console.log("Subject:", subject);

    const createdAtLine = payload.created_at
      ? new Date(payload.created_at).toLocaleString()
      : "N/A";

    const notesLine = payload.notes?.trim()
      ? payload.notes.trim()
      : "None";

    const priceLine = payload.package_price?.trim() ? payload.package_price.trim() : "Not provided";

    const emailAttachments: { filename: string; content: Buffer; contentType?: string }[] = [];
    if (payload.receipt_base64?.trim()) {
      try {
        emailAttachments.push({
          filename: payload.receipt_filename?.trim() || "payment-receipt.jpg",
          content: Buffer.from(payload.receipt_base64, "base64"),
          contentType: payload.receipt_content_type?.trim() || "image/jpeg",
        });
      } catch (attachErr) {
        console.error("Failed to decode receipt attachment:", attachErr);
      }
    }

    console.log("Processed fields:", {
      createdAtLine,
      notesLine,
      priceLine,
      hasReceiptAttachment: emailAttachments.length > 0,
    });

    console.log("Creating transporter...");

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    console.log("Transporter created");

    console.log("Verifying SMTP connection...");

    await transporter.verify();

    console.log("SMTP VERIFIED SUCCESSFULLY");

    console.log("Sending email...");

    const textBody = [
      "New booking received",
      "",
      `Booking ID: ${payload.id}`,
      `Customer Name: ${payload.name}`,
      `Customer Email: ${payload.email}`,
      "",
      `Package: ${payload.package}`,
      `Price: ${priceLine}`,
      `Date: ${payload.booking_date}`,
      `Time: ${payload.booking_time}`,
      `Created At: ${createdAtLine}`,
      "",
      "Notes:",
      notesLine,
      "",
      `Reply-To: ${replyTo}`,
      "",
      emailAttachments.length > 0 ? "Payment receipt is attached to this email." : "No payment receipt was attached.",
    ].join("\n");
    
    const htmlBody = `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #111827; line-height: 1.5;">
        <h2>New booking received</h2>
    
        <p><strong>Booking ID:</strong> ${escapeHtml(payload.id!)}</p>
        <p><strong>Name:</strong> ${escapeHtml(payload.name!)}</p>
        <p><strong>Email:</strong> ${escapeHtml(payload.email!)}</p>
    
        <p><strong>Package:</strong> ${escapeHtml(payload.package!)}</p>
        <p><strong>Price:</strong> ${escapeHtml(priceLine)}</p>
        <p><strong>Date:</strong> ${escapeHtml(payload.booking_date!)}</p>
        <p><strong>Time:</strong> ${escapeHtml(payload.booking_time!)}</p>
        <p><strong>Created At:</strong> ${escapeHtml(createdAtLine)}</p>
    
        <p><strong>Notes:</strong><br/>${escapeHtml(notesLine)}</p>
    
        <p style="margin-top: 16px; color: #6b7280;">
          Reply-to: ${escapeHtml(replyTo)}
        </p>
      </div>
    `;

    const result = await transporter.sendMail({
      from: `${fromDisplay} <${fromEmail}>`,
      to,
      replyTo,
      subject,
      text: textBody,
      html: htmlBody,
      attachments: emailAttachments,
    });

    console.log("EMAIL SENT SUCCESSFULLY:", result);

    let calendarEventId: string | null = null;
    let calendarSkipped = false;
    let calendarError: string | null = null;

    if (isGoogleCalendarConfigured()) {
      try {
        console.log("Creating Google Calendar event...");
        calendarEventId = await createBookingCalendarEvent({
          id: payload.id!,
          name: payload.name!,
          email: payload.email!,
          package: payload.package!,
          booking_date: payload.booking_date!,
          booking_time: payload.booking_time!,
          notes: payload.notes,
        });
        console.log("Google Calendar event created:", calendarEventId);
      } catch (calendarErr) {
        calendarError =
          calendarErr instanceof Error ? calendarErr.message : "Failed to create calendar event";
        console.error("Google Calendar error:", calendarErr);
      }
    } else {
      calendarSkipped = true;
      console.log("Google Calendar skipped (not configured)");
    }

    console.log("=== FUNCTION SUCCESS ===");

    return res.status(200).json({
      ok: true,
      email: true,
      calendar: calendarEventId
        ? { created: true, eventId: calendarEventId }
        : calendarSkipped
          ? { created: false, skipped: true }
          : { created: false, error: calendarError },
    });

  } catch (error) {
    console.error("=== FUNCTION ERROR ===");
    console.error("FULL ERROR OBJECT:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Stack:", error.stack);
    }

    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to send email",
    });
  }
}
