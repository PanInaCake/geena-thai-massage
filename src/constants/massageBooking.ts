/** All duration options shown in the booking UI (minutes). */
export const BOOKING_DURATION_MINUTES = [30, 45, 60, 90, 120] as const;
export type BookingDurationMinutes = (typeof BOOKING_DURATION_MINUTES)[number];

export const MASSAGE_BOOKING_PACKAGES = [
  { id: "thai-no-oil", label: "Thai Massage (No Oil)", durations: [30, 60, 90] },
  { id: "thai-oil", label: "Thai Oil Massage", durations: [60, 90, 120] },
  { id: "deep-oil", label: "Deep Oil Massage", durations: [60, 90, 120] },
  { id: "aromatherapy-back", label: "Aromatherapy Back Massage", durations: [60, 90, 120] },
  { id: "neck-shoulder", label: "Neck & Shoulder Massage", durations: [30, 45, 60] },
  { id: "head", label: "Head Massage", durations: [30, 45, 60] },
  { id: "foot", label: "Foot Massage", durations: [30, 60] },
  { id: "foot-spa-foot", label: "Foot Spa + Foot Massage", durations: [60] },
  { id: "back-scrub", label: "Back Scrub + Massage", durations: [90] },
  { id: "therapeutic", label: "Therapeutic Massage", durations: [60, 90, 120] },
  { id: "hot-stone", label: "Hot Stone Massage", durations: [90] },
  { id: "hot-herbal", label: "Hot Herbal Massage", durations: [90] },
] as const;

export type MassageBookingPackageId = (typeof MASSAGE_BOOKING_PACKAGES)[number]["id"];

const PACKAGE_ID_TUPLE = MASSAGE_BOOKING_PACKAGES.map((p) => p.id) as unknown as [
  MassageBookingPackageId,
  ...MassageBookingPackageId[],
];

/** For Zod `z.enum(...)`. */
export const BOOKING_PACKAGE_IDS = PACKAGE_ID_TUPLE;

export function getMassageBookingPackage(id: string) {
  return MASSAGE_BOOKING_PACKAGES.find((p) => p.id === id);
}

export function massagePackageAllowsDuration(pkg: (typeof MASSAGE_BOOKING_PACKAGES)[number], minutes: number) {
  return (pkg.durations as readonly number[]).includes(minutes);
}

export function formatBookingPackageForDb(packageId: MassageBookingPackageId, durationMinutes: number): string {
  const pkg = getMassageBookingPackage(packageId);
  if (!pkg) throw new Error("Invalid package id");
  return `${pkg.label} (${durationMinutes} min)`;
}
