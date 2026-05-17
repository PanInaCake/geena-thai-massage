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

export function parseBookingTimeToMinutes(time: string): number | null {
  if (/^\d{2}:\d{2}$/.test(time)) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  const legacy = LEGACY_BOOKING_TIME_MINUTES[time.toLowerCase()];
  return legacy ?? null;
}

export function parseDurationFromPackage(packageSummary: string): number {
  const match = packageSummary.match(/\((\d+)\s*min\)/i);
  return match ? Number(match[1]) : 60;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export type BookingDateTimeRange = {
  startDateTime: string;
  endDateTime: string;
  durationMinutes: number;
};

/** Build local date-time strings for Google Calendar (used with `timeZone`). */
export function getBookingDateTimeRange(
  bookingDate: string,
  bookingTime: string,
  packageSummary: string,
): BookingDateTimeRange {
  const startMinutes = parseBookingTimeToMinutes(bookingTime);
  if (startMinutes === null) {
    throw new Error(`Invalid booking time: ${bookingTime}`);
  }

  const durationMinutes = parseDurationFromPackage(packageSummary);
  const endMinutes = startMinutes + durationMinutes;

  const startHours = Math.floor(startMinutes / 60);
  const startMins = startMinutes % 60;
  const endHours = Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;

  return {
    startDateTime: `${bookingDate}T${pad2(startHours)}:${pad2(startMins)}:00`,
    endDateTime: `${bookingDate}T${pad2(endHours)}:${pad2(endMins)}:00`,
    durationMinutes,
  };
}
