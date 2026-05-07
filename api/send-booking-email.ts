import * as nodemailer from "nodemailer";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const DEFAULT_TO = "geenathaimassage@gmail.com";

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

    console.log("Processed fields:", {
      createdAtLine,
      notesLine,
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
      `Date: ${payload.booking_date}`,
      `Time: ${payload.booking_time}`,
      `Created At: ${createdAtLine}`,
      "",
      "Notes:",
      notesLine,
      "",
      `Reply-To: ${replyTo}`,
    ].join("\n");
    
    const htmlBody = `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #111827; line-height: 1.5;">
        <h2>New booking received</h2>
    
        <p><strong>Booking ID:</strong> ${escapeHtml(payload.id!)}</p>
        <p><strong>Name:</strong> ${escapeHtml(payload.name!)}</p>
        <p><strong>Email:</strong> ${escapeHtml(payload.email!)}</p>
    
        <p><strong>Package:</strong> ${escapeHtml(payload.package!)}</p>
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
    });

    console.log("EMAIL SENT SUCCESSFULLY:", result);

    console.log("=== FUNCTION SUCCESS ===");

    return res.status(200).json({ ok: true });

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
