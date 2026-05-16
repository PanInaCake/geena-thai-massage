import { format, parse } from "date-fns";

export const BOOKING_OPEN_MINUTES = 9 * 60; // 9:00 AM
export const BOOKING_CLOSE_MINUTES = 17 * 60; // 5:00 PM
export const TIME_SLOT_INCREMENT_MINUTES = 15;

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

export type ExistingBooking = {
  booking_time: string;
  package: string;
};

export function buildAllowedTimeSlots(): [string, ...string[]] {
  const slots: string[] = [];
  for (
    let minutes = BOOKING_OPEN_MINUTES;
    minutes <= BOOKING_CLOSE_MINUTES;
    minutes += TIME_SLOT_INCREMENT_MINUTES
  ) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
  }
  return slots as [string, ...string[]];
}

export const ALLOWED_TIME_SLOTS = buildAllowedTimeSlots();

export function formatTimeSlotLabel(slot: string): string {
  return format(parse(slot, "HH:mm", new Date()), "h:mm a");
}

export function parseBookingTimeToMinutes(time: string): number | null {
  if (/^\d{2}:\d{2}$/.test(time)) {
    const parsed = parse(time, "HH:mm", new Date());
    return parsed.getHours() * 60 + parsed.getMinutes();
  }

  const legacy = LEGACY_BOOKING_TIME_MINUTES[time.toLowerCase()];
  if (legacy !== undefined) return legacy;

  return null;
}

export function parseDurationFromPackage(packageSummary: string): number {
  const match = packageSummary.match(/\((\d+)\s*min\)/i);
  return match ? Number(match[1]) : 60;
}

function intervalsOverlap(aStart: number, aDuration: number, bStart: number, bDuration: number): boolean {
  return aStart < bStart + bDuration && bStart < aStart + aDuration;
}

export function isTimeSlotUnavailable(
  slot: string,
  newBookingDurationMinutes: number | null,
  existingBookings: ExistingBooking[],
): boolean {
  const slotStart = parseBookingTimeToMinutes(slot);
  if (slotStart === null) return false;

  for (const booking of existingBookings) {
    const bookingStart = parseBookingTimeToMinutes(booking.booking_time);
    if (bookingStart === null) continue;

    const bookingDuration = parseDurationFromPackage(booking.package);

    if (newBookingDurationMinutes === null) {
      if (slotStart >= bookingStart && slotStart < bookingStart + bookingDuration) {
        return true;
      }
    } else if (intervalsOverlap(slotStart, newBookingDurationMinutes, bookingStart, bookingDuration)) {
      return true;
    }
  }

  return false;
}

export function formatBookingTimeDisplay(time: string): string {
  if (/^\d{2}:\d{2}$/.test(time)) {
    return formatTimeSlotLabel(time);
  }
  return time;
}

export function compareBookingsByTime(
  a: { booking_time: string },
  b: { booking_time: string },
): number {
  const aMinutes = parseBookingTimeToMinutes(a.booking_time) ?? 0;
  const bMinutes = parseBookingTimeToMinutes(b.booking_time) ?? 0;
  return aMinutes - bMinutes;
}

export type CustomerBookingGroup<T extends { name: string; email: string; booking_time: string }> = {
  key: string;
  name: string;
  email: string;
  bookings: T[];
  alternateNames: string[];
};

/** Group bookings by email (stable customer identifier). */
export function groupBookingsByCustomer<T extends { name: string; email: string; booking_time: string }>(
  bookings: T[],
): CustomerBookingGroup<T>[] {
  const map = new Map<string, CustomerBookingGroup<T>>();

  for (const booking of bookings) {
    const key = booking.email.trim().toLowerCase();
    const displayName = booking.name.trim();
    let group = map.get(key);

    if (!group) {
      group = {
        key,
        name: displayName,
        email: booking.email.trim(),
        bookings: [],
        alternateNames: [],
      };
      map.set(key, group);
    }

    if (displayName && displayName !== group.name && !group.alternateNames.includes(displayName)) {
      group.alternateNames.push(displayName);
    }

    group.bookings.push(booking);
  }

  for (const group of map.values()) {
    group.bookings.sort(compareBookingsByTime);
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}

export function getUnavailableTimeSlots(
  existingBookings: ExistingBooking[],
  newBookingDurationMinutes: number | null,
): Set<string> {
  const unavailable = new Set<string>();
  for (const slot of ALLOWED_TIME_SLOTS) {
    if (isTimeSlotUnavailable(slot, newBookingDurationMinutes, existingBookings)) {
      unavailable.add(slot);
    }
  }
  return unavailable;
}
