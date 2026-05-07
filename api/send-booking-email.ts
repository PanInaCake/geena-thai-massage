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
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const payload = req.body as Partial<BookingEmailPayload>;
  const to = process.env.BOOKING_EMAIL_TO ?? DEFAULT_TO;

  if (!payload?.id || !payload?.name || !payload?.email || !payload?.package || !payload?.booking_date || !payload?.booking_time) {
    return res.status(400).json({ error: "Missing required booking fields" });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    // Still let the booking succeed; just report failure to the client.
    return res.status(500).json({
      error: "SMTP is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.",
    });
  }

  const fromDisplay = process.env.BOOKING_EMAIL_FROM_DISPLAY ?? "Geena Thai Massage";
  const fromEmail = process.env.BOOKING_EMAIL_FROM ?? smtpUser;
  const replyTo = process.env.BOOKING_REPLY_TO ?? payload.email;

  const subject = `New Booking: ${payload.package} - ${payload.booking_date} ${payload.booking_time}`;

  const createdAtLine = payload.created_at
    ? new Date(payload.created_at).toLocaleString()
    : "N/A";

  const notesLine = payload.notes?.trim()
    ? payload.notes.trim()
    : "None";

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
      <h2 style="margin: 0 0 16px 0;">New booking received</h2>

      <table style="border-collapse: collapse; width: 100%; max-width: 680px;">
        <tr>
          <td style="padding: 8px 12px; background: #f9fafb; font-weight: 600; border: 1px solid #e5e7eb;">Booking ID</td>
          <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${escapeHtml(payload.id)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; background: #f9fafb; font-weight: 600; border: 1px solid #e5e7eb;">Customer</td>
          <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${escapeHtml(payload.name)} (${escapeHtml(payload.email)})</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; background: #f9fafb; font-weight: 600; border: 1px solid #e5e7eb;">Package</td>
          <td style="padding: 8px 12px; border: 1px solid #e5e7eb; text-transform: capitalize;">${escapeHtml(payload.package)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; background: #f9fafb; font-weight: 600; border: 1px solid #e5e7eb;">Date</td>
          <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${escapeHtml(payload.booking_date)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; background: #f9fafb; font-weight: 600; border: 1px solid #e5e7eb;">Time</td>
          <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${escapeHtml(payload.booking_time)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; background: #f9fafb; font-weight: 600; border: 1px solid #e5e7eb;">Created At</td>
          <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${escapeHtml(createdAtLine)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; background: #f9fafb; font-weight: 600; border: 1px solid #e5e7eb; vertical-align: top;">Notes</td>
          <td style="padding: 8px 12px; border: 1px solid #e5e7eb; white-space: pre-wrap;">${escapeHtml(notesLine)}</td>
        </tr>
      </table>

      <p style="margin-top: 16px; color: #6b7280;">
        Reply-to: ${escapeHtml(replyTo)}
      </p>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // common convention; allows 465 vs 587
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  try {
    await transporter.sendMail({
      from: `${fromDisplay} <${fromEmail}>`,
      to,
      replyTo,
      subject,
      text: textBody,
      html: htmlBody,
    });
  
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("EMAIL SEND ERROR:", error);
  
    return res.status(500).json({
      error: "Failed to send email",
    });
  }
}

